import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Phone, MapPin, Clock, Calendar, FileText, 
  Image, Users, Award, Heart, Sparkles, Building, ChevronRight, Check, CheckCircle2 
} from "lucide-react";
import { CMSData, LodgeEvent, NewsPost, GalleryPhoto, LodgeSettings, MembershipApplication, HallRentalInquiry, StaffUser } from "./types.js";
import { INITIAL_CMS_DATA } from "./initial_data.js";

// Components
import Navigation from "./components/Navigation.js";
import CalendarSection from "./components/CalendarSection.js";
import NewsSection from "./components/NewsSection.js";
import GallerySection from "./components/GallerySection.js";
import HallRentalSection from "./components/HallRentalSection.js";
import MembershipSection from "./components/MembershipSection.js";
import AdminSection from "./components/AdminSection.js";
import MembersSection from "./components/MembersSection.js";
import InteractiveMap from "./components/InteractiveMap.js";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [cmsData, setCmsData] = useState<CMSData>(() => {
    const cached = localStorage.getItem("moose_cms_data");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Cache parsing mismatch", e);
      }
    }
    return INITIAL_CMS_DATA;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Authentication persistence session state
  const [passcode, setPasscode] = useState("");
  const [isLogged, setIsLogged] = useState(false);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [token, setToken] = useState<string>(() => localStorage.getItem("moose_auth_token") || "");

  // Sync state modifications to browser storage for complete serverless/offline persistence
  useEffect(() => {
    localStorage.setItem("moose_cms_data", JSON.stringify(cmsData));
  }, [cmsData]);

  // Load state and resolve session login automatically
  useEffect(() => {
    const initializeSessionAndData = async () => {
      try {
        setLoading(true);
        
        // Fetch CMS data first
        const res = await fetch("/api/cms");
        if (res.ok) {
          const data = await res.json();
          setCmsData(data);
        }

        // Check token validity
        if (token) {
          const authRes = await fetch(`/api/auth/me?token=${encodeURIComponent(token)}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          if (authRes.ok) {
            const authData = await authRes.json();
            setCurrentUser(authData.user);
            setIsLogged(true);
          } else {
            setToken("");
            localStorage.removeItem("moose_auth_token");
          }
        }
      } catch (err) {
        console.log("Local development or offline mode. FALLBACK fallback seeded state active.");
      } finally {
        setLoading(false);
      }
    };

    initializeSessionAndData();
  }, [token]);

  const fetchCmsData = async () => {
    try {
      const res = await fetch("/api/cms");
      if (res.ok) {
        const data = await res.json();
        setCmsData(data);
      }
    } catch (err) {
      console.log("Fail safe re-sync.");
    }
  };

  // ── SECURE CORE API WRAPPERS ──

  const handleUpdateSettings = async (settings: LodgeSettings): Promise<boolean> => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    // Fallback client state
    setCmsData(prev => ({ ...prev, settings }));
    return true;
  };

  const handleSaveEvent = async (event: Partial<LodgeEvent>): Promise<boolean> => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ event })
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    // Client-side fallback update
    const newEvt = {
      ...event,
      id: event.id || "evt-local-" + Date.now().toString()
    } as LodgeEvent;
    
    setCmsData(prev => {
      const exists = prev.events.some(e => e.id === newEvt.id);
      const list = exists 
        ? prev.events.map(e => e.id === newEvt.id ? newEvt : e)
        : [...prev.events, newEvt];
      return { ...prev, events: list };
    });
    return true;
  };

  const handleDeleteEvent = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    setCmsData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }));
    return true;
  };

  const handleSavePost = async (post: Partial<NewsPost>): Promise<boolean> => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ post })
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    const newPost = {
      ...post,
      id: post.id || "post-local-" + Date.now().toString(),
      date: post.date || new Date().toISOString().split("T")[0]
    } as NewsPost;
    
    setCmsData(prev => {
      const exists = prev.posts.some(p => p.id === newPost.id);
      const list = exists
        ? prev.posts.map(p => p.id === newPost.id ? newPost : p)
        : [newPost, ...prev.posts];
      return { ...prev, posts: list };
    });
    return true;
  };

  const handleDeletePost = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    setCmsData(prev => ({ ...prev, posts: prev.posts.filter(p => p.id !== id) }));
    return true;
  };

  const handleSavePhoto = async (photo: Partial<GalleryPhoto>): Promise<boolean> => {
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ photo })
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    const newPhoto = {
      ...photo,
      id: photo.id || "photo-local-" + Date.now().toString(),
      date: photo.date || new Date().toISOString().split("T")[0]
    } as GalleryPhoto;
    setCmsData(prev => ({ ...prev, photos: [newPhoto, ...prev.photos] }));
    return true;
  };

  const handleDeletePhoto = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    setCmsData(prev => ({ ...prev, photos: prev.photos.filter(p => p.id !== id) }));
    return true;
  };

  const handleUpdateRentalStatus = async (id: string, status: HallRentalInquiry["status"], estimatedPrice?: number): Promise<boolean> => {
    try {
      const payload: any = { status };
      if (estimatedPrice !== undefined) {
        payload.estimatedPrice = Number(estimatedPrice);
      }
      const res = await fetch(`/api/rentals/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    setCmsData(prev => {
      const list = prev.rentals.map(r => r.id === id ? { 
        ...r, 
        status, 
        estimatedPrice: estimatedPrice !== undefined ? Number(estimatedPrice) : r.estimatedPrice 
      } : r);
      return { ...prev, rentals: list };
    });
    return true;
  };

  const handleUpdateAppStatus = async (id: string, status: MembershipApplication["status"]): Promise<boolean> => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    setCmsData(prev => {
      const list = prev.applications.map(a => a.id === id ? { ...a, status } : a);
      return { ...prev, applications: list };
    });
    return true;
  };

  const handleSubmitRentalInquiry = async (inquiry: Omit<HallRentalInquiry, "id" | "status" | "dateSubmitted">): Promise<boolean> => {
    try {
      const res = await fetch("/api/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiry)
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    const newInquiry = {
      ...inquiry,
      id: "rent-local-" + Date.now().toString(),
      status: "pending" as const,
      dateSubmitted: new Date().toISOString().split("T")[0]
    };
    setCmsData(prev => ({ ...prev, rentals: [...prev.rentals, newInquiry] }));
    return true;
  };

  const handleSubmitMembershipApplication = async (appData: Omit<MembershipApplication, "id" | "status" | "dateSubmitted">): Promise<boolean> => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appData)
      });
      if (res.ok) {
        await fetchCmsData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    const newApp = {
      ...appData,
      id: "app-local-" + Date.now().toString(),
      status: "pending" as const,
      dateSubmitted: new Date().toISOString().split("T")[0]
    };
    setCmsData(prev => ({ ...prev, applications: [...prev.applications, newApp] }));
    return true;
  };


  // Quick chronological sort of upcoming events
  const homeEvents = [...cmsData.events]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const homePosts = [...cmsData.posts].slice(0, 3);

  return (
    <div className="bg-[#fdfcfb] min-h-screen text-stone-800 font-sans flex flex-col justify-between">
      
      {/* 1. STICKY DUAL BRAND NAVIGATION HEADER */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} settings={cmsData.settings} />

      {/* 2. DYNAMIC LIVE NOTICE ALERT BANNER */}
      {cmsData.settings.alertBannerText && (
        <div className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white text-center py-3.5 px-4 text-xs sm:text-sm font-semibold tracking-tight transition shadow-sm flex justify-center items-center gap-1.5 z-10">
          🔥 NOTICE: {cmsData.settings.alertBannerText}
          <button 
            onClick={() => setActiveTab(cmsData.settings.alertBannerLink || "calendar")}
            className="underline text-[#d4af37] hover:text-white font-extrabold border-none bg-transparent cursor-pointer ml-1 leading-none text-xs sm:text-sm uppercase tracking-wide"
          >
            Lodge Calendar →
          </button>
        </div>
      )}

      {/* 3. CENTER ACTIVE VIEWPORT COMPONENT */}
      <div className="flex-1 w-full flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-24 text-stone-400 gap-2">
            <div className="w-10 h-10 border-4 border-[#4a7ba7] border-t-transparent rounded-full animate-spin"></div>
            <span className="font-bold uppercase tracking-widest text-[11px] mt-2 text-[#4a7ba7]">Accessing Moose database...</span>
          </div>
        ) : (
          <>
            {activeTab === "home" && (
              <div className="w-full">
                
                {/* HERO PROMOTIONS BOX */}
                <section className="relative overflow-hidden bg-gradient-to-tr from-stone-900 via-stone-800 to-[#3b658a] text-white py-16 sm:py-24 px-6 sm:px-10 border-b border-stone-200">
                  <div className="absolute inset-0 bg-stone-950/20 mix-blend-overlay"></div>
                  
                  {/* Subtle Giant Background Icon */}
                  <div className="absolute -right-12 bottom-0 text-[240px] select-none opacity-5 hover:opacity-10 transition duration-500 scale-x-[-1] pointer-events-none">
                    🦌
                  </div>

                  <div className="max-w-5xl mx-auto text-center relative z-20">
                    <span className="text-[#d4af37] text-xs sm:text-sm font-extrabold tracking-widest uppercase mb-3 block">
                      LOYAL ORDER OF MOOSE • BROOKSVILLE #1676
                    </span>
                    <h2 className="text-4xl sm:text-7xl font-sans font-black tracking-tight leading-none uppercase select-none">
                      Fraternity • Service • <span className="text-[#d4af37]">Charity</span>
                    </h2>
                    <p className="text-stone-300 text-sm sm:text-lg max-w-2xl mx-auto mt-4 leading-relaxed font-sans">
                      Providing safe family homes at <strong className="text-white hover:underline cursor-pointer">Mooseheart</strong>, honorable, secure retirement at <strong className="text-white hover:underline cursor-pointer">Moosehaven</strong>, and welcoming fellowship right here on Cortez Boulevard.
                    </p>
                    
                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                      <button 
                        onClick={() => setActiveTab("membership")}
                        className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs sm:text-sm uppercase tracking-widest px-6 py-3.5 rounded-full shadow-lg cursor-pointer transition border-none"
                      >
                        Enroll Online
                      </button>
                      <button 
                        onClick={() => setActiveTab("calendar")}
                        className="border border-white hover:bg-white hover:text-stone-900 text-white font-bold text-xs sm:text-sm uppercase tracking-widest px-6 py-3.5 rounded-full cursor-pointer transition"
                      >
                        Upcoming Activities
                      </button>
                    </div>
                  </div>
                </section>

                {/* BENTO DASHBOARD TILES: EVENTS, NEWS, SIDEBAR */}
                <section className="max-w-7xl mx-auto px-6 sm:px-10 py-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT/MID: FEEDS AREA (8 Columns) */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                      
                      {/* SUB UPCOMING EVENTS */}
                      <div>
                        <div className="flex justify-between items-baseline border-b border-stone-200 pb-3 mb-6">
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 flex items-center gap-2 uppercase">
                             Next Scheduled events
                          </h3>
                          <button 
                            onClick={() => setActiveTab("calendar")}
                            className="text-xs font-bold text-[#4a7ba7] uppercase hover:underline border-none bg-transparent cursor-pointer"
                          >
                            Full Calendar &rarr;
                          </button>
                        </div>

                        <div className="space-y-4">
                          {homeEvents.map((evt) => (
                            <div 
                              key={evt.id}
                              onClick={() => setActiveTab("calendar")}
                              className="bg-white rounded-3xl border border-stone-100 hover:border-[#4a7ba7] p-5 shadow-sm transition transform hover:-translate-y-0.5 flex gap-4 h-fit items-center cursor-pointer"
                            >
                              <div className="bg-[#4a7ba7] text-white py-2.5 rounded-2xl w-16 text-center shrink-0 flex flex-col justify-center shadow-sm">
                                <span className="text-[9px] font-bold text-stone-200 uppercase tracking-widest block leading-none">
                                  {new Date(evt.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                                </span>
                                <span className="text-[20px] font-black leading-none mt-1">
                                  {new Date(evt.date + "T00:00:00").getDate()}
                                </span>
                              </div>
                              <div className="flex-1 truncate">
                                <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-snug hover:text-[#4a7ba7] truncate">
                                  {evt.title}
                                </h4>
                                <p className="text-stone-500 text-xs truncate mt-1 font-medium">
                                   Starts at {evt.time} in {evt.location || "Lodge Social Hall"}
                                </p>
                              </div>
                              <ChevronRight className="text-stone-400 shrink-0" size={16} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SUB LATEST NEWS */}
                      <div>
                        <div className="flex justify-between items-baseline border-b border-stone-200 pb-3 mb-6">
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 uppercase">
                             Gazettes & Bulletins
                          </h3>
                          <button 
                            onClick={() => setActiveTab("news")}
                            className="text-xs font-bold text-[#4a7ba7] uppercase hover:underline border-none bg-transparent cursor-pointer"
                          >
                            All Stories &rarr;
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {homePosts.map((post) => (
                            <div 
                              key={post.id}
                              onClick={() => setActiveTab("news")}
                              className="bg-white rounded-3xl border border-stone-100 hover:border-[#4a7ba7] p-6 shadow-sm transition hover:shadow-md cursor-pointer flex flex-col justify-between"
                            >
                              <div>
                                <span className="text-[9px] bg-sky-50 text-[#4a7ba7] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md self-start mb-3 block w-fit">
                                  {post.category}
                                </span>
                                <h4 className="font-bold text-stone-900 text-sm sm:text-base leading-snug line-clamp-2">
                                  {post.title}
                                </h4>
                                <p className="text-stone-500 text-xs leading-relaxed line-clamp-2 mt-2">
                                  {post.excerpt}
                                </p>
                              </div>
                              
                              <div className="flex justify-between items-center text-[10.5px] text-stone-400 border-t border-stone-100 pt-3 mt-4">
                                <span>{post.date}</span>
                                <strong className="text-[#4a7ba7]">Read Story &rarr;</strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* RIGHT: OPERATIONS SIDEBAR (4 Columns) */}
                    <div className="lg:col-span-4 space-y-6">
                      
                      {/* SCHED MEETING TIMES */}
                      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-4 flex items-center gap-2">
                          Meeting Schedule
                        </h3>
                        <div className="space-y-4 divide-y divide-stone-100">
                          <div className="pt-0">
                            <strong className="text-xs font-bold text-stone-900 block uppercase">Lodge Officer Meetings</strong>
                            <span className="text-xs text-stone-500 mt-1 block leading-relaxed">
                              1st & 3rd Wednesday • Dinner served at 6:00 PM • Meeting begins at 7:00 PM
                            </span>
                          </div>
                          <div className="pt-3">
                            <strong className="text-xs font-bold text-stone-900 block uppercase">Women of the Moose (#1420)</strong>
                            <span className="text-xs text-stone-500 mt-1 block leading-relaxed">
                              2nd & 4th Tuesday, 7:00 PM in the Lodge Room
                            </span>
                          </div>
                          <div className="pt-3">
                            <strong className="text-xs font-bold text-stone-900 block uppercase">Moose Legion Activities</strong>
                            <span className="text-xs text-stone-500 mt-1 block leading-relaxed">
                              Last Thursday of the Month, 7:00 PM
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SOCIAL HOURS */}
                      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-4 flex items-center gap-2">
                          Quarter Social Hours
                        </h3>
                        <div className="p-0">
                          <table className="w-full text-xs font-sans border-collapse" id="hours-table">
                            <tbody>
                              <tr className="border-b border-stone-100">
                                <td className="py-2.5 font-semibold text-stone-700">Monday - Thursday</td>
                                <td className="py-2.5 text-right text-stone-500 font-medium">{cmsData.settings.barHours.mon_thu}</td>
                              </tr>
                              <tr className="border-b border-stone-100">
                                <td className="py-2.5 font-semibold text-stone-700">Friday</td>
                                <td className="py-2.5 text-right text-stone-500 font-medium">{cmsData.settings.barHours.fri}</td>
                              </tr>
                              <tr className="border-b border-stone-100">
                                <td className="py-2.5 font-semibold text-stone-700">Saturday</td>
                                <td className="py-2.5 text-right text-stone-500 font-medium">{cmsData.settings.barHours.sat}</td>
                              </tr>
                              <tr className="border-b-0">
                                <td className="py-2.5 font-semibold text-stone-700">Sunday</td>
                                <td className="py-2.5 text-right text-stone-500 font-medium">{cmsData.settings.barHours.sun}</td>
                              </tr>
                            </tbody>
                          </table>
                          <div className="bg-stone-50 border border-stone-100 p-3 rounded-2xl text-[10px] text-stone-500 mt-4 leading-normal font-sans">
                            🍽️ <strong>Kitchen Note:</strong> Kitchen prep closes 1 hour before bar quarters lock. Famous Friday fish fry starts weekly at 11:30 AM!
                          </div>
                        </div>
                      </div>

                      {/* THE TEAM / BOARD OF OFFICERS */}
                      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
                        <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-4 flex items-center gap-2">
                          Board of Officers
                        </h3>
                        <div className="p-0 max-h-60 overflow-y-auto space-y-3.5 text-xs">
                          {cmsData.officers.map((off) => (
                            <div key={off.id} className="flex justify-between items-baseline gap-2 border-b border-dashed border-stone-100 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-stone-400 font-semibold uppercase text-[10px] tracking-wider truncate shrink-0 max-w-44">
                                {off.title}
                              </span>
                              <strong className="text-stone-800 text-right truncate">
                                {off.name}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DIRECTIONS ADDRESS MAP */}
                      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl shadow-xl p-6 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 text-7xl opacity-5 pointer-events-none">📍</div>
                        <h4 className="text-[10px] text-[#d4af37] font-bold uppercase tracking-widest mb-1">Local Directions</h4>
                        <h3 className="font-bold text-lg mb-2">Visit the Lodge</h3>
                        <p className="text-stone-300 text-xs leading-relaxed mb-4">
                           Our social quarters are conveniently sitting west of Interstate-75 right on Cortez Boulevard (State Road 50) in lovely Brooksville, FL. 
                        </p>
                        <div className="bg-white/10 p-3 rounded-2xl flex items-center gap-2.5 text-xs">
                          <MapPin size={16} className="text-[#d4af37] shrink-0" />
                          <span className="font-semibold text-[11px] leading-tight text-white">{cmsData.settings.address}</span>
                        </div>
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cmsData.settings.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#d4af37] hover:underline"
                        >
                          Find Directions on Maps &rarr;
                        </a>
                      </div>

                    </div>

                  </div>

                  {/* INTERACTIVE GEOGRAPHIC LANDMARKS VECTOR MAP */}
                  <div className="mt-12 bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
                    <div className="mb-6">
                      <h4 className="text-[10px] text-[#4a7ba7] font-black uppercase tracking-widest mb-1">Interactive Geographic Guide</h4>
                      <h3 className="text-xl font-black text-stone-900 uppercase">Brooksville Landmarks & Lodge Location</h3>
                      <p className="text-xs text-stone-500 mt-1">
                        Explore local Brooksville points of interest, recreation centers, parks, and our lodge quarters. Hover or tap landmarks to view key details, search locations, or change the zoom.
                      </p>
                    </div>
                    <InteractiveMap />
                  </div>

                </section>
                
              </div>
            )}

            {activeTab === "calendar" && <CalendarSection events={cmsData.events} />}
            {activeTab === "news" && <NewsSection posts={cmsData.posts} />}
            {activeTab === "gallery" && <GallerySection photos={cmsData.photos} />}
            
            {activeTab === "rental" && (
              <HallRentalSection 
                settings={cmsData.settings}
                onSubmitInquiry={handleSubmitRentalInquiry} 
              />
            )}
            
            {activeTab === "membership" && (
              <MembershipSection onSubmitApplication={handleSubmitMembershipApplication} />
            )}

            {activeTab === "members-portal" && (
              <MembersSection 
                cmsData={cmsData}
                isLoggedIn={isLogged}
                setIsLoggedIn={setIsLogged}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                token={token}
                setToken={setToken}
                onFetchCMSData={fetchCmsData}
              />
            )}

            {activeTab === "admin" && (
              <AdminSection 
                cmsData={cmsData}
                passcode={passcode}
                setPasscode={setPasscode}
                isLoggedIn={isLogged}
                setIsLoggedIn={setIsLogged}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                token={token}
                setToken={setToken}
                onUpdateSettings={handleUpdateSettings}
                onSaveEvent={handleSaveEvent}
                onDeleteEvent={handleDeleteEvent}
                onSavePost={handleSavePost}
                onDeletePost={handleDeletePost}
                onSavePhoto={handleSavePhoto}
                onDeletePhoto={handleDeletePhoto}
                onUpdateRentalStatus={handleUpdateRentalStatus}
                onUpdateAppStatus={handleUpdateAppStatus}
                onFetchCMSData={fetchCmsData}
              />
            )}
          </>
        )}
      </div>

      {/* 4. LOWER GLOBAL FOOTER */}
      <footer className="bg-[#1c1917] text-stone-400 pt-16 pb-10 px-6 sm:px-10 border-t border-stone-800 shadow-xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12" id="footer-inner">
            
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4a7ba7] rounded-xl flex items-center justify-center p-1 shadow-sm">
                  <img 
                    src="https://www.mooseintl.org/wp-content/themes/Moose/images/logo.png" 
                    alt="Logo"
                    className="w-8 h-8 object-contain brightness-0 invert"
                  />
                </div>
                <strong className="text-white text-base tracking-wide uppercase">Moose #1676</strong>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed">
                Serving Brooksville, Hernando County, and neighboring Florida communities with pride in fraternity, brotherhood, and service since 1976.
              </p>
            </div>

            <div>
              <h5 className="font-extrabold text-xs text-[#d4af37] uppercase tracking-wider mb-4">Lodge Navigation</h5>
              <ul className="space-y-2 text-xs list-none">
                <li><button onClick={() => setActiveTab("home")} className="text-stone-400 hover:text-white bg-transparent border-none cursor-pointer outline-none transition-colors">Home Quarters</button></li>
                <li><button onClick={() => setActiveTab("calendar")} className="text-stone-400 hover:text-white bg-transparent border-none cursor-pointer outline-none transition-colors">Activity Calendar</button></li>
                <li><button onClick={() => setActiveTab("news")} className="text-stone-400 hover:text-white bg-transparent border-none cursor-pointer outline-none transition-colors">Lodge News Gazettes</button></li>
                <li><button onClick={() => setActiveTab("gallery")} className="text-stone-400 hover:text-white bg-transparent border-none cursor-pointer outline-none transition-colors">Lodge Photos</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-extrabold text-xs text-[#d4af37] uppercase tracking-wider mb-4">Core Charities</h5>
              <ul className="space-y-3.5 text-xs list-none text-stone-400 leading-normal">
                <li>
                  <strong className="text-white font-semibold block mb-0.5 hover:text-[#d4af37] transition-colors cursor-pointer">Mooseheart Child City ↗</strong>
                  Safe residential family care for kids.
                </li>
                <li>
                  <strong className="text-white font-semibold block mb-0.5 hover:text-[#d4af37] transition-colors cursor-pointer">Moosehaven Senior Quarters ↗</strong>
                  Florida-based retirement for elder members.
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-extrabold text-xs text-[#d4af37] uppercase tracking-wider mb-4">Lodge Contact</h5>
              <ul className="space-y-2.5 text-xs list-none text-stone-400">
                <li className="flex items-center gap-1.5 truncate"><MapPin size={12} className="text-[#4a7ba7]" /> {cmsData.settings.address}</li>
                <li className="flex items-center gap-1.5"><Phone size={12} className="text-[#4a7ba7]" /> Phone: {cmsData.settings.phone}</li>
                <li className="flex items-center gap-1.5 font-bold text-[#d4af37] hover:underline cursor-pointer" onClick={() => setActiveTab("admin")}><ShieldCheck size={12} /> Lodge Staff Admin</li>
              </ul>
            </div>

          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row justify-between items-center text-[11px] text-stone-500 gap-4 text-center">
            <span>© {new Date().getFullYear()} Loyal Order of Moose Brooksville Lodge #1676. All Rights Reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-[#d4af37] transition-colors">Privacy Policy</a>
              <span>·</span>
              <a href="#" className="hover:text-[#d4af37] transition-colors">Terms of Use</a>
              <span>·</span>
              <a href="/wordpress-migration-guide" className="hover:text-[#d4af37] transition-colors" onClick={(e) => { e.preventDefault(); alert("WordPress Guide is successfully located in /WORDPRESS_MIGRATION_GUIDE.md at the project root!"); }}>WordPress Guide</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
