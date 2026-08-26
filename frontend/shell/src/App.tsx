import { useEffect } from "react";

import { AppProviders } from "./app/provider";
import { AppRoutes } from "./routes";
import { initializeAuthBridge } from "./bridge/authBridge";

function App() {
  useEffect(() => {
    initializeAuthBridge();
  }, []);

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;