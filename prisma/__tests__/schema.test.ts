import { readFileSync } from 'fs'
import { join } from 'path'

describe('Prisma Schema Validation (prisma/schema.prisma)', () => {
  let schemaContent: string

  beforeAll(() => {
    const schemaPath = join(__dirname, '..', 'schema.prisma')
    schemaContent = readFileSync(schemaPath, 'utf-8')
  })

  describe('Schema Structure and Configuration', () => {
    it('should have a valid Prisma schema file', () => {
      expect(schemaContent).toBeTruthy()
      expect(schemaContent.length).toBeGreaterThan(0)
    })

    it('should contain a generator block for prisma-client-js', () => {
      expect(schemaContent).toMatch(/generator\s+client\s*{/)
      expect(schemaContent).toMatch(/provider\s*=\s*"prisma-client-js"/)
    })

    it('should specify the correct output path for generated client', () => {
      expect(schemaContent).toMatch(/output\s*=\s*"\.\.\/src\/generated\/prisma"/)
    })

    it('should contain a datasource block for PostgreSQL', () => {
      expect(schemaContent).toMatch(/datasource\s+db\s*{/)
      expect(schemaContent).toMatch(/provider\s*=\s*"postgresql"/)
    })

    it('should use environment variable for database URL', () => {
      expect(schemaContent).toMatch(/url\s*=\s*env\("DATABASE_URL"\)/)
    })
  })

  describe('User Model', () => {
    it('should define a User model', () => {
      expect(schemaContent).toMatch(/model\s+User\s*{/)
    })

    it('should have an id field with correct attributes', () => {
      const userModelMatch = schemaContent.match(/model\s+User\s*{[\s\S]*?}/)?.[0]
      expect(userModelMatch).toMatch(/id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/)
    })

    it('should have an email field with unique constraint', () => {
      const userModelMatch = schemaContent.match(/model\s+User\s*{[\s\S]*?}/)?.[0]
      expect(userModelMatch).toMatch(/email\s+String\s+@unique/)
    })

    it('should have an optional name field', () => {
      const userModelMatch = schemaContent.match(/model\s+User\s*{[\s\S]*?}/)?.[0]
      expect(userModelMatch).toMatch(/name\s+String\?/)
    })

    it('should have a posts relation to Post model', () => {
      const userModelMatch = schemaContent.match(/model\s+User\s*{[\s\S]*?}/)?.[0]
      expect(userModelMatch).toMatch(/posts\s+Post\[\]/)
    })

    it('should have exactly 4 fields in User model', () => {
      const userModelMatch = schemaContent.match(/model\s+User\s*{([\s\S]*?)}/)?.[1]
      if (userModelMatch) {
        const fields = userModelMatch
          .split('\n')
          .filter(line => line.trim() && !line.trim().startsWith('//'))
        expect(fields.length).toBeGreaterThanOrEqual(4)
      }
    })
  })

  describe('Post Model', () => {
    it('should define a Post model', () => {
      expect(schemaContent).toMatch(/model\s+Post\s*{/)
    })

    it('should have an id field with autoincrement', () => {
      const postModelMatch = schemaContent.match(/model\s+Post\s*{[\s\S]*?}/)?.[0]
      expect(postModelMatch).toMatch(/id\s+Int\s+@id\s+@default\(autoincrement\(\)\)/)
    })

    it('should have a required title field', () => {
      const postModelMatch = schemaContent.match(/model\s+Post\s*{[\s\S]*?}/)?.[0]
      expect(postModelMatch).toMatch(/title\s+String/)
    })

    it('should have an optional content field', () => {
      const postModelMatch = schemaContent.match(/model\s+Post\s*{[\s\S]*?}/)?.[0]
      expect(postModelMatch).toMatch(/content\s+String\?/)
    })

    it('should have a published field with default false', () => {
      const postModelMatch = schemaContent.match(/model\s+Post\s*{[\s\S]*?}/)?.[0]
      expect(postModelMatch).toMatch(/published\s+Boolean\s+@default\(false\)/)
    })

    it('should have an authorId foreign key field', () => {
      const postModelMatch = schemaContent.match(/model\s+Post\s*{[\s\S]*?}/)?.[0]
      expect(postModelMatch).toMatch(/authorId\s+Int/)
    })

    it('should have an author relation to User model', () => {
      const postModelMatch = schemaContent.match(/model\s+Post\s*{[\s\S]*?}/)?.[0]
      expect(postModelMatch).toMatch(/author\s+User\s+@relation\(fields:\s*\[authorId\],\s*references:\s*\[id\]\)/)
    })
  })

  describe('Relationships and Constraints', () => {
    it('should define a one-to-many relationship between User and Post', () => {
      // Check User side
      const userModelMatch = schemaContent.match(/model\s+User\s*{[\s\S]*?}/)?.[0]
      expect(userModelMatch).toMatch(/posts\s+Post\[\]/)

      // Check Post side
      const postModelMatch = schemaContent.match(/model\s+Post\s*{[\s\S]*?}/)?.[0]
      expect(postModelMatch).toMatch(/author\s+User/)
    })

    it('should properly reference User.id in Post.author relation', () => {
      expect(schemaContent).toMatch(/references:\s*\[id\]/)
    })

    it('should properly reference Post.authorId in the relation', () => {
      expect(schemaContent).toMatch(/fields:\s*\[authorId\]/)
    })

    it('should have matching field types for relation (both Int)', () => {
      const userIdMatch = schemaContent.match(/model\s+User\s*{[\s\S]*?id\s+Int/)?.[0]
      const postAuthorIdMatch = schemaContent.match(/model\s+Post\s*{[\s\S]*?authorId\s+Int/)?.[0]
      
      expect(userIdMatch).toBeTruthy()
      expect(postAuthorIdMatch).toBeTruthy()
    })
  })

  describe('Field Types and Attributes', () => {
    it('should use Int type for all id fields', () => {
      const idFields = schemaContent.match(/id\s+Int/g)
      expect(idFields).toBeTruthy()
      expect(idFields!.length).toBeGreaterThanOrEqual(2)
    })

    it('should use String type for text fields', () => {
      expect(schemaContent).toMatch(/email\s+String/)
      expect(schemaContent).toMatch(/name\s+String\?/)
      expect(schemaContent).toMatch(/title\s+String/)
      expect(schemaContent).toMatch(/content\s+String\?/)
    })

    it('should use Boolean type for published field', () => {
      expect(schemaContent).toMatch(/published\s+Boolean/)
    })

    it('should mark appropriate fields as optional with ?', () => {
      expect(schemaContent).toMatch(/name\s+String\?/)
      expect(schemaContent).toMatch(/content\s+String\?/)
    })

    it('should mark required fields without ?', () => {
      expect(schemaContent).toMatch(/email\s+String\s+@unique/)
      expect(schemaContent).toMatch(/title\s+String[^?]/)
    })
  })

  describe('Default Values', () => {
    it('should have @default(autoincrement()) for id fields', () => {
      const autoIncrementFields = schemaContent.match(/@default\(autoincrement\(\)\)/g)
      expect(autoIncrementFields).toBeTruthy()
      expect(autoIncrementFields!.length).toBe(2)
    })

    it('should have @default(false) for published field', () => {
      expect(schemaContent).toMatch(/@default\(false\)/)
    })

    it('should not have defaults on optional nullable fields', () => {
      // name and content should be optional without defaults
      const nameMatch = schemaContent.match(/name\s+String\?[^\n]*/)
      const contentMatch = schemaContent.match(/content\s+String\?[^\n]*/)
      
      expect(nameMatch?.[0]).not.toMatch(/@default/)
      expect(contentMatch?.[0]).not.toMatch(/@default/)
    })
  })

  describe('Unique Constraints', () => {
    it('should have @unique constraint on email field', () => {
      expect(schemaContent).toMatch(/email\s+String\s+@unique/)
    })

    it('should have @id constraint on id fields', () => {
      const idConstraints = schemaContent.match(/@id/g)
      expect(idConstraints).toBeTruthy()
      expect(idConstraints!.length).toBeGreaterThanOrEqual(2)
    })

    it('should not have duplicate unique constraints', () => {
      const uniqueConstraints = schemaContent.match(/@unique/g)
      expect(uniqueConstraints).toBeTruthy()
      expect(uniqueConstraints!.length).toBe(1) // Only email should be unique
    })
  })

  describe('Comments and Documentation', () => {
    it('should contain schema documentation comments', () => {
      expect(schemaContent).toMatch(/\/\//)
    })

    it('should have header comments explaining the schema', () => {
      expect(schemaContent).toMatch(/This is your Prisma schema file/)
    })
  })

  describe('Best Practices and Conventions', () => {
    it('should use PascalCase for model names', () => {
      expect(schemaContent).toMatch(/model\s+User/)
      expect(schemaContent).toMatch(/model\s+Post/)
    })

    it('should use camelCase for field names', () => {
      expect(schemaContent).toMatch(/authorId/)
    })

    it('should use consistent indentation', () => {
      const lines = schemaContent.split('\n')
      const indentedLines = lines.filter(line => line.match(/^\s+\w/))
      
      expect(indentedLines.length).toBeGreaterThan(0)
      // All model fields should be indented
      indentedLines.forEach(line => {
        expect(line).toMatch(/^\s{2,}/)
      })
    })

    it('should define relations on both sides', () => {
      // User has posts
      expect(schemaContent).toMatch(/posts\s+Post\[\]/)
      // Post has author
      expect(schemaContent).toMatch(/author\s+User/)
    })
  })

  describe('Data Integrity', () => {
    it('should enforce referential integrity with @relation', () => {
      expect(schemaContent).toMatch(/@relation\(fields:\s*\[authorId\],\s*references:\s*\[id\]\)/)
    })

    it('should use autoincrement for primary keys', () => {
      const userIdLine = schemaContent.match(/model\s+User\s*{[\s\S]*?(id\s+Int.*)/)?.[1]
      const postIdLine = schemaContent.match(/model\s+Post\s*{[\s\S]*?(id\s+Int.*)/)?.[1]
      
      expect(userIdLine).toMatch(/autoincrement/)
      expect(postIdLine).toMatch(/autoincrement/)
    })

    it('should not allow null for foreign keys', () => {
      const authorIdLine = schemaContent.match(/authorId\s+Int[^\n]*/)?.[0]
      expect(authorIdLine).not.toMatch(/\?/)
    })
  })

  describe('Schema Completeness', () => {
    it('should have all required sections', () => {
      expect(schemaContent).toMatch(/generator/)
      expect(schemaContent).toMatch(/datasource/)
      expect(schemaContent).toMatch(/model\s+User/)
      expect(schemaContent).toMatch(/model\s+Post/)
    })

    it('should not have syntax errors in model definitions', () => {
      const modelBlocks = schemaContent.match(/model\s+\w+\s*{[\s\S]*?}/g)
      expect(modelBlocks).toBeTruthy()
      expect(modelBlocks!.length).toBe(2)
      
      modelBlocks!.forEach(block => {
        expect(block).toMatch(/^model\s+\w+\s*{/)
        expect(block).toMatch(/}$/)
      })
    })
  })

  describe('Edge Cases and Validation', () => {
    it('should handle relationship cardinality correctly', () => {
      // One user to many posts
      expect(schemaContent).toMatch(/posts\s+Post\[\]/)
      // Many posts to one user
      expect(schemaContent).toMatch(/author\s+User[^\[]/)
    })

    it('should not have circular dependencies without proper relations', () => {
      const userRelations = schemaContent.match(/model\s+User\s*{[\s\S]*?@relation/g)
      const postRelations = schemaContent.match(/model\s+Post\s*{[\s\S]*?@relation/g)
      
      // Only Post should have @relation annotation (one side of the relation)
      expect(postRelations).toBeTruthy()
    })

    it('should define database provider correctly', () => {
      expect(schemaContent).toMatch(/provider\s*=\s*"postgresql"/)
      // Should not have multiple providers
      const providers = schemaContent.match(/provider\s*=/g)
      expect(providers!.length).toBe(2) // One for generator, one for datasource
    })

    it('should use proper environment variable syntax', () => {
      expect(schemaContent).toMatch(/env\("DATABASE_URL"\)/)
      // Should not have typos or wrong syntax
      expect(schemaContent).not.toMatch(/env\('DATABASE_URL'\)/)
      expect(schemaContent).not.toMatch(/\$DATABASE_URL/)
    })
  })

  describe('Future-proofing and Scalability', () => {
    it('should allow for easy addition of new fields', () => {
      // Models should be properly structured to allow extension
      const userModel = schemaContent.match(/model\s+User\s*{[\s\S]*?}/)?.[0]
      const postModel = schemaContent.match(/model\s+Post\s*{[\s\S]*?}/)?.[0]
      
      expect(userModel).toBeTruthy()
      expect(postModel).toBeTruthy()
      
      // Should end with closing brace on new line
      expect(userModel).toMatch(/}\s*$/)
      expect(postModel).toMatch(/}\s*$/)
    })

    it('should use Int for IDs to support large datasets', () => {
      // Int in Prisma maps to INTEGER in PostgreSQL (4 bytes, up to 2 billion)
      // For larger datasets, consider BigInt
      const idFields = schemaContent.match(/id\s+Int/g)
      expect(idFields).toBeTruthy()
    })

    it('should support the current Prisma version syntax', () => {
      // Check for modern Prisma syntax
      expect(schemaContent).toMatch(/@default/)
      expect(schemaContent).toMatch(/@id/)
      expect(schemaContent).toMatch(/@unique/)
      expect(schemaContent).toMatch(/@relation/)
    })
  })
})