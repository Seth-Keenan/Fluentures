// UpdatePasswordPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import UpdatePasswordPage from './page'


// Mock supabase client
const pushMock = vi.fn()
const mockUpdateUser = vi.fn()
const mockGetSession = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock }),
  }))

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: () => ({
    auth: {
      updateUser: mockUpdateUser,
      getSession: mockGetSession,
    },
  }),
}))

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the form and input', () => {
    render(<UpdatePasswordPage />)

    expect(screen.getByRole('heading', { name: /update password/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Enter new password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Update Password/i })).toBeInTheDocument()
  })

  it('redirects to login if no session', async () => {
    mockGetSession.mockResolvedValueOnce(null);

    render(<UpdatePasswordPage />)

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login')
    })

  })

it('submits successfully and shows success message', async () => {
    mockGetSession.mockResolvedValueOnce(null);
    mockUpdateUser.mockResolvedValueOnce({ error: null })
  
    render(<UpdatePasswordPage />)
  
    fireEvent.change(screen.getByPlaceholderText(/enter new password/i), {
      target: { value: 'newpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /update password/i }))
  
    await waitFor(() => {
      expect(screen.getByText(/password updated successfully!/i)).toBeInTheDocument()
      expect(pushMock).toHaveBeenCalledWith('/login')
    })
  })
  
})
