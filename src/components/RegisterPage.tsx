'use client';

import React, { useState } from 'react';
import { User, Role } from '@/types';
import { INITIAL_USERS } from '@/lib/seed-data';

interface RegisterPageProps {
  onRegisterSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onNavigateToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<Role>('CRP');
  const [district, setDistrict] = useState('लातूर (LATUR)');
  const [blockName, setBlockName] = useState('जळकोट (JALKOT)');
  const [villageName, setVillageName] = useState('अतनूर (ATNUR)');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // OTP simulation
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('कृपया पूर्ण नाव टाका (Please enter full name)');
      return;
    }

    if (!mobile.trim() || mobile.trim().length < 10) {
      setErrorMessage('कृपया वैध १० अंकी मोबाईल नंबर टाका (Enter 10-digit mobile)');
      return;
    }

    if (!password.trim() || password.length < 4) {
      setErrorMessage('पासवर्ड किमान ४ अक्षरांचा असावा (Password must be at least 4 characters)');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('पासवर्ड आणि कन्फर्म पासवर्ड जुळत नाहीत (Passwords do not match)');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setOtpStep(true);
      setOtp('6721'); // simulated OTP
    }, 600);
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMessage('कृपया OTP टाका (Please enter OTP)');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);

      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: fullName,
        marathiName: `${fullName} (${role === 'CRP' ? 'समूह सखी' : role === 'BLOCK_MANAGER' ? 'प्रखंड व्यवस्थापक' : 'प्रशासक'})`,
        mobile: mobile.trim(),
        role: role,
        blockId: 'JALKOT',
        blockName: blockName,
        assignedVillageIds: ['ATNUR'],
        avatar: role === 'CRP' ? '👩🏽‍💼' : role === 'BLOCK_MANAGER' ? '👨🏽‍💼' : '🏛️'
      };

      // Save custom user to localStorage
      try {
        const stored = localStorage.getItem('sakhisetu_custom_users');
        const customUsers = stored ? JSON.parse(stored) : [];
        customUsers.push(newUser);
        localStorage.setItem('sakhisetu_custom_users', JSON.stringify(customUsers));
      } catch (err) {
        // ignore
      }

      onRegisterSuccess(newUser);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] flex flex-col justify-between py-8 px-4 sm:px-6 font-sans">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2 font-bold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>नवीन वापरकर्ता नोंदणी (New Registration)</span>
        </div>

        <button
          type="button"
          onClick={onNavigateToLogin}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
        >
          ← लॉगिन पृष्ठावर जा
        </button>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl shadow-xl shadow-emerald-950/5 border border-emerald-100 p-6 sm:p-8 space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md border border-emerald-200">

            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight pt-1">
              नवीन खाते नोंदणी (Registration)
            </h1>
            <p className="text-xs text-gray-500">
              सखीसेतू पोर्टलवर सामील होण्यासाठी आपली माहिती भरा
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-800 flex items-start gap-2">
              <span>⚠️</span>
              <p className="flex-1 leading-snug">{errorMessage}</p>
            </div>
          )}

          {!otpStep ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
              {/* Full Name */}
              <div>
                <label className="block font-black text-gray-800 mb-1">
                  पूर्ण नाव (Full Name in Marathi / English) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. नागिन संग्राम मठदेवरू"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block font-black text-gray-800 mb-1">
                  मोबाईल क्रमांक (10-Digit Mobile) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="उदा. 9022731301"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block font-black text-gray-800 mb-1">
                  आपली भूमिका निवडा (Select Role) <span className="text-rose-600">*</span>
                </label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CRP">👩🏽‍💼 समूह सखी / CRP (Community Resource Person)</option>
                  <option value="BLOCK_MANAGER">👨🏽‍💼 प्रखंड व्यवस्थापक (Block Manager)</option>
                  <option value="ADMIN">🏛️ जिल्हा / राज्य प्रशासक (Admin)</option>
                </select>
              </div>

              {/* District & Block */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-gray-800 mb-1">जिल्हा (District)</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-black text-gray-800 mb-1">तालुका / ब्लॉक</label>
                  <input
                    type="text"
                    value={blockName}
                    onChange={e => setBlockName(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* Village */}
              <div>
                <label className="block font-black text-gray-800 mb-1">गाव / ग्रामपंचायत (Village)</label>
                <input
                  type="text"
                  value={villageName}
                  onChange={e => setVillageName(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl font-medium"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-black text-gray-800 mb-1">
                    पासवर्ड <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="किमान ४ अक्षरे"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-black text-gray-800 mb-1">
                    कन्फर्म पासवर्ड <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="पुन्हा टाका"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2 mt-2"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>ओटीपी पाठवत आहे...</span>
                  </>
                ) : (
                  <span>मोबाईल OTP पाठवा (Verify Mobile) ➔</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCompleteRegistration} className="space-y-4 text-xs">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-emerald-950 text-xs">
                <span>
                  <strong>+91 {mobile}</strong> वर OTP पाठवला आहे. (सिम्युलेटेड OTP: <strong>6721</strong>)
                </span>
              </div>

              <div>
                <label className="block font-black text-gray-800 mb-1.5">
                  ४ अंकी OTP टाका (Enter 4-Digit OTP) <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="उदा. 6721"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  className="w-full py-2.5 px-3 bg-gray-50 border border-gray-300 rounded-2xl text-center text-lg font-mono font-black text-gray-900 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>नोंदणी पूर्ण होत आहे...</span>
                  </>
                ) : (
                  <span>✓ नोंदणी पूर्ण करा व डॅशबोर्ड उघडा</span>
                )}
              </button>
            </form>
          )}

          {/* Already registered */}
          <div className="pt-2 border-t border-gray-100 text-center text-xs">
            <span className="text-gray-600">आधीच खाते आहे का? </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-black text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              येथे लॉगिन करा (Login)
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-md w-full mx-auto text-center text-xs text-gray-400">
        सखीसेतू – महिला बचत गट व्यवस्थापन प्रणाली
      </div>
    </div>
  );
};
