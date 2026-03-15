import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, PlayCircle, LogOut } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("role");
    const user = localStorage.getItem("username");
    if (role !== "student") {
      navigate("/login");
      return;
    }
    setUsername(user || "Student");
  }, [navigate]);

  const startExam = async (examId) => {
    try {
      const response = await fetch(`http://localhost:8000/start-session?student_id=${username}&exam_id=${examId}`, {
        method: "POST"
      });
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to start exam session");
      
      localStorage.setItem("session_id", data.session_id);
      navigate("/student"); // navigate to the actual exam screen
    } catch (error) {
      toast.error(error.message);
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const exams = [
    { id: "CS101", title: "Introduction to Computer Science", duration: "120 mins", questions: 50 },
    { id: "MATH201", title: "Advanced Calculus", duration: "180 mins", questions: 40 },
    { id: "PHY101", title: "Physics Fundamentals", duration: "90 mins", questions: 30 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back, {username}</h1>
            <p className="mt-2 text-slate-400">You have 3 upcoming examinations available.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Exams Grid */}
        <div>
          <h2 className="mb-6 text-xl font-semibold text-white">Available Exams</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <div key={exam.id} className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-6 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
                <div>
                  <div className="mb-4 inline-flex items-center space-x-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400">
                    <BookOpen className="h-4 w-4" />
                    <span>{exam.id}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-white">{exam.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{exam.duration}</span>
                    </span>
                    <span>•</span>
                    <span>{exam.questions} Questions</span>
                  </div>
                </div>
                
                <button
                  onClick={() => startExam(exam.id)}
                  className="mt-6 flex w-full items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Start Examination</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
