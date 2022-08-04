export const cx = (value: any) => {
  if (Array.isArray(value)) return value.filter((e) => !!e).join(' ')

  return value
}
