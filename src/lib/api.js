import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod'

export const useApiClient = () => {
  const { getToken } = useAuth()

  const apiCall = async (endpoint, options = {}) => {
    const token = await getToken()

    const config = {
      headers: {
        'Content-Type': 'application/json',

        ...(token && { Authorization: `Bearer ${token}` }),

        ...options.headers
      },

      ...options
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
  }

  return { apiCall }
}
