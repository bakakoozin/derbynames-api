import { Buffer } from 'node:buffer';
import type { ObjectId } from "mongodb"
import type { ExportedHandlerType } from "../utils"
import * as utils from "../utils"
import * as Realm from 'realm-web';
import * as jose from 'jose'
import { sendEmail } from "../emails/sender"

const DERBYNAMES = "derbynames"

export const validatedEmailController = {
  async GET() {
    return utils.toJSON({ msg: "validate" })
  },

  async POST(req: Request, env: ExportedHandlerType, App: Realm.App) {

    const body = await req.json()  as {token: string}

    const secret = Buffer.from(env.JWT_SECRET, 'hex')
    try {
     const { payload } = await jose.jwtDecrypt(body.token, secret)

     console.log(payload)
    const client = await utils.getClient(env, App)
    if (!client)
      return utils.toError("problème connexion MdB", 500)

    const collection = client.db(env.DB_NAME).collection(DERBYNAMES)

    const derbyNames = await collection.find({
      generatedCode : payload.generatedCode
    })

    if(derbyNames.length === 0)
      return utils.toError("code invalide", 400)

    await collection.updateOne({ _id: derbyNames[0]._id }, { $set: { emailConfirmed: true, generatedCode: null } })

    return utils.toJSON(derbyNames.map(d => ({
      name: d.name,
      numRoster: d.numRoster,
      slug: d.name.toLowerCase().replace(/ /g, "-")
    }))[0])
    }
    catch (e) {
      console.error(e)
      return utils.toError("problème connexion MdB", 500)
    }

  },

}

