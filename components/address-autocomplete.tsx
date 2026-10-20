'use client'

import { useEffect, useRef, useState } from 'react'

interface Suggestion {
  display_name: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  inputStyle?: React.CSSProperties
  icon?: React.ReactNode
}

// Free, no-API-key address search via OpenStreetMap's Nominatim service.
export function AddressAutocomplete({ value, onChange, placeholder, inputStyle, icon }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the input in sync when the parent changes `value` (e.g. after loading the profile).
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setQuery(value)
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleInput(next: string) {
    setQuery(next)
    onChange(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (next.trim().length < 3) { setSuggestions([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=0&limit=5&q=${encodeURIComponent(next)}`
        )
        const data: Suggestion[] = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch {
        setSuggestions([])
      }
    }, 450)
  }

  function pick(s: Suggestion) {
    setQuery(s.display_name)
    onChange(s.display_name)
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      {icon}
      <input
        value={query}
        onChange={e => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        style={inputStyle}
        autoComplete="off"
      />
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
            background: '#fff', border: '1px solid #e9e9e7', borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 30, overflow: 'hidden',
            maxHeight: 220, overflowY: 'auto',
          }}
        >
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => pick(s)}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px',
                fontSize: 13.5, color: '#37352f', background: 'transparent', border: 'none',
                cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #f3f2f0' : 'none',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f7f7f5' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {s.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AddressAutocomplete
