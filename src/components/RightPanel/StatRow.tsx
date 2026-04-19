import styles from "./RightPanel.module.css";

interface Props {
  label: string;
  value: string;
  sub?: string;
}

export default function StatRow({ label, value, sub }: Props) {
  return (
    <div className={styles.statRow}>
      <div className={styles.statRowLbl}>{label}</div>
      <div className={styles.statRowVal}>{value}</div>
      {sub && <div className={styles.statRowSub}>{sub}</div>}
    </div>
  );
}
