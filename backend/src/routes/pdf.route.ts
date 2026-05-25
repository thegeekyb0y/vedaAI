import { Router, Request, Response } from "express";
import PDFDocument from "pdfkit";
import { Assignment } from "../models/Assignment";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

interface MCQOption {
  label: string;
  text: string;
}

interface MCQParsed {
  questionText: string;
  options: MCQOption[];
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
      text: (m[2] ?? "").replace(/^[a-d][.)]\s*/i, "").trim(),
    })),
  };
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number): void {
  const bottom = doc.page.height - doc.page.margins.bottom;
  if (doc.y + needed > bottom) doc.addPage();
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

    const L = doc.page.margins.left;
    const R = doc.page.width - doc.page.margins.right;
    const pageW = R - L;

    // ── HEADER ──────────────────────────────────────────────────
    if (meta?.schoolName) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(meta.schoolName, { align: "center" });
      doc.moveDown(0.25);
    }

    const subject = meta?.subject || assignment.title;
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Subject: ${subject}`, { align: "center" });
    doc.moveDown(0.15);

    if (meta?.className) {
      const classLine = meta.section
        ? `Class: ${meta.className}   |   Section: ${meta.section}`
        : `Class: ${meta.className}`;
      doc.fontSize(11).font("Helvetica").text(classLine, { align: "center" });
    }

    doc.moveDown(0.5);

    doc.moveDown(0.5);

    // ── TIME + MARKS row ────────────────────────────────────────
    const rowY = doc.y;
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Time Allowed: ${meta?.timeAllowed || "—"}`, L, rowY, {
        width: pageW / 2,
        align: "left",
      });
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Maximum Marks: ${meta?.maxMarks || "—"}`, L + pageW / 2, rowY, {
        width: pageW / 2,
        align: "right",
      });
    // Move past the row
    doc.y = rowY + 18;
    doc.moveDown(0.4);

    // ── Instructions ────────────────────────────────────────────
    if (meta?.instructions) {
      doc
        .fontSize(9)
        .font("Helvetica-Oblique")
        .text(meta.instructions, { align: "right" });
      doc.moveDown(0.25);
    }

    // ── Student fields ──────────────────────────────────────────
    const nameY = doc.y;
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Name: _______________________", L, nameY);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Roll No: ____________", L + pageW * 0.6, nameY);
    doc.y = nameY + 14;
    doc.fontSize(10).font("Helvetica").text(`Date: _______________________`, L);
    doc.moveDown(0.6);

    doc.moveDown(0.8);

    // ── SECTIONS ────────────────────────────────────────────────
    let qCounter = 1;

    for (const section of paper.sections) {
      ensureSpace(doc, 60);

      // Section title
      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(section.title, { align: "center" });
      doc.moveDown(0.2);
      doc
        .fontSize(9)
        .font("Helvetica-Oblique")
        .text(section.instruction, { align: "center" });
      doc.moveDown(0.55);

      for (const question of section.questions) {
        const mcq = parseMCQOptions(question.text);
        const marksLabel = `[${question.marks} Mark${question.marks !== 1 ? "s" : ""}]`;

        if (mcq) {
          // ── MCQ ──
          ensureSpace(doc, 70);

          // Question stem on one line
          const stemPrefix = `Q${qCounter}. `;
          const stemText = `${mcq.questionText}  ${marksLabel}`;

          const prefixW = doc.widthOfString(stemPrefix);

          doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .text(stemPrefix, L, doc.y, { continued: true, width: pageW });
          doc
            .fontSize(11)
            .font("Helvetica")
            .text(stemText, { width: pageW - prefixW });

          doc.moveDown(0.35);

          // Options: 2-column grid
          const colW = (pageW - 30) / 2;
          const col1X = L + 18;
          const col2X = col1X + colW + 12;
          const opts = mcq.options;

          for (let i = 0; i < opts.length; i += 2) {
            const opt1 = opts[i];
            const opt2 = opts[i + 1];

            ensureSpace(doc, 20);
            const rowStartY = doc.y;

            // Left option
            if (opt1) {
              doc
                .fontSize(10)
                .font("Helvetica")
                .text(`(${opt1.label}) ${opt1.text}`, col1X, rowStartY, {
                  width: colW,
                });
            }
            const afterLeftY = doc.y;

            // Right option — reset y to rowStartY first
            if (opt2) {
              doc
                .fontSize(10)
                .font("Helvetica")
                .text(`(${opt2.label}) ${opt2.text}`, col2X, rowStartY, {
                  width: colW,
                });
            }
            const afterRightY = doc.y;

            // Advance past whichever column was taller
            doc.y = Math.max(afterLeftY, afterRightY) + 4;
          }

          doc.moveDown(0.55);
        } else {
          // ── Non-MCQ ──
          ensureSpace(doc, 40);

          const stemPrefix = `Q${qCounter}. `;
          const prefixW = doc.widthOfString(stemPrefix);

          doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .text(stemPrefix, L, doc.y, { continued: true, width: pageW });
          doc
            .fontSize(11)
            .font("Helvetica")
            .text(`${question.text}  ${marksLabel}`, {
              width: pageW - prefixW,
            });

          doc.moveDown(0.65);
        }

        qCounter++;
      }

      doc.moveDown(0.5);
    }

    // ── ANSWER KEY ───────────────────────────────────────────────
    doc.addPage();

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Answer Key", { align: "center" });
    doc.moveDown(0.4);

    doc.moveDown(0.6);

    let aCounter = 1;
    for (const section of paper.sections) {
      for (const question of section.questions) {
        ensureSpace(doc, 36);

        const prefix = `Q${aCounter}. `;
        const prefixW = doc.widthOfString(prefix);

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(prefix, L, doc.y, { continued: true, width: pageW });
        doc
          .fontSize(11)
          .font("Helvetica")
          .text(question.answer, { width: pageW - prefixW });

        doc.moveDown(0.45);
        aCounter++;
      }
    }

    doc.end();
  }),
);

export default router;
