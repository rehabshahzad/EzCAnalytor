import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProtectedRoute, AdminRoute, OfficerRoute, GuestRoute } from "./routes/RouteGuards";
import Layout from "./components/Layout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/auth/Profile";
import Dashboard from "./pages/dashboard/Dashboard";
import CrimeList from "./pages/crimes/CrimeList";
import CrimeDetail from "./pages/crimes/CrimeDetail";
import CrimeForm from "./pages/crimes/CrimeForm";
import AssignCrime from "./pages/crimes/AssignCrime";
import OfficerList from "./pages/officers/OfficerList";
import OfficerDetail from "./pages/officers/OfficerDetail";
import OfficerForm from "./pages/officers/OfficerForm";
import CityStats from "./pages/stats/CityStats";
import TypeStats from "./pages/stats/TypeStats";
import TrendStats from "./pages/stats/TrendStats";
import { Unauthorized, NotFound } from "./pages/ErrorPages";

import "./styles/main.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"    element={<Dashboard />} />
              <Route path="profile"      element={<Profile />} />
              <Route path="unauthorized" element={<Unauthorized />} />

              <Route path="stats/city"   element={<CityStats />} />
              <Route path="stats/type"   element={<TypeStats />} />
              <Route path="stats/trends" element={<TrendStats />} />

              <Route path="crimes"     element={<OfficerRoute><CrimeList /></OfficerRoute>} />
              <Route path="crimes/:id" element={<OfficerRoute><CrimeDetail /></OfficerRoute>} />

              <Route path="crimes/add"      element={<AdminRoute><CrimeForm editMode={false} /></AdminRoute>} />
              <Route path="crimes/edit/:id" element={<AdminRoute><CrimeForm editMode={true} /></AdminRoute>} />
              <Route path="assign-crime"    element={<AdminRoute><AssignCrime /></AdminRoute>} />

              <Route path="officers"          element={<AdminRoute><OfficerList /></AdminRoute>} />
              <Route path="officers/:id"      element={<AdminRoute><OfficerDetail /></AdminRoute>} />
              <Route path="officers/add"      element={<AdminRoute><OfficerForm editMode={false} /></AdminRoute>} />
              <Route path="officers/edit/:id" element={<AdminRoute><OfficerForm editMode={true} /></AdminRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
