import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Building2,
  AlertCircle,
  Sun,
  Moon,
  Mail,
  Phone,
  MapPin,
  Home,
  Info,
  GraduationCap,
  Users,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ExternalLink,
  BookOpen,
  Award,
  Briefcase,
  Cpu,
  Database,
  Share2,
  Brain,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import kietLogo from '../../assets/kiet_logo.webp';
import kietCollege from '../../assets/kiet_college.png';

import campus1Img from '../../assets/campus1.avif';
import campus2Img from '../../assets/campus2.avif';
import campus3Img from '../../assets/campus3.avif';
import campus4Img from '../../assets/campus4.avif';
import campus5Img from '../../assets/campus5.avif';

import rankireddyMounikaImg from '../../assets/rankireddy mounika.jpg';
import jayaSriLakshmiImg from '../../assets/jaya sri lakshmi.jpg';
import thutthaBavyaImg from '../../assets/thuttha bavya.jpg';
import venkataSravanthiImg from '../../assets/venkata sravanthi.jpg';
import aHarshavardhanImg from '../../assets/a arshavardhan.jpg';
import gorreRajeswariImg from '../../assets/gorre rajeswari.jpg';
import skRehamanthImg from '../../assets/sk rehamanth.jpg';

const alumniList = [
  {
    name: 'Rankireddy Mounika',
    company: 'Tech Mahindra',
    lpa: '4.0 LPA',
    image: rankireddyMounikaImg,
  },
  {
    name: 'Jaya Sri Lakshmi',
    company: 'Sutherlands',
    lpa: '4.0 LPA',
    image: jayaSriLakshmiImg,
  },
  {
    name: 'Thutha Bhavya',
    company: 'Sutherlands',
    lpa: '4.0 LPA',
    image: thutthaBavyaImg,
  },
  {
    name: 'Venkata Sravanthi',
    company: 'Sepnoty',
    lpa: '4.5 LPA',
    image: venkataSravanthiImg,
  },
  {
    name: 'A Harshavardhan',
    company: 'Indian Army',
    lpa: '10 LPA',
    image: aHarshavardhanImg,
  },
  {
    name: 'Gorre Rajeshwari',
    company: 'Tech Mahindra',
    lpa: '4.0 LPA',
    image: gorreRajeswariImg,
  },
  {
    name: 'SK Rehamath',
    company: 'DRDO',
    lpa: '6.0 LPA',
    image: skRehamanthImg,
  },
];

const academicPrograms = [
  {
    title: 'Artificial Intelligence',
    code: 'CAI',
    desc: 'Develop expertise in neural networks, deep learning, and advanced AI applications.',
    duration: '4 Years',
    level: 'Undergraduate',
    availableAt: ['KIET', 'KIEK', 'KIEW'],
    icon: Brain,
  },
  {
    title: 'AI & Machine Learning',
    code: 'CSM',
    desc: 'Master algorithms, statistical models, and predictive analytics for intelligent systems.',
    duration: '4 Years',
    level: 'Undergraduate',
    availableAt: ['KIET', 'KIEK', 'KIEW'],
    icon: Share2,
  },
  {
    title: 'Data Science',
    code: 'CSD',
    desc: 'Learn to extract actionable insights from complex datasets using big data statistics.',
    duration: '4 Years',
    level: 'Undergraduate',
    availableAt: ['KIET', 'KIEK'], // No KIEW on CSD
    icon: Database,
  },
  {
    title: 'AI & Data Science',
    code: 'AID',
    desc: 'Combine AI techniques with data science methodologies to solve real-world problems.',
    duration: '4 Years',
    level: 'Undergraduate',
    availableAt: ['KIET', 'KIEK', 'KIEW'],
    icon: Cpu,
  },
  {
    title: 'Cyber Security',
    code: 'CSC',
    desc: 'Develop skills to protect systems, networks, and data from advanced cyber threats.',
    duration: '4 Years',
    level: 'Undergraduate',
    availableAt: ['KIET', 'KIEK'], // No KIEW on CSC
    icon: ShieldCheck,
  },
];

const campusImages = [
  { img: campus1Img, title: 'KIET Campus Infrastructure', desc: 'Modern academic blocks and lush green campus environment' },
  { img: campus2Img, title: 'Central Auditorium & Events', desc: 'Venue for conferences, cultural festivals, and seminars' },
  { img: campus3Img, title: 'Student Residential Hostels', desc: 'Safe, comfortable, and well-equipped living quarters' },
  { img: campus4Img, title: 'Vibrant Campus Life', desc: 'Fostering innovation, sports, and holistic development' },
  { img: campus5Img, title: 'Advanced Research & Computing Labs', desc: 'Hands-on learning with modern engineering equipment' },
];

