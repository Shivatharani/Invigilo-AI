import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { ArrowRight, Eye, BarChart3, Shield, Zap } from "lucide-react";

export default function Home() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const features = [
    {
      icon: Eye,
      title: "Real-time Monitoring",
      description: "AI-powered computer vision continuously monitors exam environment"
    },
    {
      icon: BarChart3,
      title: "Risk Analysis",
      description: "Dynamic risk scoring system with behavioral pattern tracking"
    },
    {
      icon: Shield,
      title: "Fair Examination",
      description: "Comprehensive proctoring and secure activity logging"
    },
    {
      icon: Zap,
      title: "Instant Alerts",
      description: "Real-time notifications for suspicious activities"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 from-white via-gray-50 to-slate-50 transition-colors duration-300">
      {/* Navigation */}
      <nav className="border-b backdrop-blur-lg sticky top-0 z-50 transition-all duration-300 border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">INVIGILO</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/login">
                <Button 
                  variant="ghost" 
                  className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  variant="ghost" 
                  className="text-slate-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="px-4 py-2 rounded-full inline-block text-sm font-semibold transition-colors duration-300 bg-indigo-100/60 dark:bg-indigo-500/20 border border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-300">
                Enterprise Proctoring Solution
              </span>
              <h1 className="text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white leading-tight">
                Fair Exams,
                <span className="block bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                  Advanced Trust
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-gray-400 leading-relaxed max-w-lg">
                Enterprise-grade exam proctoring powered by AI. Detect suspicious activity, analyze behavior in real-time, and ensure exam integrity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Log in to Start
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/30 dark:from-indigo-500/10 to-violet-200/30 dark:to-violet-500/10 rounded-2xl blur-3xl" />
            <Card className="relative bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-indigo-300/30 dark:border-indigo-500/20">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Live Monitoring</p>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Real-time gaze tracking</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-violet-300/30 dark:border-violet-500/20">
                  <div className="w-12 h-12 rounded-lg bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Risk Analytics</p>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Dynamic scoring engine</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-purple-300/30 dark:border-purple-500/20">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Integrity Assured</p>
                    <p className="text-sm text-slate-600 dark:text-gray-400">Complete audit trail</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-200/50 dark:border-slate-700/50">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-white">Powerful Features</h2>
          <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need for secure, fair, and transparent examinations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card 
              key={idx} 
              className="bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-lg transition-all cursor-pointer"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 dark:from-indigo-500/20 to-violet-100 dark:to-violet-500/20 flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-indigo-100/40 via-violet-100/40 to-purple-100/40 dark:from-indigo-500/10 dark:via-violet-500/10 dark:to-purple-500/10 border border-indigo-300/50 dark:border-indigo-500/30">
          <CardContent className="p-12 text-center space-y-8">
            <div>
              <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4">Ready to Transform Your Exams?</h2>
              <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl mx-auto">
                Join leading institutions ensuring exam integrity with INVIGILO
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold shadow-lg"
                >
                  Login Now
                </Button>
              </Link>
              <Link to="/signup">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20 transition-colors duration-300 border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-600 dark:text-gray-400">&copy; 2026 INVIGILO. Enterprise exam proctoring. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
