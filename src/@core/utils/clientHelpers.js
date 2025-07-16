'use client'

// Config Import
import themeConfig from '@configs/themeConfig'

// Helper to read cookies in client-side
const getCookie = name => {
  if (typeof document === 'undefined') return null

  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))

  return match ? decodeURIComponent(match[2]) : null
}

// Get settings from cookie
export const getSettingsFromCookie = () => {
  try {
    const cookieName = themeConfig.settingsCookieName
    const cookieValue = getCookie(cookieName)

    return cookieValue ? JSON.parse(cookieValue) : {}
  } catch (err) {
    console.error('Failed to parse settings cookie', err)

    return {}
  }
}

// Get mode from settings cookie
export const getMode = () => {
  const settingsCookie = getSettingsFromCookie()

  return settingsCookie.mode || themeConfig.mode
}

// Get system mode based on color preference
export const getSystemMode = () => {
  const mode = getMode()
  const colorPref = getCookie('colorPref') || 'light'

  return mode === 'system' ? colorPref : mode || 'light'
}

// Get skin from settings cookie
export const getSkin = () => {
  const settingsCookie = getSettingsFromCookie()

  return settingsCookie.skin || 'default'
}
