declare module 'clean-deep' {
  export default function cleanDeep<T> (object: T): T
}

declare module 'podcast-categories' {
  const categories: Record<string, Record<string, unknown>>
  export default categories
}
