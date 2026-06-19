'use client'

interface TagProps {
  children: React.ReactNode
  variant?: 'default' | 'blue' | 'booking' | 'food' | 'transit' | 'culture' | 'free' | 'green' | 'amber'
  className?: string
}

const variants = {
  default: 'bg-[var(--surface2)] text-[var(--text2)]',
  blue: 'bg-[var(--accent-light)] text-[var(--accent)]',
  booking: 'bg-[#fef3c7] text-[#92400e]',
  food: 'bg-[#fce7f3] text-[#9d174d]',
  transit: 'bg-[#e0f2fe] text-[#0369a1]',
  culture: 'bg-[#f3e8ff] text-[#6b21a8]',
  free: 'bg-[var(--green-light)] text-[var(--green)]',
  green: 'bg-[var(--green-light)] text-[var(--green)]',
  amber: 'bg-[var(--amber-light)] text-[var(--amber)]',
}

export default function Tag({ children, variant = 'default', className = '' }: TagProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function activityTagVariant(tag: string): TagProps['variant'] {
  const map: Record<string, TagProps['variant']> = {
    transit: 'transit',
    culture: 'culture',
    food: 'food',
    free: 'free',
    booking: 'booking',
    nature: 'green',
    adventure: 'blue',
    wildlife: 'green',
  }
  return map[tag.toLowerCase()] ?? 'default'
}
