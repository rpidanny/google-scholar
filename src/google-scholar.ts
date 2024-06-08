import Bottleneck from 'bottleneck'
import * as cheerio from 'cheerio'

import {
  IAuthor,
  ICitation,
  IGoogleScholarResult,
  ILogger,
  ISearchResponse,
  IWebClient,
} from './interfaces'

export class GoogleScholar {
  private GOOGLE_SCHOLAR_URL_PREFIX: string = 'https://scholar.google.com'
  private GOOGLE_SCHOLAR_URL: string = `${this.GOOGLE_SCHOLAR_URL_PREFIX}/scholar?hl=en&q=`

  private perSecLimiter!: Bottleneck
  private perMinLimiter!: Bottleneck

  constructor(
    private readonly webClient: IWebClient,
    private readonly logger?: ILogger,
  ) {
    this.perSecLimiter = new Bottleneck({
      reservoir: 5, // Allow 5 requests per second
      reservoirRefreshAmount: 1, // Refill 1 request every 200 milliseconds
      reservoirRefreshInterval: 200, // Refill every 200 milliseconds
    })
    this.perMinLimiter = new Bottleneck({
      reservoir: 60, // Allow 60 requests per minute
      reservoirRefreshAmount: 1, // Refill 1 request every second
      reservoirRefreshInterval: 1_000, // Refill every 1 second
    })
  }

  private getSearchUrl(keywords: string): string {
    return `${this.GOOGLE_SCHOLAR_URL}${encodeURIComponent(keywords)}`
  }

  private processHtml(html: string): ISearchResponse {
    const $ = cheerio.load(html)

    const results = $('.gs_r').filter((_, element) => {
      return $(element).find('.gs_ri h3').length > 0
    })

    const nextUrl = $('.gs_ico_nav_next').parent().attr('href')
    const prevUrl = $('.gs_ico_nav_previous').parent().attr('href')

    return {
      results: results.toArray().map(result => this.parseResult($, $(result))),
      count: this.getResultsCount($),
      nextUrl: nextUrl ? `${this.GOOGLE_SCHOLAR_URL_PREFIX}${nextUrl}` : null,
      prevUrl: prevUrl ? `${this.GOOGLE_SCHOLAR_URL_PREFIX}${prevUrl}` : null,
      next: nextUrl ? async () => this.parseUrl(nextUrl) : null,
      previous: prevUrl ? async () => this.parseUrl(prevUrl) : null,
    }
  }

  private parseResult(
    $: cheerio.CheerioAPI,
    result: cheerio.Cheerio<cheerio.Element>,
  ): IGoogleScholarResult {
    const title = result.find('.gs_ri h3').text().trim()
    const url = result.find('.gs_ri h3 a').attr('href') || ''
    const paperUrl = result.find('.gs_ggsd a').attr('href') || ''
    const description = result.find('.gs_rs').text().trim()

    return {
      title,
      url,
      description,
      paperUrl,
      authors: this.getAuthors($, result),
      citation: this.getCitation($, result),
      relatedArticlesUrl: this.getRelatedArticlesUrl($, result),
    }
  }

  private getAuthors(
    $: cheerio.CheerioAPI,
    result: cheerio.Cheerio<cheerio.Element>,
  ): Array<IAuthor> {
    const authorElements = result.find('.gs_a').find('a')

    return authorElements.toArray().map(authorElement => {
      return {
        name: $(authorElement).text(),
        url: `${this.GOOGLE_SCHOLAR_URL_PREFIX}${$(authorElement).attr('href')}` || '',
      }
    })
  }

  private getCitation($: cheerio.CheerioAPI, result: cheerio.Cheerio<cheerio.Element>): ICitation {
    const citationElement = result.find('.gs_fl a').filter((_, element) => {
      return $(element).text().includes('Cited by')
    })

    return {
      count: parseInt(citationElement.text().replace(/\D/g, '')) || 0,
      url: `${this.GOOGLE_SCHOLAR_URL_PREFIX}${citationElement.attr('href')}` || '',
    }
  }

  private getRelatedArticlesUrl(
    $: cheerio.CheerioAPI,
    result: cheerio.Cheerio<cheerio.Element>,
  ): string {
    const element = result.find('.gs_fl a').filter((_, el) => {
      return $(el).text().includes('Related articles')
    })

    return `${this.GOOGLE_SCHOLAR_URL_PREFIX}${element.attr('href')}` || ''
  }

  private getResultsCount($: cheerio.CheerioAPI): number {
    const resultsCountText = $('#gs_ab_md').text()
    const resultsCountMatch = resultsCountText.match(/\W*((\d+|\d{1,3}(.\d{3})*)(\.\d+)?) results/)

    return resultsCountMatch ? parseInt(resultsCountMatch[1].replace(/\./g, '')) : 0
  }

  private isValidUrl(url: string): boolean {
    return url.startsWith(this.GOOGLE_SCHOLAR_URL_PREFIX)
  }

  public async search(keywords: string): Promise<ISearchResponse> {
    const url = this.getSearchUrl(keywords)
    return this.parseUrl(url)
  }

  public async parseUrl(url: string): Promise<ISearchResponse> {
    if (!this.isValidUrl(url)) throw new Error('Invalid URL')

    this.logger?.debug(`Searching by URL: ${url}`)

    return this.perMinLimiter.schedule(() => {
      return this.perSecLimiter.schedule(async () => {
        const html = await this.webClient.getContent(url)
        return this.processHtml(html)
      })
    })
  }
}
