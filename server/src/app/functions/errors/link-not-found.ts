export class LinkNotFound extends Error {
  constructor(shortUrl: string) {
    super(`Link with short URL "${shortUrl}" not found`)
  }
}
