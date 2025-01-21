import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../features/userSlice";
import OAuth from "../components/OAuth";

function Signin() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill all the fields");
      return;
    }

    try {
      dispatch(signInStart());

      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(signInFailure(data.message));

        if (data.statusCode === 401 || data.statusCode === 404) {
          toast.error("Invalid credentials");
        } else {
          toast.error("Something went wrong");
        }
        return;
      }

      // If response is successful
      dispatch(signInSuccess(data));
      toast.success("Logged In successfully");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      // Catch any network error or unexpected issue
      toast.error("Something went wrong");
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">Welcome Back</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter email"
          className="border p-3 rounded-lg"
          id="email"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Enter password"
          className="border p-3 rounded-lg"
          id="password"
          onChange={handleChange}
        />
        <div className="flex justify-end mb-3">
          <Link to="/forgot-password" className=" text-blue-600 font-light text-sm hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:bg-slate-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "loading..." : "Sign in"}
        </button>
        <OAuth />
      </form>
      <div className="flex gap-1 mt-5">
        <p>Don't have an account? </p>
        <Link to="/sign-up">
          <span className="text-blue-700 hover:text-blue-900 transition-all duration-150">
            Sign up
          </span>
        </Link>
      </div>
      <Toaster />
    </div>
  );
}

export default Signin;
