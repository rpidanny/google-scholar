import { parseUrl } from '../src'

async function main() {
  const result = await parseUrl('https://scholar.google.com/scholar?q=crispr+cas9&hl=en')
  console.log(JSON.stringify(result, null, 2))
}

main()
