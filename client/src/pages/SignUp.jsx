import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { set } from "mongoose";

function Signup() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    if(data.success === false){
      setError(data.message);
      setLoading(false);
      if(data.statusCode === 409){
        toast.error('User already exists');
      }
      else{
        toast.error('Account creation failed');
      }
      return;
    }
    else{
      setError(null);
      toast.success('Account created successfully');
      setLoading(false);
      setTimeout(() => {
        navigate("/sign-in");
      }, 1000);
    }
    setLoading(false);
    } catch (error) {
      toast.error('Something went wrong');
      setLoading(false);
    }
    
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-semibold my-7">
        Create an account
      </h1>
      <form className="flex flex-col gap-4"  onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter username"
          className="border p-3 rounded-lg"
          id="username"
          onChange={handleChange}
        />
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
        <button disabled={loading} type="submit" className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:bg-slate-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? "loading..." : "Sign up"}
        </button>
      </form>
      <div className="flex gap-1 mt-5">
        <p>Have an account? </p>
        <Link to="/sign-in">
          <span className="text-blue-700 hover:text-blue-900 transition-all duration-150">
            Sign in
          </span>
        </Link>
      </div>
      <Toaster />
    </div>
  );
}
export default Signup;
