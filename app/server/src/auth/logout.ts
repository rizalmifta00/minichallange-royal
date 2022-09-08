import { AuthLogout } from 'server-web'

export default (async ({ req }) => {
  await req.session.destroy(() => {})
}) as AuthLogout
