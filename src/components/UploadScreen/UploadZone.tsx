import styles from "./UploadZone.module.css";

interface Progress {
  pct: number;
  message: string;
}

interface UploadZoneProps {
  pendingFiles: File[];
  isProcessing: boolean;
  progress: Progress | null;
  dragOver: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onProcess: () => void;
  onFileChange: (files: FileList) => void;
}

export default function UploadZone({
  pendingFiles,
  isProcessing,
  progress,
  dragOver,
  fileInputRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onProcess,
  onFileChange,
}: UploadZoneProps) {
  return (
    <div className={styles.uploadZone}>
      {/* Drop zone */}
      <div
        className={`${styles.dropZone}${dragOver ? " " + styles.dragOver : ""}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Drop JSON files here or click to browse"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="fileInput"
          className={styles.fileInput}
          accept=".json"
          multiple
          aria-label="Select streaming history JSON files"
          onChange={(e) => {
            if (e.target.files) onFileChange(e.target.files);
          }}
        />
        <svg
          className={styles.dropIcon}
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className={styles.dropTitle}>Drop files here</p>
        <p className={styles.dropHint}>
          or click to browse
          <br />
          Accepts <code>Streaming_History_Audio_*.json</code>
        </p>
      </div>

      {/* File list */}
      {pendingFiles.length > 0 && (
        <ul className={styles.fileList} aria-label="Staged files">
          {pendingFiles.map((f) => (
            <li key={f.name} className={styles.fileItem}>
              <span className={styles.fileItemName} title={f.name}>
                {f.name}
              </span>
              <span className={styles.fileItemSize}>
                {(f.size / 1024).toFixed(0)} KB
              </span>
              <span className={styles.fileItemStatus} aria-label="Valid file">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Valid
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Process button */}
      {pendingFiles.length > 0 && (
        <button
          className={styles.processBtn}
          onClick={onProcess}
          disabled={isProcessing}
          aria-disabled={isProcessing}
        >
          {isProcessing && (
            <svg
              className={styles.spinner}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          )}
          {isProcessing
            ? "Processing…"
            : `Process ${pendingFiles.length} file${pendingFiles.length !== 1 ? "s" : ""}`}
        </button>
      )}

      {/* Progress bar */}
      {progress && (
        <div className={styles.progressWrap} role="status" aria-live="polite">
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${progress.pct}%` }}
              role="progressbar"
              aria-valuenow={progress.pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className={styles.progressText}>{progress.message}</p>
        </div>
      )}
    </div>
  );
}
