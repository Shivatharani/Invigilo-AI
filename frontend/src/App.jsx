import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import StudentExam from "./pages/StudentExam";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/student" element={<StudentExam />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}
