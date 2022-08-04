export const generateQueueID = (queue: Record<string, any>, prefix: string) => {
  let id = `${prefix}|${new Date().getTime()}|${randomDigits(5)}`
  while (queue && queue[id]) {
    id = `${prefix}|${new Date().getTime()}|${randomDigits(5)}`
  }
  return id
}

export const randomDigits = (n: number) => {
  return Math.floor(Math.random() * (9 * Math.pow(10, n))) + Math.pow(10, n)
}