export default function LoginView() {
  const { login } = useAuth();
  const { isBright, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeNav, setActiveNav] = useState('Home');

  const [currentCampusIdx, setCurrentCampusIdx] = useState(0);
  const [isCampusPaused, setIsCampusPaused] = useState(false);
  const campusPauseTimerRef = useRef(null);

  useEffect(() => {
    if (isCampusPaused) return;
    const timer = setInterval(() => {
      setCurrentCampusIdx((prev) => (prev + 1) % campusImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isCampusPaused]);

  const triggerCampusManualPause = () => {
    setIsCampusPaused(true);
    if (campusPauseTimerRef.current) {
      clearTimeout(campusPauseTimerRef.current);
    }
    campusPauseTimerRef.current = setTimeout(() => {
      setIsCampusPaused(false);
    }, 10000); // 10 seconds pause on manual navigation
  };

  const handlePrevCampus = () => {
    triggerCampusManualPause();
    setCurrentCampusIdx((prev) => (prev - 1 + campusImages.length) % campusImages.length);
  };

  const handleNextCampus = () => {
    triggerCampusManualPause();
    setCurrentCampusIdx((prev) => (prev + 1) % campusImages.length);
  };

  const handleDotCampusClick = (idx) => {
    triggerCampusManualPause();
    setCurrentCampusIdx(idx);
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleNavClick = (navName) => {
    setActiveNav(navName);
    let targetId = 'home';
    if (navName === 'About Us') targetId = 'about-us';
    if (navName === 'Institutions') targetId = 'institutions';
    if (navName === 'Academics') targetId = 'academic-programs';
    if (navName === 'Alumni') targetId = 'alumni';
    if (navName === 'Contact Us') targetId = 'contact-us';
    if (navName === 'Login') targetId = 'login-section';

    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resUser = await login(loginEmail, loginPassword);
      if (resUser.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isBright ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* 1. TOP CONTACT HEADER BAR */}
      <div className={`border-b text-xs font-semibold py-2 px-4 transition-colors ${
        isBright
          ? 'bg-[#183329] text-emerald-100 border-emerald-900'
          : 'bg-slate-900 text-emerald-400 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@kietgroup.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>info@kietgroup.com</span>
            </a>
            <span className="text-emerald-700">|</span>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@kietgroup.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>contact@kietgroup.com</span>
            </a>
            <span className="text-emerald-700">|</span>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kietw@kietgroup.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>kietw@kietgroup.com</span>
            </a>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <a href="tel:+919849495335" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 98494 95335</span>
            </a>
            <span className="text-emerald-700">|</span>
            <a href="tel:+919090887777" className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>+91 90908 87777</span>
            </a>

            {/* Bright / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                isBright
                  ? 'bg-emerald-900/60 hover:bg-emerald-800 text-amber-300 border-emerald-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
              }`}
            >
              {isBright ? <Moon className="w-3 h-3 text-indigo-300" /> : <Sun className="w-3 h-3 text-amber-400" />}
              <span>{isBright ? 'Dark Mode' : 'Bright Mode'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. COLLEGE BRANDING HEADER BAR */}
      <div className={`border-b py-4 px-4 transition-colors ${
        isBright ? 'bg-[#eaf4f0] border-emerald-200' : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-1 rounded-2xl bg-white shadow-md border border-slate-200">
              <img
                src={kietLogo}
                alt="KIET Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h1 className={`text-xl sm:text-3xl font-extrabold tracking-tight uppercase ${
                isBright ? 'text-slate-900' : 'text-white'
              }`}>
                KIET GROUP OF INSTITUTIONS
              </h1>
              <p className={`text-xs sm:text-sm font-semibold tracking-wide ${
                isBright ? 'text-emerald-800' : 'text-emerald-400'
              }`}>
                KAKINADA INSTITUTE OF ENGINEERING & TECHNOLOGY
              </p>
              <p className={`text-[11px] mt-0.5 flex items-center gap-1 ${
                isBright ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>Yanam Road, Korangi Village, Tallarevu Mandal, Kakinada District (East Godavari), AP – 533461</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION BAR (Smooth Scrolling) */}
      <nav className={`border-b sticky top-0 z-30 shadow-md backdrop-blur-lg ${
        isBright ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 text-xs font-bold py-2">
            {[
              { name: 'Home', icon: Home },
              { name: 'About Us', icon: Info },
              { name: 'Institutions', icon: GraduationCap },
              { name: 'Academics', icon: BookOpen },
              { name: 'Alumni', icon: Users },
              { name: 'Contact Us', icon: PhoneCall },
              { name: 'Login', icon: LogIn }
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeNav === nav.name;
              return (
                <button
                  key={nav.name}
                  type="button"
                  onClick={() => handleNavClick(nav.name)}
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : isBright
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{nav.name}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-emerald-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Hostel Portal</span>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HOME / HERO BANNER & LOGIN CONTAINER */}
      <section id="home" className="scroll-mt-20 relative flex items-center justify-center py-10 px-4 sm:px-6">
        {/* Background Campus Banner with Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-20 pointer-events-none">
          <img
            src={kietCollege}
            alt="KIET Campus Banner"
            className="w-full h-full object-cover filter blur-[1px]"
          />
          <div className={`absolute inset-0 ${
            isBright
              ? 'bg-gradient-to-r from-slate-100 via-slate-100/90 to-slate-100/80'
              : 'bg-gradient-to-r from-slate-950 via-slate-950/95 to-slate-950/90'
          }`} />
        </div>

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          {/* Left Column: Campus Welcome & Info */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Hostel & Resource Management System</span>
            </div>

            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight ${
              isBright ? 'text-slate-900' : 'text-white'
            }`}>
              Welcome to <span className="text-blue-600">KIET Campus</span> Hostel Portal
            </h2>

            <p className={`text-xs sm:text-sm leading-relaxed ${
              isBright ? 'text-slate-700' : 'text-slate-300'
            }`}>
              Manage your hostel room allocations, submit feedback & maintenance reports, track resolution status, and stay connected with KIET campus hostel administration.
            </p>

            {/* Campus Showcase Card - Full Uncropped Campus View */}
            <div className={`rounded-2xl border p-2.5 shadow-xl overflow-hidden ${
              isBright ? 'bg-white/90 border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="relative rounded-xl overflow-hidden bg-slate-900/40 flex flex-col">
                <img
                  src={kietCollege}
                  alt="KIET College Campus"
                  className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                />
                <div className="p-3.5 border-t border-slate-800/40 flex flex-col justify-end bg-slate-900/90">
                  <h3 className="text-white font-bold text-sm sm:text-base">Kakinada Institute of Engineering & Technology (KIET)</h3>
                  <p className="text-emerald-400 text-xs font-semibold">Yanam Road, Korangi Village, Kakinada District (East Godavari)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In & Registration Card */}
          <div id="login-section" className="lg:col-span-5 scroll-mt-24">
            <div className={`border rounded-2xl p-6 sm:p-8 shadow-2xl ${
              isBright ? 'bg-white/95 border-slate-200' : 'bg-slate-900/90 border-slate-800 backdrop-blur-xl'
            }`}>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-xl font-bold tracking-tight ${isBright ? 'text-slate-900' : 'text-white'}`}>
                  KIET Hostel Portal
                </h2>
                <p className={`text-xs mt-1 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                  Sign in to access your student or admin portal
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                    Account Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@kietgroup.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isBright ? 'text-slate-800' : 'text-slate-300'}`}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none ${
                      isBright
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-blue-500'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Sign In to Portal
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT US */}
      <section id="about-us" className="scroll-mt-20 py-12 px-4 sm:px-6 border-t transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              ABOUT US
            </span>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isBright ? 'text-slate-900' : 'text-white'}`}>
              Excellence in Technical Education
            </h2>
            <p className={`text-xs sm:text-sm ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Kakinada Institute of Engineering & Technology (KIET) is approved by AICTE, Govt of AP & Affiliated to JNTUK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border ${isBright ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
              <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-base font-bold mb-2">Quality Academics</h3>
              <p className={`text-xs leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Offering state-of-the-art engineering, technology, management, and pharmacy courses with experienced faculty members.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${isBright ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
              <Building2 className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="text-base font-bold mb-2">Modern Hostels</h3>
              <p className={`text-xs leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Well-equipped residential hostels with 24/7 security, Wi-Fi connectivity, clean sanitation, and nutritious mess facilities.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${isBright ? 'bg-white border-slate-200 shadow-md' : 'bg-slate-900/60 border-slate-800'}`}>
              <Award className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="text-base font-bold mb-2">AICTE & JNTUK Approved</h3>
              <p className={`text-xs leading-relaxed ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                Recognized for academic standards, research laboratories, industry partnerships, and campus placements.
              </p>
            </div>
          </div>

          {/* Campus Highlights 3-Card Carousel (campus1 to campus5) */}
          <div className="pt-4 space-y-4">
            <div className="relative px-2 sm:px-10">
              {/* Left Arrow Manual Control */}
              <button
                type="button"
                onClick={handlePrevCampus}
                className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/90 hover:bg-blue-600 text-white backdrop-blur-md border border-slate-700 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl hover:scale-110 active:scale-95"
                aria-label="Previous Campus Photos"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Right Arrow Manual Control */}
              <button
                type="button"
                onClick={handleNextCampus}
                className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/90 hover:bg-blue-600 text-white backdrop-blur-md border border-slate-700 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xl hover:scale-110 active:scale-95"
                aria-label="Next Campus Photos"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* 3 Visible Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[0, 1, 2].map((offset) => {
                  const itemIndex = (currentCampusIdx + offset) % campusImages.length;
                  const item = campusImages[itemIndex];
                  return (
                    <div
                      key={`campus-3card-${itemIndex}-${offset}`}
                      className={`relative rounded-3xl overflow-hidden shadow-xl border transition-all duration-500 transform hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500 hover:ring-4 hover:ring-blue-500/30 cursor-pointer h-[260px] sm:h-[290px] flex flex-col justify-end ${
                        isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <img
                        src={item.img}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-5 flex flex-col justify-end z-10">
                        <h4 className="text-white font-extrabold text-base sm:text-lg tracking-tight drop-shadow-md">
                          {item.title}
                        </h4>
                        <p className="text-slate-200 text-xs font-medium mt-1 drop-shadow">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dot Indicators */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {campusImages.map((_, idx) => (
                <button
                  key={`campus-3card-dot-${idx}`}
                  type="button"
                  onClick={() => handleDotCampusClick(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentCampusIdx
                      ? 'w-7 bg-blue-600 shadow-md shadow-blue-500/50'
                      : isBright
                      ? 'w-2.5 bg-slate-300 hover:bg-slate-400'
                      : 'w-2.5 bg-slate-700 hover:bg-slate-600'
                  }`}
                  aria-label={`Go to set ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INSTITUTIONS & ACADEMIC PROGRAMS */}
      <section id="institutions" className="scroll-mt-20 py-12 px-4 sm:px-6 border-t transition-colors space-y-12">
        {/* Campus Colleges Header */}
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              OUR INSTITUTIONS
            </span>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isBright ? 'text-slate-900' : 'text-white'}`}>
              KIET Group Campus Colleges
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { name: 'KIET', desc: 'Engineering & Technology (B.Tech / M.Tech)', icon: GraduationCap },
              { name: 'KIET II', desc: 'Engineering & Technology (B.Tech / M.Tech)', icon: GraduationCap },
              { name: 'KIET Women’s', desc: 'Women’s Engineering College (B.Tech)', icon: GraduationCap },
              { name: 'KIET Polytechnic', desc: 'Diploma Programs & Technical Courses', icon: GraduationCap },
            ].map((inst) => {
              const InstIcon = inst.icon;
              return (
                <div
                  key={inst.name}
                  className={`p-5 rounded-2xl border transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/30 cursor-pointer ${
                    isBright ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <InstIcon className="w-7 h-7 text-emerald-600 mb-2" />
                  <h3 className="text-sm font-bold">{inst.name}</h3>
                  <p className={`text-xs mt-1 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>{inst.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Programs Subsection */}
        <div id="academic-programs" className="scroll-mt-20 max-w-7xl mx-auto space-y-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isBright ? 'text-slate-900' : 'text-white'}`}>
              Academic <span className="text-blue-600">Programs</span>
            </h2>
            <p className={`text-xs sm:text-sm font-medium ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Specialized tracks designed for the era of Artificial Intelligence.
            </p>
          </div>

          {/* Programs Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {academicPrograms.map((prog) => {
              const ProgIcon = prog.icon;
              return (
                <div
                  key={prog.code}
                  className={`p-6 rounded-3xl border transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl hover:border-blue-500 hover:ring-4 hover:ring-blue-500/30 cursor-pointer flex flex-col justify-between ${
                    isBright
                      ? 'bg-white border-slate-200 shadow-sm'
                      : 'bg-slate-900/80 border-slate-800 shadow-md'
                  }`}
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border shadow-sm ${
                      isBright
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                    }`}>
                      <ProgIcon className="w-6 h-6" />
                    </div>

                    <h3 className={`text-lg sm:text-xl font-bold tracking-tight flex items-center justify-between gap-2 ${isBright ? 'text-slate-900' : 'text-white'}`}>
                      <span>{prog.title}</span>
                      <span className="text-xs font-semibold text-slate-400">({prog.code})</span>
                    </h3>

                    <p className={`text-xs leading-relaxed mt-2 ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                      {prog.desc}
                    </p>

                    <div className="flex items-center gap-2 mt-5">
                      <span className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border ${
                        isBright
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                      }`}>
                        {prog.duration}
                      </span>
                      <span className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border ${
                        isBright
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                      }`}>
                        {prog.level}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`text-xs font-bold transition-colors flex items-center gap-1.5 mt-5 cursor-pointer ${
                        isBright
                          ? 'text-slate-800 hover:text-blue-600'
                          : 'text-blue-400 hover:text-blue-300'
                      }`}
                    >
                      <span>View Curriculum</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className={`pt-4 mt-5 border-t flex items-center gap-2 flex-wrap ${
                    isBright ? 'border-slate-100' : 'border-slate-800'
                  }`}>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">AVAILABLE AT:</span>
                    {prog.availableAt.map((loc) => (
                      <span
                        key={loc}
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
                          loc === 'KIET'
                            ? isBright
                              ? 'border-emerald-300 text-emerald-600 bg-emerald-50'
                              : 'border-emerald-800/80 text-emerald-400 bg-emerald-950/60'
                            : loc === 'KIEK'
                            ? isBright
                              ? 'border-rose-300 text-rose-600 bg-rose-50'
                              : 'border-rose-800/80 text-rose-400 bg-rose-950/60'
                            : isBright
                              ? 'border-pink-300 text-pink-600 bg-pink-50'
                              : 'border-pink-800/80 text-pink-400 bg-pink-950/60'
                        }`}
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: ALUMNI & PLACEMENTS */}
      <section id="alumni" className="scroll-mt-20 py-12 px-4 sm:px-6 border-t transition-colors overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              ALUMNI & PLACEMENTS
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight ${isBright ? 'text-slate-900' : 'text-white'}`}>
              Celebrating the Success of Our Bright Minds
            </h2>
            <p className={`text-xs sm:text-sm font-medium ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
              Our distinguished graduates placed across top tech companies, MNCs, and defense organizations. Hover over any card to pause scrolling and highlight details.
            </p>
          </div>

          {/* Interactive Horizontal Infinite Scroll Carousel Container */}
          <div className={`relative overflow-hidden rounded-3xl border p-4 backdrop-blur-sm ${
            isBright ? 'bg-slate-100/60 border-slate-200' : 'bg-slate-950/40 border-slate-800'
          }`}>
            <div className="flex gap-4 sm:gap-5 animate-h-scroll pause-on-hover w-max">
              {[...alumniList, ...alumniList].map((item, idx) => (
                <div
                  key={`h-alumni-${idx}`}
                  className={`relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg w-[200px] sm:w-[225px] h-[280px] sm:h-[310px] border transition-all duration-300 transform hover:scale-[1.05] hover:-translate-y-2 hover:shadow-2xl hover:border-blue-500 hover:ring-4 hover:ring-blue-500/40 cursor-pointer shrink-0 ${
                    isBright ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700/60'
                  }`}
                >
                  {/* Clean original quality photo with zero filters */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Localized bottom overlay for crisp text readability */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pt-10 pb-3 px-3.5 flex flex-col justify-end">
                    <h3 className="text-white font-extrabold text-sm sm:text-base tracking-tight drop-shadow-md">
                      {item.name}
                    </h3>
                    <p className="text-slate-200 text-[11px] sm:text-xs font-semibold mt-0.5 drop-shadow">
                      {item.company}
                    </p>
                    <div className="mt-1.5">
                      <span className="inline-block bg-blue-600 text-white font-black text-[11px] px-3 py-0.5 rounded-full shadow-md">
                        {item.lpa}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CONTACT US (Matching Reference Image 100%) */}
      <section id="contact-us" className="scroll-mt-20 py-12 px-4 sm:px-6 border-t transition-colors">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Dark Card */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl border border-slate-700/60 space-y-3 relative overflow-hidden">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white uppercase tracking-wider shadow">
              CONTACT US
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Get in Touch
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl leading-relaxed">
              KIET Group of Institutions. Approved by AICTE, Govt of AP & Affiliated to JNTUK.
            </p>
          </div>

          {/* 3 Contact Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Campus Address */}
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${
              isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight mb-2">Campus Address</h3>
                  <p className={`text-xs leading-relaxed font-semibold ${isBright ? 'text-slate-600' : 'text-slate-400'}`}>
                    KIET Group of Institutions,<br />
                    Kakinada - Yanam Road, Korangi,<br />
                    East Godavari Dist, A.P - 533461.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60">
                <a
                  href="https://maps.google.com/?q=KIET+Group+of+Institutions+Kakinada+Korangi"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 underline"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: General Enquiry */}
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${
              isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight mb-1">General Enquiry</h3>
                  <p className={`text-xs font-medium mb-3 ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                    For admissions and general information.
                  </p>

                  <div className="space-y-1.5 text-xs font-extrabold">
                    <a href="tel:+919849495335" className={`block hover:text-blue-600 transition-colors ${isBright ? 'text-slate-900' : 'text-white'}`}>
                      +91 98494 95335
                    </a>
                    <a href="tel:+918818988199" className={`block hover:text-blue-600 transition-colors ${isBright ? 'text-slate-900' : 'text-white'}`}>
                      +91 88189 88199
                    </a>
                    <a href="tel:+919090887777" className={`block hover:text-blue-600 transition-colors ${isBright ? 'text-slate-900' : 'text-white'}`}>
                      +91 90908 87777
                    </a>
                    <a href="tel:08842303400" className={`block hover:text-blue-600 transition-colors ${isBright ? 'text-slate-900' : 'text-white'}`}>
                      0884-2303400
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 space-y-1">
                <span className={`block text-[11px] font-semibold ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>Official Email Contacts:</span>
                <div className="flex flex-col gap-1">
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>info@kietgroup.com</span>
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>contact@kietgroup.com</span>
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kietw@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>kietw@kietgroup.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: Connect With Us */}
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${
              isBright ? 'bg-white border-slate-200' : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight mb-4">Connect With Us</h3>

                  <div className="space-y-3 text-xs font-bold">
                    <a
                      href="https://www.kietgroup.com"
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2.5 hover:text-blue-600 transition-colors ${isBright ? 'text-slate-800' : 'text-slate-200'}`}
                    >
                      <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>www.kietgroup.com</span>
                    </a>

                    <a
                      href="https://instagram.com/Kiet.channel"
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2.5 hover:text-pink-600 transition-colors ${isBright ? 'text-slate-800' : 'text-slate-200'}`}
                    >
                      <svg className="w-4 h-4 text-pink-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                      <span>Insta: Kiet.channel</span>
                    </a>

                    <a
                      href="https://www.youtube.com/@kakinadakiet"
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2.5 hover:text-rose-600 transition-colors ${isBright ? 'text-slate-800' : 'text-slate-200'}`}
                    >
                      <svg className="w-4 h-4 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>YT: @kakinadakiet</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60">
                <span className={`text-[11px] font-semibold ${isBright ? 'text-slate-500' : 'text-slate-400'}`}>
                  Hostel Administration & Support Office
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER BAR */}
      <footer className={`border-t py-6 px-4 text-xs transition-colors ${
        isBright ? 'bg-white border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-extrabold">
            {['Home', 'About Us', 'Institutions', 'Academics', 'Alumni', 'Contact Us', 'Login'].map((item) => (
              <button
                key={`footer-nav-${item}`}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`hover:text-blue-600 transition-colors cursor-pointer ${
                  activeNav === item ? 'text-blue-600 font-black underline' : ''
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="text-center md:text-right space-y-0.5">
            <p>© {new Date().getFullYear()} KIET Group of Institutions (Kakinada Institute of Engineering & Technology). All Rights Reserved.</p>
            <p className="text-[11px] opacity-80">Yanam Road, Korangi Village, Tallarevu Mandal, Kakinada District, AP – 533461</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
