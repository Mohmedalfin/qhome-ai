import Icon from '../atoms/Icon'

export default function WorkspaceCard({ steps }) {
  return (
    <section className="workspace-card">
      <header>
        <Icon name="sparkle" size={24} />
        <strong>AI Workspace</strong>
      </header>
      <div className="workspace-card__steps">
        {steps.map((step) => (
          <div className="workspace-step" key={step.title}>
            <span>
              <Icon name="check" size={15} />
            </span>
            <strong>{step.title}</strong>
            <small>Selesai</small>
          </div>
        ))}
      </div>
    </section>
  )
}
