'use client'

import { useEffect } from 'react'
import { useLenis } from 'lenis/react'

/**
 * Global reference counter for Lenis lock management.
 * Prevents race conditions when multiple modals are open simultaneously.
 */
let lenisLockCount = 0

/**
 * Hook to pause Lenis smooth scroll when modals/overlays are open.
 * Uses reference counting to handle multiple concurrent locks.
 *
 * This allows native scroll behavior inside modal content while
 * preventing background page scroll. Multiple modals can be open
 * simultaneously without race conditions.
 *
 * @param isActive - When true, acquires a lock (stops Lenis if first lock);
 *                   when false, releases the lock (starts Lenis if no remaining locks)
 */
export function useLenisControl(isActive: boolean) {
  const lenis = useLenis()

  useEffect(() => {
    if (!lenis) return // Handle SSR - lenis is null during server rendering

    if (isActive) {
      // Acquire lock
      lenisLockCount++
      if (lenisLockCount === 1) {
        // First lock: stop Lenis
        lenis.stop()
      }
    }

    // Cleanup: release lock when component unmounts or isActive becomes false
    return () => {
      if (isActive && lenisLockCount > 0) {
        lenisLockCount--
        if (lenisLockCount === 0) {
          // Last lock released: restart Lenis
          lenis.start()
        }
      }
    }
  }, [lenis, isActive])
}
