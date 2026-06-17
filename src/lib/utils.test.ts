import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn() — class merge utility', () => {
  describe('merges classes correctly', () => {
    it('joins multiple string classes with a space', () => {
      expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
    })

    it('merges conflicting Tailwind classes (later wins)', () => {
      // twMerge should drop the earlier conflicting padding class
      expect(cn('px-2', 'px-4')).toBe('px-4')
    })

    it('keeps non-conflicting classes intact while merging conflicts', () => {
      expect(cn('px-2 py-1 text-sm', 'px-4')).toBe('py-1 text-sm px-4')
    })

    it('handles a single class', () => {
      expect(cn('rounded-md')).toBe('rounded-md')
    })

    it('deduplicates identical classes via twMerge', () => {
      // tailwind-merge dedupes identical Tailwind utility tokens
      expect(cn('px-2', 'px-2')).toBe('px-2')
    })
  })

  describe('handles conditional classes', () => {
    it('includes truthy conditional classes', () => {
      expect(cn('base', true && 'truthy')).toBe('base truthy')
    })

    it('excludes falsy conditional classes (false)', () => {
      expect(cn('base', false && 'falsy')).toBe('base')
    })

    it('excludes undefined values', () => {
      expect(cn('base', undefined)).toBe('base')
    })

    it('excludes null values', () => {
      expect(cn('base', null)).toBe('base')
    })

    it('excludes empty strings', () => {
      expect(cn('base', '')).toBe('base')
    })

    it('handles a mix of strings, booleans, null, and undefined', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'btn',
        isActive && 'btn-active',
        isDisabled && 'btn-disabled',
        null,
        undefined,
        'btn-lg'
      )
      expect(result).toBe('btn btn-active btn-lg')
    })

    it('handles objects via clsx', () => {
      // clsx supports object syntax — { 'class-name': boolean }
      expect(cn('base', { hidden: false, visible: true })).toBe('base visible')
    })

    it('handles arrays via clsx', () => {
      expect(cn('base', ['a', 'b'])).toBe('base a b')
    })
  })

  describe('handles empty input', () => {
    it('returns an empty string when called with no arguments', () => {
      expect(cn()).toBe('')
    })

    it('returns an empty string when all inputs are falsy', () => {
      expect(cn(false, null, undefined, '')).toBe('')
    })

    it('returns an empty string when passed an empty object', () => {
      expect(cn({})).toBe('')
    })

    it('returns an empty string when passed an empty array', () => {
      expect(cn([])).toBe('')
    })
  })
})
