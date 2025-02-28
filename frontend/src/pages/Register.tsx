import { useState } from "react";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "../utils/toast";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await registerUser(email, password);
      if (response.status === 200 || response.status === 201) {
        showSuccess("Registration successful!");
        navigate("/login");
      }
    } catch (error: any) {
      showError(error.response?.data?.error || "Registration failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="w-full sm:w-96 md:w-[500px] p-8 bg-white shadow-lg rounded-lg" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Register</h2>
        
        <input 
          type="email" 
          className="border border-gray-300 rounded-lg p-3 w-full text-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        
        <input 
          type="password" 
          className="border border-gray-300 rounded-lg p-3 w-full text-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        
        <button 
          type="submit" 
          className="bg-blue-600 text-white text-lg font-semibold p-3 rounded-lg w-full transition duration-300 hover:bg-blue-700" 
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
