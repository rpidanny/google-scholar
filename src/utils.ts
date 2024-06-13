export function sanitizeText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}
