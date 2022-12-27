import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Home from "../home";
import List from "../list";

function RouterLink() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/list/:id" element={<List />} />
        </Routes>
    );
}

export default RouterLink;
