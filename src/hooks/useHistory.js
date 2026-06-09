import { useCallback, useRef, useState } from 'react'

// Undo/redo state container for a single value (the rack).
//
//   set(updater, { coalesce })  -> push a new state (updater can be value or fn).
//        Passing the same `coalesce` key on consecutive calls merges them into a
//        single history entry (e.g. typing in a name field = one undo step).
//   reset(value)                -> replace the value AND clear history (load/new).
//   undo() / redo()
//   canUndo / canRedo
export function useHistory(initial) {
  const [state, setState] = useState({ past: [], present: initial, future: [] })
  const coalesceRef = useRef(null)

  const set = useCallback((updater, options = {}) => {
    const { coalesce = null } = options
    setState((s) => {
      const next = typeof updater === 'function' ? updater(s.present) : updater
      if (next === s.present) return s
      if (coalesce && coalesceRef.current === coalesce && s.past.length > 0) {
        return { past: s.past, present: next, future: [] }
      }
      coalesceRef.current = coalesce
      return { past: [...s.past, s.present], present: next, future: [] }
    })
  }, [])

  const reset = useCallback((value) => {
    coalesceRef.current = null
    setState({ past: [], present: value, future: [] })
  }, [])

  const undo = useCallback(() => {
    coalesceRef.current = null
    setState((s) => {
      if (s.past.length === 0) return s
      const previous = s.past[s.past.length - 1]
      return {
        past: s.past.slice(0, -1),
        present: previous,
        future: [s.present, ...s.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    coalesceRef.current = null
    setState((s) => {
      if (s.future.length === 0) return s
      const next = s.future[0]
      return {
        past: [...s.past, s.present],
        present: next,
        future: s.future.slice(1),
      }
    })
  }, [])

  return {
    value: state.present,
    set,
    reset,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }
}
