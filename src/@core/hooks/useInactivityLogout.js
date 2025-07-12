import { Auth } from 'aws-amplify'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearReduxStore } from 'src/common-functions/utils/UtilityFunctions'

const INACTIVITY_TIMEOUT = 10 * 60 * 1000 // 10 minutes

export default function useInactivityLogout() {
  const dispatch = useDispatch()

  useEffect(() => {
    const resetTimer = () => {
      localStorage.setItem('lastActivity', Date.now())
    }

    const checkInactivity = async () => {
      const lastActivity = localStorage.getItem('lastActivity')
      if (lastActivity && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        await Auth.signOut()
        localStorage.removeItem('lastActivity')
        clearReduxStore(dispatch)
        window.location.reload() // Reload to reflect logout
      }
    }

    const signout = async () => {
      //Auth.signOut()
      //localStorage.clear()
      //sessionStorage.clear()
    }

    resetTimer() // Set initial timestamp
    checkInactivity() // Check on page load

    const interval = setInterval(checkInactivity, 60000) // Check every minute

    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keypress', resetTimer)
    window.addEventListener('click', resetTimer)
    window.addEventListener('scroll', resetTimer)
    window.addEventListener('beforeunload', signout)

    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keypress', resetTimer)
      window.removeEventListener('click', resetTimer)
      window.removeEventListener('scroll', resetTimer)
      window.removeEventListener('beforeunload', signout)
    }
  }, [])

  return null
}
