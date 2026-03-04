import { db } from '@/infra/db'
import { schema } from '@/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/infra/shared/either'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { LinkNotFound } from './errors/link-not-found'

const deleteLinkInput = z.object({
  shortUrl: z.string().min(1).toLowerCase(),
})

type DeleteLinkInput = z.input<typeof deleteLinkInput>

type DeleteLinkOutput = {
  id: string
}

export async function deleteLink(
  input: DeleteLinkInput
): Promise<Either<LinkNotFound, DeleteLinkOutput>> {
  const { shortUrl } = deleteLinkInput.parse(input)

  const [existingLink] = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)

  if (!existingLink) {
    return makeLeft(new LinkNotFound(shortUrl))
  }

  await db
    .delete(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))

  return makeRight({ id: existingLink.id })
}
