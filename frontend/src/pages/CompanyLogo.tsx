import { useState } from "react";
import axios from "axios";
import { showError, showSuccess } from "../utils/toast";
import Navbar from "../components/Navbar"; 

const API_URL = `${import.meta.env.VITE_API_URL}/api/company`; // ✅ Update API URL

const CompanyLogoUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("jwtToken"); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]); //  Store the selected file
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showError("Please select an image file.");
      return;
    }

    if (!token) {
      showError("Unauthorized! Please log in.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/PNG"];
    if (!allowedTypes.includes(file.type)) {
      showError("Invalid file type. Only JPEG, JPG, PNG are allowed.");
      return;
    }

    const formData = new FormData();
    formData.append("logo", file);

    setLoading(true);
    try {
      await axios.post(`${API_URL}/upload-logo`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      showSuccess("Company logo uploaded successfully!");
      setFile(null); // Reset file input after successful upload
    } catch (error) {
      showError("Failed to upload logo.");
    }
    setLoading(false);
  };

  return (
    <div>
      <Navbar /> 
      <div className="p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Upload Company Logo</h2>

        <input type="file" accept=".jpeg,.jpg,.png,.PNG" onChange={handleFileChange} className="border p-2 w-full mb-4" />
        <button onClick={handleUpload} className="bg-blue-600 text-white p-2 w-full" disabled={loading}>
          {loading ? "Uploading..." : "Upload Logo"}
        </button>
      </div>
    </div>
  );
};

export default CompanyLogoUpload;
