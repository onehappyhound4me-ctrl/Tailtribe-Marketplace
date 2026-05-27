/**
 * Lightweight unit checks for availability date helpers (no DB).
 * Run: node scripts/test-availability-logic.mjs
 */
import assert from 'node:assert/strict'

function toUtcDate(input) {
  if (typeof input === 'string') {
    const [year, month, day] = input.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  }
  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate(), 0, 0, 0, 0))
}

assert.equal(toUtcDate('2026-06-10').toISOString(), '2026-06-10T00:00:00.000Z')
assert.equal(
  toUtcDate(new Date(Date.UTC(2026, 5, 10, 15, 30, 0))).toISOString(),
  '2026-06-10T00:00:00.000Z'
)

console.log('availability logic: ok')
