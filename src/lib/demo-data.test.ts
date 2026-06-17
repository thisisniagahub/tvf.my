import { describe, it, expect } from 'vitest'
import {
  demoProducts,
  demoLinks,
  demoCampaigns,
  demoNotifications,
  navItems,
  formatRM,
  formatNumber,
} from './demo-data'

describe('formatRM()', () => {
  it('formats a simple decimal with 2 fraction digits', () => {
    expect(formatRM(19.9)).toBe('RM 19.90')
  })

  it('formats a whole number with .00 suffix', () => {
    expect(formatRM(100)).toBe('RM 100.00')
  })

  it('formats 0 correctly', () => {
    expect(formatRM(0)).toBe('RM 0.00')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatRM(11.039)).toBe('RM 11.04')
  })

  it('formats a 3-digit integer with .00 suffix', () => {
    expect(formatRM(199)).toBe('RM 199.00')
  })

  it('includes thousands separators for large amounts', () => {
    // en-MY uses comma as the thousands separator
    expect(formatRM(1240)).toBe('RM 1,240.00')
  })

  it('formats a large earnings value', () => {
    expect(formatRM(982.56)).toBe('RM 982.56')
  })

  it('always returns a string starting with "RM "', () => {
    expect(formatRM(1)).toMatch(/^RM /)
    expect(formatRM(9999.99)).toMatch(/^RM /)
  })
})

describe('formatNumber()', () => {
  it('adds commas to a 4-digit number', () => {
    expect(formatNumber(2847)).toBe('2,847')
  })

  it('returns the plain string for numbers < 1000', () => {
    expect(formatNumber(999)).toBe('999')
  })

  it('formats 0 as "0"', () => {
    expect(formatNumber(0)).toBe('0')
  })

  it('adds commas to a 7-digit number', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })

  it('formats negative numbers with a leading minus', () => {
    expect(formatNumber(-2847)).toBe('-2,847')
  })
})

describe('demoProducts', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(demoProducts)).toBe(true)
    expect(demoProducts.length).toBeGreaterThan(0)
  })

  it('has 12 demo products', () => {
    expect(demoProducts).toHaveLength(12)
  })

  it('every product has the required fields', () => {
    for (const p of demoProducts) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.name).toBe('string')
      expect(typeof p.price).toBe('number')
      expect(typeof p.commissionRate).toBe('number')
      expect(typeof p.category).toBe('string')
      expect(p.source).toBe('shopee')
    }
  })

  it('contains at least one "hot" product', () => {
    expect(demoProducts.some((p) => p.hot === true)).toBe(true)
  })

  it('contains at least one XTRA commission product', () => {
    expect(demoProducts.some((p) => p.xtra === true)).toBe(true)
  })

  it('every product id is unique', () => {
    const ids = demoProducts.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('demoLinks', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(demoLinks)).toBe(true)
    expect(demoLinks.length).toBeGreaterThan(0)
  })

  it('every link has a shortUrl and a platform', () => {
    for (const l of demoLinks) {
      expect(typeof l.shortUrl).toBe('string')
      expect(l.shortUrl.length).toBeGreaterThan(0)
      expect(typeof l.platform).toBe('string')
    }
  })
})

describe('demoCampaigns', () => {
  it('is a non-empty array', () => {
    expect(demoCampaigns.length).toBeGreaterThan(0)
  })

  it('covers a variety of statuses', () => {
    const statuses = new Set(demoCampaigns.map((c) => c.status))
    expect(statuses.size).toBeGreaterThan(1)
  })
})

describe('demoNotifications', () => {
  it('is a non-empty array', () => {
    expect(demoNotifications.length).toBeGreaterThan(0)
  })

  it('has at least one unread notification', () => {
    expect(demoNotifications.some((n) => n.read === false)).toBe(true)
  })
})

describe('navItems', () => {
  it('has exactly 36 entries', () => {
    expect(navItems).toHaveLength(36)
  })

  it('every entry has id, label, icon, and category', () => {
    for (const item of navItems) {
      expect(typeof item.id).toBe('string')
      expect(item.id.length).toBeGreaterThan(0)
      expect(typeof item.label).toBe('string')
      expect(item.label.length).toBeGreaterThan(0)
      expect(typeof item.icon).toBe('string')
      expect(typeof item.category).toBe('string')
    }
  })

  it('covers all 5 categories (core, ai, platforms, advanced, growth)', () => {
    const categories = new Set(navItems.map((n) => n.category))
    expect(categories.has('core')).toBe(true)
    expect(categories.has('ai')).toBe(true)
    expect(categories.has('platforms')).toBe(true)
    expect(categories.has('advanced')).toBe(true)
    expect(categories.has('growth')).toBe(true)
    expect(categories.size).toBe(5)
  })

  it('has 7 core pages (Dashboard, Products, Affiliate Links, Analytics, Calculator, Campaigns, Earnings)', () => {
    const core = navItems.filter((n) => n.category === 'core')
    expect(core).toHaveLength(7)
    const coreIds = core.map((n) => n.id)
    expect(coreIds).toEqual(
      expect.arrayContaining([
        'dashboard',
        'products',
        'links',
        'analytics',
        'calculator',
        'campaigns',
        'earnings',
      ])
    )
  })

  it('has 11 ai-powered pages', () => {
    const ai = navItems.filter((n) => n.category === 'ai')
    expect(ai).toHaveLength(11)
  })

  it('has 5 platform pages', () => {
    const platforms = navItems.filter((n) => n.category === 'platforms')
    expect(platforms).toHaveLength(5)
  })

  it('has 7 advanced pages', () => {
    const advanced = navItems.filter((n) => n.category === 'advanced')
    expect(advanced).toHaveLength(7)
  })

  it('has 6 growth pages', () => {
    const growth = navItems.filter((n) => n.category === 'growth')
    expect(growth).toHaveLength(6)
  })

  it('every nav id is unique', () => {
    const ids = navItems.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes the dashboard as the first entry', () => {
    expect(navItems[0]?.id).toBe('dashboard')
  })

  it('includes settings as the last entry', () => {
    expect(navItems[navItems.length - 1]?.id).toBe('settings')
  })
})
