import { useEffect, useRef, useState } from 'react'
import ChatBubble from '../molecules/ChatBubble'
import ChatComposer from '../molecules/ChatComposer'

const defaultProcessingMessages = [
  'Menganalisis file RAB...',
  'Mengekstrak item dari dokumen...',
  'Mencocokkan item dengan katalog QHome...',
]

export default function ChatPanel({
  isAgentThinking,
  isResultOpen,
  messages,
  processingMessages = defaultProcessingMessages,
  isComposerDisabled = false,
  onToggleResult,
  onSendMessage,
}) {
  const scrollAreaRef = useRef(null)
  const [processingStepIndex, setProcessingStepIndex] = useState(0)

  useEffect(() => {
    const scrollArea = scrollAreaRef.current

    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight
    }
  }, [messages, isAgentThinking])

  useEffect(() => {
    if (!isAgentThinking) {
      return undefined
    }

    const intervalId = setInterval(() => {
      setProcessingStepIndex((currentIndex) => (currentIndex + 1) % processingMessages.length)
    }, 1400)

    return () => {
      clearInterval(intervalId)
    }
  }, [isAgentThinking, processingMessages.length])

  return (
    <section className="chat-panel">
      <div className="chat-scroll-area" ref={scrollAreaRef}>
        <div className="chat-thread">
          {messages.map((message) => (
            <ChatBubble
              file={message.file}
              isResultOpen={isResultOpen}
              key={message.id}
              onToggleResult={message.resultAvailable ? onToggleResult : undefined}
              sender={message.sender}
              time={message.time}
            >
              {message.text}
            </ChatBubble>
          ))}
          {isAgentThinking && (
            <div className="chat-row chat-row--assistant">
              <div className="assistant-avatar">Q</div>
              <div className="chat-processing-stack">
                <div className="chat-processing-hint" role="status" aria-live="polite">
                  <span className="chat-processing-hint__dot" />
                  <strong>{processingMessages[processingStepIndex % processingMessages.length]}</strong>
                </div>
                <div className="chat-bubble chat-bubble--typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatComposer disabled={isComposerDisabled} onSendMessage={onSendMessage} />
    </section>
  )
}
