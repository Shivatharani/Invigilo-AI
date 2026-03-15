import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-5 bg-black/30 backdrop-blur-md">
      <h1 className="text-2xl font-bold text-cyan-400">
        Smart Exam AI
      </h1>

      <div className="space-x-6">
        <Link to="/" className="hover:text-cyan-300">Home</Link>
        <Link to="/student" className="hover:text-cyan-300">Student</Link>
        <Link to="/admin" className="hover:text-cyan-300">Admin</Link>
      </div>
    </nav>
  );
}
