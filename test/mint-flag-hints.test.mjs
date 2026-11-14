import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  NSFW_TAGS,
  FLASHING_TAGS,
  suggestMintFlags,
} from '../src/utils/mint-flag-hints.mjs'

const ORIGINAL_NSFW = [
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

const ORIGINAL_FLASHING = [
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

test('keeps the copyminter spellings and drops only repeated entries', () => {
  assert.deepEqual(NSFW_TAGS, [...new Set(ORIGINAL_NSFW)])
  assert.deepEqual(FLASHING_TAGS, [...new Set(ORIGINAL_FLASHING)])
  assert.equal(NSFW_TAGS.filter((tag) => tag === 'nsfwnft').length, 1)
  assert.equal(FLASHING_TAGS.filter((tag) => tag === 'trippy').length, 1)
  assert.ok(NSFW_TAGS.includes('nfsw'))
  assert.ok(NSFW_TAGS.includes('nsfw art'))
  assert.ok(FLASHING_TAGS.includes('glychies'))
  assert.ok(FLASHING_TAGS.includes('psychadelic'))
  assert.ok(FLASHING_TAGS.includes('glitch-art'))
})

test('suggests nothing for empty or unrelated tags', () => {
  for (const tags of [undefined, null, '', '   ', ',,,', 'portrait, digital']) {
    assert.deepEqual(suggestMintFlags(tags), {
      nsfw: false,
      photosensitive: false,
    })
  }
  assert.deepEqual(suggestMintFlags(['safe', 'landscape']), {
    nsfw: false,
    photosensitive: false,
  })
})

test('matches each listed tag on its own flag only', () => {
  for (const tag of NSFW_TAGS) {
    assert.deepEqual(
      suggestMintFlags(tag),
      { nsfw: true, photosensitive: false },
      tag
    )
  }
  for (const tag of FLASHING_TAGS) {
    assert.deepEqual(
      suggestMintFlags(tag),
      { nsfw: false, photosensitive: true },
      tag
    )
  }
})

test('reads the comma-separated mint field, ignoring case and extra space', () => {
  assert.deepEqual(suggestMintFlags('illustration, NSFW , digital'), {
    nsfw: true,
    photosensitive: false,
  })
  assert.deepEqual(suggestMintFlags('  NSFW   ART  , portrait'), {
    nsfw: true,
    photosensitive: false,
  })
  assert.deepEqual(suggestMintFlags('Glitch-Art,\n beats'), {
    nsfw: false,
    photosensitive: true,
  })
  assert.deepEqual(suggestMintFlags(['  Trippy ', 'portrait']), {
    nsfw: false,
    photosensitive: true,
  })
})

test('does not treat a longer tag as a match', () => {
  assert.deepEqual(suggestMintFlags('flashy, notnsfw, glitch art, neon'), {
    nsfw: false,
    photosensitive: false,
  })
})

test('skips a flag that is already enabled and still reports the other', () => {
  assert.deepEqual(
    suggestMintFlags('nsfw, glitch', { nsfw: true, photosensitive: false }),
    { nsfw: false, photosensitive: true }
  )
  assert.deepEqual(
    suggestMintFlags('nsfw, glitch', { nsfw: false, photosensitive: true }),
    { nsfw: true, photosensitive: false }
  )
  assert.deepEqual(
    suggestMintFlags('nsfw, seizure', { nsfw: true, photosensitive: true }),
    { nsfw: false, photosensitive: false }
  )
  assert.deepEqual(suggestMintFlags('nsfw', { nsfw: true }), {
    nsfw: false,
    photosensitive: false,
  })
})
