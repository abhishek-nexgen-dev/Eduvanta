import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStorage from "../features/login/v1/hooks/useAuthStorage";

interface ProtectedRouteProps {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = useAuthStorage((state) => state.token);
  const user = useAuthStorage((state) => state.user);
  const location = useLocation();

  const isAuthenticated = Boolean(
    token &&
      typeof token === "string" &&
      token.trim().length > 10 &&
      user &&
      (user.role === "admin" ||
        user.role === "super admin" ||
        user.role === "super_admin" ||
        user.email?.toLowerCase() === "admin@gmail.com")
  );

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
