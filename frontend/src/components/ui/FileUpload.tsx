"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileText, ImageIcon, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface FileUploadProps {
  accept?: string;
  disabled?: boolean;
  error?: string;
  fileName?: string;
  helperText?: string;
  isUploaded?: boolean;
  progress?: number;
  statusText?: string;
  onFileSelect: (file: File) => void;
}

export const FileUpload = ({
  accept = ".pdf,.jpg,.jpeg,.png",
  disabled = false,
  error,
  fileName,
  helperText = "JPEG, PNG, PDF up to 10MB",
  isUploaded = false,
  progress,
  statusText,
  onFileSelect,
}: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const pickFile = (file?: File | null) => {
    if (!file || disabled) return;
    onFileSelect(file);
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    pickFile(event.target.files?.[0]);
    event.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`rounded-[28px] border-2 border-dashed px-6 py-8 text-center transition-all ${isDragging ? "border-(--color-primary) bg-white shadow-(--shadow-card)" : "border-(--color-border-strong) bg-(--color-surface-raised)"} ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:border-(--color-primary) hover:bg-white"}`}
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-(--shadow-soft)">
          <UploadCloud size={24} className="text-(--color-primary)" />
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold text-(--color-primary)">
            {statusText ?? "Choose a file or drag and drop it here"}
          </p>
          <p className="text-sm text-(--color-muted)">{helperText}</p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-(--color-secondary) shadow-(--shadow-soft)">
            <FileText size={16} />
            PDF
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-(--color-secondary) shadow-(--shadow-soft)">
            <ImageIcon size={16} />
            Image
          </span>
        </div>

        <div className="mt-5">
          <Button variant="secondary" size="sm" disabled={disabled}>
            Browse Files
          </Button>
        </div>

        {typeof progress === "number" ? (
          <div className="mx-auto mt-5 max-w-sm">
            <div className="h-2 overflow-hidden rounded-full bg-(--color-border)">
              <div
                className="h-full rounded-full bg-(--color-primary) transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-(--color-secondary)">
              Uploading... {progress}%
            </p>
          </div>
        ) : null}

        {fileName ? (
          <div className="mt-5 rounded-2xl border border-(--color-border) bg-white px-4 py-3 text-left shadow-(--shadow-soft)">
            <p className="truncate text-sm font-medium text-(--color-primary)">
              {fileName}
            </p>
            <p
              className={`mt-1 text-xs ${isUploaded ? "text-(--color-success-strong)" : "text-(--color-muted)"}`}
            >
              {isUploaded ? "File uploaded successfully" : "Selected file"}
            </p>
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-(--color-danger)">{error}</p> : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
};
