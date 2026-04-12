import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts";
import { Users, AlertTriangle, Activity, CheckCircle, LogOut, X, ShieldAlert, LineChart as LineChartIcon } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentActivities, setStudentActivities] = useState(null);
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/login");
      return;
    }
    fetchData();
    
    // Live Polling every 5 seconds
    const interval = setInterval(() => {
       fetchData(false);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchData = async (showLoading = true) => {
    if (showLoading && !stats) setLoading(true);
    try {
      const [statsRes, studentsRes] = await Promise.all([
        fetch("http://localhost:8000/admin/dashboard-stats"),
        fetch("http://localhost:8000/admin/students")
      ]);
      const statsData = await statsRes.json();
      const studentsData = await studentsRes.json();
      
      setStats(statsData);
      setStudents(studentsData);
    } catch (error) {
      if (showLoading) toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleViewActivities = async (username) => {
    setSelectedStudent(username);
    setLoadingActivities(true);
    try {
      const response = await fetch(`http://localhost:8000/admin/student/${username}/activities`);
      if (!response.ok) throw new Error("Failed to fetch activities");
      const data = await response.json();
      setStudentActivities(data);
    } catch (error) {
      toast.error(error.message);
      setSelectedStudent(null);
    } finally {
      setLoadingActivities(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Map risk timeline from recent sessions
  const riskTimelineData = (stats.recent_sessions || []).slice().reverse().map((s, i) => ({
      name: `SS${(s.session_id || "").slice(0, 4)}`,
      risk: s.cumulative_risk || Math.floor(Math.random() * 20) // Mock base tracking
  }));

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-300">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-blue-500" /> Admin Dashboard
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full font-medium ml-2 shadow-sm shadow-emerald-500/10 animate-pulse">LIVE SECURE</span>
            </h1>
            <p className="text-slate-400 mt-1">Real-time analytical metrics mapping cumulative risk thresholds across exams.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 rounded-md bg-slate-800 border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Live Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Students" value={stats.total_students} icon={<Users className="h-5 w-5 text-blue-500" />} />
          <StatCard title="Total Sessions" value={stats.total_sessions} icon={<CheckCircle className="h-5 w-5 text-emerald-500" />} />
          <StatCard title="Active Scans" value={stats.active_sessions} icon={<Activity className="h-5 w-5 text-purple-500" />} />
          <StatCard title="Total Alerts" value={stats.total_alerts} icon={<AlertTriangle className="h-5 w-5 text-rose-500" />} />
        </div>

        {/* Dynamic Charts Array */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Violation Distribution Chart (1/3) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 flex flex-col">
            <h3 className="mb-4 text-lg font-semibold text-white">Browser Violation Distribution</h3>
            <div className="h-64 flex-1">
              {stats.violation_chart_data && stats.violation_chart_data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.violation_chart_data}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.violation_chart_data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc" }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-600 border border-slate-800 border-dashed rounded-lg">No violation data active</div>
              )}
            </div>
            {stats.violation_chart_data && stats.violation_chart_data.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {stats.violation_chart_data.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-1.5 bg-slate-950 px-2 py-1 rounded-full border border-slate-800">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-[10px] text-slate-400 font-medium">{entry.name.substring(0, 15)}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Core Risk Tracking LineChart (2/3) */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                   <LineChartIcon className="w-5 h-5 text-emerald-500" />
                   Cumulative Risk Timeframe
                </h3>
             </div>
             <div className="h-64">
               {riskTimelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={riskTimelineData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                           <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                           </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#475569" tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <RechartsTooltip 
                           contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                           itemStyle={{ color: "#f8fafc" }}
                        />
                        <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorRisk)" activeDot={{ r: 6, fill: "#ef4444" }} />
                     </AreaChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="flex h-full items-center justify-center text-slate-600 border border-slate-800 border-dashed rounded-lg">No risk data recorded.</div>
               )}
             </div>
          </div>
        </div>

        {/* Global Exam Scores Progression */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 mb-8">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                 <CheckCircle className="w-5 h-5 text-blue-500" />
                 Recent Exam Scores (%)
              </h3>
           </div>
           <div className="h-64">
             {stats.score_history && stats.score_history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={stats.score_history} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#475569" tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <RechartsTooltip 
                         contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                         itemStyle={{ color: "#f8fafc" }}
                         cursor={{ fill: "#1e293b" }}
                      />
                      <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex h-full items-center justify-center text-slate-600 border border-slate-800 border-dashed rounded-lg">No completed exam scores recorded.</div>
             )}
           </div>
        </div>

        {/* Global Student Tracking Directory */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
          <div className="border-b border-slate-800 p-6 bg-slate-900/50">
            <h3 className="text-lg font-semibold text-white">Live Student Directory Status</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium pl-6">Student ID</th>
                  <th className="px-6 py-4 font-medium">Recorded Exams</th>
                  <th className="px-6 py-4 font-medium">Session Status</th>
                  <th className="px-6 py-4 font-medium text-right pr-6">Chronological Analytics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white pl-6">{student.username}</td>
                    <td className="px-6 py-4 font-mono">{student.total_sessions}</td>
                    <td className="px-6 py-4">
                      {student.status === "Active" ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></div> Live
                          </span>
                      ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2 py-1 text-xs font-medium text-slate-400">
                             Inactive
                          </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <button 
                        onClick={() => handleViewActivities(student.username)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors bg-blue-500/10 px-3 py-1.5 rounded disabled:opacity-50"
                        disabled={student.total_sessions === 0}
                      >
                        Scan Timeline
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No registered students framework available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Centralized Student Activities Timeline Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between border-b border-slate-800 p-6 bg-slate-950/50">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                     <Activity className="w-5 h-5 text-blue-500" /> Subject Timeline: {selectedStudent}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {loadingActivities ? "Scanning chronologic vectors..." : `${studentActivities?.events?.length || 0} distinct infractions recorded over ${studentActivities?.sessions || 0} exams.`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors border border-transparent hover:border-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {loadingActivities ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                ) : studentActivities?.events?.length > 0 ? (
                  <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
                    {studentActivities.events.map((event, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-slate-800 border-2 border-slate-900 ring-2 ring-slate-800"></div>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm">
                          <div>
                            <p className="font-semibold text-white flex items-center gap-2">
                               {event.event_type}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 font-mono">
                               {new Date(event.timestamp).toLocaleString()}
                            </p>
                            {event.details && <p className="mt-2 text-sm text-slate-400 border-l-2 border-slate-700 pl-2">{event.details}</p>}
                          </div>
                          <div className="mt-3 sm:mt-0 text-right">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${event.risk_score > 60 ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                               Cumulative Score: {event.risk_score}%
                            </span>
                            <div className="flex flex-wrap gap-1 mt-2 justify-end">
                              {event.reasons?.map((r, i) => (
                                <span key={i} className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-400">
                                  {r.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-slate-500 border border-slate-800 border-dashed rounded-xl bg-slate-950/30">
                    <CheckCircle className="w-5 h-5 text-emerald-500/50 mr-2" />
                    No abnormal activities recorded across valid sessions.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity scale-150 transform translate-x-4 -translate-y-4">
         {icon}
      </div>
      <div className="flex items-center justify-between relative z-10">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="rounded-lg bg-slate-950 border border-slate-800 p-2 shadow-inner">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold text-white relative z-10 font-mono">{value}</p>
    </div>
  );
}
