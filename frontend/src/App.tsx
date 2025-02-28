import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import CreateJob from "./pages/CreateJob";
import JobList from "./pages/JobList";
import { Toaster } from "react-hot-toast";
import CompanyLogoUpload from "./pages/CompanyLogo";

const App = () => {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/createJobs" element={<CreateJob />} />
        <Route path="/jobList" element={<JobList />} />
        <Route path="/company-logo" element={<CompanyLogoUpload />} />
      </Routes>
    </Router>
  );
};

export default App;
