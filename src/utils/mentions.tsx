/**
 * Parse @mentions from text and convert to React elements
 */

import { Fragment } from 'react'

export interface MentionMatch {
  type: 'text' | 'mention'
  content: string
  mention?: string // username without @
}

export function parseMentions(text: string): MentionMatch[] {
  const parts: MentionMatch[] = []
  const mentionRegex = /@(\w+)/g
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index),
      })
    }

    // Add mention
    parts.push({
      type: 'mention',
      content: match[0], // @username
      mention: match[1], // username
    })

    lastIndex = mentionRegex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    })
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}

export function renderMentions(text: string): JSX.Element {
  const parts = parseMentions(text)

  return (
    <Fragment>
      {parts.map((part, idx) => {
        if (part.type === 'mention') {
          return (
            <span
              key={idx}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              title={`Mentioned: ${part.mention}`}
            >
              {part.content}
            </span>
          )
        }
        return <span key={idx}>{part.content}</span>
      })}
    </Fragment>
  )
}


