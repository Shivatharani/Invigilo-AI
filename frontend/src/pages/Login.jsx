import { useState, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import Webcam from "react-webcam";
import { Camera, RefreshCw, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", email: "", password: "", role: "student" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsFaceRegistration, setNeedsFaceRegistration] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const webcamRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Login failed");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", formData.username);

      toast.success("Login successful!");

      if (data.role === "student" && !data.has_registered_face) {
        setNeedsFaceRegistration(true);
        toast("Please register your face for exam security", { icon: "📸" });
      } else if (data.role === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/admin");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const captureFace = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  }, [webcamRef]);

  const submitFaceRegistration = async () => {
    if (!capturedImage) return;
    setLoading(true);

    try {
      // Convert base64 to Blob
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      
      const form = new FormData();
      form.append("username", formData.username);
      form.append("file", blob, "face.jpg");

      const response = await fetch("http://localhost:8000/auth/register-face", {
        method: "POST",
        body: form,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Face registration failed");

      toast.success("Face registered successfully!");
      navigate("/student-dashboard");
    } catch (error) {
      toast.error(error.message);
      setCapturedImage(null); // retry
    } finally {
      setLoading(false);
    }
  };

  if (needsFaceRegistration) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Face Registration</h2>
            <p className="mt-2 text-sm text-slate-400">
              Your face will be verified throughout the examination. Ensure proper lighting.
            </p>
          </div>

          <div className="relative mt-4 overflow-hidden rounded-lg bg-slate-950 px-2 py-4 shadow-inner ring-1 ring-slate-800/50 flex justify-center">
            {capturedImage ? (
              <img src={capturedImage} alt="Captured face" className="rounded-md object-cover h-64 w-full" />
            ) : (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="rounded-md object-cover h-64 w-full"
                videoConstraints={{ facingMode: "user" }}
              />
            )}
          </div>

          <div className="mt-6 flex flex-col space-y-3">
            {!capturedImage ? (
              <button
                onClick={captureFace}
                className="flex w-full items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                <Camera className="h-4 w-4" />
                <span>Capture Face</span>
              </button>
            ) : (
              <div className="flex space-x-3 gap-2 w-full justify-between items-center">
                <button
                  onClick={() => setCapturedImage(null)}
                  disabled={loading}
                  className="flex w-1/2 items-center justify-center space-x-2 rounded-md bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={submitFaceRegistration}
                  disabled={loading}
                  className="flex w-1/2 items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
                >
                  {loading ? "Saving..." : "Confirm & Continue"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Sign in</h2>
          <p className="mt-2 text-sm text-slate-400">Access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300">Username</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="johndoe@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300">Role</label>
              <select
                className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
