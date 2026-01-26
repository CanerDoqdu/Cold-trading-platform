import { useState } from "react";
import { UseAuthContext } from "./UseAuthContext";
import { useRouter } from "next/navigation";

export const useSignup = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { dispatch } = UseAuthContext();
  const router = useRouter();

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (!name || !email || !password) {
      setError("All fields must be filled");
      setIsLoading(false);
      return;
    }

    if (name.length < 2) {
      setError("Name must be at least 2 characters");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await response.json();

      if (!response.ok) {
        setError(json.error || "Signup failed");
        setIsLoading(false);
        return;
      }

      // Store in localStorage for client-side state
      localStorage.setItem("user", JSON.stringify(json));
      console.log("Signup successful:", json.name);

      // Update auth context
      dispatch({ type: "LOGIN", payload: json });

      // Redirect to home
      router.push("/");
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Failed to signup:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { signup, isLoading, error };
};
