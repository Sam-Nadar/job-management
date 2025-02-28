import { useEffect, useState } from "react";
import { createJob, bulkUploadJobs } from "../api/job";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../utils/toast";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar"; 

const CreateJob = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    salary: "",
    category: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("jwtToken");

  // Redirect to login if no token is found
  useEffect(() => {
    if (!token) {
      showError("Unauthorized! Redirecting to login...");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      showError("Unauthorized! Please log in.");
      return;
    }

    setLoading(true);
    try {
      await createJob({ ...formData, salary: parseInt(formData.salary, 10) });
      showSuccess("Job created successfully!");
      navigate("/jobList");
    } catch (error) {
      showError("Failed to create job.");
    }
    setLoading(false);
  };

  const handleFileUpload = async () => {
    if (!file) {
      showError("Please select a file.");
      return;
    }
    if (!token) {
      showError("Unauthorized! Please log in.");
      return;
    }

    setLoading(true);
    try {
      await bulkUploadJobs(file);
      showSuccess("Bulk jobs uploaded successfully!");
      navigate("/jobList");
    } catch (error) {
      showError("Bulk upload failed.");
    }
    setLoading(false);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Navbar /> 
      <div className="flex justify-center items-center h-[110vh] bg-gray-100 mt-[2px]">
        <div className="w-full sm:w-96 md:w-[500px] p-8 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create Job</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" name="title" placeholder="Job Title" 
              className="border border-gray-300 rounded-lg p-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={handleChange} required 
            />
            <textarea 
              name="description" placeholder="Job Description" 
              className="border border-gray-300 rounded-lg p-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={handleChange} required 
            />
            <input 
              type="number" name="salary" placeholder="Salary" 
              className="border border-gray-300 rounded-lg p-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={handleChange} required 
            />
            <input 
              type="text" name="category" placeholder="Category" 
              className="border border-gray-300 rounded-lg p-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={handleChange} required 
            />
            <input 
              type="text" name="location" placeholder="Location" 
              className="border border-gray-300 rounded-lg p-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={handleChange} required 
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white text-lg font-semibold p-3 rounded-lg w-full transition duration-300 hover:bg-blue-700"
            >
              Create Job
            </button>
          </form>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-center mb-4">Bulk Upload Jobs</h2>
            <input 
              type="file" accept=".xlsx, .csv" 
              className="border border-gray-300 rounded-lg p-3 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
            <button 
              onClick={handleFileUpload} 
              className="bg-green-600 text-white text-lg font-semibold p-3 rounded-lg w-full mt-4 transition duration-300 hover:bg-green-700"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJob;
