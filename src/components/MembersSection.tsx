import React, { useState, useEffect } from "react";
import { 
  Lock, User, Mail, ShieldAlert, FileText, BarChart2, Check, 
  UserPlus, LogIn, LogOut, FileCode, Landmark, Coins, AlertCircle, Sparkles, MapPin
} from "lucide-react";
import { CMSData, StaffUser, MeetingMinute, FinancialReport } from "../types.js";

interface MembersSectionProps {
  cmsData: CMSData;
  isLoggedIn: boolean;
  setIsLoggedIn: (login: boolean) => void;
  currentUser: StaffUser | null;
  setCurrentUser: (user: StaffUser | null) => void;
  token: string;
  setToken: (tok: string) => void;
  onFetchCMSData: () => Promise<void>;
}

export default function MembersSection({
  cmsData,
  isLoggedIn,
  setIsLoggedIn,
  currentUser,
  setCurrentUser,
  token,
  setToken,
  onFetchCMSData
}: MembersSectionProps) {
  // Navigation & Toggle States
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<"minutes" | "financials">("minutes");

  // Form input states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [preferredTitle, setPreferredTitle] = useState("");
  
  // Status feedback states
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Clear feedback on view toggles
  const toggleView = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setSuccess("");
    setUsername("");
    setPassword("");
    setFullName("");
    setPreferredTitle("");
  };

  // ── SUBMIT MEMBER REGISTRATION ──
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !fullName.trim()) {
      setError("Please fill in all required fields (Username, Password, Full Name).");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          fullName: fullName.trim(),
          title: preferredTitle.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Registration submitted to admin successfully!");
        // Reset fields
        setUsername("");
        setPassword("");
        setFullName("");
        setPreferredTitle("");
        await onFetchCMSData();
      } else {
        setError(data.error || "Failed to register profile. Try again.");
      }
    } catch (err) {
      setError("Server connection failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── LOG IN SECURELY ──
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter your Username and Password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("moose_auth_token", data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        setError("");
        await onFetchCMSData();
      } else {
        setError(data.error || "Check credentials. Pending accounts require administrator validation.");
      }
    } catch (err) {
      setError("Unable to authenticate with the Lodge server.");
    } finally {
      setLoading(false);
    }
  };

  // ── LOG OUT SECURELY ──
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (e) {}
    localStorage.removeItem("moose_auth_token");
    setToken("");
    setCurrentUser(null);
    setIsLoggedIn(false);
    setError("");
    setSuccess("");
  };

  const minutesList: MeetingMinute[] = cmsData.meetingMinutes || [];
  const financialsList: FinancialReport[] = cmsData.financials || [];

  // Determine current user visibility permissions
  const hasMinutesRight = currentUser && (
    currentUser.role === "admin" || 
    currentUser.role === "staff" || 
    (currentUser.memberRights && currentUser.memberRights.includes("minutes"))
  );

  const hasFinancialsRight = currentUser && (
    currentUser.role === "admin" || 
    (currentUser.memberRights && currentUser.memberRights.includes("financials"))
  );

  return (
    <div className="w-full bg-stone-50 min-h-[70vh] py-12 px-6 sm:px-10 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER BRANDING */}
        <div className="text-center mb-10">
          <span className="text-[10px] text-[#4a7ba7] font-black uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full inline-block mb-3">
            Secure Member Quarters
          </span>
          <h2 className="text-3xl font-black text-stone-900 uppercase">Brooksville Lodge Members Portal</h2>
          <p className="text-stone-500 text-xs mt-2 max-w-lg mx-auto">
             Access private resources, review official meeting minutes, audit monthly financials, and collaborate on local fraternal objectives.
          </p>
        </div>

        {/* NOT LOGGED IN WRAPPER */}
        {!currentUser ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm max-w-md mx-auto">
            <div className="flex border-b border-stone-100 mb-6">
              <button
                onClick={() => { setIsRegistering(false); setError(""); setSuccess(""); }}
                className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${
                  !isRegistering ? "text-[#4a7ba7] border-[#4a7ba7]" : "text-stone-400 border-transparent"
                }`}
              >
                 Member Access
              </button>
              <button
                onClick={() => { setIsRegistering(true); setError(""); setSuccess(""); }}
                className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider border-b-2 transition ${
                  isRegistering ? "text-[#4a7ba7] border-[#4a7ba7]" : "text-stone-400 border-transparent"
                }`}
              >
                 Register Account
              </button>
            </div>

            {/* Error Message display */}
            {error && (
              <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-2xl border border-red-100 flex gap-2 items-start mb-6">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="leading-normal font-medium">{error}</span>
              </div>
            )}

            {/* Success Message display */}
            {success && (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-4 rounded-2xl border border-emerald-100 flex gap-2 items-start mb-6">
                <Check size={16} className="shrink-0 mt-0.5" />
                <span className="leading-normal font-semibold">{success}</span>
              </div>
            )}

            {/* REGISTRATION FORM */}
            {isRegistering ? (
              <form onSubmit={handleRegister} className="space-y-4" id="member-signup-form">
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                    Your Full Name <strong className="text-[#4a7ba7]">*</strong>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-stone-400" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Frederick Miller"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-[#4a7ba7] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                     Preferred Lodge Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lifetime Member, Trustee, etc."
                    value={preferredTitle}
                    onChange={(e) => setPreferredTitle(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-[#4a7ba7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                    Choose Username <strong className="text-[#4a7ba7]">*</strong>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    placeholder="e.g. fredmiller1676"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 px-4 text-xs font-medium focus:ring-1 focus:ring-[#4a7ba7] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                    Choose Password <strong className="text-[#4a7ba7]">*</strong>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 text-stone-400" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-[#4a7ba7] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-full transition cursor-pointer shadow-md mt-6 disabled:opacity-50"
                >
                  {loading ? "Registering account..." : "Submit Registration"}
                </button>

                <p className="text-[10px] text-stone-400 text-center leading-normal mt-4">
                  Upon submission, your member profile remains pending with zero base privileges until verified by lodge officers under security protocol.
                </p>
              </form>
            ) : (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4" id="member-login-form">
                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                    Member Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-stone-400" size={16} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin or 1676"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-[#4a7ba7] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-stone-500 uppercase tracking-wider mb-1.5">
                    Your Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 text-stone-400" size={16} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl py-3 pl-10 pr-4 text-xs font-medium focus:ring-1 focus:ring-[#4a7ba7] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-full transition cursor-pointer shadow-md mt-6 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Authorized Login"}
                </button>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100 text-[10px] text-stone-500 leading-normal text-center mt-3">
                  💡 Registered staff & administrators may also sign in using this portal for seamless, unified login credentials.
                </div>
              </form>
            )}
          </div>
        ) : (
          /* SECURE LOGGED IN AREA */
          <div className="space-y-8" id="member-secure-dashboard">
            
            {/* USER PORTFOLIO BADGE */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-gradient-to-tr from-stone-900 to-stone-800 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                  🦌
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-stone-900 uppercase">{currentUser.fullName}</h3>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-100">
                       Active Session
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium leading-tight">
                    {currentUser.title || (currentUser.role === "admin" ? "Lodge Administrator" : "Verified Fraternal Member")}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 border border-stone-200 rounded-full px-4 py-2 hover:bg-stone-50 text-stone-600 font-bold text-xs uppercase cursor-pointer"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>

            {/* TAB SELECTOR FOR SECURE SECTIONS */}
            <div className="flex bg-white rounded-2xl p-1.5 border border-stone-300 w-fit" id="members-viewport-tabs">
              <button
                onClick={() => setActiveTab("minutes")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase transition cursor-pointer ${
                  activeTab === "minutes"
                    ? "bg-[#4a7ba7] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <FileText size={14} />
                 Meeting Minutes
              </button>
              <button
                onClick={() => setActiveTab("financials")}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase transition cursor-pointer ${
                  activeTab === "financials"
                    ? "bg-[#4a7ba7] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                <BarChart2 size={14} />
                 Lodge Financials
              </button>
            </div>

            {/* SECURE VIEW DETAILS */}
            <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
              
              {/* MEETING MINUTES SECURE TAB */}
              {activeTab === "minutes" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-stone-900 uppercase">Lodge Official Meeting Minutes</h3>
                    <p className="text-stone-500 text-xs leading-normal">
                      Historical review records of general Moose Lodge enrollment conclaves, trustees budgets, and committee executive sessions.
                    </p>
                  </div>

                  {!hasMinutesRight ? (
                    <div className="bg-stone-50 p-8 rounded-3xl border border-dashed border-stone-200 text-center flex flex-col items-center max-w-sm mx-auto">
                      <ShieldAlert className="text-amber-600 mb-3" size={32} />
                      <strong className="text-stone-900 text-xs font-bold uppercase block">Access Rights Required</strong>
                      <p className="text-stone-500 text-[11px] leading-relaxed mt-1">
                        Your member credentials do not currently possess the <code className="bg-amber-50 text-amber-700 font-mono px-1 rounded">minutes</code> visibility scope. Contact the Lodge Secretary or Administrator for validation.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 divide-y divide-stone-100">
                      {minutesList.length === 0 ? (
                        <p className="text-stone-400 text-xs italic text-center p-6 bg-stone-50 rounded-2xl">No recorded minutes are stored currently.</p>
                      ) : (
                        minutesList.map((m, idx) => (
                          <div key={m.id} className={`pt-6 ${idx === 0 ? "pt-0" : ""}`}>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-3">
                              <h4 className="font-bold text-stone-900 text-sm leading-snug">{m.title}</h4>
                              <span className="text-[10px] text-stone-400 font-mono shrink-0">{m.date}</span>
                            </div>
                            <div className="bg-stone-50 border border-stone-100 p-4 rounded-2xl text-[11px] text-stone-600 leading-relaxed font-sans whitespace-pre-line shadow-inner">
                              {m.content}
                            </div>
                            <div className="text-[9px] text-[#4a7ba7] font-black uppercase mt-2 select-none tracking-wider">
                              Approved & Sealed: {m.approvedBy}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* LODGE FINANCIAL BUDGETS TAB */}
              {activeTab === "financials" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-black text-stone-900 uppercase">Lodge Financial Statements</h3>
                    <p className="text-stone-500 text-xs leading-normal">
                      Quarterly audits, operating statements, net income summaries, and capital projects balance sheets audited under Lodge Regulations.
                    </p>
                  </div>

                  {!hasFinancialsRight ? (
                    <div className="bg-stone-50 p-8 rounded-3xl border border-dashed border-stone-200 text-center flex flex-col items-center max-w-sm mx-auto">
                      <ShieldAlert className="text-rose-600 mb-3" size={32} />
                      <strong className="text-stone-900 text-xs font-bold uppercase block">Access Rights Required</strong>
                      <p className="text-stone-500 text-[11px] leading-relaxed mt-1">
                        Your member credentials do not currently possess the <code className="bg-rose-50 text-rose-700 font-mono px-1 rounded">financials</code> visibility scope. Operating accounts are restricted to Trustees and authorized Officers.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      
                      {/* STATS OVERVIEW CARDS */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="members-fin-overview">
                        <div className="bg-stone-50 p-4 border border-stone-200 rounded-3xl text-center">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Average Monthly Revenue</span>
                          <strong className="text-stone-900 text-lg sm:text-xl block mt-1 tracking-tight">
                            ${financialsList.reduce((acc, f) => acc + f.revenue, 0) / (financialsList.length || 1) ? Number((financialsList.reduce((acc, f) => acc + f.revenue, 0) / (financialsList.length || 1)).toFixed(0)).toLocaleString() : "0"}
                          </strong>
                        </div>
                        <div className="bg-stone-50 p-4 border border-stone-200 rounded-3xl text-center">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">Unrestricted Oper. Funds</span>
                          <strong className="text-emerald-700 text-lg sm:text-xl block mt-1 tracking-tight">
                            ${financialsList[0]?.unrestrictedFunds ? Number(financialsList[0].unrestrictedFunds).toLocaleString() : "24,700"}
                          </strong>
                        </div>
                        <div className="bg-[#4a7ba7]/5 p-4 border border-[#4a7ba7]/10 rounded-3xl text-center">
                          <span className="text-[9px] font-bold text-[#4a7ba7] uppercase tracking-wider block">Average Fiscal Surplus</span>
                          <strong className="text-[#4a7ba7] text-lg sm:text-xl block mt-1 tracking-tight">
                            ${financialsList.reduce((acc, f) => acc + f.netIncome, 0) / (financialsList.length || 1) ? Number((financialsList.reduce((acc, f) => acc + f.netIncome, 0) / (financialsList.length || 1)).toFixed(0)).toLocaleString() : "0"}
                          </strong>
                        </div>
                      </div>

                      <div className="space-y-6 divide-y divide-stone-100">
                        {financialsList.length === 0 ? (
                          <p className="text-stone-400 text-xs italic text-center p-6 bg-stone-50 rounded-2xl">No fiscal reports are published currently.</p>
                        ) : (
                          financialsList.map((f, idx) => (
                            <div key={f.id} className={`pt-6 ${idx === 0 ? "pt-0" : ""}`}>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2 mb-4">
                                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wide flex items-center gap-2">
                                  <Coins size={14} className="text-[#d4af37]" />
                                  {f.title}
                                </h4>
                                <span className="text-[10px] text-stone-400 font-mono shrink-0">{f.date}</span>
                              </div>

                              {/* NUMERIC DETAILS GRID */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100 shadow-inner">
                                <div>
                                  <span className="text-[9px] text-stone-400 uppercase font-semibold">Allocated Revenue</span>
                                  <strong className="block text-stone-950 font-bold text-xs mt-1">${Number(f.revenue).toLocaleString()}</strong>
                                </div>
                                <div>
                                  <span className="text-[9px] text-stone-400 uppercase font-semibold">Operating Expense</span>
                                  <strong className="block text-stone-950 font-bold text-xs mt-1">${Number(f.expenses).toLocaleString()}</strong>
                                </div>
                                <div>
                                  <span className="text-[9px] text-stone-400 uppercase font-semibold">Net Operating Surplus</span>
                                  <strong className="block text-emerald-700 font-extrabold text-xs mt-1">${Number(f.netIncome).toLocaleString()}</strong>
                                </div>
                                <div>
                                  <span className="text-[9px] text-stone-400 uppercase font-semibold">Unrestricted Ledger</span>
                                  <strong className="block text-stone-950 font-bold text-xs mt-1">${Number(f.unrestrictedFunds).toLocaleString()}</strong>
                                </div>
                              </div>

                              <p className="text-[11px] text-stone-500 leading-normal mt-3 font-sans">
                                📄 <strong>Internal Audit Minutes:</strong> {f.notes}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
