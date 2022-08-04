import { API } from 'server-web'

export default [
  '/api/contoh',
  async ({ body, reply }) => {
    reply.send({success: true, data: "ini adalah response api"})
  },
] as API
      