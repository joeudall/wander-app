'use client'

import React from 'react'

interface WizardCardProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function WizardCard({ title, subtitle, children, footer }: WizardCardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px',
        boxShadow: 'var(--shadow)',
      }}
    >
      <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.3px', marginBottom: '6px' }}>{title}</h2>
      <p style={{ fontSize: '15px', color: 'var(--text2)', marginBottom: '32px' }}>{subtitle}</p>
      {children}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
        }}
      >
        {footer}
      </div>
    </div>
  )
}

interface ButtonProps {
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function WizardButton({ onClick, children, variant = 'primary', type = 'button', disabled }: ButtonProps) {
  const isPrimary = variant === 'primary'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: isPrimary ? 'var(--accent)' : 'none',
        color: isPrimary ? 'white' : 'var(--text2)',
        border: isPrimary ? 'none' : '1.5px solid var(--border)',
        padding: isPrimary ? '11px 24px' : '10px 20px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '14px',
        fontWeight: isPrimary ? 700 : 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 0.15s',
      }}
    >
      {children}
    </button>
  )
}

interface FormGroupProps {
  label: string
  optional?: boolean
  children: React.ReactNode
}

export function FormGroup({ label, optional, children }: FormGroupProps) {
  return (
    <div style={{ marginBottom: '22px' }}>
      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'var(--text)' }}>
        {label}
        {optional && <span style={{ fontWeight: 400, color: 'var(--text3)', fontSize: '12px', marginLeft: '4px' }}>(optional)</span>}
      </label>
      {children}
    </div>
  )
}

export function FormInput({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  min,
}: {
  id?: string
  type?: string
  placeholder?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: number
}) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      style={{
        width: '100%',
        padding: '11px 14px',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '15px',
        color: 'var(--text)',
        background: 'var(--surface)',
        outline: 'none',
        fontFamily: 'inherit',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
    />
  )
}

export function FormTextarea({
  placeholder,
  value,
  onChange,
  rows = 3,
}: {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
}) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      style={{
        width: '100%',
        padding: '11px 14px',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '15px',
        color: 'var(--text)',
        background: 'var(--surface)',
        outline: 'none',
        fontFamily: 'inherit',
        resize: 'vertical',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
    />
  )
}

export function ChoiceCard({
  icon,
  label,
  desc,
  selected,
  onClick,
}: {
  icon: string
  label: string
  desc: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '20px 16px',
        cursor: 'pointer',
        textAlign: 'center',
        background: selected ? 'var(--accent-light)' : 'var(--surface)',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '12px', color: 'var(--text2)', lineHeight: 1.4 }}>{desc}</div>
    </div>
  )
}

export function RadioOption({
  label,
  sublabel,
  selected,
  onClick,
  right,
}: {
  label: string
  sublabel?: string
  selected: boolean
  onClick: () => void
  right?: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        background: selected ? 'var(--accent-light)' : 'var(--surface)',
        transition: 'all 0.15s',
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
          background: selected ? 'var(--accent)' : 'transparent',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>{label}</div>
        {sublabel && <div style={{ fontSize: '12px', color: 'var(--text2)' }}>{sublabel}</div>}
      </div>
      {right}
    </div>
  )
}

export function ToggleGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', gap: '0', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content' }}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '9px 20px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              borderRight: '1.5px solid var(--border)',
              background: active ? 'var(--accent)' : 'var(--surface)',
              color: active ? 'white' : 'var(--text2)',
              transition: 'all 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function KidsPillInput({
  value,
  onChange,
}: {
  value: number[]
  onChange: (ages: number[]) => void
}) {
  const [input, setInput] = React.useState('')

  const addAge = (raw: string) => {
    const n = parseInt(raw.trim())
    if (!isNaN(n) && n >= 0 && n <= 17) {
      onChange([...value, n])
    }
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault()
      if (input.trim()) addAge(input)
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const handleBlur = () => {
    if (input.trim()) addAge(input)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '8px 10px',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--surface)',
        cursor: 'text',
        minHeight: '44px',
        alignItems: 'center',
      }}
      onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}
    >
      {value.map((age, i) => (
        <span
          key={i}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            border: '1.5px solid var(--accent)',
            borderRadius: '100px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {age}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(value.filter((_, idx) => idx !== i)) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', padding: '0 0 0 2px', fontSize: '14px', lineHeight: 1 }}
          >×</button>
        </span>
      ))}
      <input
        type="text"
        inputMode="numeric"
        placeholder={value.length === 0 ? 'Type an age, press Space or Enter…' : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '14px',
          color: 'var(--text)',
          minWidth: '160px',
          flex: 1,
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}

export function TagPicker({
  options,
  selected,
  onChange,
}: {
  options: { label: string; emoji?: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  const toggle = (label: string) => {
    if (selected.includes(label)) {
      onChange(selected.filter((s) => s !== label))
    } else {
      onChange([...selected, label])
    }
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(({ label }) => {
        const isSelected = selected.includes(label)
        return (
          <button
            key={label}
            type="button"
            onClick={() => toggle(label)}
            style={{
              padding: '7px 14px',
              border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
              color: isSelected ? 'var(--accent)' : 'var(--text2)',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
