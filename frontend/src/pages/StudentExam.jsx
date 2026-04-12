import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";
import RiskMeter from "../components/RiskMeter";
import RecordingIndicator from "../components/RecordingIndicator";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AlertCircle, Camera, Square, Eye, Clock, Activity, LogOut, CheckCircle2, AlertTriangle, ShieldAlert, BookOpen, ArrowLeft } from "lucide-react";

export default function StudentExam() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, questions } = location.state || { subject: "Mock Exam", questions: [] };
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  
  // Proctoring State
  const [cumulativeRisk, setCumulativeRisk] = useState(0);
  const [events, setEvents] = useState([]);
  const [monitoring, setMonitoring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("Normal");
  const [elapsedTime, setElapsedTime] = useState(0);

  // Exam State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const sId = localStorage.getItem("session_id");
    if (!sId) {
      toast.error("No active exam session found.");
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

  const addEventLocally = (type, ruleRisk) => {
    setEvents(prev => [{ event_type: type, timestamp: new Date().toLocaleTimeString(), risk_score: ruleRisk }, ...prev].slice(0, 5));
  };

  const logBrowserEvent = async (eventType, ruleRisk, details = "") => {
    if (!sessionId) return;
    addEventLocally(eventType, ruleRisk);
    
    try {
      const res = await api.post("/log-event", {
        session_id: sessionId,
        event_type: eventType,
        details: details
      });
      if (res.data && res.data.cumulative_risk !== undefined) {
         setCumulativeRisk(res.data.cumulative_risk);
         if (res.data.cumulative_risk > 30) {
             toast.error("⚠ Suspicious activity detected!", { id: 'risk_alert' });
         }
      }
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
    toast.success("Exam Started & Locked");

    // Enforce Fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request failed", err);
      });
    }

    // Audio tracking
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (transcript.trim().length > 0) {
            toast.error("⚠ Speech Detected! Please remain quiet.");
            logBrowserEvent("AUDIO_VIOLATION", 15, transcript);
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const submitExam = async () => {
    if (!sessionId) return;
    setIsLoading(true);
    
    // Calculate score
    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        calculatedScore += 1;
      }
    });

    try {
      await api.post(`/end-session`, {
        session_id: sessionId,
        score: calculatedScore,
        total_questions: questions.length
      });
      toast.success("Exam submitted successfully.");
      setIsSubmitted(true);
      setMonitoring(false);
      localStorage.removeItem("session_id");
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      // Removed auto-navigation to let user review score
    } catch (error) {
      toast.error("Error submitting exam.");
    } finally {
      setIsLoading(false);
    }
  };

  // Face Analysis Heartbeat
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
          // Visual risk usually stays distinct but we can show status
          setDetectionStatus(res.data.status);

          if (res.data.status === "High Risk") {
            const reasons = res.data.reasons || [];
            if (reasons.includes("Unrecognized face detected") || reasons.includes("Multiple faces detected")) {
                toast.error(`⚠ Face Match Alert: ${reasons.join(", ")}`);
            }
          }
        } catch (error) {
           // ignore
        }
      }, "image/jpeg");
    }, 4000);

    return () => {
      clearInterval(interval);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, [sessionId, monitoring]);

  // Strict Browser Proctoring Hooks
  useEffect(() => {
    if (!monitoring) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("⚠ Tab Switch Detected! +10 Risk");
        logBrowserEvent("TAB_SWITCH", 10);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        toast.error("⚠ You exited fullscreen mode! +15 Risk");
        logBrowserEvent("EXIT_FULLSCREEN", 15);
      }
    };

    const handleCopyPaste = (e) => {
      e.preventDefault();
      toast.error("⚠ Copy/Paste is disabled during the exam.");
      logBrowserEvent(e.type === "copy" ? "COPY_ATTEMPT" : "PASTE_ATTEMPT", 5);
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.error("⚠ Right-click is disabled.");
      logBrowserEvent("SHORTCUT_ATTEMPT", 10);
    };

    const handleBlur = () => {
      toast.error("⚠ Window lost focus! +5 Risk");
      logBrowserEvent("WINDOW_BLUR", 5);
    };

    const handleKeyDown = (e) => {
      // Block common shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "v" || e.key === "x")) {
         e.preventDefault();
         logBrowserEvent("SHORTCUT_ATTEMPT", 10, "Ctrl+C/V");
      }
      if (e.altKey && e.key === "Tab") {
         logBrowserEvent("SHORTCUT_ATTEMPT", 10, "Alt+Tab");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("blur", handleBlur);
    };
  }, [monitoring, sessionId]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center gap-4">
            {!monitoring && !isSubmitted && (
               <button 
                  onClick={() => navigate("/select-subject")} 
                  className="text-slate-400 hover:text-white transition-colors border-r border-slate-700 pr-4"
                  title="Go Back"
               >
                  <ArrowLeft className="w-5 h-5" />
               </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" /> {subject} Exam
              </h1>
              <p className="text-slate-400 text-sm mt-1">Answer all questions truthfully under strict proctoring lock.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {monitoring && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-300 font-mono bg-slate-800 px-3 py-1 rounded-md">
                   <Clock className="w-4 h-4 text-emerald-400" /> {formatTime(elapsedTime)}
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-sm flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block mr-2 animate-pulse"></span>
                  Active
                </Badge>
              </div>
            )}
            <button
              onClick={submitExam}
              disabled={isLoading || !monitoring || isSubmitted}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Exam
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Content - Questions (Span 3/4) */}
          <div className="lg:col-span-3 space-y-6">
            {!monitoring && !isSubmitted ? (
               <Card className="bg-slate-900 border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                 <ShieldAlert className="w-16 h-16 text-slate-500 mb-4" />
                 <h2 className="text-2xl font-bold text-white mb-2">Exam Locked</h2>
                 <p className="text-slate-400 mb-8 max-w-md">You must initialize the strict proctoring environment to reveal the examination questions. Exiting fullscreen will result in a penalty.</p>
                 <button
                    onClick={startMonitoring}
                    className="flex items-center justify-center space-x-2 rounded-md bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-500"
                  >
                    <span>Begin Exam & Enable Camera</span>
                  </button>
               </Card>
            ) : isSubmitted ? (
               <Card className="bg-slate-900 border-slate-800 flex flex-col p-8">
                  <div className="text-center border-b border-slate-800 pb-8 mb-8">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white">Exam Completed</h2>
                    <p className="text-slate-400 mt-2">Your proctoring analysis and answers have been recorded.</p>
                    
                    <div className="mt-6 inline-block bg-slate-950 border border-slate-800 rounded-2xl p-6">
                       <p className="text-slate-500 uppercase tracking-widest text-sm font-semibold mb-2">Final Score</p>
                       <p className="text-5xl font-mono font-black text-blue-500">
                          {Object.keys(answers).reduce((acc, idx) => acc + (answers[idx] === questions[idx].answer ? 1 : 0), 0)}
                          <span className="text-2xl text-slate-600"> / {questions.length}</span>
                       </p>
                    </div>
                  </div>

                  <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                     <h3 className="text-xl font-semibold text-white mb-4">Performance Review</h3>
                     {questions.map((q, idx) => {
                        const isCorrect = answers[idx] === q.answer;
                        const isUnanswered = !answers[idx];
                        return (
                          <div key={idx} className={`p-4 rounded-xl border ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                             <div className="flex justify-between items-start mb-3">
                                <span className="text-slate-300 font-medium">Q{idx + 1}. {q.question}</span>
                                <Badge className={isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}>
                                   {isCorrect ? 'Correct' : 'Incorrect'}
                                </Badge>
                             </div>
                             
                             <div className="space-y-2 mt-2">
                                <div className="text-sm">
                                   <span className="text-slate-500 mr-2">Your Answer:</span>
                                   <span className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{answers[idx] || 'Not answered'}</span>
                                </div>
                                {!isCorrect && (
                                   <div className="text-sm">
                                      <span className="text-slate-500 mr-2">Correct Answer:</span>
                                      <span className="text-emerald-400">{q.answer}</span>
                                   </div>
                                )}
                             </div>
                          </div>
                        );
                     })}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end">
                     <button
                        onClick={() => navigate("/student-dashboard")}
                        className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                     >
                        Return to Dashboard
                     </button>
                  </div>
               </Card>
            ) : currentQ ? (
                <Card className="bg-slate-900 border-slate-800 min-h-[500px] flex flex-col">
                  <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                     <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-slate-300 border-slate-700">Question {currentQuestionIndex + 1} of {questions.length}</Badge>
                        <Badge className="bg-slate-800 text-blue-400">{currentQ.difficulty || 'Medium'}</Badge>
                     </div>
                     <CardTitle className="text-2xl text-white mt-4 leading-relaxed font-medium">
                        {currentQ.question}
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col justify-center">
                     <div className="space-y-3 mt-4">
                        {currentQ.options.map((opt, idx) => (
                           <button
                             key={idx}
                             onClick={() => setAnswers({...answers, [currentQuestionIndex]: opt})}
                             className={`w-full text-left p-4 rounded-xl border transition-all ${answers[currentQuestionIndex] === opt ? 'bg-blue-600/10 border-blue-500 text-blue-100' : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-600 hover:bg-slate-900'}`}
                           >
                              <span className="inline-block w-8 h-8 rounded-full bg-slate-800 text-center leading-8 mr-3 font-semibold font-mono text-sm">{String.fromCharCode(65 + idx)}</span>
                              {opt}
                           </button>
                        ))}
                     </div>
                  </CardContent>
                  <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-between">
                     <button 
                        disabled={currentQuestionIndex === 0} 
                        onClick={() => setCurrentQuestionIndex(i => i - 1)}
                        className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 disabled:opacity-50 hover:bg-slate-800"
                     >
                        Previous
                     </button>
                     {currentQuestionIndex < questions.length - 1 ? (
                        <button 
                           onClick={() => setCurrentQuestionIndex(i => i + 1)}
                           className="px-8 py-2 rounded-lg bg-slate-100 text-slate-900 font-medium hover:bg-white"
                        >
                           Next Question
                        </button>
                     ) : (
                        <button 
                           onClick={submitExam}
                           className="px-8 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500"
                        >
                           Finish Exam
                        </button>
                     )}
                  </div>
                </Card>
            ) : (
                <div className="text-white">No questions available.</div>
            )}
          </div>

          {/* Right Sidebar - Camera & Proctoring (Span 1/4) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Camera Feed */}
            <Card className="bg-slate-900 border-slate-800 overflow-hidden shadow-sm">
              <CardHeader className="bg-slate-900 border-b border-slate-800 py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2 text-sm">
                    <Camera className="w-4 h-4 text-blue-500" /> Proctor Cam
                  </CardTitle>
                  {monitoring && <RecordingIndicator />}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-black w-full aspect-[4/3]">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                  {!monitoring && (
                    <div className="absolute inset-0 bg-slate-950/90 flex items-center justify-center backdrop-blur-sm">
                      <Camera className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>

            {/* Proctoring Status Panel */}
            <Card className="bg-slate-900 border-slate-800 shadow-sm flex flex-col max-h-[500px]">
              <CardHeader className="py-3 px-4 border-b border-slate-800">
                <CardTitle className="text-white text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  Live Proctor Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
                <div className="text-center">
                   <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-2">Cumulative Risk Score</p>
                   <div className={`text-4xl font-black font-mono tracking-tighter ${cumulativeRisk > 60 ? 'text-rose-500' : cumulativeRisk > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {cumulativeRisk}%
                   </div>
                </div>

                <div>
                   <p className="text-slate-500 text-xs uppercase tracking-wider font-semibold mb-3">Live Events Feed</p>
                   {events.length === 0 ? (
                      <div className="text-slate-600 text-xs text-center py-4 border border-slate-800 border-dashed rounded-lg">No infractions recorded</div>
                   ) : (
                      <div className="space-y-2">
                         {events.map((e, idx) => (
                             <div key={idx} className="bg-slate-950 border border-slate-800 rounded p-2 flex justify-between items-center">
                                 <div>
                                     <p className="text-xs font-semibold text-rose-400">{e.event_type}</p>
                                     <p className="text-[10px] text-slate-500">{e.timestamp}</p>
                                 </div>
                                 <Badge variant="outline" className="text-xs h-5 py-0 border-rose-500/30 text-rose-300">+{e.risk_score}</Badge>
                             </div>
                         ))}
                      </div>
                   )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}