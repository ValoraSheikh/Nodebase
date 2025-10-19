import { PrismaClient } from '@/generated/prisma'

// Mock the PrismaClient before importing db
jest.mock('@/generated/prisma', () => {
  const mockPrismaClient = jest.fn().mockImplementation(() => ({
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }))

  return {
    PrismaClient: mockPrismaClient,
  }
})

describe('Prisma Database Client (src/lib/db.ts)', () => {
  let originalEnv: string | undefined
  let originalGlobalPrisma: any

  beforeEach(() => {
    // Save original environment and global state
    originalEnv = process.env.NODE_ENV
    originalGlobalPrisma = (global as any).prisma
    
    // Clear the module cache to get fresh imports
    jest.resetModules()
    
    // Clear the global prisma instance
    delete (global as any).prisma
  })

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv
    }
    
    // Restore global state
    if (originalGlobalPrisma !== undefined) {
      (global as any).prisma = originalGlobalPrisma
    } else {
      delete (global as any).prisma
    }
    
    jest.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should create a new PrismaClient instance when imported', () => {
      const prisma = require('../db').default
      expect(prisma).toBeDefined()
      expect(PrismaClient).toHaveBeenCalled()
    })

    it('should reuse the same instance on subsequent imports in development', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()

      // First import
      const prisma1 = require('../db').default
      
      // Second import (should reuse the same instance from global)
      const prisma2 = require('../db').default

      expect(prisma1).toBe(prisma2)
    })

    it('should reuse the same instance in test environment', () => {
      process.env.NODE_ENV = 'test'
      jest.resetModules()

      const prisma1 = require('../db').default
      const prisma2 = require('../db').default

      expect(prisma1).toBe(prisma2)
    })

    it('should create a new instance but not cache in production', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()

      const prisma = require('../db').default
      
      // In production, it doesn't set globalForPrisma.prisma
      // so global.prisma should remain undefined
      expect((global as any).prisma).toBeUndefined()
    })
  })

  describe('Global Caching Behavior', () => {
    it('should cache the instance in global when not in production', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()

      const prisma = require('../db').default
      
      expect((global as any).prisma).toBe(prisma)
    })

    it('should reuse existing global prisma instance if available', () => {
      process.env.NODE_ENV = 'development'
      
      // Create a mock existing global prisma
      const existingPrisma = new PrismaClient()
      ;(global as any).prisma = existingPrisma
      
      jest.resetModules()

      const prisma = require('../db').default
      
      expect(prisma).toBe(existingPrisma)
    })

    it('should not cache in production environment', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()

      require('../db').default
      
      expect((global as any).prisma).toBeUndefined()
    })
  })

  describe('Environment-specific Behavior', () => {
    it('should handle development environment correctly', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()

      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect((global as any).prisma).toBe(prisma)
    })

    it('should handle test environment correctly', () => {
      process.env.NODE_ENV = 'test'
      jest.resetModules()

      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect((global as any).prisma).toBe(prisma)
    })

    it('should handle production environment correctly', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()

      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect((global as any).prisma).toBeUndefined()
    })

    it('should handle undefined NODE_ENV as non-production', () => {
      delete process.env.NODE_ENV
      jest.resetModules()

      const prisma = require('../db').default
      
      expect(prisma).toBeDefined()
      expect((global as any).prisma).toBe(prisma)
    })
  })

  describe('PrismaClient Instance Properties', () => {
    it('should export a valid PrismaClient instance with expected methods', () => {
      process.env.NODE_ENV = 'test'
      jest.resetModules()

      const prisma = require('../db').default
      
      // Verify it has the expected Prisma methods
      expect(prisma.user).toBeDefined()
      expect(prisma.post).toBeDefined()
      expect(typeof prisma.$connect).toBe('function')
      expect(typeof prisma.$disconnect).toBe('function')
    })

    it('should allow database operations through the exported instance', async () => {
      process.env.NODE_ENV = 'test'
      jest.resetModules()

      const prisma = require('../db').default
      
      // Mock a successful findMany operation
      const mockUsers = [
        { id: 1, email: 'test@example.com', name: 'Test User' },
      ]
      prisma.user.findMany.mockResolvedValue(mockUsers)

      const users = await prisma.user.findMany()
      
      expect(users).toEqual(mockUsers)
      expect(prisma.user.findMany).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle multiple rapid imports correctly', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()

      const imports = []
      for (let i = 0; i < 5; i++) {
        imports.push(require('../db').default)
      }

      // All should be the same instance
      const firstImport = imports[0]
      imports.forEach(prisma => {
        expect(prisma).toBe(firstImport)
      })
    })

    it('should handle switching between environments', () => {
      // Start with development
      process.env.NODE_ENV = 'development'
      jest.resetModules()
      const devPrisma = require('../db').default
      expect((global as any).prisma).toBe(devPrisma)

      // Switch to production
      process.env.NODE_ENV = 'production'
      delete (global as any).prisma
      jest.resetModules()
      const prodPrisma = require('../db').default
      expect((global as any).prisma).toBeUndefined()

      // They should be different instances
      expect(devPrisma).not.toBe(prodPrisma)
    })

    it('should maintain separate instances across test isolation', () => {
      process.env.NODE_ENV = 'test'
      
      // First test context
      jest.resetModules()
      const prisma1 = require('../db').default

      // Simulate test cleanup
      delete (global as any).prisma
      jest.resetModules()

      // Second test context
      const prisma2 = require('../db').default

      // After cleanup and reset, these should be different instances
      expect(prisma1).not.toBe(prisma2)
    })
  })

  describe('Type Safety and Module Structure', () => {
    it('should export the prisma instance as default export', () => {
      process.env.NODE_ENV = 'test'
      jest.resetModules()

      const dbModule = require('../db')
      
      expect(dbModule.default).toBeDefined()
      expect(typeof dbModule.default).toBe('object')
    })

    it('should properly type the global object extension', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()

      const prisma = require('../db').default
      const globalForPrisma = global as unknown as { prisma: typeof prisma }

      expect(globalForPrisma.prisma).toBe(prisma)
    })
  })

  describe('Memory Management', () => {
    it('should not create memory leaks by reusing the same instance', () => {
      process.env.NODE_ENV = 'development'
      jest.resetModules()

      const initialCallCount = (PrismaClient as jest.Mock).mock.calls.length

      // Multiple imports should not create new instances
      for (let i = 0; i < 10; i++) {
        require('../db').default
      }

      const finalCallCount = (PrismaClient as jest.Mock).mock.calls.length

      // Should only create one new instance despite multiple imports
      expect(finalCallCount - initialCallCount).toBeLessThanOrEqual(1)
    })

    it('should allow garbage collection in production by not caching', () => {
      process.env.NODE_ENV = 'production'
      jest.resetModules()

      require('../db').default

      // In production, no global reference is kept
      expect((global as any).prisma).toBeUndefined()
      // This allows the instance to be garbage collected when not in use
    })
  })
})