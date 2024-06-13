import { sanitizeText } from './utils'

describe('sanitizeText', () => {
  it('should remove extra spaces , new lines and trim the text', () => {
    const input = '   Hello    World\n   '
    const expectedOutput = 'Hello World'
    const result = sanitizeText(input)
    expect(result).toBe(expectedOutput)
  })
})
