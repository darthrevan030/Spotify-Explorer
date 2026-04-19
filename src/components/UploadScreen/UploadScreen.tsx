import { useState, useRef, useCallback } from "react";
import { processFiles } from "../../lib/processor";
import { resolveDefaults } from "../../lib/utils";
import { useAppStore } from "../../store/appContext";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import DataGuideSection from "./DataGuideSection";
import UploadZone from "./UploadZone";
import styles from "./UploadScreen.module.css";

interface Progress {
  pct: number;
  message: string;
}

const AUDIO_PATTERN = /streaming_history_audio/i;

export default function UploadScreen() {
  const { dispatch } = useAppStore();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadSectionRef = useRef<HTMLElement>(null);

  /* ── File management ────────────────────────────────────── */

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter(
      (f) => f.name.endsWith(".json") && AUDIO_PATTERN.test(f.name),
    );
    setPendingFiles((prev) => {
      const merged = [...prev];
      valid.forEach((f) => {
        if (!merged.find((p) => p.name === f.name)) merged.push(f);
      });
      return merged.sort((a, b) => a.name.localeCompare(b.name));
    });
  }, []);

  /* ── Drag-and-drop ──────────────────────────────────────── */

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  /* ── Process ────────────────────────────────────────────── */

  const onProcess = async () => {
    if (!pendingFiles.length || isProcessing) return;
    setIsProcessing(true);
    setProgress({ pct: 0, message: "Starting…" });

    const { db, totalPlays } = await processFiles(
      pendingFiles,
      (pct, message) => setProgress({ pct, message }),
    );

    const { selYear, selMonth, weekKey } = resolveDefaults(db);
    dispatch({
      type: "DB_READY",
      db,
      totalPlays,
      selYear,
      selMonth,
      selKey: selYear, // default gran = year, so key = year string
    });
    void weekKey; // available but not needed at this dispatch point
  };

  /* ── Scroll to upload ───────────────────────────────────── */

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Render ─────────────────────────────────────────────── */

  return (
    <div className={styles.page}>
      <HeroSection onGetStarted={scrollToUpload} />
      <FeaturesSection />
      <DataGuideSection />

      <section
        ref={uploadSectionRef}
        className={styles.uploadSection}
        aria-label="Upload your files"
      >
        <div className={styles.uploadContainer}>
          <h2 className={styles.uploadHeading}>Ready? Drop your files below.</h2>
          <p className={styles.uploadSub}>
            Your files never leave your device — all processing happens in your browser.
          </p>
          <UploadZone
            pendingFiles={pendingFiles}
            isProcessing={isProcessing}
            progress={progress}
            dragOver={dragOver}
            fileInputRef={fileInputRef}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onProcess={onProcess}
            onFileChange={addFiles}
          />
        </div>
      </section>
    </div>
  );
}
