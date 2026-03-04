import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { DuplicateShortUrl } from './errors/duplicate-short-url'
import type { InvalidUrl } from './errors/invalid-url'

const createLinkInput = z.object({
  originalUrl: z.string().startsWith('http://'),
  shortUrl: z
    .string()
    .min(1)
    .max(15)
    .toLowerCase()
    .regex(/^[a-zA-Z0-9\-_]+$/, 'Invalid characters in short URL'),
})

type CreateLinkInput = z.input<typeof createLinkInput>

type CreateLinkOutput = {
  id: string
  originalUrl: string
  shortUrl: string
}

export async function createLink(
  input: CreateLinkInput
): Promise<Either<InvalidUrl | DuplicateShortUrl, CreateLinkOutput>> {
  const { originalUrl, shortUrl } = createLinkInput.parse(input)

  const [existingLink] = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)

  if (existingLink) {
    return makeLeft(new DuplicateShortUrl(shortUrl))
  }

  const [createdLink] = await db
    .insert(schema.links)
    .values({
      originalUrl,
      shortUrl,
    })
    .returning({
      id: schema.links.id,
      originalUrl: schema.links.originalUrl,
      shortUrl: schema.links.shortUrl,
    })

  return makeRight({
    id: createdLink.id,
    originalUrl: createdLink.originalUrl,
    shortUrl: createdLink.shortUrl,
  })
}
