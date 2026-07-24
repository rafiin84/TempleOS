import type {
  Temple, FeedItem, Festival, PilgrimageRoute, Booking,
  Donation, RenovationProject, District, AdminStats, User,
  SlotAvailability, Slot
} from '@/types'
import {
  MOCK_TEMPLES, MOCK_FEED, MOCK_FESTIVALS, MOCK_ROUTES,
  MOCK_BOOKINGS, MOCK_DONATIONS, MOCK_RENOVATION, MOCK_DISTRICTS,
  MOCK_USER, MOCK_ADMIN_STATS
} from './data'

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms))

function paginate<T>(items: T[], page = 1, limit = 10) {
  const start = (page - 1) * limit
  return { items: items.slice(start, start + limit), total: items.length, page, limit }
}

export const templeApi = {
  async list(params?: { search?: string; district?: string; category?: string; page?: number }) {
    await delay()
    let items = [...MOCK_TEMPLES]
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.nameTa.includes(q) ||
        t.deity.toLowerCase().includes(q) ||
        t.district.toLowerCase().includes(q)
      )
    }
    if (params?.district) items = items.filter(t => t.district.toLowerCase() === params.district!.toLowerCase())
    if (params?.category) items = items.filter(t => t.categories.some(c => c.toLowerCase() === params.category!.toLowerCase()))
    return paginate(items, params?.page)
  },

  async get(id: string): Promise<Temple> {
    await delay()
    const temple = MOCK_TEMPLES.find(t => t.id === id)
    if (!temple) throw new Error('Temple not found')
    return temple
  },

  async getNearby(lat: number, lng: number): Promise<Temple[]> {
    await delay(200)
    return MOCK_TEMPLES.map(t => ({
      ...t,
      distanceKm: Math.round(Math.sqrt(Math.pow((t.location.lat - lat) * 111, 2) + Math.pow((t.location.lng - lng) * 111, 2)) * 10) / 10
    })).sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999)).slice(0, 6)
  },

  async getFeatured(): Promise<Temple[]> {
    await delay(200)
    return MOCK_TEMPLES.slice(0, 4)
  },

  async getSlots(templeId: string, poojaId: string, date: string): Promise<SlotAvailability> {
    await delay()
    const slots: Slot[] = [
      { id: 's1', time: '6:00 AM', available: 8, total: 20, price: 50 },
      { id: 's2', time: '8:00 AM', available: 15, total: 20, price: 100 },
      { id: 's3', time: '10:00 AM', available: 3, total: 20, price: 150 },
      { id: 's4', time: '12:00 PM', available: 0, total: 20, price: 250 },
      { id: 's5', time: '4:00 PM', available: 12, total: 20, price: 150 },
      { id: 's6', time: '6:00 PM', available: 18, total: 20, price: 100 },
    ]
    return { date, slots }
  },

  async follow(id: string): Promise<void> {
    await delay(200)
    console.log('Followed temple', id)
  },

  async unfollow(id: string): Promise<void> {
    await delay(200)
    console.log('Unfollowed temple', id)
  },
}

export const feedApi = {
  async list(page = 1): Promise<{ items: FeedItem[]; hasMore: boolean }> {
    await delay()
    const result = paginate(MOCK_FEED, page, 5)
    return { items: result.items, hasMore: result.page * result.limit < result.total }
  },
}

export const festivalApi = {
  async list(): Promise<Festival[]> {
    await delay()
    return MOCK_FESTIVALS
  },
  async getLive(): Promise<Festival[]> {
    await delay(200)
    return MOCK_FESTIVALS.filter(f => f.isLive)
  },
}

export const routeApi = {
  async list(): Promise<PilgrimageRoute[]> {
    await delay()
    return MOCK_ROUTES
  },
}

export const bookingApi = {
  async list(userId: string): Promise<Booking[]> {
    await delay()
    return MOCK_BOOKINGS
  },

  async create(data: {
    templeId: string; poojaId: string; date: string
    slotId: string; persons: number; totalAmount: number
  }): Promise<Booking> {
    await delay(800)
    const temple = MOCK_TEMPLES.find(t => t.id === data.templeId)!
    const pooja = temple.poojas.find(p => p.id === data.poojaId)!
    return {
      id: `b-${Date.now()}`,
      templeId: data.templeId,
      templeName: temple.name,
      templeImage: temple.coverImage,
      poojaId: data.poojaId,
      poojaName: pooja.name,
      date: data.date,
      slot: '12:00 PM',
      persons: data.persons,
      totalAmount: data.totalAmount,
      status: 'confirmed',
      qrCode: `TOS-${data.templeId.toUpperCase().slice(0, 3)}-${Date.now()}`,
      bookedAt: new Date().toISOString(),
      ticketNumber: `TOS-${Date.now()}`,
    }
  },

  async cancel(id: string): Promise<void> {
    await delay()
    console.log('Cancelled booking', id)
  },
}

export const donationApi = {
  async list(userId: string): Promise<Donation[]> {
    await delay()
    return MOCK_DONATIONS
  },

  async create(data: { templeId: string; amount: number; purpose: string; isAnonymous: boolean }): Promise<Donation> {
    await delay(800)
    const temple = MOCK_TEMPLES.find(t => t.id === data.templeId)!
    return {
      id: `d-${Date.now()}`,
      templeId: data.templeId,
      templeName: temple.name,
      templeImage: temple.coverImage,
      amount: data.amount,
      purpose: data.purpose,
      date: new Date().toISOString().split('T')[0],
      receiptNumber: `DON-${Date.now()}`,
      isAnonymous: data.isAnonymous,
    }
  },
}

export const renovationApi = {
  async list(): Promise<RenovationProject[]> {
    await delay()
    return MOCK_RENOVATION
  },
}

export const districtApi = {
  async list(): Promise<District[]> {
    await delay()
    return MOCK_DISTRICTS
  },
}

export const userApi = {
  async getMe(): Promise<User> {
    await delay(200)
    return MOCK_USER
  },
  async updateProfile(data: Partial<User>): Promise<User> {
    await delay()
    return { ...MOCK_USER, ...data }
  },
}

export const adminApi = {
  async getStats(): Promise<AdminStats> {
    await delay()
    return MOCK_ADMIN_STATS
  },
}

export const searchApi = {
  async query(q: string) {
    await delay()
    const lower = q.toLowerCase()
    return {
      temples: MOCK_TEMPLES.filter(t =>
        t.name.toLowerCase().includes(lower) || t.deity.toLowerCase().includes(lower) || t.district.toLowerCase().includes(lower)
      ),
      festivals: MOCK_FESTIVALS.filter(f => f.name.toLowerCase().includes(lower)),
      routes: MOCK_ROUTES.filter(r => r.name.toLowerCase().includes(lower)),
    }
  },
}
