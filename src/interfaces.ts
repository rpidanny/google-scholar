export enum PaperSourceType {
  PDF = 'pdf',
  HTML = 'html',
}

export interface IPaperSource {
  type: PaperSourceType
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

export interface IPaperMetadata {
  title: string
  url: string
  authors: IAuthor[]
  description: string
  relatedArticlesUrl: string | null
  source: IPaperSource
  citation: ICitation
}

export interface IPageContent {
  papers: IPaperMetadata[]
  totalPapers: number
  nextUrl: string | null
  prevUrl: string | null
  next: (() => Promise<IPageContent>) | null
  previous: (() => Promise<IPageContent>) | null
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
