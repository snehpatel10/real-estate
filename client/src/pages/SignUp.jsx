import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { set } from "mongoose";
import OAuth from "../components/OAuth";

function SignUp() {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });

    // Reset the error for the field as the user starts typing
    setErrors({
      ...errors,
      [id]: "",
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    let formIsValid = true;
    let tempErrors = { username: "", email: "", password: "" };

    if (!formData.username) {
      tempErrors.username = "Username is required";
      formIsValid = false;
    }

    if (!formData.email || !validateEmail(formData.email)) {
      tempErrors.email = "Please enter a valid email address";
      formIsValid = false;
    }

    if (!formData.password || !validatePassword(formData.password)) {
      tempErrors.password = "Password must contain at least 8 characters, one letter, one number, and one special character";
      formIsValid = false;
    }

    setErrors(tempErrors);

    if (!formIsValid) {
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        if (data.statusCode === 409) {
          setErrors({ ...errors, email: "Email already exists" });
        } else if (data.statusCode === 450) {
          setErrors({ ...errors, username: "Username already taken" });
        } else {
          setErrors({ ...errors, general: "Account creation failed" });
        }
        setLoading(false);
        return;
      } else {
        setErrors({});
        setLoading(false);
        toast.success("Account created successfully");
        setTimeout(() => {
          navigate("/sign-in");
        }, 1000);

      }
    } catch (error) {
      setErrors({ ...errors, general: "Something went wrong" });
      setLoading(false);
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Create your account</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Enter username"
            className={`border p-3 rounded-lg w-full ${errors.username ? 'border-red-500' : ''}`}
            id="username"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Enter email"
            className={`border p-3 rounded-lg w-full ${errors.email ? 'border-red-500' : ''}`}
            id="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="Enter password"
            className={`border p-3 rounded-lg w-full ${errors.password ? 'border-red-500' : ''}`}
            id="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

        <button
          disabled={loading}
          type="submit"
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:bg-slate-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "loading..." : "Sign up"}
        </button>
        <OAuth /> 
      </form>

      <div className="flex gap-1 mt-5">
        <p>Have an account? </p>
        <Link to="/sign-in">
          <span className="text-blue-700 hover:text-blue-900 transition-all duration-150">
            Sign in
          </span>
        </Link>
      </div>
    </div>
  );
}

export default SignUp;