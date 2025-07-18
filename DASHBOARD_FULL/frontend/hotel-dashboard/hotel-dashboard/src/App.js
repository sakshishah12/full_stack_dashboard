import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Guests from "./pages/Guests";


const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/guests" element={<Guests />} />
            </Routes>
        </Router>
    );
};

export default App;
