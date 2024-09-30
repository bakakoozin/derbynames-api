import { Buffer } from 'node:buffer';
import type { ExportedHandlerType } from "../utils"
import * as utils from "../utils"
import * as jose from 'jose'


export const validatedEmailController = {
  async GET() {
    return utils.toJSON({ msg: "validate" })
  },

  async POST(req: Request, env: ExportedHandlerType) {

    const body = await req.json()  as {token: string}

    const secret = Buffer.from(env.JWT_SECRET, 'hex')

     const { payload } = await jose.jwtDecrypt(body.token, secret)
    const email = await env.derbyname.get(`gen_${payload.generatedCode }`as string)
      if (!email)
      return utils.toError("code invalide", 400)


      const playerStr  = await env.derbyname.get(email) || '{}' 
      const player = JSON.parse(playerStr) as any
      const namesStr = await env.derbyname.get('names') || '[]'
      const names: any = JSON.parse(namesStr) as string[]

      await env.derbyname.put(player.name, JSON.stringify({
        ...player,
        email,
        emailConfirmed: true  
      }))

    await env.derbyname.put('names', JSON.stringify([...names.filter((n:any)=>n.name !== player.name ), {
      name: player.name,
      numRoster: player.numRoster,
      club: player.club,
    }]))

      return utils.toJSON({
        name: player.name,
      })
    }
}

