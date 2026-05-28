import Icon from '../atoms/Icon'

function renderInlineMarkdown(text) {
  return String(text)
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
      }

      return part.replace(/\*/g, '')
    })
}

function normalizeMarkdownText(text) {
  return String(text)
    .replace(/\r\n/g, '\n')
    .replace(/\s*(\*\*[^*]+:\*\*)\s*/g, '\n\n$1\n')
    .replace(/\s+\*\s+/g, '\n- ')
    .replace(/\s+(\d+)\.\s+/g, '\n$1. ')
    .replace(/:\s+(\d+)\.\s+/g, ':\n$1. ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function renderOrderedContent(lines, blockIndex) {
  const elements = []
  const listItems = []
  let introLines = []
  let currentItem = null

  lines.forEach((line) => {
    if (/^\d+\.\s+/.test(line)) {
      if (currentItem) {
        listItems.push(currentItem)
      }

      currentItem = {
        text: line.replace(/^\d+\.\s+/, ''),
        details: [],
      }
      return
    }

    if (line.startsWith('- ')) {
      if (currentItem) {
        currentItem.details.push(line.replace(/^- /, ''))
        return
      }

      introLines.push(line.replace(/^- /, ''))
      return
    }

    if (currentItem) {
      currentItem.details.push(line)
      return
    }

    introLines.push(line)
  })

  if (currentItem) {
    listItems.push(currentItem)
  }

  if (introLines.length) {
    elements.push(
      <p key={`intro-${blockIndex}`}>
        {renderInlineMarkdown(introLines.join(' '))}
      </p>,
    )
  }

  if (listItems.length) {
    elements.push(
      <ol key={`list-${blockIndex}`}>
        {listItems.map((item, itemIndex) => (
          <li key={`${item.text}-${itemIndex}`}>
            <span>{renderInlineMarkdown(item.text)}</span>
            {item.details.length > 0 && (
              <ul>
                {item.details.map((detail, detailIndex) => (
                  <li key={`${detail}-${detailIndex}`}>{renderInlineMarkdown(detail)}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>,
    )
  }

  return elements
}

function MarkdownMessage({ children }) {
  const blocks = normalizeMarkdownText(children).split(/\n{2,}/).filter(Boolean)

  return (
    <div className="chat-message-content">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter(Boolean)

        if (lines.some((line) => /^\d+\.\s+/.test(line))) {
          return renderOrderedContent(lines, blockIndex)
        }

        return (
          <p key={`${block}-${blockIndex}`}>
            {renderInlineMarkdown(lines.join(' '))}
          </p>
        )
      })}
    </div>
  )
}

function formatFileSize(size) {
  if (!size) {
    return 'PDF'
  }

  const sizeInKb = size / 1024

  if (sizeInKb < 1024) {
    return `${Math.max(1, Math.round(sizeInKb))} KB`
  }

  return `${(sizeInKb / 1024).toFixed(1)} MB`
}

export default function ChatBubble({
  children,
  file,
  isResultOpen = false,
  onToggleResult,
  time,
  sender = 'assistant',
}) {
  return (
    <div className={`chat-row chat-row--${sender}`}>
      {sender === 'assistant' && <div className="assistant-avatar">Q</div>}
      <div className="chat-bubble">
        <MarkdownMessage>{children}</MarkdownMessage>
        {file && (
          <div className="chat-attachment">
            <Icon name="document" size={20} />
            <div>
              <strong>{file.name}</strong>
              <span>{formatFileSize(file.size)}</span>
            </div>
          </div>
        )}
        {onToggleResult && (
          <button type="button" className="chat-result-action" onClick={onToggleResult}>
            <Icon name="document" size={17} />
            {isResultOpen ? 'Lihat Hasil Analisis' : 'Lihat Hasil Analisis'}
          </button>
        )}
        <time>{time}</time>
      </div>
    </div>
  )
}
