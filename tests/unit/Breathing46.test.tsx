import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Breathing46 } from '../../components/breathe4-6/steps/Breathing46'

const mockOnNext = vi.fn()
const mockOnBack = vi.fn()

const defaultProps = {
  backLabel: 'Back',
  nextLabel: 'Done',
  onBack: mockOnBack,
  onNext: mockOnNext,
  title: 'Breathing 4-6',
  subtitle: 'Inhale 4 seconds, exhale 6 seconds. Repeat 3 times.',
  startLabel: 'Start',
  repeatLabel: 'Repeat',
  phaseLabels: { inhale: 'Inhale', exhale: 'Exhale', done: 'Done' },
  tipText: 'The key is to lengthen the exhale.',
  initialCompletedCycles: 0,
}

describe('Breathing46', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('renders initial state with Start button', () => {
    render(<Breathing46 {...defaultProps} />)
    expect(screen.getByText('Start')).toBeInTheDocument()
    expect(screen.getByText('Breathing 4-6')).toBeInTheDocument()
  })

  it('shows title and subtitle', () => {
    render(<Breathing46 {...defaultProps} />)
    expect(screen.getByText('Breathing 4-6')).toBeInTheDocument()
    expect(screen.getByText(/Inhale 4 seconds/)).toBeInTheDocument()
  })

  it('displays tip text', () => {
    render(<Breathing46 {...defaultProps} />)
    expect(screen.getByText(/lengthen the exhale/)).toBeInTheDocument()
  })

  it('shows Done when initialCompletedCycles >= 3', () => {
    render(<Breathing46 {...defaultProps} initialCompletedCycles={3} />)
    expect(screen.getByText('Done')).toBeInTheDocument()
  })

  it('starts exercise on Start click', async () => {
    render(<Breathing46 {...defaultProps} />)
    const startButton = screen.getByText('Start')
    fireEvent.click(startButton)
    expect(screen.queryByText('Start')).not.toBeInTheDocument()
  })

  it('shows phase label after starting', async () => {
    render(<Breathing46 {...defaultProps} />)
    fireEvent.click(screen.getByText('Start'))
    expect(screen.getByText('Inhale')).toBeInTheDocument()
  })

  it('calls onNext when done and Done button clicked', () => {
    render(<Breathing46 {...defaultProps} initialCompletedCycles={3} />)
    const doneButton = screen.getByText('Done')
    fireEvent.click(doneButton)
    expect(mockOnNext).toHaveBeenCalled()
  })
})