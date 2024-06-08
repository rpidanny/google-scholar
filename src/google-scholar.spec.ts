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

    const response = await googleScholar.search('some query')

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
})
