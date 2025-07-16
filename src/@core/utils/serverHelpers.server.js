import 'server-only'
import { cookies } from 'next/headers'
import themeConfig from '@configs/themeConfig'

export async function getSettingsFromCookie() {
  const cookieStore = cookies()
  const cookieName = themeConfig.settingsCookieName

  return JSON.parse(cookieStore.get(cookieName)?.value || '{}')
}

export async function getMode() {
  const settingsCookie = await getSettingsFromCookie()
  return settingsCookie.mode || themeConfig.mode
}

export async function getSystemMode() {
  const cookieStore = cookies()
  const mode = await getMode()
  const colorPrefCookie = cookieStore.get('colorPref')?.value || 'light'

  return (mode === 'system' ? colorPrefCookie : mode) || 'light'
}

export async function getServerMode() {
  const mode = await getMode()
  const systemMode = await getSystemMode()
  return mode === 'system' ? systemMode : mode
}

export async function getSkin() {
  const settingsCookie = await getSettingsFromCookie()
  return settingsCookie.skin || 'default'
}
