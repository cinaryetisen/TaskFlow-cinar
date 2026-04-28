export function lexMiddle(a: string, b: string): string {
  const mid = String.fromCharCode(
    Math.floor((a.charCodeAt(0) + (b ? b.charCodeAt(0) : a.charCodeAt(0) + 64)) / 2)
  )
  return mid === a ? a + 'n' : mid
}
