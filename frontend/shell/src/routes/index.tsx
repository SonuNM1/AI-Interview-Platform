import {BrowserRouter, Routes, Route} from "react-router-dom"

function Home() {
    return <div>
        AI Interview Platform 
    </div>
}

export function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>} />
            </Routes>
        </BrowserRouter>
    )
}