import type { VerificationStatus } from '@/types/disbursement'

/**
 * Classic Levenshtein edit distance between two strings.
 * Uses the full matrix (Wagner–Fischer algorithm).
 */
function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length

  // Degenerate cases
  if (m === 0) return n
  if (n === 0) return m

  // Allocate a 2D array
  const dp: number[][] = []
  for (let i = 0; i <= m; i++) {
    dp[i] = new Array(n + 1).fill(0)
    dp[i][0] = i
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }

  return dp[m][n]
}

/**
 * Normalize a name for comparison:
 * - lowercase
 * - trim leading/trailing whitespace
 * - collapse multiple consecutive spaces to one
 */
function normalize(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Returns a similarity score between 0 and 1 (1 = identical).
 * Uses the Levenshtein distance normalized by the length of the longer string.
 */
export function nameSimilarity(a: string, b: string): number {
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return 1
  const maxLen = Math.max(na.length, nb.length)
  if (maxLen === 0) return 1
  const dist = levenshtein(na, nb)
  return 1 - dist / maxLen
}

/**
 * Classify the pair (csvName, retrievedName) into a VerificationStatus.
 *
 * Thresholds:
 *   similarity >= 0.90  → 'exact-match'
 *   similarity >= 0.60  → 'partial-match'
 *   else                → 'no-match'
 *   retrievedName null  → 'no-match'
 */
export function classifyMatch(
  csvName: string,
  retrievedName: string | null,
): VerificationStatus {
  if (!retrievedName) return 'no-match'
  const sim = nameSimilarity(csvName, retrievedName)
  if (sim >= 0.9) return 'exact-match'
  if (sim >= 0.6) return 'partial-match'
  return 'no-match'
}
