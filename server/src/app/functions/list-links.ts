import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeRight } from '@/infra/shared/either'
import { asc, count, desc, ilike } from 'drizzle-orm'
import { z } from 'zod'

const listLinksInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt', 'accessCount']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional().default(1),
  pageSize: z.number().optional().default(20),
})

type ListLinksInput = z.input<typeof listLinksInput>

type ListLinksOutput = {
  links: {
    id: string
    originalUrl: string
    shortUrl: string
    accessCount: number
    createdAt: Date
  }[]
  total: number
}

export async function listLinks(
  input: ListLinksInput
): Promise<Either<never, ListLinksOutput>> {
  const { page, pageSize, searchQuery, sortBy, sortDirection } =
    listLinksInput.parse(input)

  const [linksResult, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.links.id,
        originalUrl: schema.links.originalUrl,
        shortUrl: schema.links.shortUrl,
        accessCount: schema.links.accessCount,
        createdAt: schema.links.createdAt,
      })
      .from(schema.links)
      .where(
        searchQuery
          ? ilike(schema.links.shortUrl, `%${searchQuery}%`)
          : undefined
      )
      .orderBy(fields => {
        if (sortBy === 'accessCount') {
          return sortDirection === 'asc'
            ? asc(fields.accessCount)
            : desc(fields.accessCount)
        }

        if (sortBy === 'createdAt') {
          return sortDirection === 'asc'
            ? asc(fields.createdAt)
            : desc(fields.createdAt)
        }

        return desc(fields.createdAt)
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db
      .select({ total: count(schema.links.id) })
      .from(schema.links)
      .where(
        searchQuery
          ? ilike(schema.links.shortUrl, `%${searchQuery}%`)
          : undefined
      ),
  ])

  return makeRight({ links: linksResult, total })
}
