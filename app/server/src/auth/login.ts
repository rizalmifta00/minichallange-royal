import { AuthLogin } from 'server-web'

export default (async ({ req, reply }) => {
  reply.statusCode = 200
  return {
    username: '',
  }
}) as AuthLogin
