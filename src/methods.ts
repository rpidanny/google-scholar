import { GoogleScholar } from './google-scholar'
import { IPageContent, IPaperMetadata, ISearchOptions } from './interfaces'
import { SimpleWebClient } from './simple-web-client'

const webClient = new SimpleWebClient()
const googleScholar = new GoogleScholar(webClient)

/*
 * Searches google scholar with the given search options and returns the concent of the first page
 */
export async function search(opts: ISearchOptions): Promise<IPageContent> {
  return googleScholar.search(opts)
}

/*
 * Parses the given google scholar url
 */
export async function parseUrl(url: string): Promise<IPageContent> {
  return googleScholar.parseUrl(url)
}

/*
 * Iterates through all search result pages,
 * invoking the provided function on each page until it returns false
 * or there are no more pages.
 */
export async function iteratePages(
  opts: ISearchOptions,
  onPage: (page: IPageContent) => Promise<boolean>,
): Promise<void> {
  return googleScholar.iteratePages(opts, onPage)
}

/*
 * Iterates through all search result papers,
 * invoking the provided function on each paper until it returns false
 * or there are no more papers.
 */
export async function iteratePapers(
  opts: ISearchOptions,
  onPaper: (paper: IPaperMetadata) => Promise<boolean>,
  concurrency = 1,
): Promise<void> {
  return googleScholar.iteratePapers(opts, onPaper, concurrency)
}
