export type Lang = 'ta' | 'en'

export interface Temple {
  id: string
  name: string
  nameTa: string
  deity: string
  deityTa: string
  district: string
  districtTa: string
  city: string
  address: string
  description: string
  descriptionTa: string
  history: string
  coverImage: string
  images: string[]
  rating: number
  reviewCount: number
  visitCount: number
  followCount: number
  timings: Timing[]
  poojas: Pooja[]
  facilities: string[]
  categories: TempleCategory[]
  heritage: Heritage
  dynasty: string
  yearBuilt: string
  architecturalStyle: string
  location: { lat: number; lng: number }
  isOpen: boolean
  crowdLevel: CrowdLevel
  distanceKm?: number
  isFavorite?: boolean
  isFollowed?: boolean
}

export type TempleCategory =
  | 'Shiva'
  | 'Vishnu'
  | 'Murugan'
  | 'Amman'
  | 'Ganesha'
  | 'Navagraha'
  | 'Divya Desam'
  | 'Arupadai Veedu'
  | 'Padal Petra Sthalam'
  | 'Heritage'
  | 'Hill Temple'
  | 'Shore Temple'

export type CrowdLevel = 'Low' | 'Moderate' | 'High' | 'Very High'

export interface Timing {
  day: string
  morning: string
  evening: string
  closed?: boolean
}

export interface Pooja {
  id: string
  name: string
  nameTa: string
  time: string
  deity: string
  duration: string
  price: number
  description: string
  isBookable: boolean
}

export interface Heritage {
  timeline: TimelineEvent[]
  dynasties: string[]
  architecture: string
  inscriptions: string[]
  murals: string
  sculptures: string
  hasAudioGuide: boolean
  has360Tour: boolean
  hasDroneGallery: boolean
}

export interface TimelineEvent {
  year: string
  event: string
}

export interface FeedItem {
  id: string
  type: 'announcement' | 'festival' | 'booking-open' | 'photo' | 'video' | 'heritage' | 'crowd-alert' | 'renovation'
  temple?: Temple
  templeId?: string
  templeName?: string
  templeNameTa?: string
  districtId?: string
  title: string
  titleTa?: string
  body: string
  bodyTa?: string
  image?: string
  video?: string
  postedAt: string
  isOfficial: boolean
  tags: string[]
}

export interface Booking {
  id: string
  templeId: string
  templeName: string
  templeImage: string
  poojaId: string
  poojaName: string
  date: string
  slot: string
  persons: number
  totalAmount: number
  status: BookingStatus
  qrCode: string
  bookedAt: string
  ticketNumber: string
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'scanned'

export interface Donation {
  id: string
  templeId: string
  templeName: string
  templeImage: string
  amount: number
  purpose: string
  date: string
  receiptNumber: string
  isAnonymous: boolean
}

export interface PassportEntry {
  templeId: string
  templeName: string
  templeImage: string
  visitedAt: string
  method: 'qr' | 'manual'
  pooja?: string
}

export interface PilgrimageRoute {
  id: string
  name: string
  nameTa: string
  description: string
  templeCount: number
  temples: string[]
  distanceKm: number
  durationDays: number
  coverImage: string
  category: string
  completedBy?: number
  isCompleted?: boolean
  completedStops?: number
}

export interface Festival {
  id: string
  name: string
  nameTa: string
  templeId: string
  templeName: string
  templeNameTa?: string
  templeImage: string
  startDate: string
  endDate: string
  description: string
  image: string
  isLive: boolean
  district: string
  districtTa?: string
}

export interface RenovationProject {
  id: string
  templeId: string
  templeName: string
  templeImage: string
  title: string
  description: string
  targetAmount: number
  raisedAmount: number
  startDate: string
  expectedEnd: string
  status: 'active' | 'completed' | 'upcoming'
  milestones: Milestone[]
  sponsors: Sponsor[]
  gallery: string[]
  progress: number
}

export interface Milestone {
  id: string
  title: string
  completedAt?: string
  isCompleted: boolean
}

export interface Sponsor {
  id: string
  name: string
  amount: number
  logo?: string
  isAnonymous: boolean
}

export interface District {
  id: string
  name: string
  nameTa: string
  templeCount: number
  coverImage: string
}

export interface User {
  id: string
  name: string
  nameTa?: string
  email: string
  phone: string
  avatar?: string
  role: 'devotee' | 'temple_admin' | 'district_admin' | 'state_admin'
  following: string[]
  favorites: string[]
  passportEntries: PassportEntry[]
  bookings: Booking[]
  donations: Donation[]
  joinedAt: string
}

export interface SearchResult {
  temples: Temple[]
  festivals: Festival[]
  routes: PilgrimageRoute[]
}

export interface AdminStats {
  totalTemples: number
  totalBookings: number
  totalDonations: number
  totalVisitors: number
  monthlyRevenue: number
  activeRenovations: number
  pendingApprovals: number
  newUsersThisMonth: number
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface SlotAvailability {
  date: string
  slots: Slot[]
}

export interface Slot {
  id: string
  time: string
  available: number
  total: number
  price: number
}

export interface Announcement {
  id: string
  title: string
  body: string
  priority: 'low' | 'medium' | 'high'
  templeId?: string
  district?: string
  publishedAt: string
  expiresAt?: string
}
