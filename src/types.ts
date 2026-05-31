/**
 * Types for the Brooksville Moose Lodge 1676 CMS
 */

export interface LodgeEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  category: string; // relaxed from 'public' | 'members'... to allow custom ones
  location?: string;
  cost?: string;
}

export interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string; // relaxed to allow custom categories
  date: string; // YYYY-MM-DD
  author: string;
  emoji: string;
  readTime: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  title: string;
  category: string; // relaxed to allow custom categories
  date: string;
  emojiPlaceholder?: string;
}

export interface Officer {
  id: string;
  title: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface LodgeSettings {
  lodgeNumber: string;
  phone: string;
  email: string;
  address: string;
  alertBannerText: string;
  alertBannerLink: string;
  barHours: {
    mon_thu: string;
    fri: string;
    sat: string;
    sun: string;
  };
  kitchenHours: {
    mon_thu: string;
    fri: string;
    sat: string;
    sun: string;
  };
  rentalBaseHourlyRate?: number;
  rentalLargeEventSurcharge?: number;
  rentalKitchenFlatFee?: number;
  rentalBarStaffingFee?: number;
}

export interface MembershipApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  spouseName?: string;
  occupation?: string;
  interestInMoose: string;
  status: 'pending' | 'reviewed' | 'approved' | 'archived';
  dateSubmitted: string;
}

export interface HallRentalInquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventType: string;
  guestsCount: number;
  durationHours: number;
  wantsKitchen: boolean;
  wantsBar: boolean;
  estimatedPrice: number;
  status: 'pending' | 'contacted' | 'booked' | 'declined';
  dateSubmitted: string;
  notes?: string;
}

export interface MeetingMinute {
  id: string;
  title: string;
  date: string;
  content: string;
  approvedBy: string;
}

export interface FinancialReport {
  id: string;
  title: string;
  date: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  unrestrictedFunds: number;
  notes: string;
}

export interface StaffUser {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'staff' | 'member';
  fullName: string;
  allowedSections: ('rentals' | 'memberships' | 'settings' | 'events' | 'posts' | 'photos' | 'users')[];
  title?: string;
  approved?: boolean;
  memberRights?: string[];
}

export interface CMSData {
  events: LodgeEvent[];
  posts: NewsPost[];
  photos: GalleryPhoto[];
  officers: Officer[];
  settings: LodgeSettings;
  applications: MembershipApplication[];
  rentals: HallRentalInquiry[];
  users: StaffUser[];
  meetingMinutes?: MeetingMinute[];
  financials?: FinancialReport[];
  customEventCategories?: string[];
  customPhotoCategories?: string[];
  customNewsCategories?: string[];
}
