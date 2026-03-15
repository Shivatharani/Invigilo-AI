import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import RiskMeter from "../components/RiskMeter";
import RecordingIndicator from "../components/RecordingIndicator";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AlertCircle, Camera, Square, Eye, Clock, Activity, LogOut } from "lucide-react";

export default function StudentExam() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [risk, setRisk] = useState(0);
  const [monitoring, setMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("Normal");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Audio Tracking
  const recognitionRef = useRef(null);

  useEffect(() => {
    const sId = localStorage.getItem("session_id");
    if (!sId) {
      toast.error("No active exam session found. Redirecting...");
      navigate("/student-dashboard");
      return;
    }
    setSessionId(sId);
  }, [navigate]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => toast.error("Camera/Microphone permission denied!"));
  }, []);

  const logBrowserEvent = async (eventType, details = "") => {
    if (!sessionId) return;
    try {
      await api.post("/log-event", {
        session_id: sessionId,
        event_type: eventType,
        details: details
      });
    } catch (error) {
      console.error("Failed to log browser event", error);
    }
  };

  useEffect(() => {
    if (!monitoring) return;
    const timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, [monitoring]);

  const startMonitoring = () => {
    setMonitoring(true);
    toast.success("Exam Monitoring Started");

    // Request Fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request failed", err);
      });
    }

    // Start Audio Proctoring
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript.trim().length > 0) {
            toast.error("⚠ Speech Detected! Please remain quiet.");
            logBrowserEvent("Audio Violation: Speech Detected", transcript);
        }
      };
      
      recognition.onerror = (event) => {
          console.warn("Speech recognition error", event.error);
      };
      
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const endSession = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    try {
      await api.post(`/end-session?session_id=${sessionId}`);
      toast.success("Exam ended successfully.");
      setMonitoring(false);
      localStorage.removeItem("session_id");
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      navigate("/student-dashboard");
    } catch (error) {
      toast.error("Error ending exam.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId || !monitoring) return;

    const interval = setInterval(async () => {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append("session_id", sessionId);
        formData.append("file", blob);

        try {
          const res = await api.post("/analyze", formData);
          setRisk(res.data.risk_score);
          setDetectionStatus(res.data.status);

          if (res.data.status === "High Risk") {
            const reasons = res.data.reasons || [];
            if (reasons.includes("Unrecognized face detected") || reasons.includes("Multiple faces detected")) {
                toast.error(`⚠ Face Match Alert: ${reasons.join(", ")}`);
            } else {
                toast.error("⚠ High Risk Activity Detected!");
            }
          } else if (res.data.status === "Suspicious") {
            toast.error("⚠ Suspicious Activity Detected!");
          }
        } catch (error) {
          console.error("Analysis error:", error);
        }
      }, "image/jpeg");
    }, 3000);

    return () => {
      clearInterval(interval);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [sessionId, monitoring]);

  // Browser Proctoring Hooks
  useEffect(() => {
    if (!monitoring) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("⚠ Tab Switch Detected! Return to the exam immediately.");
        logBrowserEvent("Tab Switched");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        toast.error("⚠ You exited fullscreen mode!");
        logBrowserEvent("Exited Fullscreen");
      }
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      toast.error("⚠ Copy/Paste is disabled during the exam.");
      logBrowserEvent(e.type === "copy" ? "Copy Attempt" : "Paste Attempt");
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error("⚠ Right-click is disabled.");
      logBrowserEvent("Right Click Attempt");
    };

    const handleBlur = () => {
      toast.error("⚠ Window lost focus!");
      logBrowserEvent("Window Lost Focus");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("blur", handleBlur);
    };
  }, [monitoring, sessionId]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Active Examination</h1>
            <p className="text-slate-400 mt-1 text-sm">Your exam environment is being monitored securely.</p>
          </div>
          <div className="flex items-center gap-3">
            {monitoring && (
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 text-sm flex items-center">
                <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block mr-2 animate-pulse"></span>
                Monitoring Active
              </Badge>
            )}
            <button
              onClick={endSession}
              disabled={isLoading}
              className="px-4 py-2 rounded-md bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" /> End Exam
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Video and Session Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Camera Feed Card */}
            <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
              <CardHeader className="bg-slate-900 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 text-lg">
                    <Camera className="w-5 h-5 text-blue-500" /> Camera Feed
                  </CardTitle>
                  {monitoring && <RecordingIndicator />}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video shadow-inner ring-1 ring-slate-800">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {!monitoring && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center backdrop-blur-sm">
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400 text-sm">Camera ready. Waiting to start.</p>
                      </div>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>

            {/* Session Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
                <Clock className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Time Elapsed</p>
                <p className="text-white font-mono text-lg">{formatTime(elapsedTime)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
                <Eye className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Session ID</p>
                <p className="text-blue-400 font-mono text-sm">{sessionId?.slice(0, 8)}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
                <Activity className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Live Status</p>
                <p className={`font-semibold text-sm ${detectionStatus === "Normal" ? "text-emerald-400" : "text-amber-400"}`}>
                  {detectionStatus}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-5 h-5 text-slate-400 mb-2" />
                <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-1">Risk Score</p>
                <p className="text-white font-mono text-lg">{risk}%</p>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Controls and Guidelines */}
          <div className="space-y-6">
            {/* Control Card */}
            <Card className="bg-slate-900 border-slate-800 shadow-sm">
              <CardContent className="p-6">
                {!monitoring ? (
                  <button
                    onClick={startMonitoring}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center space-x-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                  >
                    <span>Begin Exam Monitoring</span>
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="w-full flex items-center justify-center space-x-2 rounded-md bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-400 border border-emerald-500/20">
                      <Activity className="w-4 h-4 animate-pulse" />
                      <span>Monitoring Active</span>
                    </div>
                    
                    <button
                      onClick={endSession}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center space-x-2 rounded-md bg-slate-800 px-4 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-slate-700 border border-slate-700 hover:border-red-500/50"
                    >
                      <Square className="w-4 h-4" />
                      <span>{isLoading ? "Ending..." : "End Exam Submission"}</span>
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment Card */}
            <Card className="bg-slate-900 border-slate-800 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-800">
                <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  Live Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-4">
                  <RiskMeter risk={risk} isDark={true} />
                </div>
                <div className="text-xs text-slate-500 space-y-2 mt-4">
                  <div className="flex justify-between items-center">
                    <span>Baseline (0-30%)</span>
                    <span className="text-emerald-400">Normal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Moderate (30-60%)</span>
                    <span className="text-amber-400">Suspicious</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Critical (60%+)</span>
                    <span className="text-red-400">High Risk</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}