import React, { useState, useEffect } from "react";
import { DollarSign, ShieldAlert, BadgeCheck, Phone, Check, Mail, Trash, Send, Plus } from "lucide-react";
import { HallRentalInquiry, LodgeSettings } from "../types.js";

interface HallRentalSectionProps {
  settings?: LodgeSettings;
  onSubmitInquiry: (inquiry: Omit<HallRentalInquiry, "id" | "status" | "dateSubmitted">) => Promise<boolean>;
}

export default function HallRentalSection({ settings, onSubmitInquiry }: HallRentalSectionProps) {
  // Calculator Variables
  const [hours, setHours] = useState(4);
  const [guests, setGuests] = useState(80);
  const [kitchen, setKitchen] = useState(false);
  const [bar, setBar] = useState(false);

  // Computed Estimates
  const [priceEstimate, setPriceEstimate] = useState(0);

  // Form Submission Variables
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("Wedding Reception");
  const [notes, setNotes] = useState("");
  
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Rate Schedule
  const BASE_HOURLY_RATE = settings?.rentalBaseHourlyRate ?? 75; // $75 per hour
  const LARGE_EVENT_SURCHARGE = settings?.rentalLargeEventSurcharge ?? 100; // if over 100 guests
  const KITCHEN_FLAT_FEE = settings?.rentalKitchenFlatFee ?? 125;
  const BAR_STAFFING_FEE = settings?.rentalBarStaffingFee ?? 150;

  // recalculate price
  useEffect(() => {
    let price = hours * BASE_HOURLY_RATE;
    if (guests > 100) {
      price += LARGE_EVENT_SURCHARGE;
    }
    if (kitchen) {
      price += KITCHEN_FLAT_FEE;
    }
    if (bar) {
      price += BAR_STAFFING_FEE;
    }
    setPriceEstimate(price);
  }, [hours, guests, kitchen, bar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    if (!name || !email || !phone || !date) {
      setErrorMsg("Please fill out all required contact fields (Name, Email, Phone, and Date) to secure your calculation.");
      setSubmitting(false);
      return;
    }

    // Prepare payload matching Omit<HallRentalInquiry, "id" | "status" | "dateSubmitted">
    const inquiryPayload = {
      fullName: name,
      email: email,
      phone: phone,
      eventDate: date,
      eventType: type,
      guestsCount: Number(guests),
      durationHours: Number(hours),
      wantsKitchen: kitchen,
      wantsBar: bar,
      estimatedPrice: priceEstimate,
      notes: notes
    };

    try {
      const ok = await onSubmitInquiry(inquiryPayload);
      if (ok) {
        setSubmitSuccess(true);
        // Clear forms
        setName("");
        setEmail("");
        setPhone("");
        setDate("");
        setNotes("");
      } else {
        setErrorMsg("Failed to connect to the Lodge database server. Our administrator can be reached directly at (352) 796-0550.");
      }
    } catch (err) {
      setErrorMsg("An unexpected system exception occurred during transmission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fdfcfb] min-h-screen p-6 sm:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* HERO HEADER */}
        <div className="text-center mb-12">
          <span className="text-[#4a7ba7] font-bold text-xs tracking-widest uppercase mb-1 block">
            Banquet Hall & Event space Rentals
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-stone-900 tracking-tight">
             Lodge Hall Rental Estimator
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm sm:text-base leading-relaxed mt-3">
            Host your wedding receptions, retirement dinners, family reunions, workshops, and business banquets in our clean, spacious air-conditioned hall! 
          </p>
        </div>

        {/* CALCULATOR GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SLIDERS CONFIG (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 shadow-sm">
            <h3 className="font-bold text-lg text-stone-900 border-b border-stone-150 pb-3 mb-6 flex items-center gap-2">
              📊 Adjust Rental Requirements
            </h3>

            <div className="space-y-6">
              {/* Event Duration Hours */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Event Duration</span>
                  <strong className="text-sm font-black text-[#4a7ba7]">{hours} Hours</strong>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="12" 
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-[#4a7ba7] outline-none"
                />
                <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                  <span>Minimum: 2 hrs</span>
                  <span>Maximum: 12 hrs</span>
                </div>
              </div>

              {/* Guest Count */}
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Expected Guest Count</span>
                  <strong className="text-sm font-black text-[#4a7ba7]">{guests} Attendees</strong>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="180" 
                  step="5"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full h-2 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-[#4a7ba7] outline-none"
                />
                <div className="flex justify-between text-[11px] text-stone-400 mt-1">
                  <span>Capacity: 10 guests</span>
                  <span>Max Limit: 180 guests</span>
                </div>
              </div>

              {/* Add-ons checkboxes */}
              <div className="bg-stone-50 border border-stone-100 rounded-3xl p-5 mt-6">
                <span className="text-xs font-semibold text-stone-550 uppercase tracking-wider block mb-3">Facility Add-Ons & Services</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Kitchen Access */}
                  <label className="flex items-center gap-3 bg-white border border-stone-200/60 p-3 rounded-2xl cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={kitchen}
                      onChange={(e) => setKitchen(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#4a7ba7] focus:ring-[#7aabdb] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-850 block">Full Kitchen Access</span>
                      <span className="text-[10px] text-stone-400 font-medium">+${KITCHEN_FLAT_FEE} flat prep surcharge</span>
                    </div>
                  </label>

                  {/* Professional Bartender */}
                  <label className="flex items-center gap-3 bg-white border border-stone-200/60 p-3 rounded-2xl cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={bar}
                      onChange={(e) => setBar(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#4a7ba7] focus:ring-[#7aabdb] cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-stone-850 block">Professional Bartender</span>
                      <span className="text-[10px] text-stone-400 font-medium">+${BAR_STAFFING_FEE} flat staffing fee</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* RATE INFORMATION ACCORDION */}
              <div className="text-[11px] text-stone-400 leading-relaxed space-y-1 mt-4">
                <p>💡 <strong>Rate Schedule Details:</strong> Base hourly rate includes full banquet tables, padded chairs, climate control, stage setups, and trash cleanup. Surcharges apply if guests exceed 100 due to public health and safety capacities.</p>
              </div>

            </div>
          </div>

          {/* RIGHT: COST BREAKDOWN & INQUIRY FORM (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* INVOICE CARD */}
            <div className="bg-[#4a7ba7] text-white rounded-3xl p-6 sm:p-8 shadow-sm border-t-4 border-[#d4af37]">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] mb-2">Estimate Invoice</h4>
              <h3 className="font-sans font-black text-2xl tracking-tight text-white mb-4">Calculated Quote</h3>
              
              <div className="space-y-3 font-mono text-xs text-sky-100 border-b border-white/10 pb-4 mb-4">
                <div className="flex justify-between">
                  <span>Base Rate ({hours} hrs @ ${BASE_HOURLY_RATE}/hr):</span>
                  <span className="text-white">${hours * BASE_HOURLY_RATE}</span>
                </div>
                {guests > 100 && (
                  <div className="flex justify-between text-[#d4af37]">
                    <span>Surcharge (&gt;100 guests):</span>
                    <span>+${LARGE_EVENT_SURCHARGE}</span>
                  </div>
                )}
                {kitchen && (
                  <div className="flex justify-between">
                    <span>Kitchen Surcharge:</span>
                    <span className="text-white">+${KITCHEN_FLAT_FEE}</span>
                  </div>
                )}
                {bar && (
                  <div className="flex justify-between">
                    <span>Lodge Bartender Fee:</span>
                    <span className="text-white">+${BAR_STAFFING_FEE}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-sky-200 font-bold uppercase tracking-wider">Estimated Total</span>
                <span className="text-[#d4af37] font-bold text-4xl font-sans tracking-tight">
                  ${priceEstimate}
                </span>
              </div>
            </div>

            {/* SEND INQUIRY FORM */}
            <div className="bg-white rounded-3xl border border-stone-100 p-6 sm:p-8 shadow-sm">
              <h3 className="font-bold text-sm sm:text-base text-stone-900 mb-4 uppercase tracking-wider border-b border-stone-100 pb-2">
                ✉ Submit Rental Inquiry
              </h3>

              {submitSuccess ? (
                <div className="bg-stone-50 border-l-4 border-emerald-550 rounded-2xl p-5 text-center text-stone-700">
                  <BadgeCheck size={36} className="text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-stone-900 mb-1">Inquiry Transmitted!</h4>
                  <p className="text-xs text-stone-500">Your booking inquiry has been recorded in our CMS databases. The Hall Manager will review date availability and call or email you back soon.</p>
                  <button 
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-4 bg-[#4a7ba7] hover:bg-[#3b658a] text-white text-xs font-bold uppercase py-2 px-5 rounded-full transition shadow-sm"
                  >
                    Estimate Another Event
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {errorMsg && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-900 text-xs p-3 rounded-md">
                      ⚠️ {errorMsg}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="text-[10.5px] font-bold uppercase text-stone-400 block mb-1">Your Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Richard Johnson"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                    />
                  </div>

                  {/* Mail and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10.5px] font-bold uppercase text-stone-400 block mb-1">Email Coordinates *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="e.g. rich@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold uppercase text-stone-400 block mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="(352) 555-0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                      />
                    </div>
                  </div>

                  {/* Date and Type */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10.5px] font-bold uppercase text-stone-400 block mb-1">Preferred Date *</label>
                      <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full text-xs p-3 rounded-full border border-stone-200 outline-none focus:border-[#4a7ba7]"
                      />
                    </div>
                    <div>
                      <label className="text-[10.5px] font-bold uppercase text-stone-400 block mb-1">Event Category *</label>
                      <select 
                        required
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full text-xs px-3 bg-white rounded-full border border-stone-200 h-10 outline-none focus:border-[#4a7ba7] appearance-none"
                      >
                        <option value="Wedding Reception">Wedding Rec.</option>
                        <option value="Birthday Bash">Birthday Bash</option>
                        <option value="Anniversary Party">Anniversary Party</option>
                        <option value="Retirement Celebration">Retirement</option>
                        <option value="Business Workshop">Business Workshop</option>
                        <option value="Charity Fundraiser">Charity Dinner</option>
                        <option value="Local Club Meeting">Club Meeting</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-[10.5px] font-bold uppercase text-stone-400 block mb-1">Special requests or catering notes</label>
                    <textarea 
                      placeholder="e.g. We will require DJ sound system, bar open for 4 hours, and setting tables for guest cards."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-3 rounded-2xl border border-stone-200 outline-none focus:border-[#4a7ba7] font-sans"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#4a7ba7] hover:bg-[#3b658a] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-full flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    {submitting ? (
                      "Saving Inquiry..."
                    ) : (
                      <>
                        <Send size={12} /> Send Booking Request
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
