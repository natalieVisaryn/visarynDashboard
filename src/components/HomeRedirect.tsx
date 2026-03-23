import { Navigate } from "react-router-dom";
import { useUser } from "../context/userContext";

export default function HomeRedirect() {
  const { user, isLoading } = useUser();

  if (isLoading) return null;

  if (user?.accountType === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
