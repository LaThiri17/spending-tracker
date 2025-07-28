import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";

function Header() {
  return (
    <header className="bg-info text-white p-3 d-flex justify-content-between align-items-center rounded-bottom">
      <h1 className="h4 mb-0">Spending Tracker</h1>
      <div>
        <NavLink to="/journal" end>
          {({ isActive }) => (
            <button className={`btn btn-outline-light me-2 ${isActive ? "active" : ""}`}>
              Journal
            </button>
          )}
        </NavLink>
        <NavLink to="/dashboard" end>
          {({ isActive }) => (
            <button className={`btn btn-outline-light ${isActive ? "active" : ""}`}>
              Dashboard
            </button>
          )}
        </NavLink>
      </div>
    </header>
  );
}

function App() {
  return (
    <Router>
      <div className="container my-4">
        <Header />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
