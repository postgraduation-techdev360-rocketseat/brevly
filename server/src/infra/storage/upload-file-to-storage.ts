import { randomUUID } from 'node:crypto'
import type { Readable } from 'node:stream'
import { env } from '@/env'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client } from './client'

interface UploadFileInput {
  folder: string
  fileName: string
  contentType: string
  contentStream: Readable
}

interface UploadFileOutput {
  key: string
  url: string
}

export async function uploadFileToStorage(
  input: UploadFileInput
): Promise<UploadFileOutput> {
  const key = `${input.folder}/${randomUUID()}-${input.fileName}`

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: env.AWS_BUCKET,
      Key: key,
      Body: input.contentStream,
      ContentType: input.contentType,
    },
  })

  await upload.done()

  const url = `${env.AWS_PUBLIC_URL}/${key}`

  return { key, url }
}
