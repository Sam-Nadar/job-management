import axios from "axios";

const API_URL = "http://localhost:5000/api/jobs";

/**
 * ✅ Helper function to get token
 */
const getAuthHeaders = () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      console.error("⚠️ No JWT token found in localStorage");
    }
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  

/**
 * ✅ Create a new job
 */
export const createJob = async (jobData: object) => {
  return axios.post(API_URL, jobData, {
    headers: { ...getAuthHeaders() },
  });
};

/**
 * ✅ Bulk upload jobs from CSV/Excel file
 */
export const bulkUploadJobs = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${API_URL}/bulk-upload`, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
};

/**
 * ✅ Get jobs with optional filters (email, location, category)
 */
export const getJobs = async (filters: Record<string, string | undefined>) => {
  return axios.get(API_URL, {
    headers: { ...getAuthHeaders() },
    params: filters,
  });
};

/**
 * ✅ Export jobs to an Excel file
 */
export const exportJobsToExcel = async (filters: Record<string, string | undefined>) => {
  return axios.get(`${API_URL}/export-excel`, {
    headers: { ...getAuthHeaders() },
    params: filters,
    responseType: "blob",
  });
};

/**
 * ✅ Update a job by ID (Only if user is the creator)
 */
export const updateJob = async (
    jobId: string,
    jobData: Partial<{ title: string; description: string; salary: number; location: string; category: string }>
) => {
    const token = localStorage.getItem("jwtToken");
    
    if (!token) {
        console.error("⚠️ No JWT token found in localStorage");
        throw new Error("Unauthorized! No token provided.");
    }

    console.log("Sending Authorization Token:", token); // ✅ Debugging

    return axios.patch(`${API_URL}/${jobId}`, jobData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

/**
 * ✅ Delete a job by ID (Only if user is the creator)
 */
export const deleteJob = async (jobId: string) => {
  return axios.delete(`${API_URL}/${jobId}`, {
    headers: { ...getAuthHeaders() },
  });
};
