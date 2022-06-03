import { useEffect, useState, useRef } from 'react'

const useNextRebaseCountdown = (): number => {
  const [secondsRemaining, setSecondsRemaining] = useState(null)
  const timer = useRef(null)

  useEffect(() => {
    const currentSeconds = Math.floor(Date.now() / 1000)
    const nextRebaseTime = (Math.floor((currentSeconds-1200) / 1800) + 1) * 1800 + 1200
    const secondsRemainingCalc = nextRebaseTime - currentSeconds
    setSecondsRemaining(secondsRemainingCalc)

    timer.current = setInterval(() => {
      setSecondsRemaining((prevSecondsRemaining) => {
        if (prevSecondsRemaining <= 1) {
          return 1800
        }
        return prevSecondsRemaining - 1
      })
    }, 1000)

    return () => clearInterval(timer.current)
  }, [setSecondsRemaining, timer])

  return secondsRemaining
}

export default useNextRebaseCountdown
