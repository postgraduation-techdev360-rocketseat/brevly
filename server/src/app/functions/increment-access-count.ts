import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { LinkNotFound } from './errors/link-not-found'

const incrementAccessCountInput = z.object({
  shortUrl: z.string().min(1).toLowerCase(),
})

type IncrementAccessCountInput = z.input<typeof incrementAccessCountInput>

type IncrementAccessCountOutput = {
  accessCount: number
}

export async function incrementAccessCount(
  input: IncrementAccessCountInput
): Promise<Either<LinkNotFound, IncrementAccessCountOutput>> {
  const { shortUrl } = incrementAccessCountInput.parse(input)

  const [existingLink] = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)

  if (!existingLink) {
    return makeLeft(new LinkNotFound(shortUrl))
  }

  const [updatedLink] = await db
    .update(schema.links)
    .set({ accessCount: sql`${schema.links.accessCount} + 1` })
    .where(eq(schema.links.shortUrl, shortUrl))
    .returning({ accessCount: schema.links.accessCount })

  return makeRight({ accessCount: updatedLink.accessCount })
}
