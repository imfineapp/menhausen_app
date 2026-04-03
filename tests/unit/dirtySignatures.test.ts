import { describe, it, expect } from 'vitest'
import {
  dirtyTypesFromSignatures,
  signaturesFromPayload,
  signatureForSyncedValue,
} from '@/utils/supabaseSync/dirtySignatures'
import { ALL_SYNCABLE_TYPES } from '@/utils/supabaseSync/syncableTypes'
import type { SyncDataType } from '@/utils/supabaseSync/types'

const TYPES: readonly SyncDataType[] = ALL_SYNCABLE_TYPES

describe('dirtySignatures', () => {
  it('signatureForSyncedValue uses absent sentinel for undefined', () => {
    expect(signatureForSyncedValue(undefined)).toBe('__absent__')
    expect(signatureForSyncedValue({ a: 1 })).toBe(JSON.stringify({ a: 1 }))
  })

  it('signaturesFromPayload covers all types', () => {
    const data = { flowProgress: { step: 1 } } as Record<string, unknown>
    const sig = signaturesFromPayload(data, TYPES)
    expect(Object.keys(sig).length).toBe(TYPES.length)
    expect(sig.flowProgress).toBe(JSON.stringify({ step: 1 }))
    expect(sig.userStats).toBe('__absent__')
  })

  it('dirtyTypesFromSignatures is empty when nothing changed', () => {
    const payload = { userStats: { x: 1 } } as Record<string, unknown>
    const before = signaturesFromPayload(payload, TYPES)
    const dirty = dirtyTypesFromSignatures(before, payload, TYPES)
    expect(dirty.size).toBe(0)
  })

  it('dirtyTypesFromSignatures includes a type when its value changes', () => {
    const beforePayload = { userStats: { points: 0 } } as Record<string, unknown>
    const before = signaturesFromPayload(beforePayload, TYPES)
    const after = { ...beforePayload, userStats: { points: 1 } } as Record<string, unknown>
    const dirty = dirtyTypesFromSignatures(before, after, TYPES)
    expect(dirty.has('userStats')).toBe(true)
    expect(dirty.size).toBe(1)
  })

  it('dirtyTypesFromSignatures detects absent to present', () => {
    const before = signaturesFromPayload({} as Record<string, unknown>, TYPES)
    const after = { referralData: { code: 'abc' } } as Record<string, unknown>
    const dirty = dirtyTypesFromSignatures(before, after, TYPES)
    expect(dirty.has('referralData')).toBe(true)
  })
})
