/** Shared brand primitives — single source for the logo mark and avatar initials. */

export const StarIcon = ({ size = 26, color = '#2F6E73' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0 }} aria-hidden="true">
    <path d="M16 1 L19.2 12.8 L31 16 L19.2 19.2 L16 31 L12.8 19.2 L1 16 L12.8 12.8 Z" fill={color} />
  </svg>
)

export function getInitials(email: string | null | undefined): string {
  if (!email) return '?'
  const parts = email.split('@')[0].split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}
