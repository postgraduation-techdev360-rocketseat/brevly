import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { LinkNotFound } from './errors/link-not-found'

const getOriginalUrlInput = z.object({
  shortUrl: z.string().min(1).toLowerCase(),
})

type GetOriginalUrlInput = z.input<typeof getOriginalUrlInput>

type GetOriginalUrlOutput = {
  originalUrl: string
}

export async function getOriginalUrl(
  input: GetOriginalUrlInput
): Promise<Either<LinkNotFound, GetOriginalUrlOutput>> {
  const { shortUrl } = getOriginalUrlInput.parse(input)

  const [link] = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)

  if (!link) {
    return makeLeft(new LinkNotFound(shortUrl))
  }

  return makeRight({ originalUrl: link.originalUrl })
}
