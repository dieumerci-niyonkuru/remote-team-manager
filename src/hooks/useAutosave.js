import { useEffect, useRef, useState } from 'react'

/**
 * useAutosave - Automatically saves form data to localStorage
 * and restores it on page reload.
 *
 * @param {string} key - Unique storage key (e.g. 'task-create-form')
 * @param {object} data - The current form state
 * @param {number} delay - Debounce delay in ms (default: 1000)
 * @returns {{ isDirty, clearSaved, hasSaved }} 
 *
 * Usage:
 *   const { isDirty, clearSaved } = useAutosave('create-task', form, 800)
 */
export function useAutosave(key, data, delay = 1000) {
  const [isDirty, setIsDirty] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  const timerRef = useRef(null)
  const storageKey = `rtm_autosave_${key}`

  // Save to localStorage after debounce
  useEffect(() => {
    if (!data || Object.keys(data).length === 0) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      const serialized = JSON.stringify({ data, savedAt: new Date().toISOString() })
      localStorage.setItem(storageKey, serialized)
      setIsDirty(false)
      setHasSaved(true)
    }, delay)
    setIsDirty(true)
    return () => clearTimeout(timerRef.current)
  }, [JSON.stringify(data)])

  // Load saved data from localStorage
  const loadSaved = () => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return null
      const { data, savedAt } = JSON.parse(stored)
      return { data, savedAt }
    } catch { return null }
  }

  // Clear saved data (call after successful submit)
  const clearSaved = () => {
    localStorage.removeItem(storageKey)
    setHasSaved(false)
    setIsDirty(false)
  }

  return { isDirty, hasSaved, clearSaved, loadSaved }
}

export default useAutosave
