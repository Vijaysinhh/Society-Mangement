import { useState, useEffect } from 'react'
import { translations, Language } from './translations'

export const useTranslations = () => {
  const [language, setLanguage] = useState<Language>('en')

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('watchmanLanguage') as Language
    if (savedLanguage && ['en', 'hi', 'mr'].includes(savedLanguage)) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference when changed
  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('watchmanLanguage', newLanguage)
  }

  return {
    language,
    changeLanguage,
    t: translations[language],
  }
}
