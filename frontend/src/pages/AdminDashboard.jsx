import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Users, AlertTriangle, Activity, CheckCircle, LogOut, X } from "lucide-react";
import toast from "react-hot-toast";

const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"];

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
  }, [navigate]);

  const fetchData = async () => {
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
      toast.error("Failed to load dashboard data");
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
      toast.success(`Loaded activities for ${username}`);
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

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Monitor platform activity and student records.</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Students" value={stats.total_students} icon={<Users className="h-5 w-5 text-blue-500" />} />
          <StatCard title="Total Sessions" value={stats.total_sessions} icon={<CheckCircle className="h-5 w-5 text-green-500" />} />
          <StatCard title="Active Scans" value={stats.active_sessions} icon={<Activity className="h-5 w-5 text-purple-500" />} />
          <StatCard title="Total Alerts" value={stats.total_alerts} icon={<AlertTriangle className="h-5 w-5 text-red-500" />} />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Violation Chart */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Violations Distribution</h3>
            <div className="h-64">
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
                <div className="flex h-full items-center justify-center text-slate-500">No violation data available</div>
              )}
            </div>
            {/* Custom Legend for Pie chart since standard legend can overflow */}
            {stats.violation_chart_data && stats.violation_chart_data.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-4 justify-center">
                    {stats.violation_chart_data.map((entry, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-xs text-slate-400">{entry.name} ({entry.value})</span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Recent Activity / Sessions Chart Mockup */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Recent Security Events Timeline</h3>
             <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.recent_sessions.map((s, i) => ({ name: `S${i+1}`, risk: Math.floor(Math.random() * 100) }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Bar dataKey="risk" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Student Records Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 flex flex-col">
          <div className="border-b border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white">Student Records & Past Logins</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-950 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Username</th>
                  <th className="px-6 py-4 font-medium">Total Sessions</th>
                  <th className="px-6 py-4 font-medium">Current Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{student.username}</td>
                    <td className="px-6 py-4">{student.total_sessions}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        student.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewActivities(student.username)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View Activities
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                      No students found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Activities Modal */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="w-full max-w-4xl rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-slate-800 p-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Activities: {selectedStudent}</h3>
                  <p className="text-sm text-slate-400">
                    {loadingActivities ? "Loading..." : `${studentActivities?.events?.length || 0} recent events across ${studentActivities?.sessions || 0} sessions.`}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
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
                  <div className="space-y-4">
                    {studentActivities.events.map((event, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4">
                        <div>
                          <p className="font-semibold text-white">{new Date(event.timestamp).toLocaleString()}</p>
                          <p className="text-sm text-slate-400">
                            Risk Score: <span className={event.status === "High Risk" ? "text-red-400" : "text-amber-400"}>{event.risk_score}%</span>
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 max-w-sm">
                          <div className="flex flex-wrap gap-2">
                            {event.reasons?.map((r, i) => (
                              <span key={i} className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                                {r}
                              </span>
                            ))}
                          </div>
                          {event.details && <p className="mt-1 text-xs text-slate-500">{event.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-slate-500">
                    No abnormal activities recorded.
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
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className="rounded-lg bg-slate-800 p-2">{icon}</div>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
