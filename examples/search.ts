import { search } from '../src'

async function main() {
  const result = await search({ keywords: 'crispr cas9' })
  console.log(JSON.stringify(result, null, 2))
}

main()
