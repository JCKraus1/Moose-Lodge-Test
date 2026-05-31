import React, { useState } from "react";
import { Search, Calendar, MapPin, DollarSign, Clock, Tag, X, ExternalLink } from "lucide-react";
import { LodgeEvent } from "../types.js";

interface CalendarSectionProps {
  events: LodgeEvent[];
}

type EventFilterType = "all" | "public" | "members" | "fundraiser" | "wom" | "legion";

export default function CalendarSection({ events }: CalendarSectionProps) {
  const [filter, setFilter] = useState<EventFilterType>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeEvent, setActiveEvent] = useState<LodgeEvent | null>(null);

  // Sorting events chronologically
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Applying search and category filters
  const filteredEvents = sortedEvents.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === "all" || event.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "public":
        return "bg-amber-100 text-amber-800 border border-amber-300";
      case "members":
        return "bg-sky-100 text-sky-800 border border-sky-300";
      case "fundraiser":
        return "bg-sky-50 text-[#4a7ba7] border border-sky-200";
      case "wom":
        return "bg-purple-100 text-purple-800 border border-purple-300";
      case "legion":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "public": return "Open to Public";
      case "members": return "Members Only";
      case "fundraiser": return "Charity Fundraiser";
      case "wom": return "Women of the Moose";
      case "legion": return "Moose Legion";
      default: return category;
    }
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", options);
  };

  const getCalendarDay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.getDate().toString().padStart(2, "0");
  };

  const getCalendarMonth = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short" });
  };

  return (
    <div className="bg-[#fdfcfb] min-h-screen p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-[#4a7ba7] font-bold text-xs tracking-widest uppercase mb-1 block">
            Interact • Serve • Participate
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mt-1 mb-3">
             Lodge Events Calendar
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            From famous family dinners to regional charity tournaments, Brooksville Moose Lodge #1676 is proud to support civic togetherness.
          </p>
        </div>

        {/* CONTROLS AREA */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* SEARCH BOX */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search upcoming events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 focus:border-[#4a7ba7] focus:ring-1 focus:ring-[#7aabdb] outline-none text-stone-850 text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-3 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>

          {/* FILTER BUTTONS */}
          <div className="flex flex-wrap gap-1.5 justify-center w-full md:w-auto">
            {(["all", "public", "members", "fundraiser", "wom", "legion"] as EventFilterType[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  filter === cat
                    ? "bg-[#4a7ba7] text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                {cat === "all" ? "Show All" : cat === "wom" ? "WOM" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* EVENT ROWS CONTAINER */}
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-100 p-12 text-center shadow-sm">
              <p className="text-4xl">🔎</p>
              <h4 className="font-bold text-lg text-stone-900 mt-2 mb-1">No matching events found</h4>
              <p className="text-stone-500 text-sm">Try broadening your search term or choosing a different filter category.</p>
              <button 
                onClick={() => { setFilter("all"); setSearchTerm(""); }} 
                className="mt-5 inline-block bg-[#4a7ba7] hover:bg-[#3b658a] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div 
                key={event.id}
                onClick={() => setActiveEvent(event)}
                className="bg-white rounded-3xl border border-stone-100 hover:border-[#4a7ba7] flex flex-col sm:flex-row shadow-sm hover:shadow-md transition duration-200 cursor-pointer overflow-hidden transform hover:-translate-y-0.5"
              >
                {/* CALENDAR GRAPHIC DATE BLOCK */}
                <div className="bg-[#4a7ba7] text-white flex sm:flex-col items-center justify-between sm:justify-center p-5 sm:px-6 w-full sm:w-28 sm:border-r-0">
                  <span className="text-xs uppercase tracking-widest text-[#d4af37] font-extrabold select-none sm:mb-1">
                    {getCalendarMonth(event.date)}
                  </span>
                  <span className="font-sans font-black text-3xl sm:text-4xl tracking-tighter leading-none text-white select-none">
                    {getCalendarDay(event.date)}
                  </span>
                  <span className="text-[10px] hidden sm:block font-bold tracking-wide text-sky-200 select-none mt-1.5">
                    {event.time}
                  </span>
                  <span className="sm:hidden text-xs bg-black/20 px-2 py-0.5 rounded text-[#d4af37] font-bold">
                    {event.time}
                  </span>
                </div>

                {/* HEART CONTENT AREA */}
                <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2.5">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${getCategoryBadgeClass(event.category)}`}>
                        {getCategoryName(event.category)}
                      </span>
                      {event.cost && (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md font-bold">
                          Cost: {event.cost}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-stone-900 leading-tight mb-1.5 hover:text-[#4a7ba7] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-stone-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                  
                  {/* FOOT METADATA */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] sm:text-xs text-stone-400 mt-4 border-t border-stone-100 pt-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock size={12} className="text-[#4a7ba7]" />
                      Doors open at {event.time}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <MapPin size={12} className="text-[#4a7ba7]" />
                        {event.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DETAIL POPUP MODAL */}
        {activeEvent && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-stone-100">
              <button 
                onClick={() => setActiveEvent(null)}
                className="absolute right-4 top-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-1.5 transition"
              >
                <X size={18} />
              </button>

              <div className="bg-[#4a7ba7] text-white p-6 pt-8">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold tracking-widest uppercase bg-white/10 text-white">
                  {getCategoryName(activeEvent.category)}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#d4af37] leading-snug mt-3 mb-2">
                  {activeEvent.title}
                </h3>
                <p className="text-[12px] text-sky-100 font-medium tracking-wider flex items-center gap-1.5">
                  <Calendar size={13} />
                  {formatDate(activeEvent.date)} @ {activeEvent.time}
                </p>
              </div>

              <div className="p-6">
                <h4 className="text-xs font-semibold text-stone-400 tracking-wider uppercase mb-1">
                  Event Description & Details
                </h4>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed mb-6 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  {activeEvent.description}
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4 text-xs sm:text-sm text-stone-600">
                  <div>
                    <span className="text-stone-400 text-[10.5px] font-extrabold tracking-wider uppercase block">Location</span>
                    <strong className="text-stone-800 mt-0.5 block">{activeEvent.location || "Lodge 1676 Hall"}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10.5px] font-extrabold tracking-wider uppercase block">Cost / Requirements</span>
                    <strong className="text-stone-800 mt-0.5 block">{activeEvent.cost || "Free Registration"}</strong>
                  </div>
                </div>

                <div className="mt-8 flex gap-2">
                  <button 
                    onClick={() => {
                      alert(`Event added to calendar: ${activeEvent.title} on ${activeEvent.date}`);
                      setActiveEvent(null);
                    }}
                    className="flex-1 bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full text-center transition cursor-pointer shadow-sm"
                  >
                    Add to Calendar
                  </button>
                  <button 
                    onClick={() => setActiveEvent(null)}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider px-5 rounded-full transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
