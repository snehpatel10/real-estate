import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setSuccess(true);
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Error sending the email");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl text-center font-semibold mb-4">Forgot Password</h1>
      {success ? (
        <p className="text-center text-green-600">
          Reset link has been sent to your email. Please check your inbox and follow the instructions to reset your password. <p className="font-medium mt-4">You can close this tab now.</p>
        </p>    
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="border p-3 rounded-lg"
            value={email}
            onChange={handleEmailChange}
          />
          <button
            type="submit"
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:bg-slate-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
      {!success && (
        <p className="text-sm text-center mt-4 text-gray-500">
          Remember your password?{" "}
          <span
            onClick={() => navigate("/sign-in")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>
      )}
      <Toaster />
    </div>
  );
}

export default ForgotPassword;
