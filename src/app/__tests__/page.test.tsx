import { render, screen, waitFor } from '@testing-library/react'
import Page from '../page'
import prisma from '@/lib/db'

// Mock the prisma client
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: {
    user: {
      findMany: jest.fn(),
    },
  },
}))

// Mock the Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <button data-variant={variant}>{children}</button>
  ),
}))

describe('Home Page Component (src/app/page.tsx)', () => {
  const mockPrisma = prisma as jest.Mocked<typeof prisma>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering with Different Data States', () => {
    it('should render successfully with no users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      render(await Page())

      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should display empty array when no users exist', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      render(await Page())

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('[]')
    })

    it('should render and display a single user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        posts: [],
      }
      mockPrisma.user.findMany.mockResolvedValue([mockUser])

      render(await Page())

      const button = screen.getByRole('button')
      const displayedData = button.textContent
      
      expect(displayedData).toContain('test@example.com')
      expect(displayedData).toContain('Test User')
    })

    it('should render and display multiple users', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', name: 'User One', posts: [] },
        { id: 2, email: 'user2@example.com', name: 'User Two', posts: [] },
        { id: 3, email: 'user3@example.com', name: 'User Three', posts: [] },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      const displayedData = button.textContent || ''

      mockUsers.forEach(user => {
        expect(displayedData).toContain(user.email)
        expect(displayedData).toContain(user.name)
      })
    })

    it('should handle users with null names', async () => {
      const mockUsers = [
        { id: 1, email: 'user1@example.com', name: null, posts: [] },
        { id: 2, email: 'user2@example.com', name: 'User Two', posts: [] },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      const displayedData = button.textContent || ''

      expect(displayedData).toContain('user1@example.com')
      expect(displayedData).toContain('null')
      expect(displayedData).toContain('User Two')
    })
  })

  describe('JSON Serialization', () => {
    it('should correctly serialize user data to JSON format', async () => {
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: 'Test User', posts: [] },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      const displayedText = button.textContent || ''

      // Parse the JSON to verify it's valid
      expect(() => JSON.parse(displayedText)).not.toThrow()
      const parsedData = JSON.parse(displayedText)
      expect(parsedData).toEqual(mockUsers)
    })

    it('should handle special characters in user data', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'test+special@example.com',
          name: 'Test "User" with \'quotes\'',
          posts: [],
        },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      const displayedText = button.textContent || ''

      expect(() => JSON.parse(displayedText)).not.toThrow()
      const parsedData = JSON.parse(displayedText)
      expect(parsedData[0].name).toBe('Test "User" with \'quotes\'')
    })

    it('should handle users with complex nested data', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user@example.com',
          name: 'Test User',
          posts: [
            { id: 1, title: 'Post 1', content: 'Content 1' },
            { id: 2, title: 'Post 2', content: null },
          ],
        },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      const displayedText = button.textContent || ''

      expect(() => JSON.parse(displayedText)).not.toThrow()
      const parsedData = JSON.parse(displayedText)
      expect(parsedData[0].posts).toHaveLength(2)
    })
  })

  describe('Database Integration', () => {
    it('should call prisma.user.findMany exactly once', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      render(await Page())

      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1)
    })

    it('should call prisma.user.findMany with no arguments', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      render(await Page())

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith()
    })

    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        posts: [],
      }))
      mockPrisma.user.findMany.mockResolvedValue(largeDataset)

      render(await Page())

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('Component Structure and Styling', () => {
    it('should render with correct CSS classes', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      render(await Page())

      const heading = screen.getByRole('heading')
      expect(heading).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center')
    })

    it('should render Button with link variant', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      render(await Page())

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-variant', 'link')
    })

    it('should use h1 as the container element', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      render(await Page())

      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toBeInTheDocument()
    })
  })

  describe('Async Behavior', () => {
    it('should be an async component', () => {
      expect(Page.constructor.name).toBe('AsyncFunction')
    })

    it('should wait for data to be fetched before rendering', async () => {
      const mockUsers = [{ id: 1, email: 'test@example.com', name: 'Test', posts: [] }]
      
      // Simulate a delay in fetching
      mockPrisma.user.findMany.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUsers), 100))
      )

      const pagePromise = Page()
      expect(mockPrisma.user.findMany).toHaveBeenCalled()
      
      const element = await pagePromise
      render(element)

      expect(screen.getByRole('button')).toHaveTextContent('test@example.com')
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      mockPrisma.user.findMany.mockRejectedValue(new Error('Database connection failed'))

      await expect(Page()).rejects.toThrow('Database connection failed')

      consoleErrorSpy.mockRestore()
    })

    it('should handle database timeout errors', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('Query timeout'))

      await expect(Page()).rejects.toThrow('Query timeout')
    })

    it('should handle malformed data from database', async () => {
      // @ts-ignore - Testing runtime behavior with invalid data
      mockPrisma.user.findMany.mockResolvedValue([{ invalid: 'data' }])

      render(await Page())

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      // Should still render, even with unexpected data structure
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string as user name', async () => {
      const mockUsers = [
        { id: 1, email: 'user@example.com', name: '', posts: [] },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      expect(button.textContent).toContain('""')
    })

    it('should handle very long user names', async () => {
      const longName = 'A'.repeat(1000)
      const mockUsers = [
        { id: 1, email: 'user@example.com', name: longName, posts: [] },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      expect(button.textContent).toContain(longName)
    })

    it('should handle Unicode characters in user data', async () => {
      const mockUsers = [
        { id: 1, email: 'user@例え.jp', name: '山田太郎 🎌', posts: [] },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      expect(button.textContent).toContain('山田太郎 🎌')
      expect(button.textContent).toContain('user@例え.jp')
    })

    it('should handle users with extremely large IDs', async () => {
      const mockUsers = [
        { id: Number.MAX_SAFE_INTEGER, email: 'user@example.com', name: 'Test', posts: [] },
      ]
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      const parsedData = JSON.parse(button.textContent || '[]')
      expect(parsedData[0].id).toBe(Number.MAX_SAFE_INTEGER)
    })
  })

  describe('Data Integrity', () => {
    it('should preserve exact data structure returned from database', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user@example.com',
          name: 'Test User',
          posts: [],
          extraField: 'should be preserved',
        },
      ]
      // @ts-ignore - Testing runtime behavior with extra fields
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      const button = screen.getByRole('button')
      const parsedData = JSON.parse(button.textContent || '[]')
      expect(parsedData[0]).toHaveProperty('extraField')
    })

    it('should handle undefined posts array', async () => {
      const mockUsers = [
        { id: 1, email: 'user@example.com', name: 'Test', posts: undefined },
      ]
      // @ts-ignore - Testing runtime behavior
      mockPrisma.user.findMany.mockResolvedValue(mockUsers)

      render(await Page())

      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Performance Considerations', () => {
    it('should not trigger multiple database calls on render', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      const element = await Page()
      render(element)

      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(1)
    })

    it('should handle quick successive renders without issues', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 1, email: 'test@example.com', name: 'Test', posts: [] },
      ])

      const element1 = await Page()
      const element2 = await Page()

      render(element1)
      render(element2)

      expect(mockPrisma.user.findMany).toHaveBeenCalledTimes(2)
    })
  })
})