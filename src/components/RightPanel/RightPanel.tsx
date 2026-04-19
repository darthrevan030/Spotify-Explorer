import type { AnyRecord, Granularity } from "../../types";
import { useCurrentNavItems } from "../../store/appContext";
import OverviewChart from "./OverviewChart";
import MiniStats from "./MiniStats";
import StatRow from "./StatRow";
import styles from "./RightPanel.module.css";

interface Props {
  record: AnyRecord;
  gran: Granularity;
  totalHours: number;
}

export default function RightPanel({ record, gran, totalHours }: Props) {
  const navItems = useCurrentNavItems();

  const pct =
    gran === "year" && totalHours
      ? `${((record.hours / totalHours) * 100).toFixed(1)}% of lifetime`
      : "";

  const avg = record.plays ? Math.round((record.hours * 60) / record.plays) : 0;
  const note =
    "note" in record ? ((record as { note?: string }).note ?? "") : "";
  const tracks =
    "tracks" in record ? (record as { tracks: number }).tracks : null;

  return (
    <>
      <div className={styles.chartSec}>
        <p className={styles.secHead}>Overview · hours</p>
        <OverviewChart items={navItems} selKey={record.key} gran={gran} />
      </div>

      {note && <p className={styles.noteBlk}>{note}</p>}

      <MiniStats
        shuffle={record.shuffle}
        skip={record.skip}
        peak={record.peak}
        artists={record.artists}
      />

      <StatRow
        label="Hours"
        value={`${record.hours}h`}
        sub={pct || undefined}
      />
      <StatRow
        label="Plays"
        value={record.plays.toLocaleString()}
        sub={`avg ${avg} min per play`}
      />
      {tracks !== null && (
        <StatRow label="Unique tracks" value={tracks.toLocaleString()} />
      )}
    </>
  );
}
