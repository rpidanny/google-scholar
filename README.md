# Google Scholar 👩🏻‍🏫

A minimal TypeScript library for fetching and parsing Google Scholar pages. This library allows users to search Google Scholar using any keywords or a direct Google Scholar URL.

## Installation

```bash
npm i @rpidanny/google-scholar
```

## Usage

### Basic Usage

For basic usage, you can use the helper functions `search` and `parseUrl` provided by the library. These functions are straightforward and easy to use.

```typescript
import { search } from '@rpidanny/google-scholar'

// Search using keywords
const result = await search('crispr cas9')
console.log(JSON.stringify(result, null, 2))

// Parse page using url
const result2 = await parseUrl('https://scholar.google.com/scholar?q=crispr+cas9&hl=en')
console.log(JSON.stringify(result2, null, 2))
```

### Advanced Usage

For more advanced usage and more control over the querying process, you can use the `GoogleScholar` class directly.

```ts
import { GoogleScholar } from 'google-scholar'
import { WebClient } from './web-client' // Make sure to implement the IWebClient interface

const webClient = new WebClient()
const googleScholar = new GoogleScholar(webClient)

async function searchGoogleScholar(keywords: string) {
  const results = await googleScholar.search(keywords)
  console.log(results)
}

searchGoogleScholar('crispr cas9')
```

### Example Response

```json
{
  "results": [
    {
      "title": "CRISPR–Cas9 structures and mechanisms",
      "url": "https://www.annualreviews.org/doi/abs/10.1146/annurev-biophys-062215-010822",
      "description": "… and Cas9 orthologs have contributed greatly to our understanding of\n                    CRISPR–Cas9 \n                    mechanisms. In this review, we briefly explain the biology underlying\n                    CRISPR–Cas9 technology …",
      "paperUrl": "https://www.annualreviews.org/doi/pdf/10.1146/annurev-biophys-062215-010822",
      "authors": [
        {
          "name": "F Jiang",
          "url": "https://scholar.google.com/citations?user=gt-dzeEAAAAJ&hl=en&oi=sra"
        },
        {
          "name": "JA Doudna",
          "url": "https://scholar.google.com/citations?user=YO5XSXwAAAAJ&hl=en&oi=sra"
        }
      ],
      "citation": {
        "count": 2020,
        "url": "https://scholar.google.com/scholar?cites=2456688039791281496&as_sdt=2005&sciodt=0,5&hl=en"
      },
      "relatedArticlesUrl": "https://scholar.google.com/scholar?q=related:WMW1j8HoFyIJ:scholar.google.com/&scioq=crispr+cas9&hl=en&as_sdt=0,5"
    }
  ],
  "count": 594000,
  "nextUrl": "https://scholar.google.com/scholar?start=10&q=crispr+cas9&hl=en&as_sdt=0,5",
  "prevUrl": null
}
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.