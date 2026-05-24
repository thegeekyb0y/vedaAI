"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PaperMeta } from "@/types/assignment.types";

interface Props {
  initialData: PaperMeta;
  submitting: boolean;
  onSubmit: (data: PaperMeta) => void;
  onBack: () => void;
}

export const StepTwo = ({
  initialData,
  submitting,
  onSubmit,
  onBack,
}: Props) => {
  const [form, setForm] = useState<PaperMeta>(initialData);

  const set = (key: keyof PaperMeta, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <section className="rounded-[28px] border-2 border-white bg-white/50 p-6 sm:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-primary">
              Paper Details
            </h2>
            <p className="mt-0.5 text-sm text-secondary">
              This information will appear on the printed question paper
            </p>
          </div>

          {/* School name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">
              School Name
            </label>
            <input
              type="text"
              value={form.schoolName}
              onChange={(e) => set("schoolName", e.target.value)}
              placeholder="e.g. Delhi Public School, Sector-4, Bokaro"
              className="h-12 w-full rounded-2xl border border-border bg-surface-raised px-4 text-sm text-primary outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Subject + Class row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Subject
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
                placeholder="e.g. English"
                className="h-12 w-full rounded-2xl border border-border bg-surface-raised px-4 text-sm text-primary outline-none transition-colors focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Class
              </label>
              <input
                type="text"
                value={form.className}
                onChange={(e) => set("className", e.target.value)}
                placeholder="e.g. 5th"
                className="h-12 w-full rounded-2xl border border-border bg-surface-raised px-4 text-sm text-primary outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>

          {/* Section + Time Allowed row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Section
              </label>
              <input
                type="text"
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
                placeholder="e.g. A"
                className="h-12 w-full rounded-2xl border border-border bg-surface-raised px-4 text-sm text-primary outline-none transition-colors focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">
                Time Allowed
              </label>
              <input
                type="text"
                value={form.timeAllowed}
                onChange={(e) => set("timeAllowed", e.target.value)}
                placeholder="e.g. 45 minutes"
                className="h-12 w-full rounded-2xl border border-border bg-surface-raised px-4 text-sm text-primary outline-none transition-colors focus:border-primary"
              />
            </div>
          </div>

          {/* Max Marks */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">
              Maximum Marks
            </label>
            <input
              type="number"
              value={form.maxMarks}
              onChange={(e) => set("maxMarks", e.target.value)}
              placeholder="e.g. 20"
              className="h-12 w-full rounded-2xl border border-border bg-surface-raised px-4 text-sm text-primary outline-none transition-colors focus:border-primary"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">
              General Instructions
            </label>
            <textarea
              value={form.instructions}
              onChange={(e) => set("instructions", e.target.value)}
              rows={3}
              placeholder="e.g. All questions are compulsory unless stated otherwise."
              className="w-full rounded-[20px] border border-dashed border-[#e5e5e5] bg-white px-5 py-4 text-sm leading-7 text-primary outline-none placeholder:text-secondary/80 resize-none"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="secondary"
          iconLeft={<ArrowLeft size={16} />}
          className="h-14 rounded-full px-8 text-[18px] font-medium shadow-none"
          onClick={onBack}
          type="button"
        >
          Previous
        </Button>
        <Button
          type="submit"
          loading={submitting}
          iconRight={<ArrowRight size={16} />}
          className="h-14 rounded-full bg-[#1d1d1d] px-9 text-[18px] font-medium hover:bg-[#1d1d1d]"
        >
          Generate Assignment
        </Button>
      </div>
    </form>
  );
};
