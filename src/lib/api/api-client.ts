import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

// Define error response structure
interface ApiErrorResponse {
  error?: string
  message?: string
  statusCode?: number
  details?: Record<string, unknown>
}

// Define success response structure
interface ApiSuccessResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add timestamp to prevent caching
    if (config.params) {
      config.params = {
        ...config.params,
        _t: Date.now(),
      }
    } else {
      config.params = { _t: Date.now() }
    }
    
    // Auth token is automatically handled by NextAuth cookies
    // No need to manually add Authorization header
    
    return config
  },
  (error: AxiosError) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response [${response.status}]:`, response.config.url, response.data)
    }
    return response
  },
  (error: AxiosError) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.config?.url, error.response?.status, error.response?.data)
    }

    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      const errorData = data as ApiErrorResponse
      
      switch (status) {
        case 400:
          toast.error(errorData.error || errorData.message || 'Bad request')
          break
        case 401:
          toast.error('Unauthorized access. Please log in again.')
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin'
          }
          break
        case 403:
          toast.error('Access forbidden. You do not have permission to perform this action.')
          break
        case 404:
          toast.error('Resource not found')
          break
        case 409:
          toast.error(errorData.error || errorData.message || 'Conflict. The resource already exists.')
          break
        case 422:
          toast.error(errorData.error || errorData.message || 'Validation error. Please check your input.')
          break
        case 429:
          toast.error('Too many requests. Please try again later.')
          break
        case 500:
          toast.error('Internal server error. Please try again later.')
          break
        case 502:
          toast.error('Bad gateway. Please try again later.')
          break
        case 503:
          toast.error('Service unavailable. Please try again later.')
          break
        case 504:
          toast.error('Gateway timeout. Please try again later.')
          break
        default:
          toast.error(errorData.error || errorData.message || 'Something went wrong')
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection and try again.')
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

// Helper function to handle API errors with proper typing
export const handleApiError = (error: AxiosError): never => {
  if (error.response?.data) {
    const errorData = error.response.data as ApiErrorResponse
    const errorMessage = errorData.error || errorData.message || 'API request failed'
    throw new Error(errorMessage)
  }
  throw new Error(error.message || 'Network error')
}

// Helper function to create query parameters
export const createQueryParams = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    }
  })
  
  return searchParams.toString()
}

// Helper function to handle pagination
export const createPaginationParams = (page: number = 1, limit: number = 10): string => {
  return createQueryParams({ page, limit })
}

// Helper function to handle filters
export const createFilterParams = (filters: Record<string, unknown>): string => {
  return createQueryParams(filters)
}

// Helper function to handle file uploads
export const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData()
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value)
      } else if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, String(item)))
      } else {
        formData.append(key, String(value))
      }
    }
  })
  
  return formData
}

// Helper function to retry failed requests
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')
      
      if (attempt === maxRetries) {
        throw lastError
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw lastError!
}

// Helper function to handle API timeouts
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    })
  ])
}

// Export types for use in other files
export type { ApiErrorResponse, ApiSuccessResponse }