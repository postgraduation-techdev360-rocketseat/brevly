export class DuplicateShortUrl extends Error {
  constructor(shortUrl: string) {
    super(`Short URL "${shortUrl}" already exists`)
  }
}
