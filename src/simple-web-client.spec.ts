import { SimpleWebClient } from './simple-web-client'

describe('SimpleWebClient', () => {
  const webClient = new SimpleWebClient()

  describe('getContent', () => {
    it('should return the content of a page', async () => {
      const url = 'https://example.com'
      const expectedContent = '<h1>Example Domain</h1>'

      const result = await webClient.getContent(url)

      expect(result).toContain(expectedContent)
      expect(result).toContain('</html>')
    })
  })
})
