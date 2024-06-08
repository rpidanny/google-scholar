import fs from 'fs'
import nock from 'nock'

import { parseUrl, search } from './methods'

describe('methods', () => {
  const keywords = 'hello'
  const baseUrl = `https://scholar.google.com`
  const path = `/scholar?hl=en&q=${keywords}`

  const page = fs.readFileSync(`${__dirname}/../test/data/page1.html`, 'utf-8')
  const content = fs.readFileSync(`${__dirname}/../test/data/page1.json`, 'utf-8')

  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    const pendingMocks = nock.pendingMocks()
    if (pendingMocks.length) {
      throw new Error(`Not all nock interceptors were used: ${pendingMocks}`)
    }
    nock.enableNetConnect()
  })

  describe('search', () => {
    it('should call search on googleScholar', async () => {
      nock(baseUrl).get(path).reply(200, page)

      const response = await search(keywords)

      expect(response).toEqual({
        ...JSON.parse(content),
        next: expect.any(Function),
        previous: null,
      })
    })
  })

  describe('parseUrl', () => {
    it('should call parseUrl on googleScholar', async () => {
      nock(baseUrl).get(path).reply(200, page)

      const response = await parseUrl(`${baseUrl}${path}`)

      expect(response).toEqual({
        ...JSON.parse(content),
        next: expect.any(Function),
        previous: null,
      })
    })

    it('should throw an error if the url is not a google scholar url', async () => {
      await expect(parseUrl('https://example.com')).rejects.toThrow()
    })

    it('should retry', async () => {
      nock(baseUrl).get(path).reply(500).get(path).reply(200, page)

      const response = await parseUrl(`${baseUrl}${path}`)

      expect(response).toEqual({
        ...JSON.parse(content),
        next: expect.any(Function),
        previous: null,
      })
    })
  })
})
