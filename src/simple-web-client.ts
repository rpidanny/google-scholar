import got from 'got'

import { IWebClient } from './interfaces'

export class SimpleWebClient implements IWebClient {
  async getContent(url: string): Promise<string> {
    const resp = await got(url, {
      timeout: 10_000,
      retry: 3,
    })
    return resp.body
  }
}
