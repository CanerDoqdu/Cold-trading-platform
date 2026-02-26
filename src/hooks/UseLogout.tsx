import { UseAuthContext } from "./UseAuthContext";
import { useRouter } from "next/navigation";

export const Uselogout = () => {
  const { dispatch } = UseAuthContext();
  const router = useRouter();

  const logout = async () => {
    try {
      // Clear server-side cookie
      await fetch("/api/user/logout", {
        method: "POST",
      });

      // Clear client-side storage
      localStorage.removeItem("user");
      localStorage.removeItem("favorites"); // Clear favorites on logout
      localStorage.removeItem("lastActivity"); // Clear activity timestamp

      // Update auth context
      dispatch({ type: "LOGOUT" });

      // Redirect to home
      router.push("/");
      
      console.log("Logout successful");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear local state even if API fails
      localStorage.removeItem("user");
      localStorage.removeItem("favorites");
      localStorage.removeItem("lastActivity");
      dispatch({ type: "LOGOUT" });
    }
  };

  return { logout };
};
