import React, { useState } from "react";
import { MapPin, Compass, Search, Navigation, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface Landmark {
  id: string;
  name: string;
  category: string;
  address: string;
  description: string;
  details: string;
  x: number; // SVG mapping coordinates (0-800 scale)
  y: number; // SVG mapping coordinates (0-500 scale)
  distanceFromLodge: string; // Miles
  driveTime: string; // Minutes
  imageUrl: string;
}

const LANDMARKS: Landmark[] = [
  {
    id: "lodge",
    name: "Brooksville Moose Lodge #1676",
    category: "Fraternal Landmark",
    address: "17129 Cortez Blvd, Brooksville, FL 34601",
    description: "The primary social community center of Moose Lodge #1676 on Cortez Blvd.",
    details: "Our active lodge hosts weekly dinners (including our famous Friday Fish Fry), darts, pool leagues, family-friendly social quarters, and handles fundraising support for Mooseheart child city and Moosehaven retirement home.",
    x: 480,
    y: 280,
    distanceFromLodge: "0.0 mi",
    driveTime: "0 mins",
    imageUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "courthouse",
    name: "Historic Downtown & Courthouse",
    category: "Historical Center",
    address: "20 N Main St, Brooksville, FL 34601",
    description: "The beautiful historic heart of Brooksville, known for century-old oak trees.",
    details: "Home to the Hernando County Courthouse (built in 1913), beautiful murals, old brick roads, antique shops, and excellent family-owned diners. It beautifully encapsulates classic Southern Florida town charm.",
    x: 280,
    y: 200,
    distanceFromLodge: "6.2 mi",
    driveTime: "9 mins",
    imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "chinsegut",
    name: "Chinsegut Hill Historic Site",
    category: "Nature & Heritage",
    address: "22495 Chinsegut Hill Rd, Brooksville, FL 34601",
    description: "One of the highest scenic elevations in peninsular Florida with majestic oak canopies.",
    details: "A 114-acre historic estate crowning a high hill. Features a fully restored 1850s manor house and serves as an educational retreat, offering a deep history of the county alongside beautiful wildlife walking loops.",
    x: 260,
    y: 80,
    distanceFromLodge: "9.5 mi",
    driveTime: "14 mins",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "boyetts",
    name: "Boyett's Grove & Citrus Attraction",
    category: "Roadside Americana",
    address: "4355 Spring Lake Hwy, Brooksville, FL 34601",
    description: "Classic old-school Florida citrus orchard, wildlife zoo, and novelty shop.",
    details: "In operation since 1966, this beloved vintage tourist spot features a fruit-shipping facility, dinosaur-themed dioramas, miniature golf, a petting zoo, and a nostalgic candy counter that children absolutely love.",
    x: 620,
    y: 360,
    distanceFromLodge: "4.8 mi",
    driveTime: "7 mins",
    imageUrl: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "museum",
    name: "May-Stringer House Museum",
    category: "Historic Museum",
    address: "601 Museum Ct, Brooksville, FL 34601",
    description: "An impressive 4-story, 14-room Victorian mansion built in 1885.",
    details: "Operated by the Hernando Historical Museum Association, this amazing Queen Anne home displays over 11,000 pioneer-era artifacts, vintage military gear, and pre-Civil War maps. Legend holds it is one of Florida's most haunted houses!",
    x: 220,
    y: 220,
    distanceFromLodge: "6.5 mi",
    driveTime: "11 mins",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "tomvarn",
    name: "Tom Varn Park & Golf Quarry",
    category: "Recreation Park",
    address: "301 Darby Ln, Brooksville, FL 34601",
    description: "A gorgeous public park centered around dynamic inactive quarry sites.",
    details: "Features premier tournament softball fields, winding paved wellness tracks, sprawling playground systems beneath Spanish-moss oaks, and an extreme disc-golf track weaving through stunning granite quarry remnants.",
    x: 180,
    y: 160,
    distanceFromLodge: "7.1 mi",
    driveTime: "11 mins",
    imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600"
  }
];

export default function InteractiveMap() {
  const [selectedId, setSelectedId] = useState<string>("lodge");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const activeLandmark = LANDMARKS.find((l) => l.id === selectedId) || LANDMARKS[0];

  // Filter landmarks by search
  const filteredLandmarks = LANDMARKS.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map Navigation Helpers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-stone-50 rounded-3xl border border-stone-200/80 p-5 md:p-8 flex flex-col gap-6" id="interactive-map-section">
      
      {/* MAP HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#4a7ba7] tracking-widest uppercase block mb-1">
            Community Geography
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <Compass className="text-[#4a7ba7] animate-pulse" size={28} />
            Brooksville Landmarks & Lodge Location
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Explore local history, scenery, and culture situated surrounding the Lodge at Cortez Boulevard.
          </p>
        </div>

        {/* SEARCH BOX */}
        <div className="relative w-full md:w-72">
          <label htmlFor="landmark-search-input" className="sr-only">Search landmarks</label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input
            id="landmark-search-input"
            type="text"
            placeholder="Search landmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white text-xs text-stone-800 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7aabdb] focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LANDMARK DIRECTORY / SEARCH RESULTS (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
            Locations Directory ({filteredLandmarks.length})
          </span>
          <div className="space-y-2">
            {filteredLandmarks.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setSelectedId(l.id);
                  // Auto center slightly on click by shifting coordinates
                  setPanOffset({
                    x: (400 - l.x) * (zoomLevel - 0.5),
                    y: (250 - l.y) * (zoomLevel - 0.5)
                  });
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1 cursor-pointer ${
                  selectedId === l.id
                    ? "bg-[#4a7ba7] border-[#4a7ba7] text-white shadow-md shadow-sky-900/10"
                    : "bg-white border-stone-100 hover:border-[#4a7ba7]/60 text-stone-700"
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    selectedId === l.id ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                  }`}>
                    {l.category}
                  </span>
                  <span className="text-[10px] font-mono opacity-80">
                    {l.id === "lodge" ? "🌟 Source" : l.distanceFromLodge}
                  </span>
                </div>
                <strong className={`font-bold text-xs mt-1 leading-snug ${selectedId === l.id ? "text-white" : "text-stone-900"}`}>
                  {l.name}
                </strong>
                <span className={`text-[10.5px] leading-tight line-clamp-1 ${selectedId === l.id ? "text-stone-200" : "text-stone-400"}`}>
                  {l.address}
                </span>
              </button>
            ))}

            {filteredLandmarks.length === 0 && (
              <div className="text-center py-10 bg-white border border-dashed border-stone-200 rounded-3xl text-stone-400 text-xs">
                No landmarks matching your search.
              </div>
            )}
          </div>
        </div>

        {/* MAP CANVAS (6 Columns) */}
        <div className="lg:col-span-6 flex flex-col gap-2 relative">
          
          {/* MAP CANVAS PANEL CONTAINER */}
          <div 
            className="w-full h-[320px] sm:h-[450px] bg-sky-50 rounded-3xl border border-stone-200 overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            {/* GRIDLINE DECORATIONS */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:40px_40px] opacity-10 pointer-events-none"></div>
            
            {/* COMPASS ROSE overlay */}
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm border border-stone-100 p-2.5 rounded-full flex items-center justify-center text-stone-500 shadow-sm z-20 pointer-events-none">
              <Compass size={20} className="text-stone-600 animate-spin-slow" />
            </div>

            {/* LATITUDE & LONGITUDE MARKINGS */}
            <div className="absolute bottom-2 left-3 font-mono text-[8.5px] text-stone-400 bg-white/70 backdrop-blur-sm py-0.5 px-2 rounded-md pointer-events-none z-20">
              Map Reference: WGS84 • Brooksville, FL Grid
            </div>

            {/* ZOOM AND PAN CONTROLS */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-20">
              <button
                onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                className="w-8.5 h-8.5 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                className="w-8.5 h-8.5 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="w-8.5 h-8.5 bg-white border border-stone-200 text-stone-600 hover:text-stone-900 rounded-xl flex items-center justify-center transition shadow-sm hover:scale-105 cursor-pointer"
                title="Recenter Map"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            {/* DYNAMIC SCALE LEGEND */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm border border-stone-100 py-1.5 px-3 rounded-2xl flex flex-col gap-0.5 pointer-events-none z-20">
              <span className="text-[8.5px] font-bold text-stone-400 uppercase tracking-wide">Dynamic Scale</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1 w-10 bg-stone-700"></div>
                <span className="text-[9.5px] font-bold text-stone-700 leading-none">
                  {(5 / zoomLevel).toFixed(1)} miles
                </span>
              </div>
            </div>

            {/* INTERACTIVE VECTOR SVG WORLD */}
            <svg
              viewBox="0 0 800 500"
              className="absolute inset-0 w-full h-full select-none"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                transformOrigin: "center center",
                transition: isDragging ? "none" : "transform 0.15s ease-out"
              }}
            >
              <defs>
                <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#4a7ba7" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4a7ba7" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* BACKGROUND FOREST AREAS */}
              {/* Withlacoochee Forest representative shape right-side */}
              <path
                d="M 650 40 C 700 80, 750 60, 780 120 C 790 180, 750 250, 760 310 C 720 380, 710 420, 790 480 L 800 500 L 800 0 Z"
                fill="#f1f8e9"
                stroke="#dcedc8"
                strokeWidth="1.5"
                opacity="0.95"
              />
              <text x="710" y="150" fill="#a1b585" fontSize="11" fontWeight="700" letterSpacing="1.5" transform="rotate(15, 710, 150)" opacity="0.8">
                WITHLACOOCHEE FOREST
              </text>

              {/* Weeki Wachee Preserve area representations left-side */}
              <circle cx="50" cy="400" r="120" fill="#e0f2f1" opacity="0.6" />
              <text x="35" y="420" fill="#80cbc4" fontSize="10" fontWeight="700" opacity="0.8">
                PRESERVES
              </text>

              {/* ROUTE 50 / CORTEZ BOULEVARD (Primary East-West Highway road) */}
              <path
                d="M 10 280 C 150 280, 310 280, 480 280 C 550 280, 680 280, 790 280"
                fill="none"
                stroke="#fff"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M 10 280 C 150 280, 310 280, 480 280 C 550 280, 680 280, 790 280"
                fill="none"
                stroke="#ffb74d"
                strokeWidth="4"
                strokeLinecap="round"
              />
              
              {/* HIGHWAY 75 (North-South Right edge Interstate-75) */}
              <path
                d="M 720 10 L 720 200 C 720 250, 715 310, 730 380 L 750 490"
                fill="none"
                stroke="#fff"
                strokeWidth="8"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M 720 10 L 720 200 C 720 250, 715 310, 730 380 L 750 490"
                fill="none"
                stroke="#78909c"
                strokeWidth="5.5"
                strokeLinecap="round"
              />

              {/* ROUTE 41 / MAIN STREET (North-South Center road crossing) */}
              <path
                d="M 280 10 L 280 140 C 280 160, 290 190, 275 220 L 220 300 C 200 350, 160 410, 140 490"
                fill="none"
                stroke="#fff"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 280 10 L 280 140 C 280 160, 290 190, 275 220 L 220 300 C 200 350, 160 410, 140 490"
                fill="none"
                stroke="#b2dfdb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* SPRING LAKE HIGHWAY (Road on the bottom right) */}
              <path
                d="M 480 280 C 500 310, 580 330, 620 360 L 650 490"
                fill="none"
                stroke="#e0e0e0"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* ROAD LABELS */}
              <text x="140" y="272" fill="#78350f" fontSize="8" fontWeight="bold" opacity="0.8">
                CORTEZ BLVD (STATE RD 50)
              </text>
              <text x="635" y="272" fill="#78350f" fontSize="8" fontWeight="bold" opacity="0.8">
                STATE RD 50
              </text>
              <text x="286" y="60" fill="#374151" fontSize="8.5" fontWeight="bold" transform="rotate(90, 286, 60)" opacity="0.8">
                US HIGHWAY 41
              </text>
              <text x="704" y="100" fill="#374151" fontSize="9" fontWeight="bold" transform="rotate(95, 704, 100)" opacity="0.8">
                INTERSTATE I-75
              </text>
              <text x="540" y="325" fill="#555" fontSize="7.5" fontWeight="bold" opacity="0.75" transform="rotate(22, 540, 325)">
                SPRING LAKE HWY
              </text>

              {/* ACTIVE LANDMARK RIPPLE HALO UNDER GOLD LODGE AND OTHERS */}
              {LANDMARKS.map((l) => (
                <g key={`ripple-${l.id}`}>
                  {selectedId === l.id && (
                    <>
                      <circle
                        cx={l.x}
                        cy={l.y}
                        r="34"
                        fill="url(#ring-glow)"
                      />
                      <circle
                        cx={l.x}
                        cy={l.y}
                        r="14"
                        fill="none"
                        stroke="#4a7ba7"
                        strokeWidth="1"
                        opacity="0.8"
                        className="animate-ping"
                        style={{ transformOrigin: `${l.x}px ${l.y}px` }}
                      />
                    </>
                  )}
                </g>
              ))}

              {/* DRAW INTERACTIVE MAP PINS */}
              {LANDMARKS.map((l) => {
                const isSelected = selectedId === l.id;
                const isLodge = l.id === "lodge";
                return (
                  <g
                    key={`pin-${l.id}`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(l.id);
                    }}
                  >
                    {/* Shadow anchor */}
                    <ellipse cx={l.x} cy={l.y + 1.5} rx="5" ry="2" fill="#312e81" opacity="0.25" />
                    
                    {/* Pin Shape */}
                    <path
                      d={
                        isLodge
                          ? `M ${l.x} ${l.y} C ${l.x - 11} ${l.y - 11}, ${l.x - 11} ${l.y - 25}, ${l.x} ${l.y - 28} C ${l.x + 11} ${l.y - 25}, ${l.x + 11} ${l.y - 11}, ${l.x} ${l.y} Z`
                          : `M ${l.x} ${l.y} C ${l.x - 7.5} ${l.y - 7.5}, ${l.x - 7.5} ${l.y - 18}, ${l.x} ${l.y - 21} C ${l.x + 7.5} ${l.y - 18}, ${l.x + 7.5} ${l.y - 7.5}, ${l.x} ${l.y} Z`
                      }
                      fill={
                        isLodge
                          ? isSelected
                            ? "url(#moose-active-grad)"
                            : "#4a7ba7"
                          : isSelected
                            ? "#d4af37"
                            : "#212121"
                      }
                      stroke="#fff"
                      strokeWidth={isSelected ? "1.8" : "1"}
                      className="transition-transform duration-300 hover:scale-115"
                      style={{
                        transformOrigin: `${l.x}px ${l.y}px`
                      }}
                    />

                    {/* Pin center indicator */}
                    <circle
                      cx={l.x}
                      cy={isLodge ? l.y - 15 : l.y - 11.5}
                      r={isLodge ? "4" : "2.5"}
                      fill={isLodge ? "#d4af37" : "#fff"}
                    />

                    {/* Small tag box hover text overlay for context */}
                    <text
                      x={l.x}
                      y={l.y - (isLodge ? 34 : 26)}
                      textAnchor="middle"
                      fill={isSelected ? "#4a7ba7" : "#292524"}
                      fontSize={isLodge ? "10" : "8"}
                      fontWeight="bold"
                      className="transition-all"
                      opacity={isSelected ? "1" : "0.5"}
                    >
                      {isLodge ? "🦌 Lodge #1676" : l.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Gradient definitions */}
              <defs>
                <linearGradient id="moose-active-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4a7ba7" />
                  <stop offset="100%" stopColor="#3b658a" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          <div className="text-center font-sans text-[10.5px] text-stone-400 font-semibold uppercase tracking-wider">
            Drag map canvas to pan • Pinch-to-zoom / Use buttons to navigate
          </div>
        </div>

        {/* DETAILS SIDEBAR PANEL (3 Columns) */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-white rounded-3xl border border-stone-100 p-5 shadow-sm min-h-[350px]">
          
          <div className="space-y-4">
            
            {/* Image header banner */}
            <div className="h-28 w-full rounded-2xl overflow-hidden relative shadow-inner bg-stone-100">
              <img
                src={activeLandmark.imageUrl}
                alt={activeLandmark.name}
                className="w-full h-full object-cover select-none"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2.5 left-2.5">
                <span className="text-[8.5px] bg-black/75 backdrop-blur-sm text-yellow-400 font-extrabold uppercase px-2 py-0.5 rounded tracking-widest leading-none">
                  {activeLandmark.category}
                </span>
              </div>
            </div>

            {/* Landmark identity details */}
            <div className="space-y-1.5 animate-fade-in">
              <h3 className="font-extrabold text-[#4a7ba7] text-sm leading-tight">
                {activeLandmark.name}
              </h3>
              <p className="text-[11px] leading-relaxed text-stone-600 font-medium italic">
                "{activeLandmark.description}"
              </p>
              <div className="border-t border-stone-100 pt-2.5 text-xs text-stone-500 leading-relaxed max-h-36 overflow-y-auto">
                {activeLandmark.details}
              </div>
            </div>

            {/* Lodge proximity matrix */}
            {activeLandmark.id !== "lodge" ? (
              <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-stone-400 font-semibold uppercase">Lodge Distance</span>
                  <strong className="text-stone-800 font-mono flex items-center gap-1">
                    <Navigation size={10} className="text-[#4a7ba7]" /> {activeLandmark.distanceFromLodge}
                  </strong>
                </div>
                <div className="flex justify-between items-center text-[10.5px]">
                  <span className="text-stone-400 font-semibold uppercase">Estimated Drive</span>
                  <strong className="text-stone-800 font-mono">{activeLandmark.driveTime}</strong>
                </div>
              </div>
            ) : (
              <div className="bg-sky-50/60 border border-sky-100/60 p-3 rounded-2xl">
                <span className="text-[9.5px] text-[#4a7ba7] font-black uppercase tracking-wider block">Star Centerpoint</span>
                <p className="text-[10.5px] text-stone-600 leading-tight mt-1 font-medium">
                  All tourist coordinates, mileage distances, and drive times on this map are centered directly surrounding our Cortez Boulevard lodge quarters.
                </p>
              </div>
            )}

          </div>

          {/* Map actions button */}
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeLandmark.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#1c1917] hover:bg-[#4a7ba7] text-white text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm transition duration-300 flex justify-center items-center gap-1.5"
            >
              <MapPin size={11.5} className="text-[#d4af37]" />
              Get Directions ↗
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
