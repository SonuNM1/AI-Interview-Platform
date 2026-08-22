import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import { lazy, Suspense } from "react"
import CandidateApp from "candidate/App"


const candidateApp = lazy(() => import("candidate/App"))

function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          AI Interview Platform
        </h1>

        <p className="mt-3 text-muted-foreground">
          Welcome to the platform
        </p>
      </div>
    </div>
    )
}

function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            Loading...
        </div>
    )
}

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Suspense fallback={<Loading/>}>
                <Routes>

                    {/* main landing page */}

                    <Route path="/" element={<Home/>} />

                    {/* Candidate micro frontend */}

                    <Route path="/candidate/*" element={<CandidateApp/>} />

                    {/* Unknown routes */}

                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />

                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}