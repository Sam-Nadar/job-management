import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi"; 
const Navbar = () => {
  return (
    <nav className="bg-[#18183b] p-4 flex justify-between items-center ">
      <h1 className="text-white text-lg font-bold">JM</h1>
      <div className="flex items-center gap-4">
        <Link 
          to="/createJobs" 
          className="flex items-center justify-center w-10 h-10 bg-white text-[#18183b] rounded-full shadow-lg"
        >
          <FiPlus size={24} /> {/* Icon */}
        </Link>
        <Link to="/jobList" className="text-white">JobList</Link>
        <Link to="/company-logo" className="text-white">Logo Upload</Link>
      </div>
    </nav>
  );
};

export default Navbar;
