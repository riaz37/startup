import axios, { AxiosError, AxiosResponse } from 'axios'
import { toast } from 'sonner'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching
    config.params = {
      ...config.params,
      _t: Date.now(),
    }
    
    // You can add auth tokens here if needed
    // const token = getAuthToken()
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      const errorData = data as any
      
      switch (status) {
        case 400:
          toast.error(errorData.error || 'Bad request')
          break
        case 401:
          toast.error('Unauthorized access')
          // Optionally redirect to login
          // window.location.href = '/auth/signin'
          break
        case 403:
          toast.error('Access forbidden')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 422:
          toast.error(errorData.error || 'Validation error')
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Internal server error')
          break
        default:
          toast.error(errorData.error || 'Something went wrong')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.')
    } else {
      // Other error
      toast.error('An unexpected error occurred')
    }
    
    return Promise.reject(error)
  }
)

export default apiClient

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data
}

// Helper function to handle API errors
export const handleApiError = (error: AxiosError): never => {
  if (error.response?.data) {
    const errorData = error.response.data as unknown
    throw new Error(errorData.error || errorData.message || 'API request failed')
  }
  throw new Error(error.message || 'Network error')
}