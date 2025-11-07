import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for debounced code synchronization
 * Prevents excessive socket emissions while typing
 * 
 * @param {Function} callback - Function to call with debounced value
 * @param {number} delay - Debounce delay in milliseconds (default: 500ms)
 * @returns {Function} - Debounced function to call
 */
export const useDebounce = (callback, delay = 500) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Hook for code synchronization with Socket.io
 * 
 * @param {Object} socket - Socket.io instance
 * @param {string} battleId - Current battle ID
 * @param {string} userId - Current user ID
 * @param {string} code - Current code value
 * @param {Function} onOpponentCodeChange - Callback when opponent's code changes
 * @param {number} debounceDelay - Debounce delay (default: 500ms)
 */
export const useCodeSync = (
  socket,
  battleId,
  userId,
  code,
  onOpponentCodeChange,
  debounceDelay = 500
) => {
  const lastSyncedCode = useRef('');

  // Debounced sync function
  const syncCode = useCallback(
    (newCode) => {
      // Only sync if code actually changed
      if (newCode !== lastSyncedCode.current && battleId && userId) {
        socket.emit('battle:code-sync', {
          battleId,
          userId,
          code: newCode,
          codeLength: newCode.length,
        });
        lastSyncedCode.current = newCode;
        console.log(`📤 Code synced: ${newCode.length} chars`);
      }
    },
    [socket, battleId, userId]
  );

  const debouncedSync = useDebounce(syncCode, debounceDelay);

  // Sync code changes
  useEffect(() => {
    if (code !== undefined) {
      debouncedSync(code);
    }
  }, [code, debouncedSync]);

  // Listen for opponent's code changes
  useEffect(() => {
    if (!socket || !onOpponentCodeChange) return;

    const handleOpponentCodeSync = (data) => {
      console.log(`📥 Opponent code received: ${data.codeLength} chars`);
      onOpponentCodeChange(data);
    };

    socket.on('battle:opponent-code-sync', handleOpponentCodeSync);

    return () => {
      socket.off('battle:opponent-code-sync', handleOpponentCodeSync);
    };
  }, [socket, onOpponentCodeChange]);
};

/**
 * Hook for throttled function calls
 * Limits function calls to once per interval
 * 
 * @param {Function} callback - Function to throttle
 * @param {number} delay - Minimum delay between calls (default: 1000ms)
 * @returns {Function} - Throttled function
 */
export const useThrottle = (callback, delay = 1000) => {
  const lastRan = useRef(Date.now());

  const throttledCallback = useCallback(
    (...args) => {
      const now = Date.now();
      
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    },
    [callback, delay]
  );

  return throttledCallback;
};

export default {
  useDebounce,
  useCodeSync,
  useThrottle,
};
