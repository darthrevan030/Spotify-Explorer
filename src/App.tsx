import { useAppStore } from "./store/appContext";
import UploadScreen from "./components/UploadScreen/UploadScreen";
import AppScreen from "./components/AppScreen/AppScreen";
import SkipLink from "./components/shared/SkipLink";

export default function App() {
  const { state } = useAppStore();
  return (
    <>
      <SkipLink />
      {state.screen === "upload" ? <UploadScreen /> : <AppScreen />}
    </>
  );
}
