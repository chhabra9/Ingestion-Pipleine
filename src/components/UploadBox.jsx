// React hooks for state management and event handling
import { useCallback, useState } from 'react'

// Component-specific styles
import './UploadBox.css'

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
 * UploadBox component for file selection via drag-and-drop or file picker
 * @param {File|null} file - Currently selected file
 * @param {function} onFileSelected - Callback when a file is selected
 */
export default function UploadBox({ file, onFileSelected }) {
  // State to track drag-and-drop visual feedback
  const [isDragging, setIsDragging] = useState(false)

  /**
   * Prevent default drag behavior to allow drop
   * @param {DragEvent} e - Drag event
   */
  const allowDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  /**
   * Handle file drop from drag-and-drop
   * @param {DragEvent} e - Drop event
   */
  const onDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) onFileSelected(dropped)
  }, [onFileSelected])

  /**
   * Handle file selection from file input
   * @param {Event} e - Change event from file input
   */
  const onSelect = useCallback((e) => {
    const picked = e.target.files?.[0]
    if (picked) onFileSelected(picked)
  }, [onFileSelected])

  return (
    <div
      className={`upload-dropzone ${isDragging ? 'dragging' : ''}`}
      onDragEnter={() => setIsDragging(true)}
      onDragOver={allowDrop}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <div className="upload-inner">
        {/* Display selected file info or upload prompt */}
        <div className="upload-title">
          {file ? `Selected: ${file.name} (${formatBytes(file.size)})` : 'Drop file here or click to browse'}
        </div>
        
        {/* Hidden file input with visible label button */}
        <label className="button outline" htmlFor="file-input">Choose File</label>
        <input 
          id="file-input" 
          type="file" 
          accept="video/*,audio/*" 
          onChange={onSelect} 
          style={{ display: 'none' }} 
        />
      </div>
    </div>
  )
}


