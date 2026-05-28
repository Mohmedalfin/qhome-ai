import { useEffect, useRef, useState } from 'react'
import IconButton from '../atoms/IconButton'
import Icon from '../atoms/Icon'

export default function ChatComposer({ disabled = false, onSendMessage }) {
  const [message, setMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  const hasContent = message.trim() || selectedFile

  const resizeTextarea = () => {
    const textarea = textareaRef.current

    if (!textarea) {
      return
    }

    textarea.style.height = '0px'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`
  }

  useEffect(() => {
    resizeTextarea()
  }, [message])

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const [file] = event.target.files

    if (file) {
      setSelectedFile(file)
    }
  }

  const clearSelectedFile = () => {
    setSelectedFile(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!hasContent || disabled) {
      return
    }

    onSendMessage({
      text: message,
      file: selectedFile,
    })
    setMessage('')
    clearSelectedFile()
  }

  const handleMessageChange = (event) => {
    setMessage(event.target.value)
  }

  const handleMessageKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit(event)
    }
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      {selectedFile && (
        <div className="chat-composer__file" title={selectedFile.name}>
          <Icon name="document" size={18} />
          <span>{selectedFile.name}</span>
          <button type="button" aria-label="Hapus file" onClick={clearSelectedFile}>
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      <div className="chat-composer__controls">
        <IconButton icon="plus" label="Tambah PDF atau foto" onClick={openFilePicker} disabled={disabled} />
        <input
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
          className="chat-composer__file-input"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled}
        />
        <textarea
          rows="1"
          placeholder="Ketik pesan Anda..."
          aria-label="Ketik pesan Anda"
          className="chat-composer__textarea"
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleMessageKeyDown}
          disabled={disabled}
        />
        <IconButton icon="paperclip" label="Lampirkan PDF atau foto" onClick={openFilePicker} disabled={disabled} />
        <button type="submit" className="send-button" aria-label="Kirim pesan" disabled={!hasContent || disabled}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="m22 2-7 20-4-9-9-4 20-7Z" fill="currentColor" />
            <path d="M22 2 11 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </form>
  )
}
