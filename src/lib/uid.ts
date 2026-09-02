/**
 * Converts a string (UUID) to a stable positive 32-bit integer.
 * Agora RTC requires numeric UIDs for token generation and channel joining.
 * The same string will always produce the same number.
 */
export function hashUid(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Ensure positive and within Agora's valid range (1 to 2^32-1)
  return (Math.abs(hash) % 2147483647) + 1;
}
