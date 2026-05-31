import { CMSData } from './types.js';

export const INITIAL_CMS_DATA: CMSData = {
  events: [
    {
      id: "evt-1",
      title: "Famous Friday Night Fish Fry",
      description: "Join us for our legendary Fried or Baked Haddock, French Fries, Coleslaw, and Hushpuppies. Best fish in Hernando county! Full bar service available.",
      date: "2026-06-05",
      time: "17:00",
      category: "public",
      location: "Main Dining Hall",
      cost: "$12.50 per plate"
    },
    {
      id: "evt-2",
      title: "Women of the Moose Charity Raffle",
      description: "WOTM Chapter 1420 is hosting a charity basket raffle. Proceeds go toward purchasing school supplies for Brooksville schools. Door prizes and sweet treats provided.",
      date: "2026-06-09",
      time: "18:30",
      category: "wom",
      location: "Social Quarters",
      cost: "Free entrance (Tickets $1 each)"
    },
    {
      id: "evt-3",
      title: "Regular Lodge General Enrollment & Meeting",
      description: "Official lodge meeting for Loyal Order members in good standing. Enrollment of new candidates at 6:30 PM, general business meeting starts at 7:00 PM.",
      date: "2026-06-03",
      time: "19:00",
      category: "members",
      location: "Lodge Room",
      cost: "Members Only"
    },
    {
      id: "evt-4",
      title: "Sunday Country Breakfast Buffet",
      description: "All-you-can-eat breakfast! Scrambled eggs, bacon, sausage, biscuits & gravy, pancakes, hash Browns, coffee and juice. Open to the public, bring the whole family!",
      date: "2026-06-07",
      time: "09:00",
      category: "public",
      location: "Main Dining Hall",
      cost: "$10 Adults / $5 Kids"
    },
    {
      id: "evt-5",
      title: "Annual Moose Legion Blind Dart Tournament",
      description: "Moose Legion blind-draw dart tournament. Heavy appetizers served at break. Cash prizes for placing 1st, 2nd, and 3rd.",
      date: "2026-06-13",
      time: "15:00",
      category: "legion",
      location: "Recreation Area",
      cost: "$15 Buy-In"
    },
    {
      id: "evt-6",
      title: "Father's Day Backyard BBQ & Live Music",
      description: "Lodge-wide celebration honoring all fathers. Smoked ribs, pulled pork, baked beans, and potato salad. Live music on the patio by Southern Horizon.",
      date: "2026-06-21",
      time: "13:00",
      category: "fundraiser",
      location: "Outdoor Patio & Pavilion",
      cost: "$15 per person"
    },
    {
      id: "evt-7",
      title: "District 2 Moose Association Meeting",
      description: "Lodge #1676 is proud to host the District 2 regional meeting. Officers and representatives from 6 neighboring Florida lodges will convene.",
      date: "2026-06-27",
      time: "11:00",
      category: "members",
      location: "Lodge Room & Banquet Space",
      cost: "Preregistration required"
    },
    {
      id: "evt-8",
      title: "First Responders Appreciation Dinner",
      description: "Free dinner plate for any Hernando County Fire, EMT, Police or Sheriff deputy. Public welcome to attend to share their gratitude. Guest speaker at 7 PM.",
      date: "2026-07-02",
      time: "18:00",
      category: "public",
      location: "Social Quarters",
      cost: "$5 Guests / Free for First Responders"
    }
  ],
  posts: [
    {
      id: "post-1",
      title: "Brooksville Moose Lodge Raises $5,200 for local Head Start Programs",
      excerpt: "Thanks to the incredible turnout at our Spring Charity Golf Scramble, the Lodge has donated over five thousand dollars to Support pre-K education.",
      content: "We are thrilled to announce that our Annual Spring Charity Scramble held at Sherman Hills Golf Club was an absolute success! Generous local sponsors and over 80 participating golfers collectively raised $5,200.\n\nThis week, Lodge President Jim Thompson and WOTM Senior Regent Sandra Myers formally presented the check to the Hernando County Head Start Program director. These funds will provide learning supplies, playground books, and support parent engagement activities for over 150 local preschoolers.\n\nThank you to everyone who bought tee sponsors, donated raffle baskets, or spent their Saturday golfing with us. This is what the Moose is all about!",
      category: "Fundraising",
      date: "2026-05-28",
      author: "Sandra Myers, WOTM",
      emoji: "⛳",
      readTime: "3 min read"
    },
    {
      id: "post-2",
      title: "Spotlight: Honoring Brother Fred Miller’s 50 Years of Faithful Service",
      excerpt: "Fred Miller was presented with his Golden Lifetime Membership card at a surprise ceremony, highlighting his remarkable contributions since 1976.",
      content: "It isn't every day that we celebrate a Golden Anniversary within our lodge wall. Last Wednesday, the officers and members of Brooksville Lodge #1676 had the supreme honor of presenting Brother Fred Miller with his 50-Year Member pin and Golden Lifetime Membership badge.\n\nFred originally joined the Loyal Order of Moose in May of 1976. Since then, he has served as Lodge Governor twice, on the Board of Trustees for a combined 12 years, and has cooked thousands of pounds of fresh haddock for our Friday Fish Fry.\n\nMembers shared funny stories, toasted in his honor, and enjoyed a wonderful sheet cake. When asked what kept him active for half a century, Fred smiled and said: 'The Moose heart is about community. If you give a little of your time, it pays you back tenfold in brotherhood.' Congratulations Fred!",
      category: "Member Spotlight",
      date: "2026-05-20",
      author: "Jim Thompson, Lodge President",
      emoji: "🏆",
      readTime: "4 min read"
    },
    {
      id: "post-3",
      title: "Dining Hall Improvements: Beautiful New Booth Seating Installed",
      excerpt: "Phase 2 of the Social Quarters facelift is complete. Come check out the new high-back leather booths and freshly painted walls.",
      content: "The Lodge Board of Trustees is excited to report that our interior refreshing projects are fully on schedule. This past weekend, a hardworking team of lodge volunteers packed up the old worn-out tables and installed eight brand-new, comfortable high-back leather booth seating units around the tavern walls.\n\nIn addition to the new seating, we have freshly painted the dining area in our classic warm cream color, and updated the light fixtures with warm, energy-efficient Edison bulb LEDs.\n\n'This gives our Social Quarters a much more premium, family-friendly diner feel,' noted Lodge Administrator Rick Peterson. A huge shoutout to the volunteer carpentry crew: Mike, Dan, Gary, and Terry, who donated over 30 hours of labor to complete the installation!",
      category: "Lodge Update",
      date: "2026-05-12",
      author: "Rick Peterson, Administrator",
      emoji: "🔨",
      readTime: "2 min read"
    },
    {
      id: "post-4",
      title: "Scholarship Foundation Announces 2026 Hernando High Recipients",
      excerpt: "Congratulations to Sarah Jenkins and Thomas Alvarez, who each won a $1,500 lodge academic scholarship to assist with college tuition.",
      content: "The Brooksville Moose Lodge #1676 is proud to continue its decades-long commitment to local youth. Our education committee reviewed dozens of outstanding applications this year from high schools across Hernando County.\n\nWe are pleased to announce the winners of our 2026 Academic Scholarships:\n- Sarah Jenkins (Hernando High School) – Matriculating at University of Florida for pre-Veterinary studies.\n- Thomas Alvarez (Nature Coast Technical High) – Matriculating at Pasco-Hernando State College for Business Administration.\n\nBoth students have shown exceptional academic grades, active community service hours, and a high degree of character. The scholarships are funded entirely by our weekly Wednesday Queen of Hearts raffle tickets and special donation jars. Thank you for continuing to support our youth!",
      category: "Scholarship",
      date: "2026-05-01",
      author: "William Harrison, Prelate",
      emoji: "🎓",
      readTime: "3 min read"
    }
  ],
  photos: [
    { id: "p-1", url: "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=600", title: "Lodge Volunteers cooking Friday Fish Fry", category: "Events", date: "2026-05-22", emojiPlaceholder: "🐟" },
    { id: "p-2", url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=600", title: "Moose Charity Golf Scramble check presentation", category: "Charity", date: "2026-05-18", emojiPlaceholder: "⛳" },
    { id: "p-3", url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=600", title: "Women of the Moose holiday donation drive", category: "Charity", date: "2026-04-12", emojiPlaceholder: "🎒" },
    { id: "p-4", url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=600", title: "Lodge social quarters community dinner", category: "Events", date: "2026-05-02", emojiPlaceholder: "🥩" },
    { id: "p-5", url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=600", title: "The newly renovated Social Quarters seating", category: "Lodge Hall", date: "2026-05-10", emojiPlaceholder: "🔨" },
    { id: "p-6", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600", title: "Joint picnic with neighboring lodges", category: "Family", date: "2026-04-20", emojiPlaceholder: "☀️" },
    { id: "p-7", url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=600", title: "Karaoke night fun in Hernando social hall", category: "Events", date: "2026-05-15", emojiPlaceholder: "🎤" },
    { id: "p-8", url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600", title: "Weekly Blind Dart tournament winners", category: "Sports", date: "2026-04-25", emojiPlaceholder: "🎯" }
  ],
  officers: [
    { id: "off-1", title: "Lodge President (President)", name: "James 'Jim' Thompson" },
    { id: "off-2", title: "Junior Past President", name: "Richard 'Rick' Peterson" },
    { id: "off-3", title: "Vice President", name: "Robert 'Bob' Davis" },
    { id: "off-4", title: "Lodge Prelate (Chaplain)", name: "William 'Bill' Harrison" },
    { id: "off-5", title: "Treasurer", name: "Thomas 'Tom' Miller" },
    { id: "off-6", title: "One-Year Trustee", name: "Charles 'Charlie' Jenkins" },
    { id: "off-7", title: "Two-Year Trustee", name: "Gary Higgins" },
    { id: "off-8", title: "Three-Year Trustee", name: "Terry McDaniel" },
    { id: "off-9", title: "WOTM Senior Regent", name: "Sandra Myers" },
    { id: "off-10", title: "Lodge Administrator", name: "Michael Vance", email: "admin@brooksvillemoose1676.org", phone: "(352) 796-0550" }
  ],
  settings: {
    lodgeNumber: "1676",
    phone: "(352) 796-0550",
    email: "info@brooksvillemoose1676.org",
    address: "17129 Cortez Blvd, Brooksville, FL 34601",
    alertBannerText: "🎟️ QUEEN OF HEARTS jackpot is at $15,600! Dinner starts Friday at 5:00 PM. Draw is at 8:00 PM.",
    alertBannerLink: "events",
    barHours: {
      mon_thu: "12:00 PM - 10:00 PM",
      fri: "11:00 AM - Midnight",
      sat: "11:00 AM - Midnight",
      sun: "11:00 AM - 9:00 PM"
    },
    kitchenHours: {
      mon_thu: "4:00 PM - 9:00 PM",
      fri: "11:30 AM - 10:00 PM",
      sat: "11:30 AM - 9:00 PM",
      sun: "9:00 AM - 3:00 PM"
    }
  },
  applications: [
    {
      id: "app-1",
      fullName: "David K. Vance",
      email: "david.vance@gmail.com",
      phone: "(352) 555-4819",
      address: "2418 Broad St, Brooksville, FL 34601",
      occupation: "Construction Manager (Vance Carpentry)",
      spouseName: "Evelyn Vance",
      interestInMoose: "I am interested in local charity events, helping with lodge maintenance, and attending fish fry dinners with my family.",
      status: "pending",
      dateSubmitted: "2026-05-30"
    }
  ],
  rentals: [
    {
      id: "rent-1",
      fullName: "Patricia Higgins",
      email: "pathig@verizon.net",
      phone: "(352) 555-8912",
      eventDate: "2026-08-15",
      eventType: "50th Wedding Anniversary",
      guestsCount: 120,
      durationHours: 6,
      wantsKitchen: true,
      wantsBar: true,
      estimatedPrice: 650,
      status: "pending",
      dateSubmitted: "2026-05-29",
      notes: "We will require tables for buffet serving, stage for a DJ, and seating for 120. Would love to tour the hall."
    }
  ],
  users: [
    {
      id: "usr-1",
      username: "admin",
      passwordHash: "adminpassword1676",
      role: "admin",
      fullName: "James Thompson (President)",
      allowedSections: ["rentals", "memberships", "settings", "events", "posts", "photos", "users"]
    },
    {
      id: "usr-2",
      username: "staff",
      passwordHash: "staffpassword1676",
      role: "staff",
      fullName: "Lodge Reporter",
      allowedSections: ["events", "posts", "photos"]
    }
  ],
  meetingMinutes: [
    {
      id: "min-1",
      title: "General Member Enrollment & Budget Review Meeting",
      date: "2026-05-15",
      content: "The monthly general membership meeting was called to order at 7:00 PM by President Jim Thompson. The prelate delivered the opening prayer. Minutes from the previous meeting on April 15th were read and approved as read. Treasurer Tom Miller presented the monthly financial position, noting an increase in Friday Night Fish Fry revenues. WOTM Regent Myers reported on the upcoming charity basket raffle progress. A motion was made, seconded and carried to approve a $2,200 expenditure for kitchen appliance repairs. The meeting was adjourned in harmony at 8:15 PM.",
      approvedBy: "William Harrison, Prelate & Acting Sec."
    },
    {
      id: "min-2",
      title: "Lodge Officers Planning Conclave",
      date: "2026-05-01",
      content: "Lodge #1676 board of officers convened for a strategic session regarding Hernando county community outreach programs. Discussion focused on the 2026 Scholarship program awardees, scheduling conflicts with District 2 regional meeting, and a proposal to upgrade the dining hall seating. The board approved the allocation of matching funds for the First Responders appreciation dinner scheduled for July.",
      approvedBy: "James Thompson, President"
    }
  ],
  financials: [
    {
      id: "fin-1",
      title: "Q2 Monthly Operating Statement (May 2026)",
      date: "2026-05-31",
      revenue: 14580,
      expenses: 11250,
      netIncome: 3330,
      unrestrictedFunds: 24700,
      notes: "May 2026 performance exceeded initial estimates. Tavern bar receipts were up by 15% year-over-year. Kitchen operation break-even was achieved. Higher-than-expected ticket purchases for the Country Breakfast Buffet contributed significantly to the cash position. Cash balance includes reserves earmarked for the ballroom booth seat replacements."
    },
    {
      id: "fin-2",
      title: "Quarterly Audit Report (Q1 2026)",
      date: "2026-04-15",
      revenue: 41200,
      expenses: 38400,
      netIncome: 2800,
      unrestrictedFunds: 21370,
      notes: "Lodge trustees completed the quarterly audit of all physical receipt books and bank accounts. Discrepancies were nil. Recommendations: transition the physical guest sign-in log to digital registers to accurately document non-member beverage surcharges under state tax guidelines."
    }
  ],
  customEventCategories: ["public", "members", "fundraiser", "wom", "legion"],
  customPhotoCategories: ["Events", "Charity", "Lodge Hall", "Sports", "Family"],
  customNewsCategories: ["Lodge Update", "Fundraising", "Member Spotlight", "Community Work", "Scholarship", "Women of Moose"]
};
