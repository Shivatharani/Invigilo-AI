import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, AlertTriangle, CheckCircle, LogOut, ShieldAlert, ArrowRight, Video, MicOff, MonitorSmartphone } from "lucide-react";
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

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleContinue = () => {
    navigate("/select-subject");
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome, {username}</h1>
            <p className="mt-2 text-slate-400">Please read the examination guidelines carefully before proceeding.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 rounded-md border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <ShieldAlert className="h-8 w-8 text-blue-500" />
            <h2 className="text-2xl font-semibold text-white">Examination Instructions</h2>
          </div>
          
          <p className="text-slate-300 leading-relaxed text-lg">
            This examination is strictly monitored using an advanced AI proctoring system to ensure academic integrity. Any suspicious activity will be flagged and recorded for review.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-800 flex gap-4 items-start">
               <Video className="w-6 h-6 text-emerald-400 mt-1 shrink-0" />
               <div>
                  <h3 className="text-white font-semibold mb-1">Continuous Camera Monitoring</h3>
                  <p className="text-sm text-slate-400">Your webcam must remain active. Multiple faces, missing faces, or looking away frequently will be flagged.</p>
               </div>
            </div>
            
            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-800 flex gap-4 items-start">
               <MonitorSmartphone className="w-6 h-6 text-rose-400 mt-1 shrink-0" />
               <div>
                  <h3 className="text-white font-semibold mb-1">Strict Browser Lock</h3>
                  <p className="text-sm text-slate-400">Switching tabs, minimizing the screen, exiting fullscreen, or losing focus will immediately incur penalties.</p>
               </div>
            </div>

            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-800 flex gap-4 items-start">
               <AlertTriangle className="w-6 h-6 text-amber-400 mt-1 shrink-0" />
               <div>
                  <h3 className="text-white font-semibold mb-1">Keyboard Shortcuts Disabled</h3>
                  <p className="text-sm text-slate-400">Copying, pasting, and common keyboard shortcuts (e.g., Ctrl+C, Alt+Tab) are disabled. Right-clicking is not permitted.</p>
               </div>
            </div>

            <div className="bg-slate-800/50 p-5 rounded-xl border border-slate-800 flex gap-4 items-start">
               <MicOff className="w-6 h-6 text-blue-400 mt-1 shrink-0" />
               <div>
                  <h3 className="text-white font-semibold mb-1">Audio Surveillance</h3>
                  <p className="text-sm text-slate-400">Any detected speech or background conversations will trigger an audio violation warning.</p>
               </div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mt-6 flex items-center gap-3">
             <CheckCircle className="w-6 h-6 text-blue-500 shrink-0" />
             <p className="text-sm text-blue-100">I have read the instructions and agree to the terms of the examination. I understand that violations will be reported to the administrator.</p>
          </div>

          <div className="pt-6 flex justify-end">
             <button
                onClick={handleContinue}
                className="flex items-center space-x-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span>Continue to Subject Selection</span>
                <ArrowRight className="h-5 w-5" />
              </button>
          </div>
        </div>

      </div>
    </div>
  );
}
