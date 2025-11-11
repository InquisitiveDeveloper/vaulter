import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../button'

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('applies default variant styles', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
  })

  test('applies destructive variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  test('applies outline variant styles', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('border')
  })

  test('applies ghost variant styles', () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent')
  })

  test('applies different size variants', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9')

    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-11')

    rerender(<Button size="icon">Icon</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10')
  })

  test('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  })

  test('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  test('merges custom className with default styles', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('inline-flex')
  })
})

