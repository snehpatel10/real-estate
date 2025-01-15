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
import { Link } from "react-router-dom";

function Profile() {
  const fileRef = useRef(null);
  const { currentUser, loading } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [avatar, setAvatar] = useState(null); // Track avatar file
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    setFormData({
      username: currentUser.username,
      email: currentUser.email,
      password: "",
      avatar: currentUser.avatar,
    });
  }, [currentUser]);

  const isFormChanged = () => {
    return (
      formData.username !== currentUser.username ||
      formData.email !== currentUser.email ||
      formData.password !== "" ||
      avatar !== currentUser.avatar
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]); // Update the avatar file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = new FormData(); // Use FormData to handle file uploads
    if (formData.username !== currentUser.username) {
      payload.append("username", formData.username);
    }
    if (formData.email !== currentUser.email) {
      payload.append("email", formData.email);
    }
    if (formData.password) {
      payload.append("password", formData.password);
    }
    if (avatar) {
      payload.append("avatar", avatar); // Append avatar to the form data
    }

    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) {
        dispatch(updateUserFailure(data.message));
        toast.error(data.message || "An error occurred. Please try again.");
        return;
      }
      dispatch(updateUserSuccess(data.user));
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

      if (res.ok) {
        dispatch(deleteUserSuccess(data)); // Dispatch success
        toast.success("Your account has been deleted.");
        navigate("/"); // Redirect to home page after deletion
      } else {
        dispatch(deleteUserFailure(data.message)); // Dispatch failure if something went wrong
        toast.error(
          data.message || "An error occurred while deleting your account."
        );
      }
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
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        encType="multipart/form-data"
      >
        <input
          onChange={handleFileChange}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          onClick={() => fileRef.current.click()}
          src={avatar ? URL.createObjectURL(avatar) : currentUser.avatar}
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
          disabled={loading || !isFormChanged()}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:bg-slate-800 disabled:opacity-50 transition-all disabled:cursor-not-allowed disabled:bg-slate-800 duration-150"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <Link
          to="/create-listing"
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:bg-green-800 transition-all duration-150"
        >
          Create Listing
        </Link>
      </form>

      {/* Delete User Button */}
      <div className="flex justify-between gap-4 mt-6">
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="bg-red-600 text-white rounded-lg px-6 py-3 hover:bg-red-700 transition-all"
        >
          Delete Account
        </button>

        <button
          onClick={() => setIsSignoutModalOpen(true)}
          className="bg-gray-700 text-white rounded-lg px-6 py-3 hover:bg-gray-800 transition-all"
        >
          Sign Out
        </button>
      </div>

      {/* Delete User Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        className="modal p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          Are you sure?
        </h2>
        <p className="text-center mb-4">
          This action will permanently delete your account.
        </p>
        <div className="flex justify-between gap-4">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-500 px-6 py-2 text-lg rounded-lg text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteUser}
            className="bg-red-600 px-6 py-2 text-lg rounded-lg text-white"
          >
            Yes, Delete
          </button>
        </div>
      </Modal>

      {/* Sign Out Modal */}
      <Modal
        isOpen={isSignoutModalOpen}
        onRequestClose={() => setIsSignoutModalOpen(false)}
        className="modal p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <h2 className="text-xl font-semibold text-center mb-4">
          Are you sure?
        </h2>
        <p className="text-center mb-4">
          You will be logged out of your account.
        </p>
        <div className="flex justify-between gap-4">
          <button
            onClick={() => setIsSignoutModalOpen(false)}
            className="bg-gray-500 px-6 py-2 text-lg rounded-lg text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSignout}
            className="bg-gray-700 px-6 py-2 text-lg rounded-lg text-white"
          >
            Yes, Sign Out
          </button>
        </div>
      </Modal>

      <Toaster />
    </div>
  );
}

export default Profile;
