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
  const [showListingError, setShowListingError] = useState(false);
  const [userListings, setUserListings] = useState([]);
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

  const handleShowListings = async () => {
    try {
      setShowListingError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingError(true);
        toast.error("Error showing listings");
      }
      setShowListingError(false);
      setUserListings(data);
      console.log(userListings);
    } catch (error) {
      setShowListingError(true);
      toast.error("Something went wrong");
    }
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
      <div className="flex justify-between  mt-6">
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className=" text-red-700 font-normal  hover:text-red-800 transition-all duration-150"
        >
          Delete Account
        </button>

        <button
          onClick={() => setIsSignoutModalOpen(true)}
          className=" text-red-700 font-normal hover:text-red-800 transition-all duration-150"
        >
          Sign Out
        </button>
      </div>

      <button
        className="text-green-700 mt-5 w-full mb-3"
        onClick={handleShowListings}
      >
        {" "}
        Show listings
      </button>

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

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">Your Listings</h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="border rounded-lg p-3 flex justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt="Listing Cover"
                  className="h-16 w-18 object-contain rounded"
                />
              </Link>
              <Link
                to={`/listing/${listing._id}`}
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
              >
                <p>{listing.name}</p>
              </Link>

              <div className="flex flex-col items-center"></div>
              <button className="text-red-700 uppercase">Delete</button>
              <button className="text-green-700 uppercase">Edit</button>
            </div>
          ))}
        </div>
      )}

      <Toaster />
    </div>
  );
}

export default Profile;
