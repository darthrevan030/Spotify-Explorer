import Header    from '../Header/Header';
import Controls  from '../Controls/Controls';
import LeftPanel  from '../LeftPanel/LeftPanel';
import RightPanel from '../RightPanel/RightPanel';
import { useFindRecord, useAppStore, useTotalHours } from '../../store/appContext';
import styles from './AppScreen.module.css';

export default function AppScreen() {
  const { state } = useAppStore();
  const record     = useFindRecord();
  const totalHours = useTotalHours();

  return (
    <div className={styles.appScreen}>
      <Header />
      <Controls />
      <div className={styles.main}>
        <main className={styles.left} aria-live="polite" aria-atomic="true">
          {record && <LeftPanel record={record} gran={state.gran} />}
        </main>
        <aside className={styles.right} aria-live="polite" aria-atomic="true">
          {record && <RightPanel record={record} gran={state.gran} totalHours={totalHours} />}
        </aside>
      </div>
    </div>
  );
}
