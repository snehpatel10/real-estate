import React, { useState } from "react";
import toast, { Toaster } from 'react-hot-toast'

function CreateListing() {
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploaded, setUploaded] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    sale: false,
    rent: false,
    parking: false,
    furnished: false,
    offer: false,
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 1,
    discountPrice: 1,
    imageUrls: []  // Add imageUrls to formData to hold uploaded images
  });

  // Handle file selection and create preview URLs
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 6) {
      toast.error("You can only upload a maximum of 6 images.");
      return;
    }
    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    const fileUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prevUrls) => [...prevUrls, ...fileUrls]);
  };

  // Handle image upload logic
  const handleImageSubmit = async () => {
    if (files.length === 0) {
      toast.error("Please select images to upload.");
      return;
    }
  
    const maxSize = 100 * 1024 * 1024;  // 100MB limit
    if (files[0].size > maxSize) {
      toast.error("File is too large. Max size is 100MB.");
      return;
    }
  
    try {
      // Upload all images and collect their URLs
      const uploadPromises = files.map((file) => storeImage(file));
      const uploadResults = await Promise.all(uploadPromises);
  
      // Debugging the upload results
      console.log("Upload Results:", uploadResults);
  
      // Update the state and log the updated state inside the callback
      setFormData((prevData) => {
        const updatedData = {
          ...prevData,
          imageUrls: [...prevData.imageUrls, ...uploadResults],
        };
  
        console.log('Updated formData inside setState:', updatedData);
        return updatedData;
      });
  
      setUploaded(true);
      toast.success("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Failed to upload images. Please try again.");
    }
  };

  // Store image logic (using fetch)
  const storeImage = async (file) => {
    const formData = new FormData();
    formData.append("images", file);  // Ensure 'images' matches your backend key
    
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
    console.log('Upload result:', result); 
    return result.imageUrls[0]; 
  };


  // Remove image from preview and file list
  const handleDeleteImage = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setPreviewUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Create a Listing</h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="sale"
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="rent"
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="parking"
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="furnished"
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                className="w-5"
                id="offer"
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
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="1"
                max="10"
                className="p-3 border border-gray-300 rounded-lg"
                required
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">(₹ / Month)</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountPrice"
                min="1"
                max="10"
                className="p-3 border border-gray-300 rounded-lg"
                required
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">(₹ / Month)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <input
            onChange={handleFileChange}
            type="file"
            id="images"
            accept="image/*"
            multiple
            className="p-3 border border-gray-300 rounded w-full"
            disabled={uploaded}
          />
          <div className="flex flex-col gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="flex justify-between p-3 border items-center">
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
            ))}
          </div>
          <button
            type="button"
            onClick={handleImageSubmit}
            className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            disabled={uploaded}
          >
            Upload
          </button>
          <button
            type="button"
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:bg-slate-800 disabled:opacity-80 transition-all duration-150"
            disabled={!uploaded}
          >
            Create Listing
          </button>
        </div>
      </form>
      <Toaster />
    </main>
  );
}

export default CreateListing;
