import "./index.css";
import { Routes, Route } from "react-router-dom";
import { CandidateLayout } from "./layouts/CandidateLayout";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Toaster } from "sonner";
import {ReactQueryDevtools} from "@tanstack/react-query-devtools"
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { Interviews } from "./pages/Interviews";
import { InterviewRoom } from "./pages/InterviewRoom";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CandidateLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/interviews" element={<Interviews/>} />

          <Route path="/interview/:accessToken" element={<InterviewRoom/>}/>
        </Routes>
      </CandidateLayout>

      <Toaster position="top-right" richColors closeButton />
      <ReactQueryDevtools initialIsOpen={false}/>
    </QueryClientProvider>
  );
}