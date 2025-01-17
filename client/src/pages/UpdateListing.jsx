import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

function UpdateListing() {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    imageUrls: [], // Add imageUrls to formData to hold uploaded images
  });

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    console.log("formData.imageUrls updated:", formData.imageUrls);
  }, [formData.imageUrls]);

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      console.log(data);

      setFormData(data);
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      if (data.imageUrls && data.imageUrls.length > 0) {
        setPreviewUrls(data.imageUrls); // Assuming imageUrls are already full URLs
      }
    };
    fetchListing();
  }, []);

  const handleChange = (e) => {
    if (e.target.id == "sale" || e.target.id == "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id == "parking" ||
      e.target.id == "furnished" ||
      e.target.id == "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  // Handle file selection and create preview URLs
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 6) {
      toast.error("You can only upload a maximum of 6 images.");
      return;
    }

    const fileUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setPreviewUrls((prevUrls) => [...prevUrls, ...fileUrls]);

    // Debugging the updated preview URLs
    console.log("Preview URLs:", [...previewUrls, ...fileUrls]);
  };

  // Handle image upload logic
  const handleImageSubmit = async () => {
    if (files.length === 0) {
      toast.error("Please select images to upload.");
      return;
    }

    const maxSize = 100 * 1024 * 1024; // 100MB limit
    if (files[0].size > maxSize) {
      toast.error("File is too large. Max size is 100MB.");
      return;
    }
    setImageLoading(true);

    try {
      // Upload all images and collect their URLs
      const uploadPromises = files.map((file) => storeImage(file));
      const uploadResults = await Promise.all(uploadPromises);

      // Update the state and log the updated state inside the callback
      setFormData((prevData) => {
        const updatedData = {
          ...prevData,
          imageUrls: [...prevData.imageUrls, ...uploadResults],
        };
        return updatedData;
      });

      setUploaded(true);
      setImageLoading(false);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      setUploaded(false);
      setImageLoading(false);
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
    }
  };

  // Store image logic (using fetch)
  const storeImage = async (file) => {
    const formData = new FormData();
    formData.append("images", file); // Ensure 'images' matches your backend key

    // Log FormData to ensure files are appended correctly
    console.log("FormData before submission:", formData);

    const response = await fetch("http://localhost:3000/api/listing/upload", {
      method: "POST",
      headers: {
        // Do not set Content-Type as 'multipart/form-data'. The browser will automatically handle it.
      },
      body: formData,
      credentials: "include", // Ensure the cookie is sent with the request
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const result = await response.json();
    return result.imageUrls[0];
  };

  const handleDeleteImage = (index) => {
    const isExistingImage = index < formData.imageUrls.length;

    if (isExistingImage) {
      // Remove from imageUrls for existing images
      const updatedImageUrls = formData.imageUrls.filter((_, i) => i !== index);
      const updatedPreviewUrls = previewUrls.filter((_, i) => i !== index);

      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          imageUrls: updatedImageUrls,
        };
        console.log("Updated formData.imageUrls:", updatedFormData.imageUrls); // Log updated imageUrls
        return updatedFormData;
      });

      setPreviewUrls(updatedPreviewUrls);
    } else {
      // Remove from files and previewUrls for newly uploaded images
      const newImageIndex = index - formData.imageUrls.length;

      const updatedFiles = files.filter((_, i) => i !== newImageIndex);
      const updatedPreviewUrls = previewUrls.filter((_, i) => i !== index);

      setFiles(updatedFiles);
      setPreviewUrls(updatedPreviewUrls);

      console.log(
        "Updated previewUrls after new image deletion:",
        updatedPreviewUrls
      ); // Log updated previewUrls
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });

      const data = await res.json();
      console.log("this is server response", data);
      setLoading(false);
      toast.success("Listing added successfully");
      setTimeout(() => {
        navigate(`/listing/${data._id}`);
      }, 1000);
      if (data.success === false) {
        setError(data.message);
        toast.error("Could not create listing");
      }
    } catch (error) {
      setError(error.message);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="sale"
                onChange={handleChange}
                checked={formData.type == "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="rent"
                onChange={handleChange}
                checked={formData.type == "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="parking"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="furnished"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="offer"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                className="p-3 border border-gray-300 rounded-lg"
                required
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                className="p-3 border border-gray-300 rounded-lg"
                required
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                className="p-3 border border-gray-300 rounded-lg"
                required
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">(₹ / Month)</span>
              </div>
            </div>

            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  className="p-3 border border-gray-300 rounded-lg"
                  required
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  <span className="text-xs">(₹ / Month)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={handleFileChange}
              type="file"
              id="images"
              accept="image/*"
              multiple
              className="p-3 border border-gray-300 rounded w-full"
              disabled={uploaded}
            />
            <button
              type="button"
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:cursor-not-allowed disabled:hover:shadow-none disabled:text-green-400 disabled:border-green-400 disabled:opacity-80"
              disabled={uploaded || imageLoading}
            >
              {imageLoading ? "Uploading..." : "Upload"}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {previewUrls.length === 0 ? (
              <p className="text-gray-500">No images selected for preview</p>
            ) : (
              previewUrls.map((url, index) => (
                <div
                  key={index}
                  className="flex justify-between p-3 border items-center"
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                  {!uploaded && (
                    <button
                      type="button"
                      className="p-3 text-red-700 rounded-lg uppercase hover:text-red-800 transition-all duration-150"
                      onClick={() => handleDeleteImage(index)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          <button
            type="submit"
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:bg-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-150"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update listing"}
          </button>
        </div>
      </form>
      <Toaster />
    </main>
  );
}

export default UpdateListing;
