import { render, screen, fireEvent } from '@testing-library/react'
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
      expect(document.body.style.overflow).toBe('unset')
    })
  })

  describe('Scroll Behavior', () => {
    it('should render modal content in a scrollable container', () => {
      render(<Modal {...defaultProps} />)

      // Find the scrollable content area (with data-lenis-prevent)
      const contentArea = document.querySelector('[data-lenis-prevent]')
      expect(contentArea).toBeInTheDocument()
      expect(contentArea).toHaveClass('overflow-y-auto', 'flex-1')
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

      const modalDialog = screen.getByRole('dialog')
      expect(modalDialog).toHaveClass('flex', 'flex-col')
      // Check max-height from Tailwind class
      expect(modalDialog).toHaveClass('max-h-[90vh]')
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
    it('should have proper ARIA attributes', () => {
      render(<Modal {...defaultProps} />)

      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')

      const title = screen.getByText('Test Modal')
      expect(title).toHaveAttribute('id', 'modal-title')
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
