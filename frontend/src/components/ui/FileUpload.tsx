"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  disabled?: boolean;
  error?: string;
  fileName?: string;
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
  isUploaded = false,
  progress,
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

  const isUploading = typeof progress === "number" && !isUploaded;

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`rounded-[20px] border-2 border-dashed py-10 text-center transition-all ${
          isDragging
            ? "border-primary bg-white"
            : "border-[#d5d5d5] bg-[#f5f5f5]"
        } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
      >
        {/* Icon */}
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
          <UploadCloud size={22} className="text-primary" />
        </div>

        {/* Text */}
        <p className="text-sm font-semibold text-primary">
          {isUploading
            ? `Uploading... ${progress}%`
            : isUploaded && fileName
              ? fileName
              : "Choose a file or drag & drop it here"}
        </p>
        <p className="mt-1 text-sm text-muted">JPEG, PNG, upto 10MB</p>

        {/* Progress bar while uploading */}
        {isUploading && (
          <div className="mx-auto mt-4 max-w-xs px-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Browse / Replace button */}
        {!isUploading && (
          <div className="mt-5">
            <span className="inline-flex items-center rounded-full border border-border bg-white px-5 py-2 text-sm font-medium text-primary">
              {isUploaded ? "Replace File" : "Browse Files"}
            </span>
          </div>
        )}

        {/* Uploaded checkmark */}
        {isUploaded && fileName && (
          <p className="mt-2 text-xs text-emerald-600">
            ✓ Uploaded successfully
          </p>
        )}
      </div>

      {/* Caption outside the box */}
      <p className="text-center text-xs text-muted">
        Upload images of your preferred document/image
      </p>

      {error && <p className="text-sm text-danger">{error}</p>}

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
