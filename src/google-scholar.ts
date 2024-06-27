import Bottleneck from 'bottleneck'
import * as cheerio from 'cheerio'

import {
  IAuthor,
  ICitation,
  ILogger,
  IPageContent,
  IPaper,
  IPaperMetadata,
  ISearchOptions,
  IWebClient,
  PaperUrlType,
} from './interfaces'
import { sanitizeText } from './utils'

export class GoogleScholar {
  private GOOGLE_SCHOLAR_URL_PREFIX: string = 'https://scholar.google.com'
  private GOOGLE_SCHOLAR_URL: string = `${this.GOOGLE_SCHOLAR_URL_PREFIX}/scholar`

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

  /*
   * Returns the google scholar url for the given search options
   */
  public getSearchUrl({ keywords, yearHigh, yearLow, authors }: ISearchOptions): string {
    // eslint-disable-next-line camelcase
    const params = new URLSearchParams({ hl: 'en', as_q: keywords })

    if (authors) {
      params.append('as_sauthors', authors.map(author => `"${author}"`).join(' '))
    }

    if (yearLow) {
      params.append('as_ylo', yearLow.toString())
    }

    if (yearHigh) {
      params.append('as_yhi', yearHigh.toString())
    }

    return `${this.GOOGLE_SCHOLAR_URL}?${params.toString()}`
  }

  /*
   * Searches google scholar with the given search options and returns the concent of the first page
   */
  public async search(opts: ISearchOptions): Promise<IPageContent> {
    return this.parseUrl(this.getSearchUrl(opts))
  }

  /*
   * Iterates through all search result pages,
   * invoking the provided function on each page until it returns false
   * or there are no more pages.
   */
  public async iteratePages(
    opts: ISearchOptions,
    onPage: (page: IPageContent) => Promise<boolean>,
  ): Promise<void> {
    const results: IPaperMetadata[] = []
    let next: (() => Promise<IPageContent>) | null = async () => this.search(opts)

    while (next) {
      const page = await next()
      results.push(...page.papers)
      if (!(await onPage(page))) break
      next = page.next
    }
  }

  /*
   * Parses the given google scholar url
   */
  public async parseUrl(url: string): Promise<IPageContent> {
    if (!this.isValidUrl(url)) throw new Error(`Invalid URL: ${url}`)

    this.logger?.debug(`Searching by URL: ${url}`)

    return this.perMinLimiter.schedule(() => {
      return this.perSecLimiter.schedule(async () => {
        const html = await this.webClient.getContent(url)
        return this.processHtml(html)
      })
    })
  }

  private getUrl(path: string): string {
    return `${this.GOOGLE_SCHOLAR_URL_PREFIX}${path}`
  }

  private processHtml(html: string): IPageContent {
    const $ = cheerio.load(html)

    const papers = $('.gs_r').filter((_, element) => {
      return $(element).find('.gs_ri h3').length > 0
    })

    const next = $('.gs_ico_nav_next').parent().attr('href')
    const prev = $('.gs_ico_nav_previous').parent().attr('href')

    const nextUrl = next ? this.getUrl(next) : null
    const prevUrl = prev ? this.getUrl(prev) : null

    return {
      papers: papers.toArray().map(paper => this.parsePaperElement($, $(paper))),
      totalPapers: this.getTotalPapersCount($),
      nextUrl,
      prevUrl,
      next: nextUrl ? async () => this.parseUrl(nextUrl) : null,
      previous: prevUrl ? async () => this.parseUrl(prevUrl) : null,
    }
  }

  private parsePaperElement(
    $: cheerio.CheerioAPI,
    result: cheerio.Cheerio<cheerio.Element>,
  ): IPaperMetadata {
    const title = sanitizeText(result.find('.gs_ri h3').text())
    const url = result.find('.gs_ri h3 a').attr('href') || ''
    const description = sanitizeText(result.find('.gs_rs').text())

    return {
      title,
      url,
      description,
      paper: this.getPaper(result),
      authors: this.getAuthors($, result),
      citation: this.getCitation($, result),
      relatedArticlesUrl: this.getRelatedArticlesUrl($, result),
    }
  }

  private getPaper(result: cheerio.Cheerio<cheerio.Element>): IPaper {
    const type =
      result.find('span.gs_ctg2').text() === '[PDF]' ? PaperUrlType.PDF : PaperUrlType.HTML
    const url = result.find('.gs_ggsd a').attr('href') || ''

    return {
      type,
      url,
    }
  }

  private getAuthors(
    $: cheerio.CheerioAPI,
    result: cheerio.Cheerio<cheerio.Element>,
  ): Array<IAuthor> {
    const authorElements = result.find('.gs_a').find('a')

    return authorElements.toArray().map(authorElement => {
      const url = $(authorElement).attr('href')

      return {
        name: $(authorElement).text(),
        url: url ? this.getUrl(url) : null,
      }
    })
  }

  private getCitation($: cheerio.CheerioAPI, result: cheerio.Cheerio<cheerio.Element>): ICitation {
    const citationElement = result.find('.gs_fl a').filter((_, element) => {
      return $(element).text().includes('Cited by')
    })

    const url = citationElement.attr('href')

    return {
      count: parseInt(citationElement.text().replace(/\D/g, '')) || 0,
      url: url ? this.getUrl(url) : null,
    }
  }

  private getRelatedArticlesUrl(
    $: cheerio.CheerioAPI,
    result: cheerio.Cheerio<cheerio.Element>,
  ): string | null {
    const element = result.find('.gs_fl a').filter((_, el) => {
      return $(el).text().includes('Related articles')
    })

    const url = element.attr('href')

    if (url) {
      return this.getUrl(url)
    }

    return null
  }

  private getTotalPapersCount($: cheerio.CheerioAPI): number {
    const resultsCountText = $('#gs_ab_md').text()
    const resultsCountMatch = resultsCountText.match(/\W*((\d+|\d{1,3}(.\d{3})*)(\.\d+)?) results/)

    return resultsCountMatch ? parseInt(resultsCountMatch[1].replace(/\./g, '')) : 0
  }

  private isValidUrl(url: string): boolean {
    return url.startsWith(this.GOOGLE_SCHOLAR_URL_PREFIX)
  }
}
