import { createContext, useContext, useState, useEffect } from 'react'

export type FontSize = 'sm' | 'md' | 'lg'

const SCALE: Record<FontSize, string> = {
  sm: '87.5%',   // ~14px base
  md: '100%',    // 16px base (default)
  lg: '118.75%', // ~19px base
}

const LS_KEY = 'templeos-fontsize'

interface FontSizeCtx {
  fontSize: FontSize
  setFontSize: (s: FontSize) => void
}

const FontSizeContext = createContext<FontSizeCtx>({
  fontSize: 'md',
  setFontSize: () => {},
})

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem(LS_KEY)
    return (saved === 'sm' || saved === 'md' || saved === 'lg') ? saved : 'md'
  })

  useEffect(() => {
    document.documentElement.style.fontSize = SCALE[fontSize]
    localStorage.setItem(LS_KEY, fontSize)
  }, [fontSize])

  const setFontSize = (s: FontSize) => setFontSizeState(s)

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  )
}

export const useFontSize = () => useContext(FontSizeContext)
