import { Odysseus } from '@rpidanny/odysseus'
import { Quill } from '@rpidanny/quill'

import { GoogleScholar } from '../src/google-scholar'

const logger = new Quill()
const odysseus = new Odysseus({ headless: false }, logger)

const googleScholar = new GoogleScholar(odysseus, logger)

async function searchGoogleScholar(query: string) {
  const result = await googleScholar.search(query)
  console.log(JSON.stringify(result, null, 2))

  await odysseus.close()
}

searchGoogleScholar('crispr cas9')
