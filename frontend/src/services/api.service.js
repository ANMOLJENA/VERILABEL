import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

// File upload function
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    // Determine endpoint based on file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const endpoint = fileExtension === 'pdf' ? '/api/ocr/pdf' : '/api/ocr/image';

    const response = await axios.post(`${API_BASE_URL}${endpoint}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to upload file",
    };
  }
};

// Text validation function
export const validateText = async (text) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/validation/validate-text`, {
      text: text,
    });

    return response.data;
  } catch (error) {
    console.error("Validation error:", error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to validate text",
    };
  }
};

// Get verified controls function
export const getRules = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/verified/`);
    return response.data;
  } catch (error) {
    console.error("Get rules error:", error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to fetch rules",
    };
  }
};

// Comparison function
export const runComparison = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE_URL}/api/comparison/run/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Comparison error:", error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || "Failed to run comparison",
    };
  }
};

// Export all functions
export default {
  uploadFile,
  validateText,
  getRules,
  runComparison,
};
