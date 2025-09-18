// React hooks for state management and side effects
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Component styles and child components
import './App.css'
import UploadBox from './components/UploadBox.jsx'
import ProgressPanel from './components/ProgressPanel.jsx'

/**
 * Configuration for the video ingestion pipeline steps
 * Each step defines a processing stage with its display label and simulated duration
 */
const STEP_DEFINITIONS = [
  { key: 'extract', label: 'Extract audio (ffmpeg)', durationMs: 2000 },
  { key: 'transcribe', label: 'Transcribe (Whisper)', durationMs: 3000 },
  { key: 'parse', label: 'Parse fields (AI+rules)', durationMs: 2000 },
  { key: 'merge', label: 'Merge top/bottom', durationMs: 1500 },
  { key: 'screenshots', label: 'Auto screenshots', durationMs: 1500 },
  { key: 'excel', label: 'Build Excel report', durationMs: 1500 },
]

/**
 * Utility function to format byte values into human-readable strings
 * @param {number} bytes - The number of bytes to format
 * @returns {string} Formatted string with appropriate unit (KB, MB, GB, etc.)
 */
function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return ''
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Main App component for the video ingestion pipeline
 * Manages file upload, processing state, and step progression
 */
function App() {
  // State for the selected file
  const [file, setFile] = useState(null)
  
  // Processing state management
  const [processing, setProcessing] = useState(false)
  const [paused, setPaused] = useState(false)
  
  // Step tracking - currentStepIndex: -1 = not started, 0+ = current step
  const [currentStepIndex, setCurrentStepIndex] = useState(-1)
  const [stepProgress, setStepProgress] = useState(0) // 0-100 for active step
  
  // Refs for animation and timing control
  const timerRef = useRef(null) // Animation frame reference
  const stepStartRef = useRef(0) // Timestamp when current step started
  const elapsedRef = useRef(0) // Total elapsed time for current step

  /**
   * Calculate overall progress percentage across all steps
   * Combines completed steps with current step progress
   */
  const overallProgress = useMemo(() => {
    const totalSteps = STEP_DEFINITIONS.length
    const completedSteps = Math.max(0, currentStepIndex)
    const perStepWeight = 100 / totalSteps
    const completedPct = completedSteps * perStepWeight
    const activePct = (stepProgress / 100) * perStepWeight
    return Math.min(100, Math.max(0, completedPct + activePct))
  }, [currentStepIndex, stepProgress])

  /**
   * Start the processing pipeline
   * Resets all progress and begins with the first step
   */
  const startProcessing = useCallback(() => {
    if (!file) return
    setProcessing(true)
    setPaused(false)
    setCurrentStepIndex(0)
    setStepProgress(0)
    elapsedRef.current = 0
    stepStartRef.current = performance.now()
  }, [file])

  /**
   * Pause the current processing step
   */
  const pause = useCallback(() => {
    setPaused(true)
  }, [])

  /**
   * Resume processing from where it was paused
   * Adjusts timing to account for pause duration
   */
  const resume = useCallback(() => {
    if (!processing) return
    setPaused(false)
    stepStartRef.current = performance.now() - elapsedRef.current
  }, [processing])

  /**
   * Reset all processing state and stop any running animations
   */
  const reset = useCallback(() => {
    setProcessing(false)
    setPaused(false)
    setCurrentStepIndex(-1)
    setStepProgress(0)
    elapsedRef.current = 0
    stepStartRef.current = 0
    if (timerRef.current) cancelAnimationFrame(timerRef.current)
  }, [])

  /**
   * Effect to handle step progression animation
   * Runs a smooth progress animation for the current step
   */
  useEffect(() => {
    if (!processing || paused || currentStepIndex < 0) return
    const step = STEP_DEFINITIONS[currentStepIndex]
    if (!step) return

    /**
     * Animation tick function that updates progress
     * Uses requestAnimationFrame for smooth 60fps updates
     */
    const tick = () => {
      const now = performance.now()
      elapsedRef.current = now - stepStartRef.current
      const pct = Math.min(100, (elapsedRef.current / step.durationMs) * 100)
      setStepProgress(pct)
      
      if (pct >= 100) {
        // Current step completed - move to next step or finish
        if (currentStepIndex + 1 < STEP_DEFINITIONS.length) {
          setCurrentStepIndex((i) => i + 1)
          setStepProgress(0)
          elapsedRef.current = 0
          stepStartRef.current = performance.now()
        } else {
          // All steps completed
          setProcessing(false)
        }
        return
      }
      timerRef.current = requestAnimationFrame(tick)
    }

    timerRef.current = requestAnimationFrame(tick)
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current)
    }
  }, [processing, paused, currentStepIndex])

  /**
   * Handle file selection from UploadBox
   * @param {File} picked - The selected file
   */
  const handleFile = useCallback((picked) => {
    setFile(picked)
    reset()
  }, [reset])

  /**
   * Determine the status of a step by its index
   * @param {number} index - The step index to check
   * @returns {string} Status: 'idle', 'pending', 'active', 'paused', or 'done'
   */
  const stepStatus = useCallback((index) => {
    if (currentStepIndex === -1) return 'idle'
    if (index < currentStepIndex) return 'done'
    if (index === currentStepIndex) return processing ? (paused ? 'paused' : 'active') : 'done'
    return 'pending'
  }, [currentStepIndex, processing, paused])

  return (
    <div className="page">
      <div className="card">
        <div className="card-title">Ingest Video</div>

        {/* File upload component */}
        <UploadBox file={file} onFileSelected={handleFile} />

        {/* Progress visualization component */}
        <ProgressPanel
          steps={STEP_DEFINITIONS}
          currentStepIndex={currentStepIndex}
          stepProgress={stepProgress}
          overallProgress={overallProgress}
          processing={processing}
          paused={paused}
        />

        {/* Control buttons */}
        <div className="actions">
          <button 
            className="button primary" 
            disabled={!file || processing} 
            onClick={startProcessing}
          >
            Run Pipeline
          </button>
          <button 
            className="button" 
            disabled={!processing || paused} 
            onClick={pause}
          >
            Pause
          </button>
          <button 
            className="button" 
            disabled={!processing || !paused} 
            onClick={resume}
          >
            Resume
          </button>
          <button 
            className="button outline" 
            disabled={!file && !processing && currentStepIndex === -1} 
            onClick={reset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
