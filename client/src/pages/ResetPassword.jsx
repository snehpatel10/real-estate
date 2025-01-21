import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

function ResetPassword() {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = (e) => {
    if (e.target.id === "newPassword") {
      setNewPassword(e.target.value);
    } else {
      setConfirmPassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();
      setLoading(false);

      if (data.success) {
        setSuccess(true);
        toast.success("Password reset successful");
        setTimeout(() => {
          navigate("/sign-in", {replace: true});
        }, 2000);
      } else {
        toast.error(data.message || "Error resetting password");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl text-center font-semibold mb-4">Reset Password</h1>
      {success ? (
        <p className="text-center text-green-600">
          Your password has been reset successfully. Redirecting to the Sign In page...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            id="newPassword"
            placeholder="Enter new password"
            className="border p-3 rounded-lg"
            value={newPassword}
            onChange={handlePasswordChange}
          />
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            className="border p-3 rounded-lg"
            value={confirmPassword}
            onChange={handlePasswordChange}
          />
          <button
            type="submit"
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:bg-slate-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
      <Toaster />
    </div>
  );
}

export default ResetPassword;
