import type { AnyRecord, Granularity } from '../../types';
import Hero       from './Hero';
import ArtistList from './ArtistList';
import TrackGrid  from './TrackGrid';
import styles from './LeftPanel.module.css';

interface Props {
  record: AnyRecord;
  gran:   Granularity;
}

export default function LeftPanel({ record, gran }: Props) {
  return (
    <>
      <Hero record={record} gran={gran} />
      <h2 className={styles.secHead}>Top artists</h2>
      <ArtistList artists={record.topArtists} />
      <h2 className={styles.secHead}>Top tracks</h2>
      <TrackGrid tracks={record.topTracks} />
    </>
  );
}
