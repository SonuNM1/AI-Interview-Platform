import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "@/components/ui/Toast";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Application entry point.

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster/>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);