export enum PaperUrlType {
  PDF = 'pdf',
  HTML = 'html',
}

export interface IPaper {
  type: PaperUrlType
  url: string
}

export interface IAuthor {
  name: string
  url: string | null
}

export interface ICitation {
  count: number
  url: string | null
}

export interface IGoogleScholarResult {
  title: string
  url: string
  authors: IAuthor[]
  description: string
  relatedArticlesUrl: string | null
  paper: IPaper
  citation: ICitation
}

export interface ISearchResponse {
  results: IGoogleScholarResult[]
  count: number
  nextUrl: string | null
  prevUrl: string | null
  next: (() => Promise<ISearchResponse>) | null
  previous: (() => Promise<ISearchResponse>) | null
}

export interface ICitations {
  count: number
  url: string
}

/* Dependency Interfaces */

export interface IWebClient {
  getContent(url: string): Promise<string>
}

export interface ILogger {
  debug(message: string): void
  info(message: string): void
  error(message: string): void
  warn(message: string): void
}

/* End Dependency */

/* Options */

export interface ISearchOptions {
  keywords: string
  yearLow?: number
  yearHigh?: number
  authors?: string[]
}
