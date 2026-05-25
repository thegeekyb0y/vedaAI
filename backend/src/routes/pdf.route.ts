import { Router, Request, Response } from "express";
import PDFDocument from "pdfkit";
import { Assignment } from "../models/Assignment";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

interface MCQParsed {
  questionText: string;
  options: Array<{ label: string; text: string }>;
}

function parseMCQOptions(text: string): MCQParsed | null {
  const aIdx = text.search(/\(a\)/i);
  if (aIdx === -1) return null;
  const questionText = text.slice(0, aIdx).trim();
  const matches = [...text.matchAll(/\(([a-d])\)\s*([^(\n]+)/gi)];
  if (matches.length < 2) return null;
  return {
    questionText,
    options: matches.map((m) => ({
      label: (m[1] ?? "").toUpperCase(),
      // NEW: strip stray labels like "A) " or "a. " from the start of the text
      text: (m[2] ?? "").replace(/^[a-d][.)]\s*/i, "").trim(),
    })),
  };
}

function checkPageBreak(doc: PDFKit.PDFDocument): void {
  const bottomThreshold = doc.page.height - doc.page.margins.bottom - 80;
  if (doc.y > bottomThreshold) doc.addPage();
}

function drawDivider(doc: PDFKit.PDFDocument): void {
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor("#cccccc")
    .lineWidth(0.5)
    .stroke()
    .strokeColor("#000000")
    .lineWidth(1);
  doc.moveDown(0.5);
}

router.get(
  "/:id/pdf",
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment?.result) {
      res.status(404).json({
        success: false,
        message: "Assignment not found or not yet generated",
      });
      return;
    }

    const meta = assignment.paperMeta;
    const paper = assignment.result;
    const safeTitle =
      assignment.title.replace(/[^a-z0-9\s-]/gi, "").trim() || "assignment";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeTitle}.pdf"`,
    );

    const doc = new PDFDocument({ margin: 55, size: "A4" });
    doc.pipe(res);

    const pageW =
      doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ── Header ──────────────────────────────────────────────────
    if (meta?.schoolName) {
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(meta.schoolName, { align: "center" });
      doc.moveDown(0.3);
    }

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(`Subject: ${meta?.subject || assignment.title}`, {
        align: "center",
      });

    if (meta?.className) {
      const classLine = meta.section
        ? `Class: ${meta.className}   |   Section: ${meta.section}`
        : `Class: ${meta.className}`;
      doc.fontSize(12).font("Helvetica").text(classLine, { align: "center" });
    }

    doc.moveDown(0.6);
    drawDivider(doc);

    // Time + Marks row
    const leftX = doc.page.margins.left;
    const timeY = doc.y;
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Time Allowed: ${meta?.timeAllowed || "—"}`, leftX, timeY, {
        width: pageW / 2,
      });
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(
        `Maximum Marks: ${meta?.maxMarks || "—"}`,
        leftX + pageW / 2,
        timeY,
        {
          width: pageW / 2,
          align: "right",
        },
      );
    doc.y = Math.max(doc.y, timeY + 18);
    doc.moveDown(0.5);

    // Instructions
    if (meta?.instructions) {
      doc.fontSize(10).font("Helvetica-Oblique").text(meta.instructions);
      doc.moveDown(0.4);
    }

    // Student fields
    doc
      .fontSize(11)
      .font("Helvetica")
      .text(
        "Name: _________________________   Roll No: ____________   Date: ____________",
      );
    doc.moveDown(0.8);
    drawDivider(doc);

    // ── Sections ────────────────────────────────────────────────
    let qCounter = 1;

    for (const section of paper.sections) {
      checkPageBreak(doc);

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(section.title, { align: "center" });
      doc.moveDown(0.2);
      doc
        .fontSize(10)
        .font("Helvetica-Oblique")
        .text(section.instruction, { align: "center" });
      doc.moveDown(0.6);

      for (const question of section.questions) {
        checkPageBreak(doc);

        const mcq = parseMCQOptions(question.text);
        const marksLabel = `[${question.marks} Mark${question.marks > 1 ? "s" : ""}]`;

        if (mcq) {
          // Question stem
          doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .text(`Q${qCounter}. `, { continued: true })
            .font("Helvetica")
            .text(`${mcq.questionText}  ${marksLabel}`);
          doc.moveDown(0.3);

          // Options in 2-column layout
          const colW = (pageW - 20) / 2;
          const lX = leftX + 20;
          const rX = lX + colW + 10;

          for (let i = 0; i < mcq.options.length; i += 2) {
            checkPageBreak(doc);
            const rowY = doc.y;
            const opt1 = mcq.options[i];
            const opt2 = mcq.options[i + 1];

            if (opt1) {
              doc
                .fontSize(10)
                .font("Helvetica")
                .text(`(${opt1.label}) ${opt1.text}`, lX, rowY, {
                  width: colW,
                });
            }
            const lEndY = doc.y;

            if (opt2) {
              doc
                .fontSize(10)
                .font("Helvetica")
                .text(`(${opt2.label}) ${opt2.text}`, rX, rowY, {
                  width: colW,
                });
            }
            const rEndY = doc.y;

            doc.y = Math.max(lEndY, rEndY);
            doc.moveDown(0.2);
          }
        } else {
          doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .text(`Q${qCounter}. `, { continued: true })
            .font("Helvetica")
            .text(`${question.text}  ${marksLabel}`);
        }

        doc.moveDown(0.6);
        qCounter++;
      }

      doc.moveDown(0.4);
    }

    // ── Answer Key ───────────────────────────────────────────────
    doc.addPage();
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Answer Key", { align: "center" });
    doc.moveDown(0.4);
    drawDivider(doc);

    let aCounter = 1;
    for (const section of paper.sections) {
      for (const question of section.questions) {
        checkPageBreak(doc);
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(`Q${aCounter}. `, { continued: true })
          .font("Helvetica")
          .text(question.answer);
        doc.moveDown(0.4);
        aCounter++;
      }
    }

    doc.end();
  }),
);

export default router;
