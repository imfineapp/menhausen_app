import type { SyncDataType } from './types'

const ABSENT = '__absent__'

export function signatureForSyncedValue(v: unknown): string {
  return v === undefined ? ABSENT : JSON.stringify(v)
}

/** Stable JSON signatures per syncable type (matches pre-merge snapshot semantics). */
export function signaturesFromPayload(
  data: Record<string, unknown>,
  allTypes: readonly SyncDataType[]
): Record<string, string> {
  const sig: Record<string, string> = {}
  for (const t of allTypes) {
    const v = data[t]
    sig[t] = signatureForSyncedValue(v)
  }
  return sig
}

/** Types whose serialized payload changed between `before` signatures and `after` data. */
export function dirtyTypesFromSignatures(
  before: Record<string, string>,
  after: Record<string, unknown>,
  allTypes: readonly SyncDataType[]
): Set<SyncDataType> {
  const dirty = new Set<SyncDataType>()
  for (const t of allTypes) {
    const v = after[t]
    const afterSig = signatureForSyncedValue(v)
    if (before[t] !== afterSig) {
      dirty.add(t)
    }
  }
  return dirty
}
