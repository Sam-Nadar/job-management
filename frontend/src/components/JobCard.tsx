import { useState } from "react";
import { deleteJob, updateJob } from "../api/job";
import { showError, showSuccess } from "../utils/toast";

interface JobProps {
  job: {
    id: string;
    title: string;
    description: string;
    salary: number;
    location: string;
    category: string;
    posted_by_email: string;
    created_at: string;
  };
  currentUserEmail: string;
  refreshJobs: () => void;
}

const JobCard: React.FC<JobProps> = ({ job, currentUserEmail, refreshJobs }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    title: job.title,
    description: job.description,
    salary: job.salary.toString(),
    location: job.location,
    category: job.category,
  });

  const token = localStorage.getItem("jwtToken");

  const handleDelete = async () => {
    if (!token) {
      showError("Unauthorized! Please log in.");
      return;
    }

    try {
      await deleteJob(job.id);
      showSuccess("Job deleted successfully!");
      refreshJobs();
    } catch (error) {
      showError("Failed to delete job.");
    }
  };

  const handleEdit = async () => {
    if (!token) {
      showError("Unauthorized! Please log in.");
      return;
    }
  
    // ✅ Construct updated fields (Only include changed fields)
    const updatedFields: Partial<{ title: string; description: string; salary: number; location: string; category: string }> = {};
  
    if (editData.title !== job.title) updatedFields.title = editData.title;
    if (editData.description !== job.description) updatedFields.description = editData.description;
    if (editData.salary !== job.salary.toString()) updatedFields.salary = parseInt(editData.salary, 10); //  Convert salary to number
    if (editData.location !== job.location) updatedFields.location = editData.location;
    if (editData.category !== job.category) updatedFields.category = editData.category;
  
    if (Object.keys(updatedFields).length === 0) {
      showError("Please change at least one field to update.");
      return;
    }
  
    try {
      await updateJob(job.id, updatedFields);
      showSuccess("Job updated successfully!");
      refreshJobs();
      setShowEditModal(false);
    } catch (error) {
      showError("Failed to update job.");
    }
  };

  return (
    <div className="border p-4 rounded shadow-lg bg-white mb-4">
      <h3 className="text-xl lg:text-2xl font-bold">{job.title}</h3>
      <p className="text-sm text-gray-600">{job.category}</p>
      <p className="mt-2 text-gray-700">{job.description}</p>
      <p className="text-sm text-gray-900">Salary: ${job.salary}</p>
      <p className="text-sm text-gray-700">Location: {job.location}</p>
      <p className="text-sm text-gray-600">Posted by: {job.posted_by_email}</p>
      <p className="text-xs text-gray-500">Posted on: {new Date(job.created_at).toLocaleDateString()}</p>

      {currentUserEmail === job.posted_by_email && (
        <div className="mt-4 flex gap-2">
          <button onClick={() => setShowEditModal(true)} className="bg-yellow-500 text-white px-3 py-1 rounded">✏️ Edit</button>
          <button onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded">🗑️ Delete</button>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Edit Job</h2>
            <input type="text" name="title" className="border p-2 w-full mb-2" value={editData.title} onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
            <textarea name="description" className="border p-2 w-full mb-2" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })}></textarea>
            <input type="number" name="salary" className="border p-2 w-full mb-2" value={editData.salary} onChange={(e) => setEditData({ ...editData, salary: e.target.value })} />
            <input type="text" name="location" className="border p-2 w-full mb-2" value={editData.location} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
            <input type="text" name="category" className="border p-2 w-full mb-2" value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowEditModal(false)} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
              <button onClick={handleEdit} className="bg-blue-500 text-white px-3 py-1 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
