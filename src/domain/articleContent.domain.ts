/**
 * Format markdown-like article content to HTML.
 *
 * Notes:
 * - We do lightweight parsing to avoid invalid HTML nesting and keep spacing stable.
 * - This function is pure and should have no app/state dependencies.
 */
export function formatArticleContent(content: string): string {
  const normalized = (content || '').replace(/\r\n/g, '\n')
  const lines = normalized.split('\n')

  const out: string[] = []
  let paragraph: string[] = []
  let listItems: string[] = []

  const inlineFormat = (text: string) => {
    // Bold (**text**)
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  }

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    const html = inlineFormat(paragraph.join('<br />'))
    out.push(`<p class="mb-4">${html}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (listItems.length === 0) return
    out.push(`<ul class="list-disc list-inside mb-4 space-y-2">${listItems.join('')}</ul>`)
    listItems = []
  }

  const emitHeading = (level: 1 | 2 | 3, text: string) => {
    const t = inlineFormat(text.trim())
    if (level === 1) out.push(`<h1 class="typography-h1 text-[#e1ff00] mt-8 mb-4">${t}</h1>`)
    else if (level === 2) out.push(`<h2 class="typography-h2 text-[#e1ff00] mt-8 mb-4">${t}</h2>`)
    else out.push(`<h3 class="typography-h3 text-[#e1ff00] mt-6 mb-3">${t}</h3>`)
  }

  for (const raw of lines) {
    const line = raw ?? ''
    const trimmed = line.trim()

    // Blank line => block separator
    if (trimmed === '') {
      flushList()
      flushParagraph()
      continue
    }

    // Headings
    const h3 = trimmed.match(/^###\s+(.*)$/)
    const h2 = trimmed.match(/^##\s+(.*)$/)
    const h1 = trimmed.match(/^#\s+(.*)$/)
    if (h3 || h2 || h1) {
      flushList()
      flushParagraph()
      if (h3) emitHeading(3, h3[1])
      else if (h2) emitHeading(2, h2[1])
      else if (h1) emitHeading(1, h1[1])
      continue
    }

    // List items (- item)
    const li = trimmed.match(/^- (.*)$/)
    if (li) {
      flushParagraph()
      const item = inlineFormat(li[1])
      listItems.push(`<li class="ml-4 mb-2">${item}</li>`)
      continue
    }

    // Regular text line (part of a paragraph)
    flushList()
    paragraph.push(trimmed)
  }

  flushList()
  flushParagraph()
  return out.join('')
}

