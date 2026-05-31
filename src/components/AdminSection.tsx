import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Phone, Check, Mail, Trash, Send, Plus, Landmark, 
  UserCheck, Settings, AlertTriangle, LogIn, LogOut, Calendar, 
  FileText, Image, Users, ChevronRight, Eye, Lock, Key, Edit, 
  UserPlus, RefreshCw, CheckSquare, Square, Coins
} from "lucide-react";
import { 
  CMSData, LodgeEvent, NewsPost, GalleryPhoto, 
  Officer, LodgeSettings, MembershipApplication, HallRentalInquiry, StaffUser
} from "../types.js";

interface AdminSectionProps {
  cmsData: CMSData;
  passcode: string;
  setPasscode: (pass: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (login: boolean) => void;
  currentUser: StaffUser | null;
  setCurrentUser: (user: StaffUser | null) => void;
  token: string;
  setToken: (tok: string) => void;
  onUpdateSettings: (settings: LodgeSettings) => Promise<boolean>;
  onSaveEvent: (event: Partial<LodgeEvent>) => Promise<boolean>;
  onDeleteEvent: (id: string) => Promise<boolean>;
  onSavePost: (post: Partial<NewsPost>) => Promise<boolean>;
  onDeletePost: (id: string) => Promise<boolean>;
  onSavePhoto: (photo: Partial<GalleryPhoto>) => Promise<boolean>;
  onDeletePhoto: (id: string) => Promise<boolean>;
  onUpdateRentalStatus: (id: string, status: HallRentalInquiry["status"], estimatedPrice?: number) => Promise<boolean>;
  onUpdateAppStatus: (id: string, status: MembershipApplication["status"]) => Promise<boolean>;
  onFetchCMSData: () => Promise<void>;
}

type AdminSubTab = "rentals" | "memberships" | "settings" | "events" | "posts" | "photos" | "users" | "minutes" | "financials";

export default function AdminSection({
  cmsData,
  passcode,
  setPasscode,
  isLoggedIn,
  setIsLoggedIn,
  currentUser,
  setCurrentUser,
  token,
  setToken,
  onUpdateSettings,
  onSaveEvent,
  onDeleteEvent,
  onSavePost,
  onDeletePost,
  onSavePhoto,
  onDeletePhoto,
  onUpdateRentalStatus,
  onUpdateAppStatus,
  onFetchCMSData
}: AdminSectionProps) {
  // Login Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [authChecking, setAuthChecking] = useState(false);

  // Active view management
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>("events");

  // Local Form States
  const [alertText, setAlertText] = useState(cmsData.settings.alertBannerText);
  const [settPhone, setSettPhone] = useState(cmsData.settings.phone);
  const [settEmail, setSettEmail] = useState(cmsData.settings.email);
  const [settAddress, setSettAddress] = useState(cmsData.settings.address);
  const [rentBaseRate, setRentBaseRate] = useState<number>(cmsData.settings.rentalBaseHourlyRate ?? 75);
  const [rentSurcharge, setRentSurcharge] = useState<number>(cmsData.settings.rentalLargeEventSurcharge ?? 100);
  const [rentKitchenFee, setRentKitchenFee] = useState<number>(cmsData.settings.rentalKitchenFlatFee ?? 125);
  const [rentBarFee, setRentBarFee] = useState<number>(cmsData.settings.rentalBarStaffingFee ?? 150);
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Event creation form
  const [evtTitle, setEvtTitle] = useState("");
  const [evtDesc, setEvtDesc] = useState("");
  const [evtDate, setEvtDate] = useState("");
  const [evtTime, setEvtTime] = useState("");
  const [evtCategory, setEvtCategory] = useState<LodgeEvent["category"]>("public");
  const [evtLocation, setEvtLocation] = useState("");
  const [evtCost, setEvtCost] = useState("");
  const [evtSuccess, setEvtSuccess] = useState("");

  // News creation form
  const [postTitle, setPostTitle] = useState("");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState<NewsPost["category"]>("Lodge Update");
  const [postAuthor, setPostAuthor] = useState("");
  const [postEmoji, setPostEmoji] = useState("📢");
  const [postReadTime, setPostReadTime] = useState("3 min read");
  const [postSuccess, setPostSuccess] = useState("");

  // Photo adding form
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoCategory, setPhotoCategory] = useState<GalleryPhoto["category"]>("Events");
  const [photoEmoji, setPhotoEmoji] = useState("📸");
  const [photoSuccess, setPhotoSuccess] = useState("");

