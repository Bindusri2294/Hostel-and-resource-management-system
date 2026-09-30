import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Building2,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  BedDouble,
  FileText,
  Lock,
  Globe,
  ExternalLink,
  Eye,
  EyeOff,
  X
} from 'lucide-react';

import kietLogo from '../../assets/kiet_logo.webp';
import kietCollege from '../../assets/kiet_college_login_photo.jpeg';
import { authService } from '../../services/api';
import hostelRoom1 from '../../assets/hostel_room1.jpeg';
import hostelRoom2 from '../../assets/hostel_room2.jpeg';
import hostelRoom3 from '../../assets/hostel_room3.jpeg';
import hostelRoom4 from '../../assets/hostel_room4.jpeg';
import hostelRoom5 from '../../assets/hostel_room5.jpeg';
import hostelRoom6 from '../../assets/hostel_room6.jpeg';
import hostelRoom7 from '../../assets/hostel_room7.jpeg';
import hostelRoom8 from '../../assets/hostel_room8.jpeg';

export default function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeNav, setActiveNav] = useState('Home');
  const [loginRole, setLoginRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Scroll-aware login state
  const [isPastHero, setIsPastHero] = useState(false);
  const [showFloatingLogin, setShowFloatingLogin] = useState(false);
  const heroRef = useRef(null);

  const allHostelRooms = [
    hostelRoom1, hostelRoom2, hostelRoom3, hostelRoom4,
    hostelRoom5, hostelRoom6, hostelRoom7, hostelRoom8
  ];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allHostelRooms.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? allHostelRooms.length - 1 : prev - 1));

  // Automatic slideshow interval: moves every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allHostelRooms.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [allHostelRooms.length]);

  // Login form state
  const [userId, setUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotRollNo, setForgotRollNo] = useState('');
  const [forgotOTP, setForgotOTP] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotResetToken, setForgotResetToken] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [showManualResetPrompt, setShowManualResetPrompt] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const fillDemo = (role) => {
    setLoginRole(role);
    if (role === 'Admin') {
      setUserId('admin@hostel.com');
      setLoginPassword('admin123');
    } else {
      setUserId('2026-CS-01');
      setLoginPassword('2026-CS-01');
    }
  };

  // Scroll: track hero visibility + active nav
  useEffect(() => {
    const handleScroll = () => {
      // Active nav highlight
      const sections = ['home', 'about', 'contact'];
      let current = '';
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 3) {
            current = section.charAt(0).toUpperCase() + section.slice(1);
          }
        }
      }
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        current = 'Contact';
      }
      if (current) setActiveNav(current);

      // Hero visibility
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setIsPastHero(heroBottom < 80);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close floating login when scrolled back to hero
  useEffect(() => {
    if (!isPastHero) setShowFloatingLogin(false);
  }, [isPastHero]);

  useEffect(() => {
    let timer;
    if (otpCooldown > 0) {
      timer = setInterval(() => {
        setOtpCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCooldown]);

  const handleNavClick = (navName) => {
    setActiveNav(navName);
    const targetId = navName.toLowerCase();
    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const elem = document.getElementById(targetId);
      if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleRoleChange = (role) => {
    setLoginRole(role);
    setError('');
    setUserId('');
    setLoginPassword('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(userId, loginPassword);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setShowManualResetPrompt(false);
    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword({ rollNo: forgotRollNo });
      setForgotSuccess(res.data.message);
      setForgotStep(2);
      setOtpCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP.';
      setForgotError(msg);
      if (msg.includes('No email address found')) {
        setShowManualResetPrompt(true);
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleManualResetRequest = async () => {
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      const res = await authService.requestManualReset({ rollNo: forgotRollNo });
      setForgotSuccess(res.data.message);
      setShowManualResetPrompt(false);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to request manual reset.');
      setShowManualResetPrompt(false);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      const res = await authService.verifyOTP({ rollNo: forgotRollNo, otp: forgotOTP });
      setForgotSuccess('OTP verified successfully!');
      setForgotResetToken(res.data.resetToken);
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);
    try {
      await authService.resetPassword({ resetToken: forgotResetToken, newPassword: forgotNewPassword });
      setForgotSuccess('Password reset successfully! You can now login.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotRollNo('');
        setForgotOTP('');
        setForgotNewPassword('');
        setForgotSuccess('');
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  // The login form JSX — reused in hero card and floating modal
  const LoginForm = () => (
    <div className="relative z-10 space-y-4">
      <div>
        <h3 className="text-xl font-black text-[#2F2925] tracking-tight">Welcome Back!</h3>
        <p className="text-xs font-medium text-[#8B7355] mt-0.5">Sign in to access your hostel management portal.</p>
      </div>

      <div className="flex p-1 bg-[#FDF0DC] border border-[#E8D8C4] rounded-xl mb-4">
        <button
          type="button"
          onClick={() => handleRoleChange('Admin')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${loginRole === 'Admin' ? 'bg-[#EB8055] text-white shadow-sm' : 'text-[#8B7355] hover:text-[#2F2925]'
            }`}
        >
          <Building2 className="w-3 h-3" /> Admin
        </button>
        <button
          type="button"
          onClick={() => handleRoleChange('Student')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${loginRole === 'Student' ? 'bg-[#EB8055] text-white shadow-sm' : 'text-[#8B7355] hover:text-[#2F2925]'
            }`}
        >
          <GraduationCap className="w-3 h-3" /> Student
        </button>
      </div>

      {/* Demo Quick Login */}
      <div className="flex justify-between items-center bg-[#FDF0DC] p-2.5 rounded-xl mb-4 border border-[#E8D8C4]">
        <span className="text-[10px] font-black text-[#B85228] uppercase tracking-widest pl-1">One-Click Demo</span>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => fillDemo('Admin')} className="text-[10px] font-bold bg-white text-[#EB8055] border border-[#E8D8C4] px-3 py-1.5 rounded-lg shadow-xs hover:bg-[#EB8055] hover:text-white hover:border-[#EB8055] transition-all active:scale-95">Admin</button>
          <button type="button" onClick={() => fillDemo('Student')} className="text-[10px] font-bold bg-white text-[#EB8055] border border-[#E8D8C4] px-3 py-1.5 rounded-lg shadow-xs hover:bg-[#EB8055] hover:text-white hover:border-[#EB8055] transition-all active:scale-95">Student</button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleLoginSubmit} className="space-y-3">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B7355] group-focus-within:text-[#EB8055] transition-colors">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="Enter username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8D8C4] text-xs font-medium text-[#2F2925] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8055]/20 focus:border-[#EB8055] transition-all placeholder:text-[#8B7355]/60"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B7355] group-focus-within:text-[#EB8055] transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-white border border-[#E8D8C4] text-xs font-medium text-[#2F2925] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB8055]/20 focus:border-[#EB8055] transition-all placeholder:text-[#8B7355]/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8B7355] hover:text-[#2F2925]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input type="checkbox" className="w-4 h-4 rounded border-[#E8D8C4] text-[#EB8055] focus:ring-[#EB8055] cursor-pointer" />
            <span className="text-xs font-semibold text-[#8B7355] group-hover:text-[#2F2925] transition-colors">Remember me</span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (loginRole === 'Student' && userId) {
                setForgotRollNo(userId);
              }
              setShowForgotModal(true);
            }}
            className="text-xs font-bold text-[#EB8055] hover:text-[#D96B3A] transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold py-2.5 rounded-lg shadow-md shadow-[#EB8055]/20 text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3 active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Sign In <ChevronRight className="w-4 h-4" /></>
          )}
        </button>

        <div className="text-center pt-2">
          <p className="text-xs font-medium text-[#8B7355]">
            New here? <a href="#contact" className="font-bold text-[#EB8055] hover:underline">Contact Admin</a>
          </p>
        </div>
      </form>
    </div>
  );

  return (
    <div className="w-full min-h-screen flex flex-col font-sans bg-[#F9EFDE] text-[#2F2925] selection:bg-[#EB8055] selection:text-white overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section
        id="home"
        ref={heroRef}
        className="relative w-full min-h-screen flex flex-col justify-between pt-5 pb-6 px-4 sm:px-8 lg:px-12 z-30"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={kietCollege}
            alt="KIET Campus Background"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/35" />
        </div>

        {/* TOP HEADER */}
        <header className="relative z-20 w-full max-w-7xl mx-auto flex items-center justify-between py-2 shrink-0">
          {/* Left Logo */}
          <div className="flex items-center gap-3 sm:gap-3.5 z-10">
            <div className="bg-transparent p-0.5 sm:p-1 shrink-0">
              <img src={kietLogo} alt="KIET Logo" className="w-10 h-10 sm:w-13 sm:h-13 object-contain drop-shadow-sm" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-black text-xl sm:text-2xl tracking-tight leading-none">KIET</h1>
              <p className="text-white/80 text-[8px] sm:text-[9px] font-bold tracking-widest uppercase mt-1 leading-none">Group of Institutions</p>
            </div>
          </div>

          {/* Right: Plain text nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {['Home', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`text-sm font-semibold transition-colors relative pb-1 cursor-pointer ${activeNav === item
                  ? 'text-white font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#EB8055] after:rounded-full'
                  : 'text-white/80 hover:text-white'
                  }`}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* Mobile: hamburger-style Sign In */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="md:hidden px-4 py-1.5 bg-white text-[#EB8055] text-[10px] font-black rounded-full shadow-lg border border-white/20 z-10 uppercase tracking-wide cursor-pointer hover:bg-[#FDF0DC]"
          >
            Sign In
          </button>
        </header>

        {/* HERO CONTENT & LOGIN CARD */}
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center flex-1 my-auto py-4">

          {/* Left: Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-3 sm:space-y-4 max-lg:order-2 max-lg:mt-6">
            <div className="space-y-1.5">
              <p className="text-[#FDF0DC] text-[9px] sm:text-[10px] font-bold tracking-[0.12em] uppercase">
                Kakinada Institute of Engineering & Technology (JNTUK)
              </p>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.1] tracking-[-0.01em]"
                style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600 }}
              >
                KIET Hostel <br />
                <span
                  className="text-[#EB8055]"
                  style={{ fontFamily: "'Sora', sans-serif", fontWeight: 500 }}
                >Management Portal</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed font-medium">
              A smarter way to manage your hostel life. Access room allocations, submit feedback, track maintenance and more — all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 pt-1 sm:pt-2">
              {[
                { icon: BedDouble, text: 'Room Management' },
                { icon: GraduationCap, text: 'Student Services' },
                { icon: FileText, text: 'Resource Utilization' },
                { icon: ShieldCheck, text: 'Safe & Secure Access' }
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1.5 sm:gap-2 text-white/90">
                  <badge.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#EB8055]" />
                  <span className="text-[10px] sm:text-xs font-semibold">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login Card (always visible in hero) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full max-lg:order-1">
            <div className="w-full max-w-[360px] bg-white rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/50 relative overflow-hidden border border-[#E8D8C4]">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#EB8055]/10 rounded-full blur-3xl pointer-events-none" />
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Bottom subtle spacer */}
        <div className="w-full shrink-0 h-2" />
      </section>

      {/* ================= FLOATING LOGIN BUTTON (appears after scrolling past hero) ================= */}
      <div
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '24px',
          zIndex: 50,
          pointerEvents: isPastHero ? 'auto' : 'none',
          opacity: isPastHero ? 1 : 0,
          transform: isPastHero ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {!showFloatingLogin ? (
          <button
            onClick={() => setShowFloatingLogin(true)}
            className="flex items-center gap-2 bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold text-sm px-5 py-3 rounded-full shadow-xl shadow-[#EB8055]/30 transition-all active:scale-95 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
        ) : (
          // Expanded floating login card
          <div
            className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-[#E8D8C4] w-[340px] sm:w-[380px] overflow-hidden"
            style={{ animation: 'floatCardIn 0.25s ease forwards' }}
          >
            <style>{`
              @keyframes floatCardIn {
                from { opacity: 0; transform: scale(0.94) translateY(10px); }
                to   { opacity: 1; transform: scale(1)   translateY(0); }
              }
            `}</style>
            {/* Card header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-[#E8D8C4] bg-[#FDF0DC]/50">
              <div className="flex items-center gap-2">
                <img src={kietLogo} alt="KIET" className="w-6 h-6 object-contain" />
                <span className="text-sm font-black text-[#2F2925] tracking-tight">KIET Hostel Portal</span>
              </div>
              <button
                onClick={() => setShowFloatingLogin(false)}
                className="text-[#8B7355] hover:text-[#2F2925] p-1 rounded-full hover:bg-[#FDF0DC] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#EB8055]/8 rounded-full blur-3xl pointer-events-none" />
              <LoginForm />
            </div>
          </div>
        )}
      </div>

      {/* ================= ABOUT / ROOMS SECTION ================= */}
      <section id="about" className="pt-12 pb-20 px-4 sm:px-8 bg-[#F9EFDE] relative z-10 border-t border-[#E8D8C4]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10 items-start">

          {/* Left: About Details */}
          <div className="space-y-8 flex flex-col justify-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] text-[#8B7355] uppercase">
                <div className="w-8 h-[2px] bg-[#EB8055]"></div>
                <span>About KIET Hostel</span>
                <div className="w-8 h-[2px] bg-[#EB8055]"></div>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#2F2925] leading-[1.2] tracking-normal">
                <span
                  className="block"
                  style={{
                    fontFamily: "'Caveat', cursive, sans-serif",
                    fontWeight: 600,
                    fontSize: '1.18em',
                    lineHeight: 1.15,
                  }}
                >
                  More Than Just a Place to Stay
                </span>
                <span
                  className="text-[#EB8055] block mt-1"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontWeight: 500,
                    fontStyle: 'italic',
                    fontSize: '0.9em',
                    letterSpacing: '0.005em',
                  }}
                >
                  It's Your Home Away From Home
                </span>
              </h2>
            </div>

            <p className="text-[#5A4A3A] leading-relaxed font-medium">
              KIET Hostel provides a safe, comfortable and supportive living environment for students. Our hostels are designed to offer the right balance of academic focus, personal growth and a vibrant community life. With modern facilities, well-maintained rooms and dedicated support staff, we ensure that every student feels at home, away from home.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {[
                { icon: ShieldCheck, title: 'Safe & Secure', sub: 'Campus' },
                { icon: Building2, title: 'Modern', sub: 'Facilities' },
                { icon: AlertCircle, title: 'Healthy', sub: 'Environment' },
                { icon: GraduationCap, title: 'Student', sub: 'Support' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-xl border border-[#E8D8C4] bg-white hover:bg-white hover:shadow-md hover:border-[#EB8055] transition-all cursor-default min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#FDF0DC] text-[#EB8055] flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] sm:text-xs font-bold text-[#2F2925] leading-tight truncate">{feature.title}</p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-[#8B7355] truncate">{feature.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Room Images Automatic Slideshow */}
          <div className="space-y-4 flex flex-col justify-start">
            <div className="flex items-end justify-between mb-2">
              <div>
                <h3 className="text-2xl font-black text-[#2F2925] tracking-tight">Our Hostel Rooms</h3>
                <p className="text-sm font-medium text-[#8B7355] mt-1">Comfortable, well-furnished rooms designed for a better stay.</p>
              </div>
            </div>

            {/* Main Featured Image Automatic Slideshow */}
            <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden group shadow-lg border border-[#E8D8C4] bg-[#2F2925]">
              {/* Horizontal Sliding Track */}
              <div
                className="flex w-full h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
              >
                {allHostelRooms.map((img, i) => (
                  <div key={i} className="w-full h-full shrink-0 relative">
                    <img
                      src={img}
                      alt={`Hostel Room ${i + 1}`}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent pointer-events-none" />
                  </div>
                ))}
              </div>

              {/* Prev / Next Arrows */}
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-[#EB8055] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-[#EB8055] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs cursor-pointer shadow-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Indicator Dots */}
              <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center items-center gap-2">
                {allHostelRooms.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentImageIndex(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${i === currentImageIndex
                      ? 'w-6 h-2 bg-[#EB8055] shadow-xs'
                      : 'w-2 h-2 bg-white/60 hover:bg-white'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER / CONTACT SECTION ================= */}
      <footer id="contact" className="w-full scroll-mt-6 bg-gradient-to-b from-[#2F2925] via-[#352D27] to-[#25201D] text-[#F9EFDE] border-t border-[#43372F] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          {/* Main 3-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14 pb-14 border-b border-[#43372F]/80">
            {/* Column 1: Campus Address */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EB8055]/15 border border-[#EB8055]/30 text-[#EB8055] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold tracking-tight text-white">Campus Address</h3>
              </div>
              <p className="text-xs leading-relaxed font-medium text-[#E8D8C4] pl-1">
                KIET Group of Institutions,<br />
                Kakinada - Yanam Road, Korangi,<br />
                East Godavari Dist, A.P - 533461.
              </p>
              <div className="pt-2 pl-1">
                <a
                  href="https://maps.google.com/?q=KIET+Group+of+Institutions+Kakinada+Korangi"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EB8055] hover:text-[#f3956f] transition-colors underline"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Column 2: General Enquiry */}
            <div className="space-y-4 md:border-l md:border-[#43372F]/80 md:pl-8 lg:pl-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EB8055]/15 border border-[#EB8055]/30 text-[#EB8055] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-white">General Enquiry</h3>
                  <p className="text-[11px] font-medium text-[#E8D8C4]/70">For admissions and hostel queries</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-semibold pl-1">
                <a href="tel:+919849495335" className="hover:text-[#EB8055] transition-colors text-[#F9EFDE]">+91 98494 95335</a>
                <a href="tel:+918818988199" className="hover:text-[#EB8055] transition-colors text-[#F9EFDE]">+91 88189 88199</a>
                <a href="tel:+919090887777" className="hover:text-[#EB8055] transition-colors text-[#F9EFDE]">+91 90908 87777</a>
                <a href="tel:08842303400" className="hover:text-[#EB8055] transition-colors text-[#F9EFDE]">0884-2303400</a>
              </div>

              <div className="pt-2 pl-1 space-y-1.5">
                <span className="block text-[11px] font-bold text-[#E8D8C4]/70 uppercase tracking-wider">Official Email Contacts:</span>
                <div className="flex flex-col gap-1.5">
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[#F9EFDE] hover:text-[#EB8055] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#EB8055]" /><span>info@kietgroup.com</span>
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[#F9EFDE] hover:text-[#EB8055] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#EB8055]" /><span>contact@kietgroup.com</span>
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kietw@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-medium text-[#F9EFDE] hover:text-[#EB8055] transition-colors">
                    <Mail className="w-3.5 h-3.5 text-[#EB8055]" /><span>kietw@kietgroup.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Column 3: Connect With Us */}
            <div className="space-y-4 md:border-l md:border-[#43372F]/80 md:pl-8 lg:pl-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EB8055]/15 border border-[#EB8055]/30 text-[#EB8055] flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight text-white">Connect With Us</h3>
                  <p className="text-[11px] font-medium text-[#E8D8C4]/70">Follow and stay updated</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-semibold pl-1">
                <a href="https://www.kietgroup.com" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-[#F9EFDE] hover:text-[#EB8055] transition-colors">
                  <Globe className="w-4 h-4 text-[#EB8055] shrink-0" /><span>www.kietgroup.com</span>
                </a>
                <a href="https://instagram.com/Kiet.channel" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-[#F9EFDE] hover:text-pink-400 transition-colors">
                  <svg className="w-4 h-4 text-pink-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>Insta: Kiet.channel</span>
                </a>
                <a href="https://youtube.com/@kakinadakiet" target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-[#F9EFDE] hover:text-rose-400 transition-colors">
                  <svg className="w-4 h-4 text-rose-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span>YT: @kakinadakiet</span>
                </a>
              </div>

              <div className="pt-2 pl-1">
                <span className="text-[11px] font-semibold text-[#EB8055] bg-[#EB8055]/10 px-2.5 py-1 rounded-md border border-[#EB8055]/20 inline-block">
                  Hostel Administration & Support Office
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Quick Nav + Copyright & Support info */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#E8D8C4]/80">
            <div className="flex flex-wrap items-center justify-center gap-6 font-bold">
              {['Home', 'About', 'Contact'].map((item) => (
                <button
                  key={`footer-nav-${item}`}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`hover:text-[#EB8055] transition-colors cursor-pointer ${activeNav === item ? 'text-[#EB8055] font-black underline' : 'text-[#F9EFDE]'
                    }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="text-center md:text-right space-y-0.5">
              <p className="font-semibold text-[#F9EFDE]">© {new Date().getFullYear()} KIET Group of Institutions • Hostel & Resource Management System</p>
              <p className="text-[11px] text-[#E8D8C4]/70">KIET Hostel • Dedicated 24/7 Residential Support & Care • All Rights Reserved</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-[#E8D8C4]">
            <div className="px-6 py-4 border-b border-[#E8D8C4] flex items-center justify-between bg-[#FDF0DC]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F5E8D4] text-[#EB8055] rounded-full">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#2F2925] text-lg">Reset Password</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStep(1);
                  setForgotError('');
                  setForgotSuccess('');
                }}
                className="text-[#8B7355] hover:text-[#2F2925] font-bold p-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              {forgotError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /><span>{forgotError}</span>
                </div>
              )}
              {forgotSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" /><span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 && (
                <div className="space-y-4">
                  {!showManualResetPrompt ? (
                    !forgotSuccess && !(forgotError && forgotError.includes("pending password reset request")) ? (
                      <form onSubmit={handleForgotSubmit} className="space-y-4">
                        <p className="text-sm text-[#8B7355] font-medium mb-2">
                          Enter your Roll Number. We will send a 6-digit OTP to the email address registered on your student profile.
                        </p>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-[#2F2925]">Roll Number</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2026-CS-01"
                            value={forgotRollNo}
                            onChange={(e) => setForgotRollNo(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[#E8D8C4] text-sm text-[#2F2925] focus:outline-none focus:ring-2 focus:ring-[#EB8055]/20 focus:border-[#EB8055]"
                          />
                        </div>
                        <button type="submit" disabled={forgotLoading} className="w-full bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-70 mt-2 cursor-pointer">
                          {forgotLoading ? "Sending OTP..." : "Send OTP to Email"}
                        </button>
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setShowForgotModal(false); setForgotError(''); setForgotSuccess(''); }}
                        className="w-full bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold py-2.5 rounded-xl shadow-md transition-all mt-2 cursor-pointer"
                      >
                        Close
                      </button>
                    )
                  ) : (
                    <div className="p-4 border border-[#E8D8C4] bg-[#FDF0DC] rounded-xl animate-in slide-in-from-top-2">
                      <p className="text-sm text-[#B85228] font-semibold mb-4">
                        No registered email address was found. Would you like to notify the administration office to reset your password manually?
                      </p>
                      <button type="button" onClick={handleManualResetRequest} disabled={forgotLoading} className="w-full bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-70 text-sm cursor-pointer">
                        {forgotLoading ? "Notifying..." : "Notify Admin for Manual Reset"}
                      </button>
                      <button type="button" onClick={() => { setShowManualResetPrompt(false); setForgotError(''); }} className="w-full mt-3 text-[#EB8055] font-bold hover:text-[#D96B3A] text-xs transition-colors cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <p className="text-sm text-[#8B7355] font-medium mb-2">Check your email inbox! Enter the 6-digit verification code below.</p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2F2925]">Verification Code</label>
                    <input
                      type="text"
                      required
                      maxLength="6"
                      placeholder="Enter 6-digit OTP"
                      value={forgotOTP}
                      onChange={(e) => setForgotOTP(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#E8D8C4] text-sm tracking-widest text-center font-bold text-[#2F2925] focus:outline-none focus:ring-2 focus:ring-[#EB8055]/20 focus:border-[#EB8055]"
                    />
                  </div>
                  <button type="submit" disabled={forgotLoading} className="w-full bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-70 mt-2 cursor-pointer">
                    {forgotLoading ? "Verifying..." : "Verify OTP"}
                  </button>
                  <div className="text-center mt-3 text-xs font-semibold">
                    {otpCooldown > 0 ? (
                      <span className="text-[#8B7355]">Resend OTP in {otpCooldown}s</span>
                    ) : (
                      <button type="button" onClick={handleForgotSubmit} disabled={forgotLoading} className="text-[#EB8055] hover:text-[#D96B3A] transition-colors cursor-pointer">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-sm text-[#8B7355] font-medium mb-2">OTP verified successfully. Please set your new password.</p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#2F2925]">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8B7355]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        required
                        minLength="6"
                        placeholder="Enter new password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        className="w-full pl-10 px-4 py-2.5 rounded-xl border border-[#E8D8C4] text-sm text-[#2F2925] focus:outline-none focus:ring-2 focus:ring-[#EB8055]/20 focus:border-[#EB8055]"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={forgotLoading} className="w-full bg-[#EB8055] hover:bg-[#D96B3A] text-white font-bold py-2.5 rounded-xl shadow-md transition-all disabled:opacity-70 mt-2 cursor-pointer">
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
