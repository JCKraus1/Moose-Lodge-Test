import React, { useState } from "react";
import { Search, User, Clock, ArrowLeft, Share2, Calendar, FileText } from "lucide-react";
import { NewsPost } from "../types.js";

interface NewsSectionProps {
  posts: NewsPost[];
}

type NewsCategory = "all" | "Lodge Update" | "Fundraising" | "Member Spotlight" | "Community Work" | "Scholarship" | "Women of Moose";

export default function NewsSection({ posts }: NewsSectionProps) {
  const [filter, setFilter] = useState<NewsCategory>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<NewsPost | null>(null);

  // Filter & search implementation
  const filteredPosts = posts.filter((post) => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || post.category === filter;

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const shareArticle = (post: NewsPost) => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert(`copied link for "${post.title}" to clipboard!`);
    }
  };

  // FULL STORY VIEW (READ MODE)
  if (selectedPost) {
    return (
      <div className="bg-[#fdfcfb] min-h-screen py-8 sm:py-16 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg border border-stone-100 overflow-hidden">
          
          {/* HEADER HERO AREA */}
          <div className="bg-[#4a7ba7] text-white p-6 sm:p-12 relative">
            <button 
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-1.5 text-[#d4af37] text-xs font-bold uppercase tracking-wider hover:underline bg-transparent border-none cursor-pointer mb-6"
            >
              <ArrowLeft size={14} /> Back to Lodge News
            </button>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-white/10 text-white px-3 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest">
                {selectedPost.category}
              </span>
              <span className="text-sky-200 text-xs flex items-center gap-1">
                <Clock size={12} /> {selectedPost.readTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4">
              {selectedPost.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-sky-100 border-t border-white/10 pt-4 mt-2">
              <span className="flex items-center gap-1">
                <User size={12} className="text-[#d4af37]" />
                By {selectedPost.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-[#d4af37]" />
                Published {formatDate(selectedPost.date)}
              </span>
            </div>
          </div>

          {/* MAIN ARTICLE BODY */}
          <div className="p-6 sm:p-12">
            {/* LARGE EMBLEM CALLOUT */}
            <div className="text-6xl text-center mb-8 bg-stone-50 w-20 h-20 flex items-center justify-center rounded-2xl mx-auto border border-stone-100">
              {selectedPost.emoji}
            </div>

            <p className="text-lg font-bold text-stone-900 leading-relaxed mb-6 border-l-4 border-[#4a7ba7] pl-4">
              {selectedPost.excerpt}
            </p>

            <div className="text-stone-600 text-sm sm:text-base leading-relaxed space-y-6 whitespace-pre-wrap font-sans">
              {selectedPost.content}
            </div>

            <div className="border-t border-stone-100 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs text-stone-400">
                Lodge Gazette • Loyal Order of Moose #1676
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => shareArticle(selectedPost)} 
                  className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-full text-xs font-bold transition uppercase cursor-pointer"
                >
                  <Share2 size={13} /> Share Link
                </button>
                <button 
                  onClick={() => setSelectedPost(null)} 
                  className="bg-[#4a7ba7] hover:bg-[#3b658a] text-white px-5 py-2 rounded-full text-xs font-bold transition uppercase cursor-pointer shadow-sm"
                >
                  All News articles
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // STANDARD NEWS ARCHIVE FEED LIST VIEW
  return (
    <div className="bg-[#fdfcfb] min-h-screen p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* PAGE TITLE */}
        <div className="text-center mb-10">
          <span className="text-[#4a7ba7] font-bold text-xs tracking-widest uppercase mb-1 block">
            Lodge Gazette • Brooksville #1676
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight mt-1 mb-3">
             Lodge News & Announcements
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Stay up-to-date with our volunteer achievements, dinner events, facility transformations, and outstanding spotlit members.
          </p>
        </div>

        {/* CONTROLS BAR */}
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-5 mb-8 flex flex-col lg:flex-row justify-between items-center gap-4">
          
          {/* SEARCH */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-3 text-stone-400" size={18} />
            <input 
              type="text" 
              placeholder="Search news & archives..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 focus:border-[#4a7ba7] focus:ring-1 focus:ring-[#7aabdb] outline-none text-stone-855 text-sm"
            />
          </div>

          {/* CATEGORIES */}
          <div className="flex flex-wrap gap-1.5 justify-center w-full lg:w-auto">
            {(["all", "Lodge Update", "Fundraising", "Member Spotlight", "Community Work", "Scholarship", "Women of Moose"] as NewsCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-wider uppercase transition cursor-pointer ${
                  filter === cat
                    ? "bg-[#4a7ba7] text-white shadow-sm"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                {cat === "all" ? "Show All" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* PRIMARY POST GRID */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-100 p-12 text-center shadow-sm">
            <FileText className="mx-auto text-stone-300 mb-2" size={42} />
            <h4 className="font-bold text-lg text-stone-900 mt-2">No announcements found</h4>
            <p className="text-stone-500 text-sm max-w-sm mx-auto">There are currently no posted items matching that description. Try clearing filters.</p>
            <button 
              onClick={() => { setFilter("all"); setSearchTerm(""); }} 
              className="mt-5 bg-[#4a7ba7] hover:bg-[#3b658a] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full shadow-sm"
            >
              Show All Posts
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <div 
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-3xl border border-stone-100 hover:border-[#4a7ba7] shadow-sm hover:shadow-md transition duration-200 cursor-pointer overflow-hidden flex flex-col justify-between transform hover:-translate-y-0.5"
              >
                {/* CARD UPPER: DYNAMIC COLOR HEADER BY CAT */}
                <div className="bg-gradient-to-r from-[#4a7ba7] to-[#3b658a] text-white p-5 h-20 flex justify-between items-center relative">
                  <span className="text-[10px] font-extrabold tracking-widest uppercase bg-white/15 text-white px-2.5 py-0.5 rounded-md">
                    {post.category}
                  </span>
                  <span className="text-2xl select-none">{post.emoji}</span>
                </div>

                {/* HEART CARD BODY */}
                <div className="p-6 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    <span className="text-xs text-stone-400 block mb-1">
                      {formatDate(post.date)}
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 leading-snug line-clamp-2 mb-2 hover:text-[#4a7ba7] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-stone-500 text-xs sm:text-sm line-clamp-3 leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="border-t border-stone-100 pt-4 flex justify-between items-center text-[11px] text-stone-400 font-medium">
                    <span className="truncate">By {post.author}</span>
                    <span className="bg-stone-50 text-stone-600 px-2.5 py-0.5 rounded-md shrink-0">
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