  // Editing News and Categories state selectors
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newCatInput, setNewCatInput] = useState("");
  const [showNewCatInput, setShowNewCatInput] = useState<"event" | "photo" | "news" | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Meeting Minutes States
  const [editingMinuteId, setEditingMinuteId] = useState<string | null>(null);
  const [minTitle, setMinTitle] = useState("");
  const [minDate, setMinDate] = useState("");
  const [minContent, setMinContent] = useState("");
  const [minApprovedBy, setMinApprovedBy] = useState("");
  const [minSuccess, setMinSuccess] = useState("");
  const [minError, setMinError] = useState("");

  // Financial Reports States
  const [editingFinId, setEditingFinId] = useState<string | null>(null);
  const [finTitle, setFinTitle] = useState("");
  const [finDate, setFinDate] = useState("");
  const [finRevenue, setFinRevenue] = useState<number>(0);
  const [finExpenses, setFinExpenses] = useState<number>(0);
  const [finNetIncome, setFinNetIncome] = useState<number>(0);
  const [finUnrestrictedFunds, setFinUnrestrictedFunds] = useState<number>(0);
  const [finNotes, setFinNotes] = useState("");
  const [finSuccess, setFinSuccess] = useState("");
  const [finError, setFinError] = useState("");

  // Staff Management Forms (Admins Only)
  const [staffDirectory, setStaffDirectory] = useState<StaffUser[]>([]);
  const [selectedStaffUser, setSelectedStaffUser] = useState<Partial<StaffUser> | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffRole, setStaffRole] = useState<'admin' | 'staff' | 'member'>("staff");
  const [staffAllowedSections, setStaffAllowedSections] = useState<string[]>(["events", "posts", "photos"]);
  const [staffTitleLocal, setStaffTitleLocal] = useState("");
  const [memberApproved, setMemberApproved] = useState(true);
  const [memberRights, setMemberRights] = useState<string[]>(["minutes", "announcements"]);
  const [staffSuccess, setStaffSuccess] = useState("");
  const [staffError, setStaffError] = useState("");

  // Synchronize state values if settings update
  useEffect(() => {
    setAlertText(cmsData.settings.alertBannerText);
    setSettPhone(cmsData.settings.phone);
    setSettEmail(cmsData.settings.email);
    setSettAddress(cmsData.settings.address);
    setRentBaseRate(cmsData.settings.rentalBaseHourlyRate ?? 75);
    setRentSurcharge(cmsData.settings.rentalLargeEventSurcharge ?? 100);
    setRentKitchenFee(cmsData.settings.rentalKitchenFlatFee ?? 125);
    setRentBarFee(cmsData.settings.rentalBarStaffingFee ?? 150);
  }, [cmsData.settings]);

  // Load Staff Directory if logged-in user is admin
  useEffect(() => {
    if (isLoggedIn && currentUser?.role === "admin" && token) {
      fetchStaffDirectory();
    }
  }, [isLoggedIn, currentUser, token]);

  const fetchStaffDirectory = async () => {
    try {
      const res = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const users = await res.json();
        setStaffDirectory(users);
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
    }
  };

  // Safe login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setAuthChecking(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setCurrentUser(data.user);
        setIsLoggedIn(true);
        localStorage.setItem("moose_auth_token", data.token);
        
        // Auto navigate to the first available section
        if (data.user.role === "admin") {
          setActiveSubTab("events");
        } else if (data.user.allowedSections && data.user.allowedSections.length > 0) {
          // Find first matching subtab they own
          const allowed: AdminSubTab[] = ["rentals", "memberships", "settings", "events", "posts", "photos"];
          const matched = allowed.find(sec => data.user.allowedSections.includes(sec));
          if (matched) setActiveSubTab(matched);
        }
      } else {
        const errData = await res.json();
        setLoginError(errData.error || "Login rejected. Invalid username or credentials.");
      }
    } catch (err) {
      setLoginError("Development network error. Fallback guest bypass support is inactive.");
    } finally {
      setAuthChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
    } catch (err) {
      // Ignored
    }
    setToken("");
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("moose_auth_token");
    setUsername("");
    setPassword("");
    setLoginError("");
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess("");
    const ok = await onUpdateSettings({
      ...cmsData.settings,
      alertBannerText: alertText,
      phone: settPhone,
      email: settEmail,
      address: settAddress,
      rentalBaseHourlyRate: Number(rentBaseRate),
      rentalLargeEventSurcharge: Number(rentSurcharge),
      rentalKitchenFlatFee: Number(rentKitchenFee),
      rentalBarStaffingFee: Number(rentBarFee)
    });
    if (ok) {
      setSettingsSuccess("Lodge configuration saved successfully on backend!");
    } else {
      setSettingsSuccess("Error updating settings. Verify permission credentials.");
    }
  };

  // Meeting Minutes CRUD
  const saveMeetingMinute = async (e: React.FormEvent) => {
    e.preventDefault();
    setMinSuccess("");
    setMinError("");

    try {
      const payload: any = {
        title: minTitle,
        date: minDate,
        content: minContent,
        approvedBy: minApprovedBy
      };
      if (editingMinuteId) {
        payload.id = editingMinuteId;
      }

      const res = await fetch("/api/minutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ minute: payload })
      });

      const data = await res.json();
      if (res.ok) {
        setMinSuccess(editingMinuteId ? "Sealed Meeting Minutes revised successfully!" : "New meeting minutes recorded and sealed!");
        setEditingMinuteId(null);
        setMinTitle("");
        setMinDate("");
        setMinContent("");
        setMinApprovedBy("");
        await onFetchCMSData();
      } else {
        setMinError(data.error || "Failed to commit seconds.");
      }
    } catch (err) {
      setMinError("Network error. Could not save minutes.");
    }
  };

  const deleteMeetingMinute = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete minutes: "${title}"?`)) {
      return;
    }
    setMinSuccess("");
    setMinError("");

    try {
      const res = await fetch(`/api/minutes/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setMinSuccess("Meeting document permanently deleted.");
        await onFetchCMSData();
      } else {
        setMinError(data.error || "Fail to delete document.");
      }
    } catch (err) {
      setMinError("Network exception deleting meeting minute.");
    }
  };

  const handleEditMeetingMinute = (m: any) => {
    setEditingMinuteId(m.id);
    setMinTitle(m.title);
    setMinDate(m.date);
    setMinContent(m.content);
    setMinApprovedBy(m.approvedBy);
    setMinSuccess("");
    setMinError("");
  };

  const handleCancelMeetingMinuteEdit = () => {
    setEditingMinuteId(null);
    setMinTitle("");
    setMinDate("");
    setMinContent("");
    setMinApprovedBy("");
    setMinSuccess("");
    setMinError("");
  };

  // Financial Reports CRUD
  const saveFinancialReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFinSuccess("");
    setFinError("");

    try {
      const payload: any = {
        title: finTitle,
        date: finDate,
        revenue: Number(finRevenue),
        expenses: Number(finExpenses),
        netIncome: Number(finRevenue) - Number(finExpenses),
        unrestrictedFunds: Number(finUnrestrictedFunds),
        notes: finNotes
      };
      if (editingFinId) {
        payload.id = editingFinId;
      }

      const res = await fetch("/api/financials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ financial: payload })
      });

      const data = await res.json();
      if (res.ok) {
        setFinSuccess(editingFinId ? "Financial report successfully updated on ledger!" : "New financial fiscal report committed!");
        setEditingFinId(null);
        setFinTitle("");
        setFinDate("");
        setFinRevenue(0);
        setFinExpenses(0);
        setFinNetIncome(0);
        setFinUnrestrictedFunds(0);
        setFinNotes("");
        await onFetchCMSData();
      } else {
        setFinError(data.error || "Failed to commit financials.");
      }
    } catch (err) {
      setFinError("Network error. Could not commit financials.");
    }
  };

  const deleteFinancialReport = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the financial report: "${title}"?`)) {
      return;
    }
    setFinSuccess("");
    setFinError("");

    try {
      const res = await fetch(`/api/financials/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setFinSuccess("Financial ledger statement deleted.");
        await onFetchCMSData();
      } else {
        setFinError(data.error || "Fail to delete statement.");
      }
    } catch (err) {
      setFinError("Network exception deleting financials.");
    }
  };

  const handleEditFinancialReport = (f: any) => {
    setEditingFinId(f.id);
    setFinTitle(f.title);
    setFinDate(f.date);
    setFinRevenue(f.revenue);
    setFinExpenses(f.expenses);
    setFinNetIncome(f.netIncome);
    setFinUnrestrictedFunds(f.unrestrictedFunds);
    setFinNotes(f.notes);
    setFinSuccess("");
    setFinError("");
  };

  const handleCancelFinancialReportEdit = () => {
    setEditingFinId(null);
    setFinTitle("");
    setFinDate("");
    setFinRevenue(0);
    setFinExpenses(0);
    setFinNetIncome(0);
    setFinUnrestrictedFunds(0);
    setFinNotes("");
    setFinSuccess("");
    setFinError("");
  };

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvtSuccess("");
    if (!evtTitle || !evtDate || !evtTime) return;

    const ok = await onSaveEvent({
      title: evtTitle,
      description: evtDesc,
      date: evtDate,
      time: evtTime,
      category: evtCategory,
      location: evtLocation || undefined,
      cost: evtCost || undefined
    });

    if (ok) {
      setEvtSuccess("Calendar event created & synchronized!");
      setEvtTitle("");
      setEvtDesc("");
      setEvtDate("");
      setEvtTime("");
      setEvtLocation("");
      setEvtCost("");
    } else {
      setEvtSuccess("Authorization issue. Failed to schedule event.");
    }
  };

  const createNewsPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setPostSuccess("");
    if (!postTitle || !postContent) return;

    const ok = await onSavePost({
      title: postTitle,
      excerpt: postExcerpt || postContent.substring(0, 100) + "...",
      content: postContent,
      category: postCategory,
      author: postAuthor || currentUser?.fullName || "Lodge Reporter",
      emoji: postEmoji,
      readTime: postReadTime
    });

    if (ok) {
      setPostSuccess("News post published successfully!");
      setPostTitle("");
      setPostExcerpt("");
      setPostContent("");
      setPostAuthor("");
    } else {
      setPostSuccess("Authorization issue. Failed to publish.");
    }
  };

  const addPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoSuccess("");
    if (!photoUrl || !photoTitle) return;

    const ok = await onSavePhoto({
      url: photoUrl,
      title: photoTitle,
      category: photoCategory,
      emojiPlaceholder: photoEmoji
    });

    if (ok) {
      setPhotoSuccess("Photo meta added to archives!");
      setPhotoUrl("");
      setPhotoTitle("");
    } else {
      setPhotoSuccess("Authorization issue. Failed to write photo.");
    }
  };

  // Staff directory mutation handlers
  const handleToggleSectionPermission = (sec: string) => {
    if (staffAllowedSections.includes(sec)) {
      setStaffAllowedSections(prev => prev.filter(s => s !== sec));
    } else {
      setStaffAllowedSections(prev => [...prev, sec]);
    }
  };

  const handleAddCustomCategory = async (type: "event" | "photo" | "news") => {
    if (!newCatInput.trim()) return;
    
    let current: string[] = [];
    if (type === "event") {
      current = cmsData.customEventCategories || [];
    } else if (type === "photo") {
      current = cmsData.customPhotoCategories || [];
    } else if (type === "news") {
      current = cmsData.customNewsCategories || [];
    }

    if (current.includes(newCatInput.trim())) {
      alert("Category already exists.");
      return;
    }

    const updated = [...current, newCatInput.trim()];

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ type, categories: updated })
      });

      if (res.ok) {
        await onFetchCMSData();
        setNewCatInput("");
        setShowNewCatInput(null);
        
        // Auto-select newly created category in the active form
        if (type === "event") {
          setEvtCategory(newCatInput.trim() as any);
        } else if (type === "photo") {
          setPhotoCategory(newCatInput.trim() as any);
        } else if (type === "news") {
          setPostCategory(newCatInput.trim() as any);
        }
      } else {
        alert("Authorization issue. Failed to register category.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOrUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffSuccess("");
    setStaffError("");

    if (!staffName || !staffUsername) {
      setStaffError("Full name and login username are required.");
      return;
    }

    const payload: any = {
      fullName: staffName,
      username: staffUsername.trim().toLowerCase(),
      role: staffRole,
      allowedSections: staffRole === "admin" 
        ? ["rentals", "memberships", "settings", "events", "posts", "photos", "users"]
        : staffAllowedSections,
      title: staffTitleLocal || (staffRole === "member" ? "Lodge Member" : "Lodge Staff"),
      approved: memberApproved,
      memberRights: memberRights
    };

    if (selectedStaffUser?.id) {
      payload.id = selectedStaffUser.id;
      if (staffPassword.trim() !== "") {
        payload.password = staffPassword; // Send password only if updated
      }
    } else {
      if (!staffPassword || staffPassword.trim() === "") {
        setStaffError("Password is required for new accounts.");
        return;
      }
      payload.password = staffPassword;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ user: payload })
      });

      if (res.ok) {
        setStaffSuccess(selectedStaffUser?.id ? "Role & Profile updated and synchronized live!" : "New profile registered successfully!");
        setStaffName("");
        setStaffUsername("");
        setStaffPassword("");
        setStaffTitleLocal("");
        setMemberApproved(true);
        setMemberRights(["minutes", "announcements"]);
        setSelectedStaffUser(null);
        fetchStaffDirectory();
        onFetchCMSData(); // Refresh global app context users
      } else {
        const data = await res.json();
        setStaffError(data.error || "Failed to commit profile updates.");
      }
    } catch (e) {
      setStaffError("Server network failure. Try again.");
    }
  };

  const handleDeleteStaffUser = async (id: string) => {
    if (currentUser?.id === id) {
      alert("Security Block: You cannot delete your own active administrator profile!");
      return;
    }

    if (!confirm("Are you absolutely sure you want to delete this profile? They will lose all portal privileges immediately.")) {
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        fetchStaffDirectory();
        onFetchCMSData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStaffUserClick = (usr: StaffUser) => {
    setSelectedStaffUser(usr);
    setStaffName(usr.fullName);
    setStaffUsername(usr.username);
    setStaffPassword("");
    setStaffRole(usr.role);
    setStaffAllowedSections(usr.allowedSections || []);
    setStaffTitleLocal(usr.title || "");
    setMemberApproved(usr.approved !== false);
    setMemberRights(usr.memberRights || ["minutes", "announcements"]);
  };

  const handleCancelStaffEdit = () => {
    setSelectedStaffUser(null);
    setStaffName("");
    setStaffUsername("");
    setStaffPassword("");
    setStaffRole("staff");
    setStaffAllowedSections(["events", "posts", "photos"]);
    setStaffTitleLocal("");
    setMemberApproved(true);
    setMemberRights(["minutes", "announcements"]);
  };

  // Determine Subtab listing dynamically based on permissions
  const isAllowedTab = (tab: AdminSubTab) => {
    if (!currentUser) return false;
    if (currentUser.role === "admin") return true;
    if (tab === "users") return false; // Users strictly adminonly
    return currentUser.allowedSections.includes(tab as any);
  };

  // RENDER LOGIN GATE
  if (!isLoggedIn) {
    return (
      <div className="bg-stone-100 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-stone-200">
          
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-[#4a7ba7]/10 rounded-2xl flex items-center justify-center text-3xl mb-4 text-[#4a7ba7]">
              <Lock size={28} />
            </div>
            <h2 className="text-2xl font-black text-stone-900 uppercase tracking-tight">Staff Portal Login</h2>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Sign in with your assigned lodge credentials to update schedules, post news bulletins, and manage inquiries.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-600 text-red-900 text-xs p-3.5 rounded-2xl">
                <strong>🔒 Access Error:</strong> {loginError}
              </div>
            )}

            <div>
              <label htmlFor="login-username-input" className="text-[10.5px] font-bold text-stone-500 uppercase block mb-1">Username</label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  id="login-username-input"
                  type="text" 
                  placeholder="e.g. admin or staff"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#7aabdb] text-sm text-stone-700 bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password-input" className="text-[10.5px] font-bold text-stone-500 uppercase block mb-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                <input 
                  id="login-password-input"
                  type="password" 
                  placeholder="••••••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#7aabdb] text-sm text-stone-700 bg-stone-50"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={authChecking}
              className="w-full bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow disabled:opacity-50"
            >
              {authChecking ? (
                <>
                  <RefreshCw className="animate-spin" size={14} /> Checking...
                </>
              ) : (
                <>
                  <LogIn size={14} /> Enter Portal
                </>
              )}
            </button>
          </form>
          
          <div className="text-center text-[10px] text-stone-400 mt-6 pt-4 border-t border-stone-100 uppercase tracking-widest font-semibold">
            SECURED LOYAL ORDER COUNCIL DATABASE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-100 min-h-screen p-4 sm:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* UPPER STATUS BAR */}
        <div className="bg-[#1c1917] text-white rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-md border-b-[3px] border-[#d4af37]" id="admin-workspace">
          <div className="flex items-center gap-3">
            <div className="bg-[#4a7ba7] text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl select-none shadow">
              🦌
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#d4af37] flex items-center gap-1.5 uppercase">
                <ShieldCheck size={18} className="text-white" /> Brooksville lodge #1676 CMS console
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Logged in as: <strong className="text-white font-bold">{currentUser?.fullName}</strong> ({currentUser?.role === "admin" ? "Master Administrator" : "Staff Reporter"})
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest px-4 py-3 flex items-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <LogOut size={13} /> Exit Portal
          </button>
        </div>

        {/* WORKSPACE MIDDLE PANES */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* SIDEBAR TABS (1 Column) */}
          <div className="lg:col-span-1 bg-white rounded-3xl border border-stone-200 overflow-hidden p-4 space-y-1 h-fit shadow-sm">
            <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase block px-3 mb-2.5">Your Controls</span>
            
            {/* Conditional Tabbing based on Staff Permissions */}
            {isAllowedTab("events") && (
              <button 
                onClick={() => setActiveSubTab("events")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer ${
                  activeSubTab === "events" ? "bg-[#4a7ba7] text-white" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-1.5"><Calendar size={14} /> Calendar Events</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === "events" ? "bg-white text-stone-800" : "bg-stone-100"}`}>
                  {cmsData.events.length}
                </span>
              </button>
            )}

            {isAllowedTab("posts") && (
              <button 
                onClick={() => setActiveSubTab("posts")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer ${
                  activeSubTab === "posts" ? "bg-[#4a7ba7] text-white" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-1.5"><FileText size={14} /> News Posts</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === "posts" ? "bg-white text-stone-800" : "bg-stone-100"}`}>
                  {cmsData.posts.length}
                </span>
              </button>
            )}

            {isAllowedTab("photos") && (
              <button 
                onClick={() => setActiveSubTab("photos")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer ${
                  activeSubTab === "photos" ? "bg-[#4a7ba7] text-white" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-1.5"><Image size={14} /> Photo Archive</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === "photos" ? "bg-white text-stone-800" : "bg-stone-100"}`}>
                  {cmsData.photos.length}
                </span>
              </button>
            )}

            {isAllowedTab("rentals") && (
              <button 
                onClick={() => setActiveSubTab("rentals")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer ${
                  activeSubTab === "rentals" 
                    ? "bg-[#4a7ba7] text-white" 
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-1.5"><Landmark size={14} /> Hall Rentals</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === "rentals" ? "bg-white text-stone-800" : "bg-stone-100"}`}>
                  {cmsData.rentals.length}
                </span>
              </button>
            )}

            {isAllowedTab("memberships") && (
              <button 
                onClick={() => setActiveSubTab("memberships")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer ${
                  activeSubTab === "memberships" 
                    ? "bg-[#4a7ba7] text-white" 
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-1.5"><Users size={14} /> Candidates</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === "memberships" ? "bg-white text-stone-800" : "bg-stone-100"}`}>
                  {cmsData.applications.length}
                </span>
              </button>
            )}

            {isAllowedTab("settings") && (
              <button 
                onClick={() => setActiveSubTab("settings")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                  activeSubTab === "settings" ? "bg-[#4a7ba7] text-white" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Settings size={14} /> General Settings
              </button>
            )}

            {isAllowedTab("settings") && (
              <button 
                onClick={() => setActiveSubTab("minutes")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer ${
                  activeSubTab === "minutes" ? "bg-[#4a7ba7] text-white" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-1.5"><FileText size={14} /> Meeting Minutes</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === "minutes" ? "bg-white text-stone-800" : "bg-stone-100"}`}>
                  {cmsData.meetingMinutes?.length || 0}
                </span>
              </button>
            )}

            {isAllowedTab("settings") && (
              <button 
                onClick={() => setActiveSubTab("financials")}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer ${
                  activeSubTab === "financials" ? "bg-[#4a7ba7] text-white" : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span className="flex items-center gap-1.5"><Coins size={14} /> Lodge Financials</span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === "financials" ? "bg-white text-stone-800" : "bg-stone-100"}`}>
                  {cmsData.financials?.length || 0}
                </span>
              </button>
            )}

            {currentUser?.role === "admin" && (
              <div className="pt-3 border-t border-stone-100 mt-2">
                <span className="text-[9px] font-black text-rose-800 uppercase tracking-widest block px-3 mb-1.5">Admin Security</span>
                <button 
                  onClick={() => setActiveSubTab("users")}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition cursor-pointer ${
                    activeSubTab === "users" ? "bg-stone-900 text-white" : "text-rose-900 font-bold hover:bg-red-50/50"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><UserCheck size={14} /> Staff Members</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeSubTab === "users" ? "bg-white text-stone-800" : "bg-rose-100"}`}>
                    {staffDirectory.length}
                  </span>
                </button>
              </div>
            )}

          </div>

          {/* MAIN FORM/LIST WORK SPACE (3 Columns) */}
          <div className="lg:col-span-3">
            
            {/* 1. CALENDAR EVENTS MANAGER */}
            {activeSubTab === "events" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <Calendar size={18} className="text-[#4a7ba7]" /> Lodge Event Scheduling
                </h3>

                <form onSubmit={createEvent} className="bg-stone-50 border border-stone-200 p-4 sm:p-5 rounded-2xl space-y-4 mb-8">
                  <span className="text-[11px] font-black text-stone-800 block uppercase border-b border-stone-200 pb-1.5 flex items-center gap-1">
                    <Plus size={12} className="text-[#4a7ba7]" /> Schedule New Event
                  </span>
                  
                  {evtSuccess && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 text-xs p-3 rounded-xl">
                      {evtSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="evt-title-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Event Title *</label>
                      <input 
                        id="evt-title-input"
                        type="text" 
                        required 
                        value={evtTitle}
                        placeholder="e.g. Wednesday Beef Tacos"
                        onChange={(e) => setEvtTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="evt-category-select" className="text-[10px] font-bold text-stone-500 uppercase">Category *</label>
                        <button 
                          type="button"
                          onClick={() => setShowNewCatInput(showNewCatInput === "event" ? null : "event")}
                          className="text-[#4a7ba7] text-[10px] hover:underline font-bold"
                        >
                          + New Category
                        </button>
                      </div>

                      {showNewCatInput === "event" && (
                        <div className="flex gap-1.5 mb-2 p-2 border border-stone-200 bg-white rounded-xl items-center">
                          <input 
                            type="text"
                            placeholder="e.g. Trivia Night"
                            value={newCatInput}
                            onChange={(e) => setNewCatInput(e.target.value)}
                            className="bg-stone-50 text-xs p-1.5 rounded border border-stone-200 flex-1 h-8"
                          />
                          <button 
                            type="button"
                            onClick={() => handleAddCustomCategory("event")}
                            className="bg-[#4a7ba7] text-white text-[10px] font-bold px-3 py-1.5 rounded"
                          >
                            Add
                          </button>
                        </div>
                      )}

                      <select 
                        id="evt-category-select"
                        value={evtCategory}
                        onChange={(e) => setEvtCategory(e.target.value as any)}
                        className="w-full text-xs px-2.5 rounded-xl border border-stone-200 bg-white h-10"
                      >
                        {Array.from(new Set(["public", "members", "fundraiser", "wom", "legion", ...(cmsData.customEventCategories || [])])).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label htmlFor="evt-date-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Date *</label>
                      <input 
                        id="evt-date-input"
                        type="date" 
                        required 
                        value={evtDate}
                        onChange={(e) => setEvtDate(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="evt-time-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Start Time *</label>
                      <input 
                        id="evt-time-input"
                        type="time" 
                        required 
                        value={evtTime}
                        onChange={(e) => setEvtTime(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="evt-location-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Room Location</label>
                      <input 
                        id="evt-location-input"
                        type="text" 
                        value={evtLocation}
                        placeholder="Main Hall"
                        onChange={(e) => setEvtLocation(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="evt-cost-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Estimated Cost</label>
                      <input 
                        id="evt-cost-input"
                        type="text" 
                        value={evtCost}
                        placeholder="$10 per plate"
                        onChange={(e) => setEvtCost(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="evt-desc-textarea" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Detailed description *</label>
                    <textarea 
                      id="evt-desc-textarea"
                      required 
                      value={evtDesc}
                      placeholder="Give details about menu options, bar support, and volunteer tasks..."
                      onChange={(e) => setEvtDesc(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-sans"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition cursor-pointer shadow-sm"
                  >
                    Commit Scheduled Event
                  </button>
                </form>

                <span className="text-[10px] font-black text-stone-400 block uppercase mb-3">Currently Scheduled Events</span>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {cmsData.events.map((e) => (
                    <div key={e.id} className="flex justify-between items-center text-xs p-3 hover:bg-stone-50 rounded-2xl border border-stone-200/60 transition">
                      <div>
                        <strong className="text-stone-900 text-sm">{e.title}</strong>
                        <span className="text-stone-400 block mt-0.5">{e.date} @ {e.time} • Room: {e.location || "Lodge"} • Cat: {e.category}</span>
                      </div>
                      <button 
                        onClick={() => {
                          if (confirm(`Delete "${e.title}" calendar event?`)) {
                            onDeleteEvent(e.id);
                          }
                        }}
                        className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition cursor-pointer"
                        title="Delete Event"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. NEWS POSTS CRUD */}
            {activeSubTab === "posts" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <FileText size={18} className="text-[#4a7ba7]" /> News Bulletins & Gazettes
                </h3>

                <form onSubmit={createNewsPost} className="bg-stone-50 border border-stone-200 p-4 sm:p-5 rounded-2xl space-y-4 mb-8">
                  <span className="text-[11px] font-black text-stone-800 block uppercase border-b border-stone-200 pb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Plus size={12} className="text-[#4a7ba7]" /> 
                      {editingPostId ? "Edit Existing News Article" : "Publish News Article"}
                    </span>
                    {editingPostId && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold uppercase animate-pulse">Mode: Editing</span>
                    )}
                  </span>

                  {postSuccess && (
                     <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 text-xs p-3 rounded-xl">
                       {postSuccess}
                     </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="post-title-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Article Title *</label>
                      <input 
                        id="post-title-input"
                        type="text" 
                        required 
                        value={postTitle}
                        placeholder="e.g. Lodge BBQ Raises $800"
                        onChange={(e) => setPostTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="post-category-select" className="text-[10px] font-bold text-stone-500 uppercase">Category *</label>
                        <button 
                          type="button"
                          onClick={() => setShowNewCatInput(showNewCatInput === "news" ? null : "news")}
                          className="text-[#4a7ba7] text-[10px] hover:underline font-bold"
                        >
                          + New Category
                        </button>
                      </div>

                      {showNewCatInput === "news" && (
                        <div className="flex gap-1.5 mb-2 p-2 border border-stone-200 bg-white rounded-xl items-center">
                          <input 
                            type="text"
                            placeholder="e.g. Officers"
                            value={newCatInput}
                            onChange={(e) => setNewCatInput(e.target.value)}
                            className="bg-stone-50 text-xs p-1.5 rounded border border-stone-200 flex-1 h-8"
                          />
                          <button 
                            type="button"
                            onClick={() => handleAddCustomCategory("news")}
                            className="bg-[#4a7ba7] text-white text-[10px] font-bold px-3 py-1.5 rounded"
                          >
                            Add
                          </button>
                        </div>
                      )}

                      <select 
                        id="post-category-select"
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value as any)}
                        className="w-full text-xs px-2.5 rounded-xl border border-stone-200 bg-white h-10"
                      >
                        {Array.from(new Set(["Lodge Update", "Fundraising", "Member Spotlight", "Community Work", "Scholarship", "Women of Moose", ...(cmsData.customNewsCategories || [])])).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="post-author-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Author Name</label>
                      <input 
                        id="post-author-input"
                        type="text" 
                        value={postAuthor}
                        placeholder="President Thompson"
                        onChange={(e) => setPostAuthor(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="post-emoji-select" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Emoji Icon</label>
                      <select
                        id="post-emoji-select"
                        value={postEmoji}
                        onChange={(e) => setPostEmoji(e.target.value)}
                        className="w-full text-xs px-2.5 rounded-xl border border-stone-200 bg-white h-10"
                      >
                        <option value="📢">📢 Announcement</option>
                        <option value="🦌">🦌 Lodge Moose</option>
                        <option value="🍔">🍔 Kitchen/Dining</option>
                        <option value="📅">📅 Event Schedule</option>
                        <option value="📸">📸 Photo snapshot</option>
                        <option value="🏆">🏆 Award Winner</option>
                        <option value="✨">✨ Highlight</option>
                        <option value="👥">👥 Members Note</option>
                        <option value="📰">📰 Gazette Bulletin</option>
                        <option value="🍺">🍺 Social Quarters</option>
                        <option value="🍳">🍳 Kitchen Breakfast</option>
                        <option value="🔨">🔨 Volunteers Work</option>
                        <option value="⛳">⛳ Golfing Event</option>
                        <option value="💰">💰 Financial Report</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="post-excerpt-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Excerpt (Teaser Hook)</label>
                    <input 
                      id="post-excerpt-input"
                      type="text" 
                      value={postExcerpt}
                      placeholder="Brief one-sentence hook for dashboard panels..."
                      onChange={(e) => setPostExcerpt(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="post-content-textarea" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Full Article Body *</label>
                    <textarea 
                      id="post-content-textarea"
                      required 
                      value={postContent}
                      placeholder="Write your news post here. Supports multiple paragraphs..."
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={4}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-sans whitespace-pre-wrap"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition cursor-pointer shadow-sm"
                    >
                      {editingPostId ? "Save Updates Now" : "Publish News Story"}
                    </button>
                    {editingPostId && (
                      <button 
                        type="button"
                        onClick={() => {
                          setEditingPostId(null);
                          setPostTitle("");
                          setPostExcerpt("");
                          setPostContent("");
                          setPostAuthor("");
                          setPostEmoji("📢");
                        }}
                        className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </form>

                <span className="text-[10px] font-black text-stone-400 block uppercase mb-3">Manage Published Articles</span>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {cmsData.posts.map((p) => (
                    <div key={p.id} className="flex justify-between items-center text-xs p-3 hover:bg-stone-50 rounded-2xl border border-stone-200/65 transition-colors">
                      <div>
                        <strong className="text-stone-900 text-sm">{p.title}</strong>
                        <span className="text-stone-400 block mt-0.5">By: {p.author} • Gazette Published: {p.date} • {p.category}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => {
                            setEditingPostId(p.id);
                            setPostTitle(p.title);
                            setPostExcerpt(p.excerpt || "");
                            setPostContent(p.content);
                            setPostCategory(p.category);
                            setPostAuthor(p.author);
                            setPostEmoji(p.emoji || "📢");
                            // Scroll up instantly so they are positioned right over the form
                            document.getElementById("post-title-input")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded px-2.5 py-1 text-[10px] font-bold uppercase transition"
                          title="Edit News Article Content"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={async () => {
                            if (confirm(`Delete news article: "${p.title}"?`)) {
                              onDeletePost(p.id);
                            }
                          }}
                          className="text-red-650 hover:bg-red-50 p-1.5 rounded-xl transition cursor-pointer"
                          title="Delete Post"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. PHOTO ARCHIVE MANAGER */}
            {activeSubTab === "photos" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <Image size={18} className="text-[#4a7ba7]" /> Photo Catalog Archive
                </h3>

                <form onSubmit={addPhoto} className="bg-stone-50 border border-stone-200 p-4 sm:p-5 rounded-2xl space-y-4 mb-8">
                  <span className="text-[11px] font-black text-stone-800 block uppercase border-b border-stone-200 pb-1.5 flex items-center gap-1">
                    <Plus size={12} className="text-[#4a7ba7]" /> Upload New Catalog Image
                  </span>

                  {photoSuccess && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 text-xs p-3 rounded-xl">
                      {photoSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="photo-title-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Image Description Title *</label>
                      <input 
                        id="photo-title-input"
                        type="text" 
                        required 
                        value={photoTitle}
                        placeholder="e.g. Friday Fish Fry Crew"
                        onChange={(e) => setPhotoTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="photo-category-select" className="text-[10px] font-bold text-stone-500 uppercase">Category *</label>
                        <button 
                          type="button"
                          onClick={() => setShowNewCatInput(showNewCatInput === "photo" ? null : "photo")}
                          className="text-[#4a7ba7] text-[10px] hover:underline font-bold"
                        >
                          + New Category
                        </button>
                      </div>

                      {showNewCatInput === "photo" && (
                        <div className="flex gap-1.5 mb-2 p-2 border border-stone-200 bg-white rounded-xl items-center">
                          <input 
                            type="text"
                            placeholder="e.g. Ladies Night"
                            value={newCatInput}
                            onChange={(e) => setNewCatInput(e.target.value)}
                            className="bg-stone-50 text-xs p-1.5 rounded border border-stone-200 flex-1 h-8"
                          />
                          <button 
                            type="button"
                            onClick={() => handleAddCustomCategory("photo")}
                            className="bg-[#4a7ba7] text-white text-[10px] font-bold px-3 py-1.5 rounded"
                          >
                            Add
                          </button>
                        </div>
                      )}

                      <select 
                        id="photo-category-select"
                        value={photoCategory}
                        onChange={(e) => setPhotoCategory(e.target.value as any)}
                        className="w-full text-xs px-2.5 rounded-xl border border-stone-200 bg-white h-10"
                      >
                        {Array.from(new Set(["Events", "Charity", "Lodge Hall", "Sports", "Family", ...(cmsData.customPhotoCategories || [])])).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* DRAG AND DROP ZONE */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const files = e.dataTransfer.files;
                      if (files && files.length > 0) {
                        const file = files[0];
                        if (file.type.startsWith("image/")) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setPhotoUrl(event.target.result as string);
                              if (!photoTitle) {
                                setPhotoTitle(file.name.split(".")[0].replace(/[-_]/g, " "));
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        } else {
                          alert("Invalid file: Please drag & drop an image file (PNG/JPG/WEBP).");
                        }
                      }
                    }}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                      dragOver 
                        ? "border-[#4a7ba7] bg-sky-50/20" 
                        : "border-stone-250 bg-white hover:bg-stone-50/50"
                    }`}
                    onClick={() => {
                      document.getElementById("photo-file-upload")?.click();
                    }}
                  >
                    <input 
                      id="photo-file-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setPhotoUrl(event.target.result as string);
                              if (!photoTitle) {
                                setPhotoTitle(file.name.split(".")[0].replace(/[-_]/g, " "));
                              }
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span className="text-2xl mb-1">📸</span>
                    <strong className="text-xs text-stone-750 block uppercase tracking-wider">Drag & Drop Image File Here</strong>
                    <span className="text-[10px] text-stone-400 mt-0.5 font-medium">Or click to browse catalog files • Base64 offline loading supported</span>
                    
                    {photoUrl && photoUrl.startsWith("data:") && (
                      <div className="mt-3 relative w-16 h-16 rounded-xl overflow-hidden border border-emerald-300">
                        <img src={photoUrl} className="w-full h-full object-cover" alt="preview" />
                        <span className="absolute bottom-0 right-0 bg-emerald-650 text-white text-[8px] font-semibold uppercase px-1 leading-snug">Selected</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="photo-url-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Or Image Web Address URL</label>
                      <input 
                        id="photo-url-input"
                        type="url" 
                        value={photoUrl}
                        placeholder="https://images.unsplash.com/..."
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="photo-emoji-input" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Emoji Icon</label>
                      <input 
                        id="photo-emoji-input"
                        type="text" 
                        value={photoEmoji}
                        onChange={(e) => setPhotoEmoji(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white text-center font-bold"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest py-3 px-6 rounded-xl transition cursor-pointer shadow-sm"
                  >
                    Publish Photo Entry
                  </button>
                </form>

                <span className="text-[10px] font-black text-stone-400 block uppercase mb-3">Active Photo Catalog</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-1">
                  {cmsData.photos.map((p) => (
                    <div key={p.id} className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 shadow-sm group">
                      <img src={p.url} className="w-full h-full object-cover opacity-85 hover:opacity-100 transition duration-300" alt={p.title} />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                        <button 
                          onClick={async () => {
                            if (confirm(`Remove custom archive photo "${p.title}"?`)) {
                              onDeletePhoto(p.id);
                            }
                          }}
                          className="bg-red-600 text-white p-2.5 rounded-full hover:scale-110 transition cursor-pointer"
                          title="Purge Image"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-stone-900/85 backdrop-blur-xs py-1.5 px-2.5 text-white text-[9.5px] truncate">
                        {p.title}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. HALL RENTAL PIPELINE */}
            {activeSubTab === "rentals" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <Landmark size={18} className="text-[#4a7ba7]" /> Hall Rental Pipeline Requests
                </h3>
                
                {cmsData.rentals.length === 0 ? (
                  <p className="text-sm text-stone-500 text-center py-6">No rental inquiries received yet.</p>
                ) : (
                  <div className="space-y-6">
                    {cmsData.rentals.map((r) => (
                      <div key={r.id} className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-stone-50">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                          <div>
                            <span className="text-stone-400 text-[9px] font-bold uppercase block tracking-wider">Candidate / Contact</span>
                            <h4 className="font-bold text-stone-900 text-base">{r.fullName}</h4>
                            <p className="text-stone-500 text-xs mt-0.5">{r.email} • {r.phone}</p>
                          </div>
                          
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            r.status === "booked" ? "bg-emerald-100 text-emerald-800" :
                            r.status === "contacted" ? "bg-sky-100 text-sky-800" :
                            r.status === "declined" ? "bg-stone-200 text-stone-600" :
                            "bg-amber-100 text-amber-800 animate-pulse"
                          }`}>
                            {r.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-3 rounded-xl border border-stone-200/60 mt-4 text-xs">
                          <div>
                            <strong className="text-stone-400 text-[8.5px] uppercase block">Event Date</strong>
                            <span className="font-bold text-stone-900">{r.eventDate}</span>
                          </div>
                          <div>
                            <strong className="text-stone-400 text-[8.5px] uppercase block">Event Type</strong>
                            <span className="font-bold text-stone-900">{r.eventType}</span>
                          </div>
                          <div>
                            <strong className="text-stone-400 text-[8.5px] uppercase block">Guests / Hrs</strong>
                            <span className="font-bold text-stone-900">{r.guestsCount} guests • {r.durationHours} hrs</span>
                          </div>
                          <div>
                            <strong className="text-stone-400 text-[8.5px] uppercase block">Est Surcharge ($)</strong>
                            <div className="flex items-center gap-1 mt-0.5">
                              <input 
                                type="number" 
                                id={`price-input-${r.id}`}
                                defaultValue={r.estimatedPrice} 
                                className="w-16 bg-stone-50 border border-stone-300 rounded px-1.5 py-0.5 text-xs text-stone-900 font-bold focus:outline-none focus:border-[#7aabdb]"
                              />
                              <button 
                                onClick={async () => {
                                  const inputEl = document.getElementById(`price-input-${r.id}`) as HTMLInputElement;
                                  if (inputEl) {
                                    const newPrice = Number(inputEl.value);
                                    const success = await onUpdateRentalStatus(r.id, r.status, newPrice);
                                    if (success) {
                                      alert("Rental price updated successfully!");
                                      onFetchCMSData();
                                    }
                                  }
                                }}
                                className="bg-[#4a7ba7] text-white rounded px-2 py-1 text-[9px] font-bold uppercase hover:bg-[#3b658a] transition cursor-pointer"
                              >
                                Set
                              </button>
                            </div>
                          </div>
                        </div>

                        {r.notes && (
                          <p className="text-stone-600 text-xs italic mt-3 bg-white p-2.5 rounded-xl border border-stone-100">
                             &ldquo;{r.notes}&rdquo;
                          </p>
                        )}

                        <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-stone-200/60">
                          <button 
                            onClick={async () => onUpdateRentalStatus(r.id, "contacted")}
                            className="bg-sky-50 text-sky-800 border border-sky-300 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-sky-100 cursor-pointer transition"
                          >
                            Mark Contacted
                          </button>
                          <button 
                            onClick={async () => onUpdateRentalStatus(r.id, "booked")}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl px-4 py-1.5 text-xs font-bold hover:bg-emerald-100 cursor-pointer transition"
                          >
                            Confirm Booking
                          </button>
                          <button 
                            onClick={async () => onUpdateRentalStatus(r.id, "declined")}
                            className="bg-stone-100 text-stone-700 border border-stone-300 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-stone-200 cursor-pointer transition"
                          >
                            Archive / Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. MEMBERSHIP PIPELINE */}
            {activeSubTab === "memberships" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <Users size={18} className="text-[#4a7ba7]" /> Membership Candidate Vetting
                </h3>

                {cmsData.applications.length === 0 ? (
                  <p className="text-sm text-stone-500 text-center py-6">No applications received yet.</p>
                ) : (
                  <div className="space-y-6">
                    {cmsData.applications.map((app) => (
                      <div key={app.id} className="border border-stone-200 rounded-2xl p-4 sm:p-5 bg-stone-50">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                          <div>
                            <span className="text-stone-400 text-[9px] uppercase font-bold tracking-wider block">Candidate Details</span>
                            <h4 className="font-bold text-stone-900 text-base">{app.fullName}</h4>
                            <p className="text-stone-500 text-xs mt-0.5">{app.email} • {app.phone}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            app.status === "approved" ? "bg-emerald-100 text-emerald-800" :
                            app.status === "reviewed" ? "bg-sky-100 text-sky-800" :
                            "bg-amber-100 text-amber-800 animate-pulse"
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-3 rounded-xl border border-stone-200/60 text-xs">
                          <div>
                            <strong className="text-stone-400 text-[8.5px] uppercase block mb-0.5">Residence Address</strong>
                            <span className="font-bold text-stone-900">{app.address}</span>
                          </div>
                          <div>
                            <strong className="text-stone-400 text-[8.5px] uppercase block mb-0.5">Family / Professional background</strong>
                            <span className="font-bold text-stone-900">Spouse: {app.spouseName || "None"} • Occupation: {app.occupation || "N/A"}</span>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-stone-600 bg-white p-3 rounded-xl border border-stone-200/40">
                          <strong>Statement of Interest / Sponsor bio:</strong> {app.interestInMoose}
                        </div>

                        <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-stone-200/60">
                          <button 
                            onClick={async () => onUpdateAppStatus(app.id, "reviewed")}
                            className="bg-sky-50 text-sky-800 border border-sky-300 rounded-xl px-3 py-1.5 text-xs font-bold hover:bg-sky-100 cursor-pointer transition"
                          >
                            Mark Reviewed
                          </button>
                          <button 
                            onClick={async () => onUpdateAppStatus(app.id, "approved")}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl px-4 py-1.5 text-xs font-bold hover:bg-emerald-100 cursor-pointer transition"
                          >
                            Approve Candidate
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. GENERAL SETTINGS */}
            {activeSubTab === "settings" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
                  <Settings size={18} className="text-[#4a7ba7]" /> General Lodge Variables Setting
                </h3>

                <form onSubmit={saveSettings} className="space-y-4">
                  {settingsSuccess && (
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 text-xs p-3 rounded-xl">
                      🎉 {settingsSuccess}
                    </div>
                  )}

                  <div>
                    <label htmlFor="settings-alert-textarea" className="text-xs font-bold text-stone-700 block mb-1">📢 Home Banner Announcement Hook</label>
                    <textarea 
                      id="settings-alert-textarea"
                      value={alertText}
                      onChange={(e) => setAlertText(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block font-medium">Displays at the top of the homepage in our crimson announcement banner. Good for detailing jackpot values.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="settings-phone-input" className="text-xs font-bold text-stone-700 block mb-1">Office Telephone Line</label>
                      <input 
                        id="settings-phone-input"
                        type="text" 
                        value={settPhone}
                        onChange={(e) => setSettPhone(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-email-input" className="text-xs font-bold text-stone-700 block mb-1">Lodge Administrative Email</label>
                      <input 
                        id="settings-email-input"
                        type="email" 
                        value={settEmail}
                        onChange={(e) => setSettEmail(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="settings-address-input" className="text-xs font-bold text-stone-700 block mb-1">Physical Lodge Address</label>
                    <input 
                      id="settings-address-input"
                      type="text" 
                      value={settAddress}
                      onChange={(e) => setSettAddress(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50"
                    />
                  </div>

                  {/* HALL RENTAL PRICING SETTINGS */}
                  <div className="border-t border-stone-105 pt-6 mt-6">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      🏛️ Hall Rental Calculator Charges
                    </h4>
                    <p className="text-[10px] text-stone-400 mb-4 leading-normal">
                      Configure base, surcharge and service flat fee parameters for the dynamic Hall Rental pricing estimator page.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label htmlFor="settings-base-rate" className="text-[10px] font-bold text-[#4a7ba7] uppercase block mb-1">Base Hourly Rate ($)</label>
                        <input
                          id="settings-base-rate"
                          type="number"
                          required
                          value={rentBaseRate}
                          onChange={(e) => setRentBaseRate(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-bold"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-surcharge" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Over 100 Guests Surcharge ($)</label>
                        <input
                          id="settings-surcharge"
                          type="number"
                          required
                          value={rentSurcharge}
                          onChange={(e) => setRentSurcharge(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-kitchen-fee" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Kitchen Flat Fee ($)</label>
                        <input
                          id="settings-kitchen-fee"
                          type="number"
                          required
                          value={rentKitchenFee}
                          onChange={(e) => setRentKitchenFee(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-bar-fee" className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Bar Staffing Surcharge ($)</label>
                        <input
                          id="settings-bar-fee"
                          type="number"
                          required
                          value={rentBarFee}
                          onChange={(e) => setRentBarFee(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition mt-4 cursor-pointer"
                  >
                    Commit Settings Write
                  </button>
                </form>
              </div>
            )}

            {/* 7. STAFF USERS MANAGER (ADMINS ONLY) */}
            {activeSubTab === "users" && currentUser?.role === "admin" && (
              <div className="space-y-8 animate-fade-in">
                
                {/* User List Panel */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                  <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center justify-between">
                    <span className="flex items-center gap-2"><UserCheck size={18} className="text-rose-800" /> Lodge Staff Roster Directory</span>
                    <span className="text-xs font-mono text-stone-400">Total: {staffDirectory.length} Accounts</span>
                  </h3>

                  <div className="divide-y divide-stone-100 space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    {staffDirectory.map((usr) => (
                      <div key={usr.id} className="pt-3 first:pt-0 flex flex-wrap justify-between items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-stone-900 text-sm">{usr.fullName}</strong>
                            <span className={`text-[8.5px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${
                              usr.role === "admin" 
                                ? "bg-stone-900 text-[#d4af37]" 
                                : usr.role === "member" 
                                ? "bg-stone-100 text-stone-700" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {usr.role === "member" ? "Fraternal Member" : usr.role}
                            </span>
                            
                            {usr.title && (
                              <span className="text-[10px] bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200 font-semibold italic">
                                {usr.title}
                              </span>
                            )}

                            {usr.role === "member" && (
                              <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ${
                                usr.approved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                              }`}>
                                {usr.approved ? "Approved" : "Pending Approval"}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-500 block mt-0.5">Username login: <strong className="text-stone-800 font-mono font-medium">@{usr.username}</strong></span>
                          
                          {/* Render section tags */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            <span className="text-[9px] text-stone-400 font-bold uppercase block mr-1 mt-0.5">Permissions:</span>
                            {usr.role === "admin" ? (
                              <span className="text-[8.5px] bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                All Sections (Full Master Access)
                              </span>
                            ) : usr.role === "member" ? (
                              <div className="flex flex-wrap gap-1">
                                <span className="text-[9px] text-stone-500 font-black">Authorized View Rights:</span>
                                {usr.rights && usr.rights.length > 0 ? (
                                  usr.rights.map((rig: string) => (
                                    <span key={rig} className="text-[8.5px] bg-emerald-50 text-emerald-800 font-bold px-1 py-0.1 border border-emerald-200 rounded">
                                      {rig}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[8.5px] bg-stone-100 text-stone-400 px-1 py-0.1 rounded">None Assigned</span>
                                )}
                              </div>
                            ) : (
                              usr.allowedSections.map((sec) => (
                                <span key={sec} className="text-[8.5px] bg-stone-100 text-stone-600 font-medium px-1.5 py-0.5 rounded capitalize">
                                  {sec}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditStaffUserClick(usr)}
                            className="bg-stone-50 text-stone-700 border border-stone-250 p-2 rounded-xl text-xs hover:bg-stone-100 transition flex items-center gap-1 cursor-pointer font-bold uppercase tracking-wider"
                            title="Edit User Info"
                          >
                            <Edit size={13} /> Edit
                          </button>
                          
                          <button
                            onClick={() => handleDeleteStaffUser(usr.id)}
                            disabled={currentUser?.id === usr.id}
                            className="text-red-600 border border-red-100 p-2 rounded-xl text-xs hover:bg-rose-50 transition flex items-center justify-center cursor-pointer disabled:opacity-40"
                            title="Revoke and Purge Account"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create/Edit Form Panel */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                  <h4 className="font-bold text-base text-stone-900 uppercase border-b border-stone-100 pb-3 mb-6 flex items-center gap-1.5">
                    {selectedStaffUser?.id ? (
                      <>
                        <Edit size={16} className="text-rose-800 animate-pulse" />
                        Modify Profile Details
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} className="text-rose-800" />
                        Register New Staff Profile
                      </>
                    )}
                  </h4>

                  <form onSubmit={handleCreateOrUpdateStaff} className="space-y-4">
                    {staffSuccess && (
                      <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 text-xs p-3 rounded-xl">
                        ✔️ Success: {staffSuccess}
                      </div>
                    )}
                    {staffError && (
                      <div className="bg-red-50 border-l-4 border-red-500 text-red-950 text-xs p-3 rounded-xl">
                        ❌ Error: {staffError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="staff-name-input" className="text-[10.5px] font-bold text-stone-500 uppercase block mb-1">Full Name</label>
                        <input
                          id="staff-name-input"
                          type="text"
                          required
                          value={staffName}
                          placeholder="e.g. Robert Smith"
                          onChange={(e) => setStaffName(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="staff-username-input" className="text-[10.5px] font-bold text-stone-500 uppercase block mb-1">Profile Username (Unique Login ID)</label>
                        <input
                          id="staff-username-input"
                          type="text"
                          required
                          value={staffUsername}
                          placeholder="e.g. robertsmith or staff3"
                          onChange={(e) => setStaffUsername(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="staff-password-input" className="text-[10.5px] font-bold text-stone-500 uppercase block mb-1">
                          {selectedStaffUser?.id ? "New Password (Leave blank to keep existing)" : "Sign-in Password"}
                        </label>
                        <input
                          id="staff-password-input"
                          type="password"
                          value={staffPassword}
                          placeholder={selectedStaffUser?.id ? "••••••••••••" : "Type login passcode..."}
                          onChange={(e) => setStaffPassword(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="staff-role-select" className="text-[10.5px] font-bold text-stone-500 uppercase block mb-1">System Privilege Level</label>
                        <select
                          id="staff-role-select"
                          value={staffRole}
                          onChange={(e) => setStaffRole(e.target.value as any)}
                          className="w-full text-xs px-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none h-10"
                        >
                          <option value="staff">Staff Member (Limited Section Permissions)</option>
                          <option value="admin">Master Administrator (Full Permission Everywhere)</option>
                          <option value="member">Fraternal Member (Access Private Portal Content)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="staff-title-input" className="text-[10.5px] font-bold text-stone-500 uppercase block mb-1">Lodge Title / Role Designation</label>
                        <input
                          id="staff-title-input"
                          type="text"
                          value={staffTitleLocal}
                          placeholder="e.g. Governor, Kitchen Captain, Social Trustee, General Member"
                          onChange={(e) => setStaffTitleLocal(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-stone-50 outline-none"
                        />
                      </div>
                    </div>

                    {/* Member Approval & viewing rights Assignment (Only visible if role is 'member') */}
                    {staffRole === "member" && (
                      <div className="space-y-4">
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 mt-2 space-y-2">
                          <span className="text-[10px] font-black text-stone-500 tracking-wider uppercase block">
                            Fraternal Approval Gateway Status
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setMemberApproved(!memberApproved)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                                memberApproved ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-amber-50 text-amber-800 border-amber-300"
                              }`}
                            >
                              {memberApproved ? "✅ Fraternally Approved (Active Member)" : "⏳ Pending Officers Review (Gate Locked)"}
                            </button>
                            <span className="text-[10px] text-stone-400">Approved members can login to the private portal.</span>
                          </div>
                        </div>

                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 space-y-2">
                          <span className="text-[10px] font-black text-stone-500 tracking-wider uppercase block mb-1">
                            Administer Member viewing Rights (Manage Area Visibility)
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                              { code: "minutes", label: "Meeting Minutes" },
                              { code: "financials", label: "Financial Reports" },
                              { code: "announcements", label: "Internal Announcements" },
                            ].map((right) => {
                              const isChecked = memberRights.includes(right.code);
                              return (
                                <button
                                  key={right.code}
                                  type="button"
                                  onClick={() => {
                                    if (isChecked) {
                                      setMemberRights(memberRights.filter(r => r !== right.code));
                                    } else {
                                      setMemberRights([...memberRights, right.code]);
                                    }
                                  }}
                                  className={`flex items-center gap-2 p-2.5 text-xs text-stone-700 bg-white rounded-xl border text-left transition cursor-pointer ${
                                    isChecked ? "border-[#4a7ba7] bg-sky-50/20" : "border-stone-250 hover:bg-stone-50"
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckSquare className="text-[#4a7ba7] shrink-0" size={15} />
                                  ) : (
                                    <Square className="text-stone-300 shrink-0" size={15} />
                                  )}
                                  <span className="font-semibold">{right.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Section Assignment Checkboxes (Hidden if Admin or Member role) */}
                    {staffRole === "staff" && (
                      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/60 mt-4 space-y-2">
                        <span className="text-[10px] font-black text-stone-500 tracking-wider uppercase block mb-1">
                          Assign Sections He/She Can Update (Check boxes)
                        </span>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { code: "events", label: "Calendar Events" },
                            { code: "posts", label: "News Bulletins" },
                            { code: "photos", label: "Photo Gallery" },
                            { code: "rentals", label: "Hall Rentals Pipeline" },
                            { code: "memberships", label: "Member Vetting" },
                            { code: "settings", label: "Lodge Settings" },
                          ].map((item) => {
                            const isChecked = staffAllowedSections.includes(item.code);
                            return (
                              <button
                                key={item.code}
                                type="button"
                                onClick={() => handleToggleSectionPermission(item.code)}
                                className={`flex items-center gap-2 p-2.5 text-xs text-stone-700 bg-white rounded-xl border text-left transition ${
                                  isChecked ? "border-[#4a7ba7] bg-sky-50/20" : "border-stone-250 hover:bg-stone-50"
                                }`}
                              >
                                {isChecked ? (
                                  <CheckSquare className="text-[#4a7ba7] shrink-0" size={15} />
                                ) : (
                                  <Square className="text-stone-300 shrink-0" size={15} />
                                )}
                                <span className="font-semibold">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 flex gap-2">
                      <button
                        type="submit"
                        className="bg-stone-900 hover:bg-[#4a7ba7] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition cursor-pointer"
                      >
                        {selectedStaffUser?.id ? "Save Profile Changes" : "Register Lodge Profile"}
                      </button>
                      
                      {selectedStaffUser?.id && (
                        <button
                          type="button"
                          onClick={handleCancelStaffEdit}
                          className="bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold text-xs uppercase tracking-widest px-4 py-3 rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

              </div>
            )}

            {/* 8. MEETING MINUTES TAB */}
            {activeSubTab === "minutes" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in text-left">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
                    <FileText size={18} className="text-[#4a7ba7]" /> Meeting Minutes Ledger
                  </h3>

                  {/* Form */}
                  <form onSubmit={saveMeetingMinute} className="bg-stone-50 border border-stone-200 p-4 sm:p-5 rounded-2xl space-y-4">
                    <span className="text-[11px] font-black text-stone-800 block uppercase border-b border-stone-200 pb-1.5 text-left">
                      {editingMinuteId ? "✏️ Edit Archived Minutes" : "➕ Seal New Meeting Minutes"}
                    </span>

                    {minSuccess && (
                      <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 text-xs p-3 rounded-xl text-left">
                        🎉 {minSuccess}
                      </div>
                    )}
                    {minError && (
                      <div className="bg-red-50 border-l-4 border-red-500 text-red-900 text-xs p-3 rounded-xl text-left">
                        ⚠️ {minError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-left">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Minute Document Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Regular Lodge Meeting Second Quarter"
                          value={minTitle}
                          onChange={(e) => setMinTitle(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                        />
                      </div>
                      <div className="text-left">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Meeting Date *</label>
                        <input
                          type="date"
                          required
                          value={minDate}
                          onChange={(e) => setMinDate(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                        />
                      </div>
                    </div>

                    <div className="text-left">
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Official Approver / Officer Seal *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lodge President John Doe / Secretary Mark Smith"
                        value={minApprovedBy}
                        onChange={(e) => setMinApprovedBy(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>

                    <div className="text-left">
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Meeting Content / Resolutions Transcript *</label>
                      <textarea
                        required
                        rows={8}
                        placeholder="Enter the full, detailed record of meeting notes, members present, proposals, votes and treasury statements..."
                        value={minContent}
                        onChange={(e) => setMinContent(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-mono"
                      />
                    </div>

                    <div className="flex gap-2 justify-start pt-2">
                      <button
                        type="submit"
                        className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        {editingMinuteId ? "Update Sealed Record" : "Publish & Seal Record"}
                      </button>
                      {editingMinuteId && (
                        <button
                          type="button"
                          onClick={handleCancelMeetingMinuteEdit}
                          className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List view */}
                <div className="border-t border-stone-100 pt-6 text-left">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 text-left">
                    📚 Published Seconds & Archives ({cmsData.meetingMinutes?.length || 0})
                  </h4>

                  {!cmsData.meetingMinutes || cmsData.meetingMinutes.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-6">No meeting minutes stored yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {cmsData.meetingMinutes.map((m) => (
                        <div key={m.id} className="border border-stone-200 p-4 sm:p-5 rounded-xl bg-stone-50/50 flex flex-wrap justify-between items-start gap-4">
                          <div className="space-y-1.5 flex-1 min-w-[280px] text-left">
                            <h5 className="font-extrabold text-[#4a7ba7] text-sm text-left">{m.title}</h5>
                            <p className="text-xs text-stone-500 flex flex-wrap gap-x-4 text-left">
                              <span>📅 Date: <strong className="text-stone-700">{m.date}</strong></span>
                              <span>✍️ Sealed By: <strong className="text-stone-700">{m.approvedBy}</strong></span>
                            </p>
                            <div className="text-xs text-stone-600 bg-white border border-stone-200 rounded-xl p-3 max-h-[120px] overflow-y-auto font-mono whitespace-pre-wrap text-left">
                              {m.content}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditMeetingMinute(m)}
                              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-[#4a7ba7] text-stone-600 hover:text-white hover:border-[#4a7ba7] transition cursor-pointer"
                              title="Edit minutes"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => deleteMeetingMinute(m.id, m.title)}
                              className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-rose-600 text-stone-600 hover:text-white hover:border-rose-600 transition cursor-pointer"
                              title="Delete minutes"
                            >
                              <Trash size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 9. LODGE FINANCIALS TAB */}
            {activeSubTab === "financials" && (
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in text-left">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 uppercase tracking-tight flex items-center gap-2">
                    <Coins size={18} className="text-[#4a7ba7]" /> Lodge Ledger Reporting
                  </h3>

                  {/* Form */}
                  <form onSubmit={saveFinancialReport} className="bg-stone-50 border border-stone-200 p-4 sm:p-5 rounded-2xl space-y-4 font-sans">
                    <span className="text-[11px] font-black text-stone-800 block uppercase border-b border-stone-200 pb-1.5 text-left">
                      {editingFinId ? "✏️ Edit Financial Statement" : "➕ Commit New Financial Report"}
                    </span>

                    {finSuccess && (
                      <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-900 text-xs p-3 rounded-xl text-left">
                        🎉 {finSuccess}
                      </div>
                    )}
                    {finError && (
                      <div className="bg-red-50 border-l-4 border-red-500 text-red-900 text-xs p-3 rounded-xl text-left">
                        ⚠️ {finError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-left">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Fiscal Record Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Q1 Income & Expense Statement"
                          value={finTitle}
                          onChange={(e) => setFinTitle(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                        />
                      </div>
                      <div className="text-left">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Filing Date *</label>
                        <input
                          type="date"
                          required
                          value={finDate}
                          onChange={(e) => setFinDate(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="text-left">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Total Revenue ($) *</label>
                        <input
                          type="number"
                          required
                          value={finRevenue}
                          onChange={(e) => setFinRevenue(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-bold text-emerald-700"
                        />
                      </div>
                      <div className="text-left">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Total Expenses ($) *</label>
                        <input
                          type="number"
                          required
                          value={finExpenses}
                          onChange={(e) => setFinExpenses(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-bold text-rose-700"
                        />
                      </div>
                      <div className="text-left">
                        <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Unrestricted Reserves ($) *</label>
                        <input
                          type="number"
                          required
                          value={finUnrestrictedFunds}
                          onChange={(e) => setFinUnrestrictedFunds(Number(e.target.value))}
                          className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white font-bold text-stone-700"
                        />
                      </div>
                    </div>

                    <div className="text-left">
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Computed Net Surplus/Deficit ($)</label>
                      <div className={`text-sm font-extrabold p-3 rounded-xl border ${
                        (finRevenue - finExpenses) >= 0 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                          : "bg-rose-50 border-rose-100 text-rose-800"
                      }`}>
                        ${(finRevenue - finExpenses).toLocaleString()} USD
                      </div>
                    </div>

                    <div className="text-left">
                      <label className="text-[10px] font-bold text-stone-500 uppercase block mb-1">Notes & Explanatory Breakdown</label>
                      <textarea
                        rows={4}
                        placeholder="Detail specific line items, gaming revenues, charitable donations, or capital improvements..."
                        value={finNotes}
                        onChange={(e) => setFinNotes(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white"
                      />
                    </div>

                    <div className="flex gap-2 justify-start pt-2">
                      <button
                        type="submit"
                        className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        {editingFinId ? "Update Financial Ledger" : "Commit Statement to Ledger"}
                      </button>
                      {editingFinId && (
                        <button
                          type="button"
                          onClick={handleCancelFinancialReportEdit}
                          className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs uppercase tracking-widest px-4 py-2.5 rounded-xl transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List view */}
                <div className="border-t border-stone-100 pt-6 text-left">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4 text-left">
                    📊 Historic Ledger Archives ({cmsData.financials?.length || 0})
                  </h4>

                  {!cmsData.financials || cmsData.financials.length === 0 ? (
                    <p className="text-xs text-stone-400 text-center py-6 animate-fade-in">No financial records filed yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {cmsData.financials.map((f) => {
                        const net = f.revenue - f.expenses;
                        return (
                          <div key={f.id} className="border border-stone-200 p-4 sm:p-5 rounded-xl bg-stone-50/50 flex flex-wrap justify-between items-start gap-4">
                            <div className="space-y-2 flex-1 min-w-[285px] text-left">
                              <div className="flex items-center justify-between gap-2 text-left">
                                <h5 className="font-extrabold text-[#4a7ba7] text-sm text-left">{f.title}</h5>
                                <span className="text-[10px] font-bold text-stone-400">Filed: {f.date}</span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-stone-200 p-2.5 rounded-xl text-[11px] text-stone-600">
                                <div>
                                  <span className="text-[8.5px] font-bold text-stone-400 uppercase block text-left">Revenue</span>
                                  <span className="font-extrabold text-emerald-600">${f.revenue.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-[8.5px] font-bold text-stone-400 uppercase block text-left">Expenses</span>
                                  <span className="font-extrabold text-rose-600">${f.expenses.toLocaleString()}</span>
                                </div>
                                <div>
                                  <span className="text-[8.5px] font-bold text-stone-400 uppercase block text-left">Net Yield</span>
                                  <span className={`font-extrabold ${net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                                    ${net.toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[8.5px] font-bold text-stone-400 uppercase block text-left">Reserves</span>
                                  <span className="font-extrabold text-stone-900">${f.unrestrictedFunds.toLocaleString()}</span>
                                </div>
                              </div>

                              {f.notes && (
                                <p className="text-xs text-stone-500 bg-white border border-stone-150 p-2.5 rounded-xl italic text-left">
                                  {f.notes}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditFinancialReport(f)}
                                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-[#4a7ba7] text-stone-600 hover:text-white hover:border-[#4a7ba7] transition cursor-pointer"
                                title="Edit Financial Record"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => deleteFinancialReport(f.id, f.title)}
                                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-rose-600 text-stone-600 hover:text-white hover:border-rose-600 transition cursor-pointer"
                                title="Delete Financial Record"
                              >
                                <Trash size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
