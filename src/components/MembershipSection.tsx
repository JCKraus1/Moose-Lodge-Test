import React, { useState } from "react";
import { BadgeCheck, Heart, Users, ShieldAlert, Award, FileSpreadsheet, ArrowRight, CornerDownRight, CheckCircle2 } from "lucide-react";
import { MembershipApplication } from "../types.js";

interface MembershipSectionProps {
  onSubmitApplication: (appData: Omit<MembershipApplication, "id" | "status" | "dateSubmitted">) => Promise<boolean>;
}

export default function MembershipSection({ onSubmitApplication }: MembershipSectionProps) {
  // Candidate form inputs
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [spouse, setSpouse] = useState("");
  const [occupation, setOccupation] = useState("");
  const [motivation, setMotivation] = useState("charity");
  const [customBrief, setCustomBrief] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    setSubmitting(true);

    if (!fullname || !email || !phone || !address) {
      setErrMsg("Please complete all fundamental contact details (Name, Email, Phone, Address).");
      setSubmitting(false);
      return;
    }

    const payload = {
      fullName: fullname,
      email: email,
      phone: phone,
      address: address,
      spouseName: spouse || undefined,
      occupation: occupation || undefined,
      interestInMoose: motivation === "other" ? customBrief : `Focus: ${motivation}. Motivation summary: ${customBrief || "Eager to get active with lodge volunteer committees and charitable fundraisers."}`
    };

    try {
      const ok = await onSubmitApplication(payload);
      if (ok) {
        setSuccess(true);
        // Clear state
        setFullname("");
        setEmail("");
        setPhone("");
        setAddress("");
        setSpouse("");
        setOccupation("");
        setCustomBrief("");
      } else {
        setErrMsg("Could not relay application candidate payload. The database server reported an unexpected connection refusal.");
      }
    } catch (err) {
      setErrMsg("An unhandled script exception occurred. Please verify your internet connection.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fdfcfb] min-h-screen p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* TOP INTRO */}
        <div className="text-center mb-12">
          <span className="text-[#4a7ba7] font-bold text-xs tracking-widest uppercase mb-1 block">
            Progressive Fraternal Brotherhood
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
             Moose Member Enrollment
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mt-3">
            Join 1.6 million men and women across North America dedicated to volunteer endeavors, warm social brotherhood, and supporting children & senior citizens.
          </p>
        </div>

        {/* FRATERNAL VALUES COLUMN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Mooseheart */}
          <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm hover:border-[#4a7ba7] hover:-translate-y-0.5 transition duration-200">
            <div className="bg-sky-50 text-[#4a7ba7] w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-sky-100">
              <Heart size={22} />
            </div>
            <h4 className="font-bold text-stone-900 text-lg mb-2">Mooseheart Child City</h4>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Our 1,000-acre residential campus near Chicago offers a safe, loving family home and vocational education for children and teens in need, helping them grow into successful adults.
            </p>
          </div>

          {/* Card 2: Moosehaven */}
          <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm hover:border-[#4a7ba7] hover:-translate-y-0.5 transition duration-200">
            <div className="bg-stone-50 text-[#d4af37] w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-stone-150">
              <Award size={22} />
            </div>
            <h4 className="font-bold text-stone-900 text-lg mb-2">Moosehaven Senior Center</h4>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Located on the St. Johns River in Florida, Moosehaven provides senior members with comfortable retirement facilities, secure medical attention, and full community care services at no cost.
            </p>
          </div>

          {/* Card 3: Local Brotherhood */}
          <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm hover:border-[#4a7ba7] hover:-translate-y-0.5 transition duration-200">
            <div className="bg-stone-50 text-stone-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-stone-150">
              <Users size={22} />
            </div>
            <h4 className="font-bold text-stone-900 text-lg mb-2">Lodge Social Life</h4>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Lodge #1676 is a warm hub featuring Friday dinners, pool & dart tournaments, clean hall spaces, karaoke, and joint local charity projects. Meet great lifelong friends!
            </p>
          </div>

        </div>

        {/* FORM CONTAINER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* THE STEPS & RECRUITING BROCHURE (5 Columns) */}
          <div className="lg:col-span-5 bg-[#4a7ba7] text-white rounded-3xl p-6 sm:p-8 border-l-4 border-[#d4af37]">
            <h4 className="text-[10px] text-[#d4af37] tracking-widest uppercase font-bold mb-1">Induction Protocol</h4>
            <h3 className="font-bold text-xl sm:text-2xl text-white tracking-tight mb-4">How Joining Works</h3>
            
            <div className="space-y-6">
              
              <div className="flex gap-3">
                <div className="bg-white/10 w-7 h-7 shrink-0 text-[#d4af37] rounded-full flex items-center justify-center text-xs font-black">
                  1
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#d4af37]">Submit candidate inquiry</h5>
                  <p className="text-[11px] text-sky-100 leading-relaxed mt-0.5">Complement this digital induction application. It goes straight to our Lodge Admission logs for vetting.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-white/10 w-7 h-7 shrink-0 text-[#d4af37] rounded-full flex items-center justify-center text-xs font-black">
                  2
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#d4af37]">Sponsor nomination match</h5>
                  <p className="text-[11px] text-sky-100 leading-relaxed mt-0.5">All new candidates require a sponsor in good standing. If you do not have one, we will introduce you to an officer to sponsor your candidature.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-white/10 w-7 h-7 shrink-0 text-[#d4af37] rounded-full flex items-center justify-center text-xs font-black">
                  3
                </div>
                <div>
                  <h5 className="text-sm font-bold text-[#d4af37]">Admission fee & annual dues</h5>
                  <p className="text-[11px] text-sky-100 leading-relaxed mt-0.5">Once approved, our standard dues are approximately $55 (Loyal Order) or $45 (Women of the Moose) annually, helping sustain our non-profit community services.</p>
                </div>
              </div>

            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-8 flex items-start gap-3 text-xs text-sky-200">
              <span className="text-[#d4af37] text-xl">ℹ️</span>
              <p>Brooksville Moose Lodge #1676 is an authorized 501(c)(8) non-profit fraternal organization registered in Brooksville, Florida. We follow the supreme charter of Moose International.</p>
            </div>
          </div>

          {/* APPLICATION FORM BLOCK (7 Columns) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 shadow-sm">
            <h3 className="font-bold text-lg text-stone-900 border-b border-stone-100 pb-3 mb-6 flex items-center gap-2">
              📋 Lodge #1676 Digital Enrollment Card
            </h3>

            {success ? (
              <div className="bg-stone-50 border-l-4 border-emerald-550 rounded-2xl p-8 text-center text-stone-700">
                <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-lg text-stone-900 mb-1">Candidate Record Saved!</h4>
                <p className="text-xs text-stone-550">Congratulations, your digital candidate card has been logged into the Brooksville Moose Lodge Database. An officer will review your card and contact you within 5 days.</p>
                <div className="bg-white rounded-2xl p-4 text-left border border-stone-150 text-[11px] text-stone-500 mt-4 leading-relaxed">
                  📢 <strong>Next Steps:</strong> You are warmly invited to drop by the lodge at 17129 Cortez Blvd during open hours and tell the bartender you submitted an application online!
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="mt-6 bg-[#4a7ba7] hover:bg-[#3b658a] text-white text-xs font-bold uppercase py-2.5 px-6 rounded-full transition cursor-pointer shadow-sm"
                >
                  Apply For Another Family Member
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                
                {errMsg && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-900 text-xs p-3 rounded-md">
                    ⚠️ {errMsg}
                  </div>
                )}

                {/* Candidate name */}
                <div>
                  <label className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">Full Candidate Name *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Sandra Lee Henderson"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">Your Email Address *</label>
                    <input 
                      type="email"
                      required
                      placeholder="e.g. sandra@yahoo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">Mobile Phone *</label>
                    <input 
                      type="tel"
                      required
                      placeholder="e.g. (352) 555-1234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                    />
                  </div>
                </div>

                {/* Physical address */}
                <div>
                  <label className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">Physical Address *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 159 Jasmine Dr, Brooksville, FL 34601"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full text-xs p-3 rounded-full border border-stone-100/10 outline-none focus:border-[#4a7ba7]"
                  />
                </div>

                {/* Optional items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10.5px] font-semibold text-stone-400 uppercase block mb-1">Spouse Name (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Frederick Henderson"
                      value={spouse}
                      onChange={(e) => setSpouse(e.target.value)}
                      className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                    />
                  </div>
                  <div>
                    <label className="text-[10.5px] font-semibold text-stone-400 uppercase block mb-1">Occupation (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Retired Elementary Teacher"
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                    />
                  </div>
                </div>

                {/* Motivation Select */}
                <div>
                  <label className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">Core recruitment interest?</label>
                  <select 
                    value={motivation} 
                    onChange={(e) => setMotivation(e.target.value)}
                    className="w-full text-xs px-3 bg-white rounded-full border border-stone-200 h-10 outline-none focus:border-[#4a7ba7] appearance-none"
                  >
                    <option value="charity">Supporting Child Care (Mooseheart) & Senior Care (Moosehaven)</option>
                    <option value="local-benefit">Volunteering for local Hernando County youth and family food drives</option>
                    <option value="fraternal">Participating in local social quarters (Fish fry, Dart leagues, Pool)</option>
                    <option value="other">Other reasons / Fraternal family tradition</option>
                  </select>
                </div>

                {/* Custom motivation */}
                <div>
                  <label className="text-[10.5px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">Candidate motivation brief</label>
                  <textarea 
                    value={customBrief}
                    onChange={(e) => setCustomBrief(e.target.value)}
                    placeholder="Briefly tell us why you'd like to join our lodge family..."
                    rows={3}
                    className="w-full text-xs p-3 rounded-2xl border border-stone-200 outline-none focus:border-[#4a7ba7] font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-full shadow-sm transition cursor-pointer mt-4"
                >
                  {submitting ? "relaying Candidate Card..." : "Send Candidate Induction Request"}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
