import React from "react";
import { ShieldCheck, Calendar, FileText, Image, DollarSign, UserCheck, Settings, Phone, Mail, MapPin } from "lucide-react";
import { LodgeSettings } from "../types.js";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: LodgeSettings;
}

export default function Navigation({ activeTab, setActiveTab, settings }: NavigationProps) {
  return (
    <div className="w-full">
      {/* UTILITY TELEMETRY & CONTACT BAR - SLEEK MINIMALIST PROTOCOL */}
      <div className="bg-[#1c1917] text-stone-300 text-[11px] font-sans flex flex-col md:flex-row justify-between items-center px-6 sm:px-10 py-2 gap-2 border-b border-stone-800" id="util-bar">
        <div className="flex flex-wrap items-center justify-center gap-4 text-center">
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <MapPin size={12} className="text-[#d4af37]" />
            {settings.address}
          </span>
          <span className="text-stone-700 hidden sm:inline-block">|</span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={12} className="text-[#d4af37]" />
            {settings.phone}
          </span>
          <span className="text-stone-700 hidden sm:inline-block">|</span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail size={12} className="text-[#d4af37]" />
            {settings.email}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab("admin")} 
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all text-[11px] font-bold tracking-wider uppercase ${
              activeTab === "admin" 
                ? "bg-[#4a7ba7] text-white shadow-sm" 
                : "text-[#d4af37] bg-white/5 hover:bg-white/10"
            }`}
          >
            <Settings size={12} />
            Staff Portal
          </button>
          <a 
            href="https://www.mooseintl.org" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-stone-300 hover:text-white transition-colors"
          >
            Moose International ↗
          </a>
        </div>
      </div>

      {/* HEADER HERO TITLE & LOGO BRANDING */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <button 
            onClick={() => setActiveTab("home")} 
            className="brand flex items-center gap-3.5 text-left border-none bg-transparent cursor-pointer outline-none focus:outline-none"
          >
            {/* Moose International Emblem with Fallback Emoji */}
            <div className="relative w-12 h-12 bg-[#4a7ba7] rounded-xl flex items-center justify-center text-white shadow-md p-1.5">
              <img 
                src="https://www.mooseintl.org/wp-content/themes/Moose/images/logo.png"
                alt="Loyal Order of Moose Logo"
                className="w-10 h-10 object-contain brightness-0 invert"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                  const fb = document.getElementById('favicon-fallback');
                  if (fb) fb.style.display = 'block';
                }}
              />
              <div id="favicon-fallback" className="hidden text-2xl select-none">🦌</div>
            </div>
            
            <div className="brand-text">
              <h1 className="font-sans font-bold text-lg sm:text-xl text-stone-900 tracking-tight leading-none uppercase">
                Loyal Order of Moose
              </h1>
              <p className="text-[10px] tracking-widest text-[#4a7ba7] font-bold uppercase mt-1">
                Brooksville Lodge #1676 • Est. 1976
              </p>
            </div>
          </button>
          
          <div className="flex gap-2 sm:gap-3">
            <button 
              onClick={() => setActiveTab("membership")} 
              className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-semibold text-xs sm:text-sm px-5 py-2 rounded-full shadow-sm transition hover:shadow-md cursor-pointer"
            >
              Join Us
            </button>
            <button 
              onClick={() => setActiveTab("rental")} 
              className="hidden sm:inline-block border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs sm:text-sm px-5 py-2 rounded-full transition cursor-pointer"
            >
              Hall Rental
            </button>
          </div>
        </div>
      </header>

      {/* CORE HORIZONTAL NAVIGATION BAR - SLEEK INTERFACE TABS */}
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 overflow-x-auto scrollbar-hide">
          <ul className="flex list-none gap-4 sm:gap-6 justify-start md:justify-center py-0">
            <li>
              <button 
                onClick={() => setActiveTab("home")} 
                className={`flex items-center gap-1.5 px-1 py-4 text-xs sm:text-[13px] font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "home" 
                    ? "text-[#4a7ba7] border-[#4a7ba7]" 
                    : "text-stone-500 border-transparent hover:text-stone-900"
                }`}
              >
                Home
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("calendar")} 
                className={`flex items-center gap-1.5 px-1 py-4 text-xs sm:text-[13px] font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "calendar" 
                    ? "text-[#4a7ba7] border-[#4a7ba7]" 
                    : "text-stone-500 border-transparent hover:text-stone-900"
                }`}
              >
                Calendar
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("news")} 
                className={`flex items-center gap-1.5 px-1 py-4 text-xs sm:text-[13px] font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "news" 
                    ? "text-[#4a7ba7] border-[#4a7ba7]" 
                    : "text-stone-500 border-transparent hover:text-stone-900"
                }`}
              >
                News
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("gallery")} 
                className={`flex items-center gap-1.5 px-1 py-4 text-xs sm:text-[13px] font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "gallery" 
                    ? "text-[#4a7ba7] border-[#4a7ba7]" 
                    : "text-stone-500 border-transparent hover:text-stone-900"
                }`}
              >
                Photos
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("rental")} 
                className={`flex items-center gap-1.5 px-1 py-4 text-xs sm:text-[13px] font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "rental" 
                    ? "text-[#4a7ba7] border-[#4a7ba7]" 
                    : "text-stone-500 border-transparent hover:text-stone-900"
                }`}
              >
                Hall Rental
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("membership")} 
                className={`flex items-center gap-1.5 px-1 py-4 text-xs sm:text-[13px] font-semibold tracking-wide border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "membership" 
                    ? "text-[#4a7ba7] border-[#4a7ba7]" 
                    : "text-stone-500 border-transparent hover:text-stone-900"
                }`}
              >
                Membership
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab("members-portal")} 
                className={`flex items-center gap-1.5 px-1 py-4 text-xs sm:text-[13px] font-bold tracking-wide border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "members-portal" 
                    ? "text-[#4a7ba7] border-[#4a7ba7]" 
                    : "text-[#b25e00] border-transparent hover:text-[#4a7ba7]"
                }`}
              >
                🔒 Members Portal
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
