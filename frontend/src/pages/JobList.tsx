import { useEffect, useState } from "react";
import { getJobs, exportJobsToExcel } from "../api/job";
import { showError, showSuccess } from "../utils/toast";
import Loading from "../components/Loading";
import JobCard from "../components/JobCard";
import Navbar from "../components/Navbar"; 
import { useNavigate } from "react-router-dom";

const JobList = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("email");
  const [filterValue, setFilterValue] = useState<string>("");
  const [limit] = useState<number>(5);
  const [page, setPage] = useState<number>(1);
  const [debouncedFilter, setDebouncedFilter] = useState<string>(""); //  Add debounced filter

  const token = localStorage.getItem("jwtToken");
  const currentUserEmail = localStorage.getItem("userEmail") || "";
  const navigate = useNavigate(); 

  // Redirect to login if no token is found
  useEffect(() => {
    if (!token) {
      showError("Unauthorized! Redirecting to login...");
      navigate("/login");
    }
  }, [token, navigate]);

  //  Debounce filter input (waits 1.5s after last keypress)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilter(filterValue);
    }, 1500);

    return () => clearTimeout(handler); // Cleanup timeout on new input
  }, [filterValue]);

  const fetchJobs = async () => {
    if (!token) {
      showError("Unauthorized! Please log in.");
      return;
    }

    setLoading(true);
    try {
      const filters: Record<string, string | undefined> = { 
        limit: String(limit), 
        page: String(page) 
      };

      if (debouncedFilter) filters[filterType] = debouncedFilter; //  Use debounced filter

      const { data } = await getJobs(filters);
      setJobs(data.data);
    } catch (error) {
      showError("Failed to fetch jobs.");
    }
    setLoading(false);
  };

  // Fetch jobs when page, filter type, or debounced filter changes
  useEffect(() => {
    fetchJobs();
  }, [page, filterType, debouncedFilter]); 

  const handleDownload = async () => {
    if (!token) {
      showError("Unauthorized! Please log in.");
      return;
    }

    setLoading(true);
    try {
      const filters = debouncedFilter ? { [filterType]: debouncedFilter } : {};
      const response = await exportJobsToExcel(filters);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "jobs.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess("Excel file downloaded!");
    } catch (error) {
      showError("Download failed.");
    }
    setLoading(false);
  };

  const handleNextPage = () => setPage((prev) => prev + 1);
  const handlePrevPage = () => setPage((prev) => (prev > 1 ? prev - 1 : 1));

  if (loading) return <Loading />;

  return (
    <div>
      <Navbar /> 
      <div className="p-8">
        <h2 className="text-3xl font-bold mb-4">Job List</h2>

        <div className="mb-4 flex gap-2">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="border p-2">
            <option value="email">Email</option>
            <option value="location">Location</option>
            <option value="category">Category</option>
          </select>
          <input
            type="text"
            placeholder={`Filter by ${filterType}`}
            className="border p-2"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
          <button onClick={fetchJobs} className="bg-blue-600 text-white p-2">Apply Filter</button>
          <button onClick={handleDownload} className="bg-green-600 text-white p-2">Download</button>
        </div>

        {jobs.length === 0 ? (
          <p>No jobs found.</p>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} currentUserEmail={currentUserEmail} refreshJobs={fetchJobs} />)
        )}

        {/* Pagination Controls */}
        <div className="flex justify-between mt-6">
          <button onClick={handlePrevPage} disabled={page === 1} className="bg-gray-500 text-white p-2 rounded disabled:opacity-50">
            Previous
          </button>
          <span className="text-lg font-bold">Page {page}</span>
          <button onClick={handleNextPage} className="bg-gray-500 text-white p-2 rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobList;
