import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { GoogleScholar } from '../src/google-scholar'

const logger = new Quill()
const odysseus = new Odysseus({ headless: false }, logger)

odysseus.init()

const googleScholar = new GoogleScholar(odysseus, logger)

async function searchGoogleScholar({ keywords, yearLow, yearHigh, authors }) {
  const result = await googleScholar.search({ keywords, yearLow, yearHigh, authors })
  console.log(JSON.stringify(result, null, 2))
}

searchGoogleScholar({
  keywords: 'crispr cas9',
  yearLow: 2_000,
  yearHigh: 2_024,
  authors: ['JA Doudna', 'E Charpentier'],
})

await odysseus.close()
