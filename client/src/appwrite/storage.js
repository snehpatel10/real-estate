import { Client, ID, Storage } from "appwrite";

// Initialize the Appwrite client and storage
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_API_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const storage = new Storage(client);

// File upload service
const uploadFile = async (file) => {
  try {
    return await storage.createFile(import.meta.env.VITE_APPWRITE_BUCKET_ID, ID.unique(), file);
  } catch (error) {
    console.error("Appwrite service :: uploadFile :: error", error);
    return false;
  }
};

// File deletion service
const deleteFile = async (fileId) => {
  try {
    await storage.deleteFile(import.meta.env.VITE_APPWRITE_BUCKET_ID, fileId);
    return true;
  } catch (error) {
    console.error("Appwrite service :: deleteFile :: error", error);
    return false;
  }
};

// Get file preview
const getFilePreview = (fileId) => {
  try {
    return storage.getFilePreview(import.meta.env.VITE_APPWRITE_BUCKET_ID, fileId);
  } catch (error) {
    console.error("Appwrite service :: getFilePreview :: error", error);
    return false;
  }
};

// Export the functional services
export const authStorage = {
  uploadFile,
  deleteFile,
  getFilePreview,
};

export default authStorage;
