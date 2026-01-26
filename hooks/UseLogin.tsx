import { useState } from "react";
import { useRouter } from "next/navigation";
import { UseAuthContext } from "./UseAuthContext";

export const useLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { dispatch } = UseAuthContext();
  const router = useRouter();

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!email || !password) {
      setError("All fields must be filled");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Store in localStorage for client-side state
      localStorage.setItem("user", JSON.stringify(json));
      console.log("Login successful:", json.email);

      // Update auth context
      dispatch({ type: "LOGIN", payload: json });

      // Redirect to home
      router.push("/");
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Failed to login:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
