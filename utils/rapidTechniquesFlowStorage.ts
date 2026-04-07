import { bumpRapidTechniquesResultsSyncVersion } from '@/src/stores/sync-triggers.store'
import { storageReadJson, storageRemoveItem, storageWriteJson } from '@/src/effects/storage.effects'

export type RapidTechniquesDraft = {
  draftId: string
  techniqueId: string
  step: number
  stressBefore?: number
  stressAfter?: number
  // Step 1
  stopFrameDone?: boolean
  // Step 2
  breathing46CompletedCycles?: number
  // Step 3
  groundingCompletedCount?: number
  // Step 4
  brainDumpNow?: string
  brainDumpOneStep?: string
  brainDumpWait?: string
  // Step 5
  postCycleStress?: number
  startedAt: string
  updatedAt: string
  completedAt?: string | null
}

export type RapidTechniquesHistoryEntry = {
  id: string
  techniqueId: string
  startedAt: string
  completedAt: string
  durationMs?: number
  stressBefore: number
  stressAfter: number
  version: number
}

export type RapidTechniquesHistoryContainer = {
  lastCompletedAt?: string
  history: RapidTechniquesHistoryEntry[]
}

const DRAFT_KEY = 'rapid-techniques-flow-draft'
const RESULTS_KEY = 'rapid-techniques-flow-results'
const RESULTS_VERSION = 1

function nowIso(): string {
  return new Date().toISOString()
}

function randomId(): string {
  // Good enough for client-side idempotency keys.
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function getRapidTechniquesDraft(): RapidTechniquesDraft | null {
  return storageReadJson<RapidTechniquesDraft | null>(DRAFT_KEY, null)
}

export function saveRapidTechniquesDraft(draft: RapidTechniquesDraft): void {
  storageWriteJson(DRAFT_KEY, { ...draft, updatedAt: nowIso() })
}

export function clearRapidTechniquesDraft(): void {
  storageRemoveItem(DRAFT_KEY)
}

export function ensureRapidTechniquesDraft(techniqueId: string): { draft: RapidTechniquesDraft; wasCreated: boolean } {
  const existing = getRapidTechniquesDraft()
  if (existing && existing.techniqueId === techniqueId && !existing.completedAt) {
    return { draft: existing, wasCreated: false }
  }
  const created: RapidTechniquesDraft = {
    draftId: randomId(),
    techniqueId,
    step: 0,
    startedAt: nowIso(),
    updatedAt: nowIso(),
    completedAt: null,
  }
  saveRapidTechniquesDraft(created)
  return { draft: created, wasCreated: true }
}

export function loadRapidTechniquesHistory(): RapidTechniquesHistoryContainer {
  return storageReadJson<RapidTechniquesHistoryContainer>(RESULTS_KEY, { history: [] })
}

function saveRapidTechniquesHistory(container: RapidTechniquesHistoryContainer): void {
  storageWriteJson(RESULTS_KEY, container)
  bumpRapidTechniquesResultsSyncVersion()
}

export function completeRapidTechniquesFlow(draft: RapidTechniquesDraft): (RapidTechniquesHistoryEntry & { durationMs: number }) | null {
  const stressBefore = typeof draft.stressBefore === 'number' ? draft.stressBefore : null
  const stressAfter = typeof draft.stressAfter === 'number' ? draft.stressAfter : null
  if (stressBefore === null || stressAfter === null) return null

  const startedAtMs = Date.parse(draft.startedAt)
  const completedAt = nowIso()
  const completedAtMs = Date.parse(completedAt)
  const durationMs = Number.isFinite(startedAtMs) && Number.isFinite(completedAtMs) ? Math.max(0, completedAtMs - startedAtMs) : 0

  const entry: RapidTechniquesHistoryEntry = {
    id: draft.draftId,
    techniqueId: draft.techniqueId,
    startedAt: draft.startedAt,
    completedAt,
    durationMs,
    stressBefore,
    stressAfter,
    version: RESULTS_VERSION,
  }

  const existing = loadRapidTechniquesHistory()
  const history = Array.isArray(existing.history) ? existing.history : []

  // Idempotency: if completion for this draftId already exists, don't duplicate.
  const already = history.some((h) => h?.id === entry.id)
  const merged = already ? history : [...history, entry]
  merged.sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))

  saveRapidTechniquesHistory({
    lastCompletedAt: completedAt,
    history: merged,
  })

  return { ...entry, durationMs }
}

