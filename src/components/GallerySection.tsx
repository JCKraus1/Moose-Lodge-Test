import React, { useState } from "react";
import { Search, Image as ImageIcon, X, Calendar, Tag, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { GalleryPhoto } from "../types.js";

interface GallerySectionProps {
  photos: GalleryPhoto[];
}

type PhotoFilterType = "all" | "Events" | "Charity" | "Lodge Hall" | "Sports" | "Family";

export default function GallerySection({ photos }: GallerySectionProps) {
  const [filter, setFilter] = useState<PhotoFilterType>("all");
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  const filteredPhotos = photos.filter((photo) => {
    return filter === "all" || photo.category === filter;
  });

  const openLightbox = (photoId: string) => {
    const idx = filteredPhotos.findIndex(p => p.id === photoId);
    if (idx !== -1) {
      setActivePhotoIdx(idx);
    }
  };

  const nextPhoto = () => {
    if (activePhotoIdx !== null) {
      setActivePhotoIdx((activePhotoIdx + 1) % filteredPhotos.length);
    }
  };

  const prevPhoto = () => {
    if (activePhotoIdx !== null) {
      setActivePhotoIdx((activePhotoIdx - 1 + filteredPhotos.length) % filteredPhotos.length);
    }
  };

  const activePhoto = activePhotoIdx !== null ? filteredPhotos[activePhotoIdx] : null;

  return (
    <div className="bg-[#fdfcfb] min-h-screen p-6 sm:p-12 text-stone-800">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="text-center mb-10">
          <span className="text-[#4a7ba7] font-bold text-xs tracking-widest uppercase mb-1 block">
            Captured Memories & Fellowship
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mt-1 mb-3">
             Lodge Photo Gallery
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Take a visual tour of our life-affirming volunteer fundraisers, sports tournaments, and friendly community gather-ups at Brooksville Lodge 1676.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="bg-white border border-stone-100 shadow-sm rounded-3xl p-5 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-stone-400">
            <SlidersHorizontal size={16} className="text-[#4a7ba7]" />
            <span className="font-semibold uppercase tracking-wider text-xs">Filter Galleries:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {(["all", "Events", "Charity", "Lodge Hall", "Sports", "Family"] as PhotoFilterType[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
                  filter === cat
                    ? "bg-[#4a7ba7] text-white shadow-sm"
                    : "bg-stone-50 text-stone-600 hover:bg-stone-150 hover:text-stone-900"
                }`}
              >
                {cat === "all" ? "All Photos" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* IMAGE GRID */}
        {filteredPhotos.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-100 p-12 text-center text-stone-400 shadow-sm">
            <ImageIcon className="mx-auto text-stone-300 mb-2" size={40} />
            <h4 className="font-bold text-stone-900 mb-1">No photos in archive</h4>
            <p className="text-sm text-stone-500">There are currently no uploaded photos in this custom section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" id="photo-grid">
            {filteredPhotos.map((photo) => (
              <div 
                key={photo.id}
                onClick={() => openLightbox(photo.id)}
                className="group relative aspect-square bg-stone-100 rounded-3xl overflow-hidden border border-stone-100 hover:border-[#4a7ba7] transition duration-300 cursor-pointer shadow-sm transform hover:scale-[1.01]"
              >
                {/* Fallback Graphic placeholder behind */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 select-none bg-stone-50">
                  <span className="text-4xl mb-1">{photo.emojiPlaceholder || "📸"}</span>
                  <span className="text-[10px] text-stone-400 font-bold tracking-widest uppercase">Click to view</span>
                </div>

                {/* Main image */}
                <img 
                  src={photo.url} 
                  alt={photo.title}
                  className="w-full h-full object-cover relative z-10 transition duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Overlaid details on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex flex-col justify-end p-4">
                  <span className="text-[9px] bg-[#d4af37] text-[#1c1917] font-black uppercase px-2 py-0.5 rounded-md self-start mb-2 shadow">
                    {photo.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-tight truncate">
                    {photo.title}
                  </h4>
                  <span className="text-[10px] text-stone-300 mt-1 block">
                    {photo.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* LIGHTBOX MODAL */}
        {activePhoto && (
          <div className="fixed inset-0 bg-stone-950/95 z-50 flex items-center justify-center p-4">
            
            {/* CLOSE BUTTON */}
            <button 
              onClick={() => setActivePhotoIdx(null)}
              className="absolute right-4 top-4 bg-white/10 hover:bg-white/25 text-white rounded-full p-2.5 transition z-50 cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* PREV BUTTON */}
            <button 
              onClick={prevPhoto}
              className="absolute left-4 bg-white/5 hover:bg-white/15 text-white rounded-full p-3 transition z-55 cursor-pointer max-xs:hidden"
            >
              <ChevronLeft size={24} />
            </button>

            {/* MAIN IMAGE WORKSPACE */}
            <div className="max-w-4xl w-full max-h-[85vh] flex flex-col items-center justify-center relative z-40">
              <div className="relative overflow-hidden rounded-3xl bg-stone-900 border border-stone-800">
                
                {/* Fallback behind in light box */}
                <div className="absolute inset-x-0 top-36 text-center select-none z-0">
                  <span className="text-7xl block">{activePhoto.emojiPlaceholder || "🦌"}</span>
                  <span className="text-xs text-stone-500 uppercase font-black tracking-widest mt-2 block">Moose Lodge 1676</span>
                </div>

                <img 
                  src={activePhoto.url} 
                  alt={activePhoto.title}
                  className="max-h-[70vh] max-w-full relative z-10 object-contain mx-auto"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* OVERLAID TITLES UNDER CAPTION */}
              <div className="bg-stone-900/90 border border-stone-800 px-6 py-4 rounded-3xl max-w-xl w-full mt-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="bg-[#d4af37] text-stone-900 font-extrabold text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-md">
                    {activePhoto.category}
                  </span>
                  <span className="text-stone-400 font-semibold text-xs flex items-center gap-1">
                    <Calendar size={12} /> {activePhoto.date}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {activePhoto.title}
                </h3>
              </div>
            </div>

            {/* NEXT BUTTON */}
            <button 
              onClick={nextPhoto}
              className="absolute right-4 bg-white/5 hover:bg-white/15 text-white rounded-full p-3 transition z-55 cursor-pointer max-xs:hidden"
            >
              <ChevronRight size={24} />
            </button>
            
          </div>
        )}

      </div>
    </div>
  );
}
