import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;
  return children;
};

export const OfficerRoute = ({ children }) => {
  const { user, isOfficerOrAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isOfficerOrAdmin) return <Navigate to="/unauthorized" replace />;
  return children;
};

export const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};
