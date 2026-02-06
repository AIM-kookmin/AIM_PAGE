'use client'

import { useEffect } from 'react'
import { useLenis } from 'lenis/react'

/**
 * Hook to pause Lenis smooth scroll when modals/overlays are open.
 * This allows native scroll behavior inside modal content.
 *
 * @param isActive - When true, Lenis is stopped; when false, Lenis resumes
 */
export function useLenisControl(isActive: boolean) {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return // Handle SSR - lenis is null during server rendering

    if (isActive) {
      lenis.stop()
    } else {
      lenis.start()
    }

    // Cleanup: ensure Lenis is restarted when component unmounts
    return () => {
      if (isActive) {
        lenis.start()
      }
    }
  }, [lenis, isActive])
}
