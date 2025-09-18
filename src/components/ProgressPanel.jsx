// Component-specific styles
import './ProgressPanel.css'

/**
 * ProgressPanel component for displaying pipeline progress and step status
 * @param {Array} steps - Array of step definitions with key, label, and durationMs
 * @param {number} currentStepIndex - Index of currently active step (-1 = not started)
 * @param {number} stepProgress - Progress percentage (0-100) for current step
 * @param {number} overallProgress - Overall progress percentage across all steps
 * @param {boolean} processing - Whether pipeline is currently running
 * @param {boolean} paused - Whether pipeline is currently paused
 */
export default function ProgressPanel({ steps, currentStepIndex, stepProgress, overallProgress, processing, paused }) {
  /**
   * Determine the status of a step by its index
   * @param {number} index - The step index to check
   * @returns {string} Status: 'idle', 'pending', 'active', 'paused', or 'done'
   */
  const stepStatus = (index) => {
    if (currentStepIndex === -1) return 'idle'
    if (index < currentStepIndex) return 'done'
    if (index === currentStepIndex) return processing ? (paused ? 'paused' : 'active') : 'done'
    return 'pending'
  }

  return (
    <>
      {/* Overall progress bar */}
      <div className="progress-wrap">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className="progress-label">{Math.round(overallProgress)}%</div>
      </div>

      {/* Individual step details */}
      <div className="steps">
        {steps.map((s, i) => {
          const status = stepStatus(i)
          return (
            <details key={s.key} open>
              <summary className={`step ${status}`}>
                <span>{s.label}</span>
                {/* Show progress percentage for active step */}
                {status === 'active' && <span className="badge">{Math.round(stepProgress)}%</span>}
                {/* Show completion badge for done steps */}
                {status === 'done' && <span className="badge success">Done</span>}
                {/* Show pause indicator for paused step */}
                {status === 'paused' && <span className="badge warn">Paused</span>}
              </summary>
            </details>
          )
        })}
      </div>
    </>
  )
}


