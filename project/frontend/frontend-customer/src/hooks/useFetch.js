import { useCallback, useEffect, useState } from 'react'

export function useFetch(apiFn, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(() => {
    let active = true
    setLoading(true)
    setError(null)

    return Promise.resolve(apiFn())
      .then((res) => {
        if (!active) return null
        setData(res?.data?.data ?? null)
        return res
      })
      .catch((err) => {
        if (!active) return null
        setError(err?.response?.data?.message || err.message || 'Request failed')
        throw err
      })
      .finally(() => {
        if (active) setLoading(false)
      })
  }, deps)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.resolve(apiFn())
      .then((res) => {
        if (!cancelled) setData(res?.data?.data ?? null)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || err.message || 'Request failed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, deps)

  return { data, loading, error, refetch }
}
