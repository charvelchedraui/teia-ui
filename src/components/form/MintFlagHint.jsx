import { useWatch } from 'react-hook-form'
import { suggestMintFlags } from '@utils/mint-flag-hints.mjs'
import styles from '@style'

const HINTS = {
  nsfw: 'Your tags suggest this work may be NSFW. Consider enabling the NSFW flag if appropriate.',
  photosensitive:
    'Your tags suggest this work may be photosensitive. Consider enabling the Photo Sensitive Seizure Warning if appropriate.',
}

/**
 * Non-blocking note under an NSFW or photosensitivity checkbox. It only
 * reads the tags and the current flags. It does not check a box or stop
 * the mint.
 *
 * @param {{ flag: 'nsfw' | 'photosensitive' }} props
 */
export function MintFlagHint({ flag }) {
  const [tags, nsfw, photosensitive] = useWatch({
    name: ['tags', 'nsfw', 'photosensitive'],
  })
  const suggested = suggestMintFlags(tags, { nsfw, photosensitive })
  if (!suggested[flag]) return null

  return (
    <p className={styles.flag_hint} role="status">
      {HINTS[flag]}
    </p>
  )
}
