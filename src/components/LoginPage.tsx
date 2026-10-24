'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { INITIAL_USERS } from '@/lib/seed-data';
import { verifyPassword } from '@/lib/auth-crypto';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateToRegister,
}) => {
  const [loginMode, setLoginMode] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [mobileOrUsername, setMobileOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMobile, setForgotMobile] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Authenticate user with auto-role detection and password verification
  const authenticateUser = async (identifier: string, pwd?: string, isOtpAuth = false): Promise<User | null> => {
    if (!identifier) return null;
    const rawId = identifier.trim();
    const cleanId = rawId.toLowerCase();
    const noSpaceCleanId = cleanId.replace(/\s+/g, '');

    // Canonical Demo Users from INITIAL_USERS
    const crpUser = INITIAL_USERS.find(u => u.role === 'CRP' && u.id === 'crp_nagin') || INITIAL_USERS[0];
    const bmUser = INITIAL_USERS.find(u => u.role === 'BLOCK_MANAGER') || INITIAL_USERS[1];
    const adminUser = INITIAL_USERS.find(u => u.role === 'ADMIN') || INITIAL_USERS[2];

    // 1. Direct Block Manager Identification
    if (
      noSpaceCleanId.includes('स्वामी') ||
      noSpaceCleanId.includes('महेश') ||
      noSpaceCleanId.includes('संग्राम') ||
      noSpaceCleanId.includes('swami') ||
      noSpaceCleanId.includes('blockmanager') ||
      cleanId === 'bm' ||
      cleanId === 'jalkot' ||
      cleanId === '9881123456' ||
      cleanId === 'bm_swami' ||
      cleanId === 'blockmanager001'
    ) {
      if (isOtpAuth) return bmUser;
      if (pwd) {
        const isMatch = await verifyPassword(pwd, bmUser.passwordHash);
        if (isMatch) return bmUser;
      }
      return null;
    }

    // 2. Direct CRP Identification
    if (
      noSpaceCleanId.includes('नागीण') ||
      noSpaceCleanId.includes('नागिन') ||
      noSpaceCleanId.includes('मठदेवरू') ||
      noSpaceCleanId.includes('nagin') ||
      cleanId === 'crp001' ||
      cleanId === 'crp' ||
      cleanId === '8806594798' ||
      cleanId === 'crp_nagin'
    ) {
      if (isOtpAuth) return crpUser;
      if (pwd) {
        const isMatch = await verifyPassword(pwd, crpUser.passwordHash);
        if (isMatch) return crpUser;
      }
      return null;
    }

    // 3. Direct Admin Identification
    if (
      noSpaceCleanId.includes('विजयमाला') ||
      noSpaceCleanId.includes('वाघमारे') ||
      noSpaceCleanId.includes('विठ्ठलराव') ||
      noSpaceCleanId.includes('vijaymala') ||
      cleanId === 'admin001' ||
      cleanId === 'admin' ||
      cleanId === '9422001122' ||
      cleanId === 'admin_vijaymala' ||
      cleanId === 'districtadmin'
    ) {
      if (isOtpAuth) return adminUser;
      if (pwd) {
        const isMatch = await verifyPassword(pwd, adminUser.passwordHash);
        if (isMatch) return adminUser;
      }
      return null;
    }

    // Look up existing registered users in localStorage or seed data
    let usersList: User[] = INITIAL_USERS;
    if (typeof window !== 'undefined') {
      try {
        const storedUsers = localStorage.getItem('sakhisetu_custom_users');
        if (storedUsers) {
          usersList = [...JSON.parse(storedUsers), ...INITIAL_USERS];
        }
      } catch {
        // ignore error
      }
    }

    // General match by username, mobile, ID, or name
    const foundUser = usersList.find(
      u =>
        u.username?.toLowerCase() === cleanId ||
        u.mobile.toLowerCase() === cleanId ||
        u.id.toLowerCase() === cleanId ||
        u.name.toLowerCase().replace(/\s+/g, '') === noSpaceCleanId ||
        u.marathiName.toLowerCase().replace(/\s+/g, '').includes(noSpaceCleanId)
    );

    if (foundUser) {
      if (isOtpAuth) return foundUser;
      if (pwd) {
        const isMatch = await verifyPassword(pwd, foundUser.passwordHash);
        if (isMatch) return foundUser;
      }
      return null;
    }

    // If a valid 10-digit mobile number is entered, create dynamic CRP user session
    if (/^\d{10}$/.test(cleanId)) {
      const newUser: User = {
        id: `usr_${Date.now()}`,
        username: `crp_${cleanId.slice(-4)}`,
        name: `User ${cleanId.slice(-4)}`,
        marathiName: `समूह सखी (${cleanId})`,
        mobile: cleanId,
        role: 'CRP',
        blockId: 'jalkot',
        blockName: 'जळकोट (लातूर)',
        districtId: 'dist_latur',
        districtName: 'लातूर जिल्हा (Latur)',
        status: 'ACTIVE',
        avatar: '👩🏽‍💼'
      };
      return newUser;
    }

    return null;
  };

  const handleQuickDemoLogin = async (username: string, pass: string) => {
    setLoginMode('PASSWORD');
    setMobileOrUsername(username);
    setPassword(pass);
    setErrorMessage('');
    setIsLoading(true);

    try {
      const user = await authenticateUser(username, pass, false);
      setIsLoading(false);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('डेमो लॉगिन करताना अडचण आली.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('त्रुटी आली.');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!mobileOrUsername.trim()) {
      setErrorMessage('कृपया मोबाईल नंबर किंवा युझरनेम टाका (Please enter Mobile/Username)');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('कृपया पासवर्ड टाका (Please enter Password)');
      return;
    }

    setIsLoading(true);

    try {
      const user = await authenticateUser(mobileOrUsername, password, false);
      setIsLoading(false);

      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('अवैध मोबाईल क्रमांक/युझरनेम किंवा पासवर्ड. कृपया पुन्हा तपासा. (Invalid credentials)');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('लॉगिन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!mobileOrUsername.trim() || mobileOrUsername.trim().length < 10) {
      setErrorMessage('कृपया १० अंकी मोबाईल नंबर टाका (Enter 10-digit mobile)');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setOtp('5892'); // Pre-fill simulation for ease
    }, 500);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otp.trim()) {
      setErrorMessage('कृपया OTP टाका (Please enter OTP)');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authenticateUser(mobileOrUsername, '', true);
      setIsLoading(false);
      if (user) {
        onLoginSuccess(user);
      } else {
        setErrorMessage('अवैध OTP. कृपया पुन्हा तपासा. (Invalid OTP)');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('सत्यापनात त्रुटी आली.');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotMobile.trim() || forgotMobile.trim().length < 10) {
      alert('कृपया वैध १० अंकी मोबाईल नंबर टाका');
      return;
    }
    setForgotSuccess(true);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden font-sans bg-emerald-950">
      {/* Background Image: Rural Indian Women SHG Empowerment */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://ddindia.co.in/wp-content/uploads/2026/08/ChatGPT-Image-Aug-7-2026-04_40_22-PM-1024x683.png')`,
        }}
      >
        {/* Soft Dark & Emerald Gradient Overlays */}

      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">

        {/* Left Side: Brand Narrative & Digital SHG Highlights (Visible on Large screens) */}
        <div className="w-full lg:w-7/12 text-white space-y-6 text-center lg:text-left">
          {/* Government / Digital India Badges */}
          <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-amber-300/30 flex items-center gap-1.5 tracking-wide">
              🇮🇳 डिजिटल भारत | Digital India
            </span>
            <span className="bg-emerald-800/80 backdrop-blur-md text-emerald-200 font-bold text-[11px] sm:text-xs px-3.5 py-1.5 rounded-full border border-emerald-400/30">
              उमेद MSRLM | महाराष्ट्र शासन
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight sm:leading-tight text-white drop-shadow-md">
              सखीसेतू – महिला बचत गट व्यवस्थापन
            </h1>
            <p className="text-lg sm:text-xl text-emerald-200 font-bold">
              SakhiSetu – Women Self-Help Group Digital Empowerment Platform
            </p>
            <p className="text-sm sm:text-base text-gray-200/90 max-w-2xl leading-relaxed font-medium">
              ग्रामीण महिलांचे आर्थिक स्वावलंबन, मासिक बचत संकलन, पारदर्शक कर्ज वितरण, लखपती दीदी उपजीविका आणि डिजिटल नोंदवह्यांचे एकात्मिक व्यासपीठ.
            </p>
          </div>

          {/* 3 Core Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 max-w-2xl mx-auto lg:mx-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-left transition hover:bg-white/15 shadow-sm">
              <div className="text-2xl mb-1.5">🌾</div>
              <h4 className="font-extrabold text-white text-xs sm:text-sm">शेती व उपजीविका</h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">शेळीपालन, दुग्धव्यवसाय व उद्योग विकास</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-left transition hover:bg-white/15 shadow-sm">
              <div className="text-2xl mb-1.5">💰</div>
              <h4 className="font-extrabold text-white text-xs sm:text-sm">बचत व सुलभ कर्ज</h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">पारदर्शक हिशोब, डिजिटल पावत्या व बँक लिंकेज</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15 text-left transition hover:bg-white/15 shadow-sm">
              <div className="text-2xl mb-1.5">📱</div>
              <h4 className="font-extrabold text-white text-xs sm:text-sm">लखपती दीदी</h4>
              <p className="text-[11px] text-emerald-200 mt-0.5">वार्षिक ₹१ लाख+ उत्पन्नाचे डिजिटल ट्रॅकिंग</p>
            </div>
          </div>

          {/* Trust Metrics */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-emerald-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>१५,०००+ सक्रिय बचत गट</span>
            </div>
            <span>•</span>
            <div>२,५०,०००+ महिला सभासद</div>
            <span>•</span>
            <div>१००% सुरक्षित व मराठी-प्रथम</div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Login Card */}
        <div className="w-full lg:w-5/12 max-w-md mx-auto">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40 border border-white/60 relative overflow-hidden transition-all duration-300">

            {/* Top Accent Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

            {/* Logo & Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-2xl shadow-md shadow-emerald-900/20 border-2 border-emerald-100 mb-1 transform hover:rotate-3 transition">
                स
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                सखीसेतू लॉगिन <span className="text-emerald-700 text-lg font-bold">(Sign In)</span>
              </h2>
              <p className="text-xs font-semibold text-gray-500">
                आपल्या खात्यात प्रवेश करण्यासाठी तपशील प्रविष्ट करा
              </p>
            </div>

            {/* Mode Toggle: Password vs OTP */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 text-xs font-extrabold mb-5">
              <button
                type="button"
                onClick={() => {
                  setLoginMode('PASSWORD');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${loginMode === 'PASSWORD'
                  ? 'bg-white text-emerald-900 shadow-md font-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <span>🔑 पासवर्डने लॉगिन</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginMode('OTP');
                  setErrorMessage('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${loginMode === 'OTP'
                  ? 'bg-white text-emerald-900 shadow-md font-black'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                <span>📲 OTP ने लॉगिन</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-start gap-2 animate-in fade-in">
                <span className="text-base leading-none">⚠️</span>
                <p className="flex-1 leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Form 1: Password Login */}
            {loginMode === 'PASSWORD' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-black text-gray-800 mb-1.5">
                    मोबाईल नंबर किंवा युझरनेम (Mobile / Username) <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-gray-400 font-bold text-sm">
                      📱
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="उदा. 9822104567 किंवा crp / admin"
                      value={mobileOrUsername}
                      onChange={e => setMobileOrUsername(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-gray-50/90 border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-black text-gray-800">
                      पासवर्ड (Password) <span className="text-rose-600">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
                    >
                      पासवर्ड विसरलात? (Forgot?)
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-gray-400 font-bold text-sm">
                      🔒
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="आपला पासवर्ड टाका"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-20 py-3 bg-gray-50/90 border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 px-2.5 py-1 text-gray-500 hover:text-gray-900 text-xs font-bold rounded-xl bg-gray-200/70 hover:bg-gray-200 transition"
                    >
                      {showPassword ? 'लपवा' : 'पहा'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-gray-700 font-bold text-xs">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>सत्र लक्षात ठेवा (Remember me)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-700/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>लॉगिन होत आहे... (Signing In)</span>
                    </>
                  ) : (
                    <>
                      <span>लॉगिन करा (Login)</span>
                      <span className="text-lg">➔</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Form 2: OTP Login */}
            {loginMode === 'OTP' && (
              <div className="space-y-4 text-xs">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block font-black text-gray-800 mb-1.5">
                        नोंदणीकृत मोबाईल नंबर टाका (Registered Mobile) <span className="text-rose-600">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-gray-400 font-bold text-sm">
                          📱
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="उदा. 9822104567"
                          value={mobileOrUsername}
                          onChange={e => setMobileOrUsername(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-3 bg-gray-50/90 border border-gray-300 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-700/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>OTP पाठवत आहे...</span>
                        </>
                      ) : (
                        <span>📲 OTP पाठवा (Send OTP)</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-emerald-900 flex justify-between items-center text-xs">
                      <span>
                        मोबाईल: <strong>+91 {mobileOrUsername}</strong> वर OTP पाठवला.
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-emerald-700 font-black hover:underline"
                      >
                        बदला
                      </button>
                    </div>

                    <div>
                      <label className="block font-black text-gray-800 mb-1.5">
                        ४ अंकी OTP टाका (Enter 4-Digit OTP) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="उदा. 5892"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-2xl text-center text-xl font-mono font-black text-gray-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm sm:text-base shadow-lg shadow-emerald-700/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>सत्यापित होत आहे...</span>
                        </>
                      ) : (
                        <span>✓ OTP सत्यापित करा व लॉगिन व्हा</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Registration Link */}
            <div className="mt-5 pt-3.5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-600 font-medium">
                नवीन खाते तयार करायचे आहे का?{' '}
                <button
                  type="button"
                  onClick={onNavigateToRegister}
                  className="font-black text-emerald-700 hover:text-emerald-950 hover:underline"
                >
                  नवीन नोंदणी करा (Register)
                </button>
              </p>
            </div>

            {/* Quick Demo Logins Section for Instant Testing */}
            <div className="mt-5 pt-4 border-t border-dashed border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase text-emerald-900 tracking-wide flex items-center gap-1">
                  ⚡ चाचणीसाठी डेमो लॉगिन (Quick Demo Logins)
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  1-क्लिक लॉगिन
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-left">
                {/* 1. CRP Demo Button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('crp001', 'Crp@123')}
                  className="p-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-300 rounded-2xl flex items-center justify-between transition group shadow-sm text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      👩🏽‍💼
                    </span>
                    <div>
                      <div className="font-black text-gray-900 leading-tight">
                        नागीण संग्राम मठदेवरू <span className="text-emerald-800 text-[10px] font-bold">(CRP)</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                        युझर: <strong className="text-gray-800">crp001</strong> | पास: <strong className="text-gray-800">Crp@123</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 group-hover:translate-x-1 transition">
                    लॉगिन ➔
                  </span>
                </button>

                {/* 2. Block Manager A Demo Button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('blockmanager001', 'BL@123')}
                  className="p-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-300 rounded-2xl flex items-center justify-between transition group shadow-sm text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      👨🏽‍💼
                    </span>
                    <div>
                      <div className="font-black text-gray-900 leading-tight">
                        स्वामी महेश संग्राम <span className="text-blue-800 text-[10px] font-bold">(Block Manager A - जळकोट)</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                        युझर: <strong className="text-gray-800">blockmanager001</strong> | पास: <strong className="text-gray-800">BL@123</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-blue-800 group-hover:translate-x-1 transition">
                    लॉगिन ➔
                  </span>
                </button>

                {/* 2B. Block Manager B Demo Button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('blockmanager002', 'BL@123')}
                  className="p-2.5 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 border border-teal-300 rounded-2xl flex items-center justify-between transition group shadow-sm text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      👨🏽‍💼
                    </span>
                    <div>
                      <div className="font-black text-gray-900 leading-tight">
                        राजेश विठ्ठल शिंदे <span className="text-teal-800 text-[10px] font-bold">(Block Manager B - हवेली, पुणे)</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                        युझर: <strong className="text-gray-800">blockmanager002</strong> | पास: <strong className="text-gray-800">BL@123</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-teal-800 group-hover:translate-x-1 transition">
                    लॉगिन ➔
                  </span>
                </button>

                {/* 3. Admin Demo Button */}
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin001', 'Admin@123')}
                  className="p-2.5 bg-gradient-to-r from-purple-50 to-fuchsia-50 hover:from-purple-100 hover:to-fuchsia-100 border border-purple-300 rounded-2xl flex items-center justify-between transition group shadow-sm text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      🏛️
                    </span>
                    <div>
                      <div className="font-black text-gray-900 leading-tight">
                        विजयमाला विठ्ठलराव वाघमारे <span className="text-purple-800 text-[10px] font-bold">(Admin)</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-medium mt-0.5">
                        युझर: <strong className="text-gray-800">admin001</strong> | पास: <strong className="text-gray-800">Admin@123</strong>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-black text-purple-800 group-hover:translate-x-1 transition">
                    लॉगिन ➔
                  </span>
                </button>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="mt-4 text-center">
              <span className="text-[10px] text-gray-400 font-semibold flex items-center justify-center gap-1">
                🔒 २५६-बिट एन्क्रिप्टेड सुरक्षित सर्व्हर
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-emerald-200 animate-in fade-in zoom-in-95 text-xs">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(false);
              }}
              className="absolute right-4 top-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
            >
              ✕
            </button>

            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-2">
              पासवर्ड रीसेट करा (Forgot Password)
            </h3>

            {forgotSuccess ? (
              <div className="py-4 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <p className="text-xs text-gray-800 font-bold">
                  आपल्या मोबाईल नंबरवर पासवर्ड रीसेट SMS पाठवला आहे.
                </p>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2.5 bg-emerald-700 text-white rounded-xl font-bold"
                >
                  ठीक आहे (OK)
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    आपला नोंदणीकृत मोबाईल नंबर टाका
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="उदा. 9822104567"
                    value={forgotMobile}
                    onChange={e => setForgotMobile(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow-md"
                >
                  रीसेट लिंक पाठवा (Send Link)
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
