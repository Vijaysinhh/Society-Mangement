// Hook for audio feedback (beeps and sounds)
export const useAudioFeedback = () => {
  const playBeep = (type: 'click' | 'success' | 'error' = 'click') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      switch (type) {
        case 'click':
          // Short beep for button clicks
          oscillator.frequency.value = 800
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.1)
          break
          
        case 'success':
          // Two ascending beeps for success
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.2)
          break
          
        case 'error':
          // Low beep for error
          oscillator.frequency.value = 300
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.15)
          break
      }
    } catch (error) {
      console.log("[v0] Audio feedback not available on this device")
    }
  }
  
  return { playBeep }
}
