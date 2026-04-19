import { useState } from "react";
import styles from "./DataGuideSection.module.css";

const steps = [
  {
    num: 1,
    text: (
      <>
        Go to your{" "}
        <a
          href="https://www.spotify.com/sg-en/account/privacy/"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          Spotify privacy settings
        </a>
      </>
    ),
  },
  {
    num: 2,
    text: (
      <>
        Scroll to <strong>"Download your data"</strong> and select{" "}
        <strong>Extended streaming history</strong>
      </>
    ),
    warning:
      "Choose Extended streaming history, not Account data — only the extended version contains your full play history.",
  },
  {
    num: 3,
    text: (
      <>
        Wait for Spotify's email confirming your request (this can take{" "}
        <strong>up to 30 days</strong>)
      </>
    ),
  },
  {
    num: 4,
    text: (
      <>
        Download and <strong>unzip</strong> the file Spotify sends you
      </>
    ),
  },
  {
    num: 5,
    text: (
      <>
        Look for files named{" "}
        <code className={styles.code}>Streaming_History_Audio_*.json</code> —
        those are the ones to upload below
      </>
    ),
  },
];

export default function DataGuideSection() {
  const [open, setOpen] = useState(false);

  return (
    <section className={styles.guide} aria-label="How to get your Spotify data">
      <div className={styles.container}>
        <button
          className={styles.toggle}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <span className={styles.toggleText}>
            Don't have your files yet? Here's how to get them
          </span>
          <svg
            className={`${styles.chevron}${open ? " " + styles.chevronOpen : ""}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <ol
            className={styles.stepList}
            aria-label="Steps to download Spotify data"
          >
            {steps.map((s) => (
              <li key={s.num} className={styles.step}>
                <span className={styles.stepNum} aria-hidden="true">
                  {s.num}
                </span>
                <div className={styles.stepContent}>
                  <p className={styles.stepText}>{s.text}</p>
                  {s.warning && (
                    <p className={styles.warning}>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      {s.warning}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
