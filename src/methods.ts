import { GoogleScholar } from './google-scholar'
import { ISearchOptions, ISearchResponse } from './interfaces'
import { SimpleWebClient } from './simple-web-client'

const webClient = new SimpleWebClient()
const googleScholar = new GoogleScholar(webClient)

export async function search(opts: ISearchOptions): Promise<ISearchResponse> {
  return googleScholar.search(opts)
}

export async function parseUrl(url: string): Promise<ISearchResponse> {
  return googleScholar.parseUrl(url)
}
