import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Building2,
  AlertCircle,
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
  EyeOff
} from 'lucide-react';

import kietLogo from '../../assets/kiet_logo.webp';
import kietCollege from '../../assets/kiet_college_login_photo.jpeg';
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
  const [loginRole, setLoginRole] = useState('Admin'); // 'Admin' or 'Student'
  const [showPassword, setShowPassword] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allHostelRooms = [
    hostelRoom1, hostelRoom2, hostelRoom3, hostelRoom4,
    hostelRoom5, hostelRoom6, hostelRoom7, hostelRoom8
  ];

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % allHostelRooms.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev === 0 ? allHostelRooms.length - 1 : prev - 1));

  // Login form state
  const [userId, setUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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

  // Handle active navigation highlighting on scroll
  useEffect(() => {
    const handleScroll = () => {
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
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900 selection:bg-[#673BB7] selection:text-white">
      
      {/* ================= HERO SECTION (Matches Screenshot) ================= */}
      <section id="home" className="relative h-[65vh] min-h-[500px] flex flex-col items-center pt-4 pb-2 px-4 sm:px-8 overflow-visible z-30">
        
        {/* Full Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={kietCollege}
            alt="KIET Campus Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>

        {/* TOP FLOATING HEADER */}
        <header className="relative z-20 w-full max-w-7xl mx-auto flex items-center mb-2 sm:mb-4">
          {/* Left Logo */}
          <div className="flex items-center gap-3 z-10">
            <div className="bg-transparent p-1">
              <img src={kietLogo} alt="KIET Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-black text-lg sm:text-xl tracking-tight leading-none">KIET</h1>
              <p className="text-white/70 text-[6px] sm:text-[7px] font-bold tracking-widest uppercase mt-0.5 leading-none">Group of Institutions</p>
            </div>
          </div>

          {/* Centered Navigation */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 bg-white/95 backdrop-blur-md px-1.5 py-1.5 rounded-full shadow-lg">
            {['Home', 'About', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`px-6 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeNav === item 
                    ? 'text-[#673BB7] shadow-sm bg-transparent' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </header>

        {/* HERO CONTENT & LOGIN CARD */}
        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 flex-1">
          
          {/* Left: Text Content */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-2">
            <div className="space-y-1">
              <p className="text-white text-[8px] sm:text-[9px] font-bold tracking-[0.1em] uppercase">
                Kakinada Institute of Engineering & Technology (Autonomous)
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
                KIET Hostel <br />
                <span className="text-blue-400">Management Portal</span>
              </h2>
            </div>
            
            <p className="text-[10px] sm:text-xs text-white/90 max-w-lg leading-relaxed font-medium">
              A smarter way to manage your hostel life. Access room allocations, submit feedback, track maintenance and more — all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
              {[
                { icon: BedDouble, text: 'Room Management' },
                { icon: GraduationCap, text: 'Student Services' },
                { icon: FileText, text: 'Resource Utilization' },
                { icon: ShieldCheck, text: 'Safe & Secure Access' }
              ].map((badge, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-white/90">
                  <badge.icon className="w-3.5 h-3.5 text-blue-300" />
                  <span className="text-[9px] sm:text-[10px] font-semibold">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full self-start -mt-2 sm:-mt-6">
            <div className="w-full max-w-[380px] bg-white rounded-2xl p-5 shadow-2xl shadow-black/40 relative overflow-hidden">
              {/* Decorative background blur inside card */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#673BB7]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 space-y-4">
                

                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Welcome Back!</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Sign in to access your hostel management portal.</p>
                </div>

                <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Admin')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      loginRole === 'Admin' ? 'bg-[#512da8] text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3 h-3" /> Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('Student')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      loginRole === 'Student' ? 'bg-[#512da8] text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-3 h-3" /> Student
                  </button>
                </div>

                {/* Demo Quick Login */}
                <div className="flex justify-between items-center bg-blue-50 p-2.5 rounded-xl mb-4 border border-blue-100/50">
                  <span className="text-[10px] font-black text-blue-800 uppercase tracking-widest pl-1">One-Click Demo</span>
                  <div className="flex gap-1.5">
                    <button type="button" onClick={() => fillDemo('Admin')} className="text-[10px] font-bold bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95">Admin</button>
                    <button type="button" onClick={() => fillDemo('Student')} className="text-[10px] font-bold bg-white text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95">Student</button>
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
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#673BB7] transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder={loginRole === 'Admin' ? "Enter admin email or username" : "Enter student email or roll no"}
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-xs font-medium text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#673BB7]/20 focus:border-[#673BB7] transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#673BB7] transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 text-xs font-medium text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#673BB7]/20 focus:border-[#673BB7] transition-all placeholder:text-slate-400"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-[#673BB7] focus:ring-[#673BB7] cursor-pointer" />
                      <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                    </label>
                    <a href="#" className="text-xs font-bold text-[#673BB7] hover:text-[#512da8] transition-colors">Forgot password?</a>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#512da8] hover:bg-[#4527a0] text-white font-bold py-2.5 rounded-lg shadow-md shadow-[#512da8]/20 text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-3 active:scale-[0.98]"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Sign In <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                  
                  <div className="text-center pt-2">
                    <p className="text-xs font-medium text-slate-500">
                      New here? <a href="#contact" className="font-bold text-[#673BB7] hover:underline">Contact Admin</a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT / ROOMS SECTION ================= */}
      <section id="about" className="pt-10 pb-20 px-4 sm:px-8 bg-white relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-10 items-start">
          
          {/* Left: About Details */}
          <div className="space-y-8 flex flex-col justify-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-bold tracking-[0.15em] text-slate-500 uppercase">
                <div className="w-8 h-[2px] bg-[#673BB7]"></div>
                About KIET Hostel
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] tracking-tight">
                More Than Just a Place to Stay<br />
                <span className="text-[#673BB7]">— It's Your Home Away From Home</span>
              </h2>
            </div>

            <p className="text-slate-600 leading-relaxed font-medium">
              KIET Hostel provides a safe, comfortable and supportive living environment for students. Our hostels are designed to offer the right balance of academic focus, personal growth and a vibrant community life. With modern facilities, well-maintained rooms and dedicated support staff, we ensure that every student feels at home, away from home.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: ShieldCheck, title: 'Safe & Secure', sub: 'Campus' },
                { icon: Building2, title: 'Modern', sub: 'Facilities' },
                { icon: AlertCircle, title: 'Healthy', sub: 'Environment' },
                { icon: GraduationCap, title: 'Student', sub: 'Support' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-[#e1bee7] transition-all cursor-default">
                  <div className="w-10 h-10 rounded-lg bg-[#f3e5f5] text-[#673BB7] flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">{feature.title}</p>
                    <p className="text-xs font-medium text-slate-500">{feature.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Room Images Grid */}
          <div className="space-y-4 flex flex-col justify-start">
            <div className="flex items-end justify-between mb-2">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Our Hostel Rooms</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Comfortable, well-furnished rooms designed for a better stay.</p>
              </div>
            </div>

            {/* Main Featured Image */}
            <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden group shadow-lg">
              <img src={allHostelRooms[currentImageIndex]} alt="Hostel Room" className="w-full h-full object-cover transition-transform duration-700" />
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {allHostelRooms.map((_, i) => (
                  <button key={i} onClick={() => setCurrentImageIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/80'}`} />
                ))}
              </div>
            </div>

            {/* Sub Images Grid (Thumbnails) */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {allHostelRooms.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-16 sm:h-20 rounded-xl overflow-hidden group shadow-sm cursor-pointer border-2 transition-all ${currentImageIndex === idx ? 'border-[#673BB7]' : 'border-transparent'}`}
                >
                  <img src={img} alt={`Room Thumbnail ${idx + 1}`} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${currentImageIndex === idx ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className="py-12 px-4 sm:px-6 border-t transition-colors bg-slate-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Dark Card */}
          <div id="contact" className="scroll-mt-4 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl border border-slate-700/60 space-y-3 relative overflow-hidden">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#673BB7] text-white uppercase tracking-wider shadow">
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
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 bg-white border-slate-200`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f3e5f5] text-[#673BB7] flex items-center justify-center border border-[#e1bee7] shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight mb-2">Campus Address</h3>
                  <p className={`text-xs leading-relaxed font-semibold text-slate-600`}>
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
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#673BB7] hover:text-[#5e35b1] underline"
                >
                  <span>Get Directions</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: General Enquiry */}
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 bg-white border-slate-200`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f3e5f5] text-[#673BB7] flex items-center justify-center border border-[#e1bee7] shadow-sm">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight mb-1">General Enquiry</h3>
                  <p className={`text-xs font-medium mb-3 text-slate-500`}>
                    For admissions and general information.
                  </p>

                  <div className="space-y-1.5 text-xs font-extrabold">
                    <a href="tel:+919849495335" className={`block hover:text-[#673BB7] transition-colors text-slate-900`}>
                      +91 98494 95335
                    </a>
                    <a href="tel:+918818988199" className={`block hover:text-[#673BB7] transition-colors text-slate-900`}>
                      +91 88189 88199
                    </a>
                    <a href="tel:+919090887777" className={`block hover:text-[#673BB7] transition-colors text-slate-900`}>
                      +91 90908 87777
                    </a>
                    <a href="tel:08842303400" className={`block hover:text-[#673BB7] transition-colors text-slate-900`}>
                      0884-2303400
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 space-y-1">
                <span className={`block text-[11px] font-semibold text-slate-500`}>Official Email Contacts:</span>
                <div className="flex flex-col gap-1">
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#673BB7] hover:underline">
                    <Mail className="w-3.5 h-3.5 text-[#673BB7]" />
                    <span>info@kietgroup.com</span>
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#673BB7] hover:underline">
                    <Mail className="w-3.5 h-3.5 text-[#673BB7]" />
                    <span>contact@kietgroup.com</span>
                  </a>
                  <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kietw@kietgroup.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#673BB7] hover:underline">
                    <Mail className="w-3.5 h-3.5 text-[#673BB7]" />
                    <span>kietw@kietgroup.com</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: Connect With Us */}
            <div className={`p-6 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 bg-white border-slate-200`}>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#f3e5f5] text-[#673BB7] flex items-center justify-center border border-[#e1bee7] shadow-sm">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold tracking-tight mb-4">Connect With Us</h3>

                  <div className="space-y-3 text-xs font-bold">
                    <a
                      href="https://www.kietgroup.com"
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2.5 hover:text-[#673BB7] transition-colors text-slate-800`}
                    >
                      <Globe className="w-4 h-4 text-[#673BB7] shrink-0" />
                      <span>www.kietgroup.com</span>
                    </a>

                    <a
                      href="https://instagram.com/Kiet.channel"
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-2.5 hover:text-pink-600 transition-colors text-slate-800`}
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
                      className={`flex items-center gap-2.5 hover:text-rose-600 transition-colors text-slate-800`}
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
                <span className={`text-[11px] font-semibold text-slate-500`}>
                  Hostel Administration & Support Office
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER BAR */}
      <footer className={`border-t py-6 px-4 text-xs transition-colors bg-white border-slate-200 text-slate-600`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-extrabold">
            {['Home', 'About', 'Contact'].map((item) => (
              <button
                key={`footer-nav-${item}`}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`hover:text-[#673BB7] transition-colors cursor-pointer ${
                  activeNav === item ? 'text-[#673BB7] font-black underline' : ''
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
