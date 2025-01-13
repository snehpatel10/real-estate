import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signoutStart,
  signoutSuccess,
  signoutFailure,
} from "../features/userSlice";
import toast, { Toaster } from "react-hot-toast";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [formData, setFormData] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setFormData({
      username: currentUser.username,
      email: currentUser.email,
      password: "",
    });
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        dispatch(updateUserFailure(data.message));
        toast.error("An error occurred. Please try again.");
        return;
      }

      dispatch(updateUserSuccess(data.rest));
      toast.success("Changes saved successfully!");
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      toast.error("Internal server error. Please try again later.");
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(deleteUserFailure(data.message));
        toast.error("An error occurred while deleting your account.");
        return;
      }
      dispatch(deleteUserSuccess(data));
      toast.success("Your account has been deleted.");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      toast.error("Internal server error. Please try again later.");
    }
    setIsDeleteModalOpen(false);
  };

  const handleSignout = async () => {
    try {
      dispatch(signoutStart());
      const res = await fetch("/api/auth/signout", {
        method: "GET",
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(signoutFailure(data.message));
        toast.error(data.message || "Signout failed. Please try again.");
      } else {
        dispatch(signoutSuccess());
        toast.success("Signed out successfully.");
        navigate("/");
      }
    } catch (error) {
      dispatch(signoutFailure(error.message));
      toast.error("Internal server error. Please try again later.");
    }
    setIsSignoutModalOpen(false);
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={currentUser.avatar}
          alt="profile"
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        <input
          type="text"
          placeholder="username"
          value={formData.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="email"
          value={formData.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading || !formData.password}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:bg-slate-800 disabled:opacity-50 transition-all disabled:cursor-not-allowed disabled:bg-slate-800 duration-150"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span
          onClick={() => setIsSignoutModalOpen(true)}
          className="text-red-700 cursor-pointer"
        >
          Sign out
        </span>
      </div>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        contentLabel="Confirm Delete"
        className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold text-center mb-4">Are you sure?</h2>
        <p className="text-center text-gray-600 mb-6">
          This action cannot be undone. Do you really want to delete your
          account?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleDeleteUser}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </Modal>

      {/* Signout Confirmation Modal */}
      <Modal
        isOpen={isSignoutModalOpen}
        onRequestClose={() => setIsSignoutModalOpen(false)}
        contentLabel="Confirm Signout"
        className="bg-white p-6 rounded-lg shadow-lg w-96 mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold text-center mb-4">Are you sure?</h2>
        <p className="text-center text-gray-600 mb-6">
          Do you really want to sign out of your account?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleSignout}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Yes, Sign Out
          </button>
          <button
            onClick={() => setIsSignoutModalOpen(false)}
            className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </Modal>

      <Toaster />
    </div>
  );
}

export default Profile;
