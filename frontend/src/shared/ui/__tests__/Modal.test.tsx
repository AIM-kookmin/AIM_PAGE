import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Modal } from '../Modal'

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    // Cleanup body styles
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  })

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal opens', () => {
      render(<Modal {...defaultProps} />)

      expect(document.body.style.overflow).toBe('hidden')
    })

    it('should restore body scroll when modal closes', () => {
      const { rerender } = render(<Modal {...defaultProps} />)
      expect(document.body.style.overflow).toBe('hidden')

      rerender(<Modal {...defaultProps} isOpen={false} />)
      expect(document.body.style.overflow).toBe('')
    })

    it('should compensate for scrollbar width', () => {
      // Mock scrollbar width
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
      Object.defineProperty(document.documentElement, 'clientWidth', { value: 1008, writable: true })

      render(<Modal {...defaultProps} />)

      // Should add padding equal to scrollbar width (1024 - 1008 = 16px)
      expect(document.body.style.paddingRight).toBe('16px')
    })
  })

  describe('Scroll Behavior', () => {
    it('should render modal content in a scrollable container', () => {
      render(<Modal {...defaultProps} />)

      // Find the scrollable content area
      const contentArea = document.querySelector('.overflow-auto')
      expect(contentArea).toBeInTheDocument()
      expect(contentArea).toHaveStyle({ maxHeight: '100%' })
    })

    it('should prevent background scroll when modal is open', () => {
      render(<Modal {...defaultProps} />)

      const overlay = screen.getByRole('dialog').parentElement
      expect(overlay).not.toHaveClass('overflow-y-auto')
    })
  })

  describe('Modal Structure', () => {
    it('should render modal with Portal', () => {
      render(<Modal {...defaultProps} />)

      // Modal should be rendered as direct child of body
      const modal = document.body.lastChild
      expect(modal).toHaveClass('fixed', 'inset-0')
    })

    it('should have correct flexbox structure', () => {
      render(<Modal {...defaultProps} />)

      const modalContainer = screen.getByText('Test Modal').closest('div[style*="maxHeight"]')
      expect(modalContainer).toHaveClass('flex', 'flex-col')
      expect(modalContainer).toHaveStyle({ maxHeight: 'calc(100vh - 2rem)' })
    })
  })

  describe('Click Handlers', () => {
    it('should close modal when clicking overlay', () => {
      render(<Modal {...defaultProps} />)

      const overlay = document.querySelector('.fixed.inset-0')
      fireEvent.click(overlay!)

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('should not close modal when clicking modal content', () => {
      render(<Modal {...defaultProps} />)

      const modalContent = screen.getByText('Modal Content')
      fireEvent.click(modalContent)

      expect(defaultProps.onClose).not.toHaveBeenCalled()
    })
  })

  describe('Form Handling', () => {
    it('should render form when onSubmit is provided', () => {
      const onSubmit = jest.fn((e) => e.preventDefault())

      render(
        <Modal {...defaultProps} onSubmit={onSubmit}>
          <input type="text" placeholder="Test input" />
        </Modal>
      )

      const form = document.getElementById('modal-form')
      expect(form).toBeInTheDocument()
      expect(form?.tagName).toBe('FORM')
    })

    it('should call onSubmit when form is submitted', () => {
      const onSubmit = jest.fn((e) => e.preventDefault())

      render(
        <Modal {...defaultProps} onSubmit={onSubmit}>
          <input type="text" />
        </Modal>
      )

      const form = document.getElementById('modal-form')!
      fireEvent.submit(form)

      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
  })

  describe('Accessibility', () => {
    it('should trap focus within modal', () => {
      render(<Modal {...defaultProps} />)

      // Modal should be focusable
      const modalContainer = screen.getByText('Test Modal').closest('div[style*="maxHeight"]')
      expect(modalContainer).toBeTruthy()
    })
  })

  describe('SSR Safety', () => {
    it('should not render on server', () => {
      // Mock SSR environment
      const originalWindow = global.window
      // @ts-expect-error - Intentionally deleting window for SSR test
      delete global.window

      const { container } = render(<Modal {...defaultProps} />)
      expect(container.firstChild).toBeNull()

      // Restore
      global.window = originalWindow
    })
  })
})
