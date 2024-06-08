import { GoogleScholar } from './google-scholar'
import { ISearchResponse } from './interfaces'
import { SimpleWebClient } from './simple-web-client'

const webClient = new SimpleWebClient()
const googleScholar = new GoogleScholar(webClient)

export async function search(keywords: string): Promise<ISearchResponse> {
  return googleScholar.search(keywords)
}

export async function parseUrl(url: string): Promise<ISearchResponse> {
  return googleScholar.parseUrl(url)
}
