export type Either<L, R> = Left<L, R> | Right<L, R>

class Left<L, R> {
  constructor(public readonly value: L) {}

  isLeft(): this is Left<L, R> {
    return true
  }

  isRight(): this is Right<L, R> {
    return false
  }
}

class Right<L, R> {
  constructor(public readonly value: R) {}

  isLeft(): this is Left<L, R> {
    return false
  }

  isRight(): this is Right<L, R> {
    return true
  }
}

export function makeLeft<L, R>(value: L): Either<L, R> {
  return new Left(value)
}

export function makeRight<L, R>(value: R): Either<L, R> {
  return new Right(value)
}

export function isLeft<L, R>(either: Either<L, R>): either is Left<L, R> {
  return either.isLeft()
}

export function isRight<L, R>(either: Either<L, R>): either is Right<L, R> {
  return either.isRight()
}

export function unwrapEither<L, R>(either: Either<L, R>): R {
  if (isLeft(either)) {
    throw new Error(`Tried to unwrap left value: ${either.value}`)
  }

  return either.value
}
