import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpen, Code, Database, Globe, Cpu, Loader2, ArrowRight, ArrowLeft } from "lucide-react";

const SUBJECTS = [
  { id: "ds", name: "Data Structures", icon: <Database className="w-6 h-6" /> },
  { id: "algo", name: "Algorithms", icon: <Code className="w-6 h-6" /> },
  { id: "py", name: "Python Programming", icon: <Code className="w-6 h-6" /> },
  { id: "c", name: "C Programming", icon: <Code className="w-6 h-6" /> },
  { id: "java", name: "Java", icon: <Code className="w-6 h-6" /> },
  { id: "dbms", name: "Database Management System (DBMS)", icon: <Database className="w-6 h-6" /> },
  { id: "os", name: "Operating Systems", icon: <Cpu className="w-6 h-6" /> },
  { id: "cn", name: "Computer Networks", icon: <Globe className="w-6 h-6" /> },
  { id: "block", name: "Blockchain", icon: <BookOpen className="w-6 h-6" /> },
  { id: "iot", name: "Internet of Things (IoT)", icon: <Cpu className="w-6 h-6" /> },
  { id: "ai", name: "Artificial Intelligence", icon: <BookOpen className="w-6 h-6" /> },
  { id: "ml", name: "Machine Learning", icon: <BookOpen className="w-6 h-6" /> },
];

export default function SubjectSelection() {
  const navigate = useNavigate();
  const [loadingSubject, setLoadingSubject] = useState(null);

  const handleSelectSubject = async (subject) => {
    setLoadingSubject(subject.id);
    toast.loading(`Loading questions for ${subject.name}...`, { id: 'loading' });

    try {
      // Create session first
      const username = localStorage.getItem("username") || "Student";
      const startRes = await fetch(`http://localhost:8000/start-session?student_id=${username}&exam_id=${subject.id}`, {
        method: "POST"
      });
      const startData = await startRes.json();
      if (!startRes.ok) throw new Error("Failed to start exam session");
      
      localStorage.setItem("session_id", startData.session_id);

      // First ensure questions are generated/fetched
      const res = await fetch(`http://localhost:8000/api/questions/${encodeURIComponent(subject.name)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch questions from AI");
      }
      
      const questions = await res.json();
      toast.success("Questions ready!", { id: 'loading' });
      
      // Navigate to exam and pass subject + questions
      navigate("/student", { state: { subject: subject.name, questions } });

    } catch (error) {
      console.error(error);
      toast.error(`Error: ${error.message}`, { id: 'loading' });
    } finally {
      setLoadingSubject(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 flex flex-col items-center relative">
      <button 
        onClick={() => navigate("/student-dashboard")} 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg transition-all hover:bg-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> 
        <span className="font-medium text-sm">Return to Dashboard</span>
      </button>

      <div className="w-full max-w-5xl mt-12 md:mt-0">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-4">
            Select Exam Subject
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose your examination subject to begin. AI will dynamically prepare your assessment. Ensure you are ready, as proctoring will begin immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {SUBJECTS.map((subject) => (
            <button
              key={subject.id}
              onClick={() => handleSelectSubject(subject)}
              disabled={loadingSubject !== null}
              className={`relative group flex flex-col items-center justify-center p-6 rounded-2xl border text-center transition-all duration-300
                ${loadingSubject === subject.id 
                  ? "border-blue-500 bg-blue-500/10" 
                  : "border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 hover:-translate-y-1"
                } ${loadingSubject !== null && loadingSubject !== subject.id ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className={`p-4 rounded-full mb-4 transition-colors ${loadingSubject === subject.id ? "bg-blue-500 text-white" : "bg-slate-800 text-blue-400 group-hover:bg-blue-500 group-hover:text-white"}`}>
                {loadingSubject === subject.id ? <Loader2 className="w-6 h-6 animate-spin" /> : subject.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{subject.name}</h3>
              <div className="mt-2 text-sm text-slate-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Start Exam <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
