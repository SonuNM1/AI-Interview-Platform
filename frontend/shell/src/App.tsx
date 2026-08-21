import { AppProviders } from "./app/provider";
import { AppRoutes } from "./routes";

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;