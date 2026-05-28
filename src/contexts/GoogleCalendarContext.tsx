import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const STORAGE_KEY = 'gcal-token'

interface StoredToken { token: string; expiry: number }

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any
  }
}

function readStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const { token, expiry } = JSON.parse(raw) as StoredToken
    if (Date.now() > expiry) { localStorage.removeItem(STORAGE_KEY); return null }
    return token
  } catch { return null }
}

interface GoogleCalendarCtx {
  isConnected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  getToken: () => Promise<string>
}

const Ctx = createContext<GoogleCalendarCtx | null>(null)

function loadGis(): Promise<void> {
  if (document.getElementById('gis-script')) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.id = 'gis-script'
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('GIS 스크립트 로드 실패'))
    document.head.appendChild(s)
  })
}

export function GoogleCalendarProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => { loadGis().catch(() => {}) }, [])

  const requestToken = useCallback((): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        await loadGis()
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          callback: (resp: { access_token?: string; error?: string }) => {
            if (!resp.access_token) {
              reject(new Error(resp.error ?? 'Google 인증 실패'))
              return
            }
            const expiry = Date.now() + 55 * 60 * 1000
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: resp.access_token, expiry }))
            setToken(resp.access_token)
            resolve(resp.access_token)
          },
        })
        client.requestAccessToken()
      } catch (e) {
        reject(e)
      }
    })
  }, [])

  const connect = useCallback(async () => {
    setConnecting(true)
    try { await requestToken() } catch (e) { console.error(e) } finally { setConnecting(false) }
  }, [requestToken])

  const disconnect = useCallback(() => {
    if (token) window.google?.accounts.oauth2.revoke(token, () => {})
    localStorage.removeItem(STORAGE_KEY)
    setToken(null)
  }, [token])

  const getToken = useCallback(async (): Promise<string> => {
    if (token) return token
    return requestToken()
  }, [token, requestToken])

  return (
    <Ctx.Provider value={{ isConnected: !!token, connecting, connect, disconnect, getToken }}>
      {children}
    </Ctx.Provider>
  )
}

export function useGoogleCalendar() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('GoogleCalendarProvider 안에서 사용하세요')
  return ctx
}
