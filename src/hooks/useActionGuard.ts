// src/hooks/useActionGuard.ts
import { useRef, useCallback } from 'react';

/**
 * Throttling guard untuk mencegah double-tap tidak sengaja di perangkat layar sentuh.
 */
export function useActionGuard(cooldownMs = 350) {
    const lastExecutionRef = useRef<number>(0);

    return useCallback(
        <T extends unknown[]>(fn: (...args: T) => void) =>
            (...args: T) => {
                const now = Date.now();
                if (now - lastExecutionRef.current < cooldownMs) {
                    return;
                }
                lastExecutionRef.current = now;
                fn(...args);
            },
        [cooldownMs]
    );
}