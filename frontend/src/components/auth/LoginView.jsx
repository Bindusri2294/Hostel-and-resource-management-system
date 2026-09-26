import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

import { useNavigate } from 'react-router-dom';
import {
  LogIn,
  Building2,
  AlertCircle, Mail,
  Phone,
  MapPin,
  Home,
  Info,
  GraduationCap,
  PhoneCall,
  BookOpen,
  Award,
  Globe,
  ExternalLink
} from 'lucide-react';

import kietLogo from '../../assets/kiet_logo.webp';
import kietCollege from '../../assets/kiet_college_login_photo.png';

import hostelRoom1 from '../../assets/hostel_room1.jpeg';
import hostelRoom2 from '../../assets/hostel_room2.jpeg';

const hostelRoomImages = [
  { img: hostelRoom1, title: 'Student Hostel Rooms', desc: 'Spacious, clean, and well-ventilated student accommodation' },
  { img: hostelRoom2, title: 'Modern Hostel Facilities', desc: 'Comfortable living spaces equipped with study desks and storage' },
];

export default function LoginView() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeNav, setActiveNav] = useState('Home');
  const [loginRole, setLoginRole] = useState('Admin'); // 'Admin' or 'Student'

  // Login form state
  const [userId, setUserId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'home', name: 'Home' },
        { id: 'about-us', name: 'About Us' },
        { id: 'institutions', name: 'Institutions' },
        { id: 'contact-us', name: 'Contact Us' }
      ];

      let currentSection = '';

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // If the section top is above the middle of the viewport, it's considered active
          if (rect.top <= window.innerHeight / 2) {
            currentSection = section.name;
          }
        }
      }

      // If scrolled to the very bottom, ensure Contact Us is active
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
        currentSection = 'Contact Us';
      }

      if (currentSection) {
        setActiveNav(prev => {
          // If they explicitly clicked "Login", keep it active while in the Home section
          if (prev === 'Login' && currentSection === 'Home') return prev;
          return currentSection;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (navName) => {
    setActiveNav(navName);

    if (navName === 'Home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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

  const handleRoleChange = (role) => {
    setLoginRole(role);
    setError('');
    setUserId('');
    setLoginPassword('');
  };

  const fillDemo = (role) => {
    if (role === 'Admin') {
      setLoginRole('Admin');
      setUserId('admin@hostel.com');
      setLoginPassword('admin123');
    } else {
      setLoginRole('Student');
      setUserId('student@hostel.com');
      setLoginPassword('student123');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const resUser = await login(userId, loginPassword);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 bg-slate-100 text-slate-900`}>
      {/* 1. TOP CONTACT HEADER BAR */}
      <div className={`border-b text-xs font-semibold py-2 px-4 transition-colors bg-[#311b92] text-[#f3e5f5] border-[#4a148c]`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=info@kietgroup.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#e1bee7] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#d1c4e9]" />
              <span>info@kietgroup.com</span>
            </a>
            <span className="text-[#9c27b0]">|</span>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@kietgroup.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#e1bee7] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#d1c4e9]" />
              <span>contact@kietgroup.com</span>
            </a>
            <span className="text-[#9c27b0]">|</span>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=kietw@kietgroup.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#e1bee7] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#d1c4e9]" />
              <span>kietw@kietgroup.com</span>
            </a>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <a href="tel:+919849495335" className="flex items-center gap-1.5 hover:text-[#e1bee7] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#d1c4e9]" />
              <span>+91 98494 95335</span>
            </a>
            <span className="text-[#9c27b0]">|</span>
            <a href="tel:+919090887777" className="flex items-center gap-1.5 hover:text-[#e1bee7] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#d1c4e9]" />
              <span>+91 90908 87777</span>
            </a>


          </div>
        </div>
      </div>

      {/* 2. COLLEGE BRANDING HEADER BAR */}
      <div className={`border-b py-4 px-4 transition-colors bg-[#f3e5f5]/60 border-[#e1bee7]`}>
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
              <h1 className={`text-xl sm:text-3xl font-extrabold tracking-tight uppercase text-slate-900`}>
                KIET GROUP OF INSTITUTIONS
              </h1>
              <p className={`text-xs sm:text-sm font-semibold tracking-wide text-[#512da8]`}>
                KAKINADA INSTITUTE OF ENGINEERING & TECHNOLOGY
              </p>
              <p className={`text-[11px] mt-0.5 flex items-center gap-1 text-slate-600`}>
                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                <span>Yanam Road, Korangi Village, Tallarevu Mandal, Kakinada District (East Godavari), AP – 533461</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. NAVIGATION BAR (Smooth Scrolling) */}
      <nav className={`border-b sticky top-0 z-30 shadow-md backdrop-blur-lg bg-white/95 border-slate-200`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 text-xs font-bold py-2">
            {[
              { name: 'Home', icon: Home },
              { name: 'About Us', icon: Info },
              { name: 'Institutions', icon: GraduationCap },
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
                  className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${isActive
                      ? 'bg-[#673BB7] text-white shadow-md font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{nav.name}</span>
                </button>
              );
            })}
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
          <div className={`absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-100/90 to-slate-100/80`} />
        </div>

        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
          {/* Left Column: Campus Welcome & Info */}
          <div className="lg:col-span-7 space-y-5">
            <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900`}>
              Welcome to <span className="text-[#673BB7]">KIET Campus</span> Hostel Portal
            </h2>

            <p className={`text-xs sm:text-sm leading-relaxed text-slate-700`}>
              Manage your hostel room allocations, submit feedback & maintenance reports, track resolution status, and stay connected with KIET campus hostel administration.
            </p>

            {/* Campus Showcase Card - Full Uncropped Campus View */}
            <div className={`rounded-2xl border p-2.5 shadow-xl overflow-hidden bg-white/90 border-slate-200`}>
              <div className="relative rounded-xl overflow-hidden bg-slate-900/40 flex flex-col">
                <img
                  src={kietCollege}
                  alt="KIET College Campus"
                  className="w-full h-auto max-h-[400px] object-contain rounded-xl"
                />
                <div className="p-3 border-t border-slate-800/40 flex flex-col justify-end bg-slate-900/90">
                  <p className="text-[#d1c4e9] text-xs font-semibold">Yanam Road, Korangi Village, Kakinada District (East Godavari)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card with Dual Role Login */}
          <div id="login-section" className="lg:col-span-5 scroll-mt-24">
            <div className={`border rounded-2xl p-6 sm:p-8 shadow-2xl bg-white/95 border-slate-200`}>
              <div className="flex flex-col items-center text-center mb-5">
                <div className="w-14 h-14 bg-gradient-to-tr from-[#673BB7] to-[#512da8] rounded-2xl flex items-center justify-center shadow-lg shadow-[#673BB7]/20 mb-3">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-xl font-extrabold tracking-tight text-slate-900`}>
                  KIET Hostel Portal
                </h2>
                <p className={`text-xs mt-1 text-slate-600`}>
                  Select your role experience to access your workspace
                </p>
              </div>

              {/* DUAL LOGIN TABS (Admin Login vs Student Login) */}
              <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 mb-5 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => handleRoleChange('Admin')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${loginRole === 'Admin'
                      ? 'bg-[#673BB7] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Admin Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('Student')}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${loginRole === 'Student'
                      ? 'bg-[#673BB7] text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student Login</span>
                </button>
              </div>

              {/* QUICK DEMO FILL BUTTONS */}
              <div className="flex items-center justify-between gap-2 mb-4 p-2 rounded-xl bg-purple-50/70 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider">Quick Demo:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillDemo('Admin')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer shadow-xs"
                  >
                    Demo Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo('Student')}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer shadow-xs"
                  >
                    Demo Student
                  </button>
                </div>
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
                  <label className={`block text-xs font-bold mb-1 text-slate-800`}>
                    {loginRole === 'Admin' ? 'Admin Email / Username *' : 'Student Roll Number / Email *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={loginRole === 'Admin' ? 'admin@hostel.com' : 'student@hostel.com or Roll No'}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#673BB7] focus:bg-white shadow-sm`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 text-slate-800`}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-[#673BB7] focus:bg-white shadow-sm`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#673BB7] hover:bg-[#5e35b1] text-white font-bold py-2.5 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Sign In as {loginRole}
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
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#f3e5f5] text-[#512da8] border border-[#e1bee7]">
              ABOUT US
            </span>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight text-slate-900`}>
              Excellence in Technical Education
            </h2>
            <p className={`text-xs sm:text-sm text-slate-600`}>
              Kakinada Institute of Engineering & Technology (KIET) is approved by AICTE, Govt of AP & Affiliated to JNTUK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-2xl border bg-white border-slate-200 shadow-md`}>
              <BookOpen className="w-8 h-8 text-[#673BB7] mb-3" />
              <h3 className="text-base font-bold mb-2">Quality Academics</h3>
              <p className={`text-xs leading-relaxed text-slate-600`}>
                Offering state-of-the-art engineering, technology, management, and pharmacy courses with experienced faculty members.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border bg-white border-slate-200 shadow-md`}>
              <Building2 className="w-8 h-8 text-[#673BB7] mb-3" />
              <h3 className="text-base font-bold mb-2">Modern Hostels</h3>
              <p className={`text-xs leading-relaxed text-slate-600`}>
                Well-equipped residential hostels with 24/7 security, Wi-Fi connectivity, clean sanitation, and nutritious mess facilities.
              </p>
            </div>

            <div className={`p-6 rounded-2xl border bg-white border-slate-200 shadow-md`}>
              <Award className="w-8 h-8 text-[#673BB7] mb-3" />
              <h3 className="text-base font-bold mb-2">AICTE & JNTUK Approved</h3>
              <p className={`text-xs leading-relaxed text-slate-600`}>
                Recognized for academic standards, research laboratories, industry partnerships, and campus placements.
              </p>
            </div>
          </div>

          {/* Hostel Room Showcase Cards (Static 2-Column Grid) */}
          <div className="pt-6 space-y-4">
            <div className="text-center max-w-3xl mx-auto space-y-1">
              <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight text-slate-900`}>
                Our Hostel Rooms
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {hostelRoomImages.map((item, idx) => (
                <div
                  key={`hostel-room-${idx}`}
                  className={`rounded-3xl overflow-hidden shadow-xl border transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:border-[#673BB7] cursor-pointer flex flex-col bg-white border-slate-200`}
                >
                  <div className="relative w-full h-[280px] sm:h-[320px] overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className={`p-4 border-t border-slate-100 bg-white`}>
                    <p className={`text-xs font-semibold text-slate-700`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hostel Life Information Section */}
          <div className="pt-8 space-y-8">
            {/* Tagline */}
            <div className="text-center max-w-3xl mx-auto space-y-2">
              <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900`}>
                Hostel Life at <span className="text-[#673BB7]">KIET</span>
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed font-medium text-slate-600`}>
                A Home Away From Home — secure, comfortable, and vibrant living designed to support academic excellence and holistic development.
              </p>
            </div>

            {/* Key Highlights - 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  title: '24×7 Security',
                  desc: 'CCTV surveillance, controlled entry/exit, and dedicated hostel wardens available round the clock.',
                },
                {
                  title: 'Quality Dining',
                  desc: 'Fully AC mess with nutritious breakfast, lunch, evening refreshments & dinner prepared under strict hygiene.',
                },
                {
                  title: 'Academic Support',
                  desc: 'AC study halls, reading rooms, and Wi-Fi connectivity for focused self-study and exam preparation.',
                },
                {
                  title: 'Sports & Fitness',
                  desc: 'AC gymnasium with trainer, indoor/outdoor sports — cricket, basketball, badminton, table tennis & more.',
                },
              ].map((card, idx) => (
                <div
                  key={`hostel-highlight-${idx}`}
                  className={`p-5 rounded-2xl border transition-all duration-300 hover:border-[#673BB7] hover:shadow-lg bg-white border-slate-200 shadow-sm`}
                >
                  <h4 className={`text-sm font-bold mb-1.5 text-slate-900`}>{card.title}</h4>
                  <p className={`text-xs leading-relaxed text-slate-600`}>{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Boys & Girls Hostel Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl border bg-white border-slate-200 shadow-md`}>
                <h4 className={`text-base font-bold mb-2 text-slate-900`}>Boys' Hostels</h4>
                <p className={`text-xs leading-relaxed text-slate-600`}>
                  A nurturing environment with robust safety measures, quality dining, fitness & sports facilities, and reliable transportation for off-campus residents. More than a place to stay — a community where students live, learn, grow, and succeed.
                </p>
              </div>
              <div className={`p-6 rounded-2xl border bg-white border-slate-200 shadow-md`}>
                <h4 className={`text-base font-bold mb-2 text-slate-900`}>Girls' Hostels</h4>
                <p className={`text-xs leading-relaxed text-slate-600`}>
                  A safe, peaceful, and comfortable environment with AC mess, AC gym with professional trainer, visitors' room, beauty parlour, 24×7 ambulance service, medical room, laundry services, lift access, and seamless Wi-Fi connectivity.
                </p>
              </div>
            </div>

            {/* Hostel Facilities Grid */}
            <div>
              <h4 className={`text-base font-bold mb-4 text-center text-slate-900`}>Hostel Facilities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  'Fully AC Mess & Dining', 'AC Study Hall', 'High-Speed Wi-Fi', 'Cafeteria & Store',
                  'Indoor & Outdoor Sports', 'Power Backup (Generator)', 'RO Purified Drinking Water', 'Lift Access',
                  'Laundry & Iron (Self-Service)', 'Bus Service (Off-Campus)', 'CCTV & Security', 'Temple',
                ].map((facility) => (
                  <div
                    key={facility}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center border transition-all hover:border-[#673BB7] hover:shadow-sm bg-[#f3e5f5]/60 text-[#512da8] border-[#e1bee7]`}
                  >
                    {facility}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: INSTITUTIONS & ACADEMIC PROGRAMS */}
      <section id="institutions" className="scroll-mt-20 py-12 px-4 sm:px-6 border-t transition-colors space-y-12">
        {/* Campus Colleges Header */}
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#f3e5f5] text-[#512da8] border border-[#e1bee7]">
              OUR INSTITUTIONS
            </span>
            <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight text-slate-900`}>
              KIET Group of Colleges
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
                  className={`p-5 rounded-2xl border transition-all duration-300 transform hover:scale-[1.03] hover:-translate-y-1 hover:shadow-xl hover:border-[#673BB7] hover:ring-2 hover:ring-[#673BB7]/30 cursor-pointer bg-white border-slate-200 shadow-sm`}
                >
                  <InstIcon className="w-7 h-7 text-[#673BB7] mb-2" />
                  <h3 className="text-sm font-bold">{inst.name}</h3>
                  <p className={`text-xs mt-1 text-slate-500`}>{inst.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: CONTACT US (Matching Reference Image 100%) */}
      <section id="contact-us" className="scroll-mt-20 py-12 px-4 sm:px-6 border-t transition-colors">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Dark Card */}
          <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl border border-slate-700/60 space-y-3 relative overflow-hidden">
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
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
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
            {['Home', 'About Us', 'Institutions', 'Contact Us', 'Login'].map((item) => (
              <button
                key={`footer-nav-${item}`}
                type="button"
                onClick={() => handleNavClick(item)}
                className={`hover:text-[#673BB7] transition-colors cursor-pointer ${activeNav === item ? 'text-[#673BB7] font-black underline' : ''
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
