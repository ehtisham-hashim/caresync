import { Link } from 'react-router-dom';
import { Heart, Mic, Calendar, MessageCircle, Activity, Shield } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Mic,
      title: 'AI Medical Scribe',
      description: 'Automatically transcribe and generate clinical notes from doctor-patient conversations.',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Easy appointment booking and management for patients and providers.',
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      icon: MessageCircle,
      title: 'AI Health Companion',
      description: 'Get instant answers to health questions with our intelligent chatbot.',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      icon: Activity,
      title: 'Health Tracking',
      description: 'Monitor vitals, medications, and health metrics over time.',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'HIPAA-compliant platform ensuring your health data stays protected.',
      color: 'bg-amber-100 text-amber-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Healthcare Made Simple
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl">
          CareSync combines AI-powered medical scribing with comprehensive patient care management. 
          Spend less time on paperwork, more time caring.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
          <Link
            to="/login"
            className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for Modern Healthcare
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-gray-50 border border-gray-200 p-6 rounded-xl">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center border-t border-gray-800">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="h-5 w-5 text-blue-500" />
          <span className="text-lg font-bold text-white">CareSync</span>
        </div>
        <p>&copy; 2026 CareSync. All rights reserved.</p>
      </footer>
    </div>
  );
}
