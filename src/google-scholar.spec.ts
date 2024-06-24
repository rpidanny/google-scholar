import fs from 'fs/promises'

import { GoogleScholar } from './google-scholar'
import { ISearchResponse, IWebClient } from './interfaces'

describe('GoogleScholar', () => {
  const webClient: IWebClient = {
    getContent: async (): Promise<string> => {
      return fs.readFile(`${__dirname}/../test/data/page1.html`, 'utf-8')
    },
  }

  const logger = {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }

  let googleScholar: GoogleScholar

  beforeEach(() => {
    googleScholar = new GoogleScholar(webClient, logger)
  })

  test.each`
    page       | next                    | previous
    ${'page1'} | ${expect.any(Function)} | ${null}
    ${'page2'} | ${expect.any(Function)} | ${expect.any(Function)}
  `('should parse $page correctly', async ({ page, next, previous }) => {
    jest.spyOn(webClient, 'getContent').mockImplementationOnce(() => {
      return fs.readFile(`${__dirname}/../test/data/${page}.html`, 'utf-8')
    })

    const response = await googleScholar.search({ keywords: 'some query' })

    const expectedResponse = JSON.parse(
      await fs.readFile(`${__dirname}/../test/data/${page}.json`, 'utf-8'),
    ) as ISearchResponse

    expect(response).toEqual({
      ...expectedResponse,
      next,
      previous,
    })
  })

  it('should throw an error if the url is not a google scholar url', async () => {
    await expect(googleScholar.parseUrl('https://example.com')).rejects.toThrow()
  })

  it('should return correct next function', async () => {
    const expectedResponse = JSON.parse(
      await fs.readFile(`${__dirname}/../test/data/page1.json`, 'utf-8'),
    ) as ISearchResponse

    const response = await googleScholar.search({ keywords: 'some query' })
    expect(response).toEqual({
      ...expectedResponse,
      next: expect.any(Function),
      previous: null,
    })

    const parseUrlSpy = jest.spyOn(googleScholar, 'parseUrl')

    const nextResponse = await response.next!()

    expect(parseUrlSpy).toHaveBeenCalledWith(expectedResponse.nextUrl)
    expect(nextResponse).toEqual({
      ...expectedResponse,
      next: expect.any(Function),
      previous: null,
    })
  })

  describe('advanced search', () => {
    it('should return correct url', () => {
      const url = googleScholar.getSearchUrl({
        keywords: 'crispr cas9',
        yearHigh: 2_025,
        yearLow: 2_000,
        authors: ['JA Doudna', 'E Charpentier'],
      })

      expect(url).toEqual(
        'https://scholar.google.com/scholar?hl=en&as_q=crispr+cas9&as_sauthors=%22JA+Doudna%22+%22E+Charpentier%22&as_ylo=2000&as_yhi=2025',
      )
    })

    it('should return correct url for year low', () => {
      const url = googleScholar.getSearchUrl({
        keywords: 'crispr cas9',
        yearLow: 2_000,
      })

      expect(url).toEqual('https://scholar.google.com/scholar?hl=en&as_q=crispr+cas9&as_ylo=2000')
    })

    it('should return correct url for year high', () => {
      const url = googleScholar.getSearchUrl({
        keywords: 'crispr cas9',
        yearHigh: 2_000,
      })

      expect(url).toEqual('https://scholar.google.com/scholar?hl=en&as_q=crispr+cas9&as_yhi=2000')
    })

    it('should return correct url for authors', () => {
      const url = googleScholar.getSearchUrl({
        keywords: 'crispr cas9',
        authors: ['JA Doudna', 'E Charpentier'],
      })

      expect(url).toEqual(
        'https://scholar.google.com/scholar?hl=en&as_q=crispr+cas9&as_sauthors=%22JA+Doudna%22+%22E+Charpentier%22',
      )
    })
  })
})
