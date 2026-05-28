import ResultPanel from './ResultPanel'

export default function MobileResultSheet({ isOpen, onClose, ...resultProps }) {
  return (
    <>
      {isOpen && (
        <div className="mobile-result-sheet" role="dialog" aria-label="Hasil Analisis RAB">
          <div className="mobile-result-sheet__bar">
            <span className="mobile-result-sheet__handle" />
          </div>
          <ResultPanel onClose={onClose} {...resultProps} />
        </div>
      )}
    </>
  )
}
