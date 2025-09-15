import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ requireRole }: { requireRole?: "admin" | "user" }) {
  const { session, loading, role } = useAuth();
  const loc = useLocation();

  if (loading) return <Outlet />; // não bloquear a UI pública

  if (!session) return <Navigate to="/entrar" replace state={{ from: loc.pathname }} />;

  if (requireRole === "admin" && role !== "admin" && role !== "editor") {
    return <main className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-xl font-semibold">Acesso restrito</h1>
      <p className="text-sm text-muted-foreground">Entre com uma conta de admin ou editor.</p>
    </main>;
  }
  return <Outlet />;
}