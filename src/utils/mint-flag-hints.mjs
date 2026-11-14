// Tag lists the copyminter bot uses to notice mints that may be missing an
// NSFW or photosensitivity flag (issue #557). Duplicates from those lists
// are dropped. Spellings are kept as written, including typos.

const NSFW_TAG_LIST = [
  'nsfw',
  'nfsw',
  'nsfwart',
  'nsfwnft',
  'nsfw art',
  'nsfwartwork',
  'nsfwnft',
  'nsfwcontent',
  'nsfwkink',
  'nsfwsubmissive',
  'nsfwmeme',
  'nsfwmemes',
  'nsfwsub',
  'nsfwcommunity',
  'nsfwrp',
  'nsfwdominant',
  'nsfwdrawing',
]

const FLASHING_TAG_LIST = [
  'glitch',
  'glitchy',
  'glitches',
  'glychies',
  'glitchart',
  'glitch-art',
  'analogglitch',
  'epilepsy',
  'seizure',
  'flash',
  'trippy',
  'psychadelic',
  'neonart',
  'trippy',
  'beats',
]

function dedupe(tags) {
  const seen = new Set()
  return tags.filter((tag) => {
    if (seen.has(tag)) return false
    seen.add(tag)
    return true
  })
}

export const NSFW_TAGS = dedupe(NSFW_TAG_LIST)
export const FLASHING_TAGS = dedupe(FLASHING_TAG_LIST)

function normalizeMintTag(tag) {
  return String(tag ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * The mint form stores tags as a comma-separated string. Callers may also
 * pass an array of tags.
 * @param {string | string[] | null | undefined} tags
 * @returns {string[]}
 */
function parseMintTags(tags) {
  if (tags == null) return []
  const parts = Array.isArray(tags) ? tags : String(tags).split(',')
  return parts.map(normalizeMintTag).filter(Boolean)
}

const nsfwSet = new Set(NSFW_TAGS.map(normalizeMintTag))
const flashingSet = new Set(FLASHING_TAGS.map(normalizeMintTag))

/**
 * Which content flags the current tags suggest, skipping any flag that is
 * already enabled. Matching is exact after lowercasing and collapsing
 * whitespace. This never changes form state.
 *
 * @param {string | string[] | null | undefined} tags
 * @param {{ nsfw?: boolean, photosensitive?: boolean }} [enabled]
 * @returns {{ nsfw: boolean, photosensitive: boolean }}
 */
export function suggestMintFlags(tags, enabled = {}) {
  const parsed = parseMintTags(tags)
  return {
    nsfw: !enabled?.nsfw && parsed.some((tag) => nsfwSet.has(tag)),
    photosensitive:
      !enabled?.photosensitive && parsed.some((tag) => flashingSet.has(tag)),
  }
}
