import { useState, useEffect } from 'react'

const HealthIndicator = () => {
  const [healthStatus, setHealthStatus] = useState('checking')
  const [lastChecked, setLastChecked] = useState(null)

  const checkHealth = async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('http://192.168.1.136/health', {
        method: 'GET',
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        setHealthStatus('healthy')
      } else {
        setHealthStatus('down')
      }
    } catch (error) {
      // Only log unexpected errors, not timeout/network errors
      if (error.name !== 'AbortError' && !error.message.includes('Failed to fetch')) {
        console.warn('Health check error:', error.message)
      }
      setHealthStatus('down')
    }
    setLastChecked(new Date())
  }

  useEffect(() => {
    checkHealth()
    
    const interval = setInterval(checkHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = () => {
    switch (healthStatus) {
      case 'healthy':
        return '#4CAF50' // Green
      case 'down':
        return '#F44336' // Red
      case 'checking':
        return '#FF9800' // Orange
      default:
        return '#9E9E9E' // Gray
    }
  }

  const getStatusText = () => {
    switch (healthStatus) {
      case 'healthy':
        return 'API Healthy'
      case 'down':
        return 'API Down'
      case 'checking':
        return 'Checking...'
      default:
        return 'Unknown'
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      fontSize: '14px',
      color: '#666'
    }}>
      <div style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: getStatusColor(),
        border: '1px solid rgba(0,0,0,0.1)',
        animation: healthStatus === 'checking' ? 'pulse 1.5s infinite' : 'none'
      }}></div>
      <span>{getStatusText()}</span>
      {lastChecked && (
        <span style={{ fontSize: '12px', color: '#999' }}>
          (Last checked: {lastChecked.toLocaleTimeString()})
        </span>
      )}
      <button 
        onClick={checkHealth}
        style={{
          marginLeft: '8px',
          padding: '2px 6px',
          fontSize: '12px',
          border: '1px solid #ccc',
          borderRadius: '3px',
          backgroundColor: '#f8f9fa',
          cursor: 'pointer',
          color: '#666'
        }}
        title="Refresh health status"
      >
        ↻
      </button>
    </div>
  )
}

export default HealthIndicator