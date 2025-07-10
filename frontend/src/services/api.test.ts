import { vi, describe, beforeEach, afterEach, test, expect } from 'vitest'
import api from './api'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('GET request works correctly', async () => {
    const mockResponse = { data: 'test' }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await api.get('/test')
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
    expect(result).toEqual(mockResponse)
  })

  test('POST request works correctly', async () => {
    const mockResponse = { success: true }
    const postData = { name: 'test' }
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    const result = await api.post('/test', postData)
    
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/test',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })
    )
    expect(result).toEqual(mockResponse)
  })

  test('handles API errors correctly', async () => {
    const errorResponse = { message: 'Not found' }
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => errorResponse,
    })

    await expect(api.get('/test')).rejects.toThrow('Not found')
  })

  test('handles network errors correctly', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(api.get('/test')).rejects.toThrow('Network error')
  })

  test('handles timeout errors correctly', async () => {
    const abortError = new Error('Request timeout')
    abortError.name = 'AbortError'
    
    mockFetch.mockRejectedValueOnce(abortError)

    await expect(api.get('/test')).rejects.toThrow('Request timeout - please try again')
  })
})