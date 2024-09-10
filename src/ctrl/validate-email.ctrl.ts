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

    const client = await utils.getClient(env, App)
    if (!client)
      return utils.toError("problème connexion MdB", 500)

    const collection = client.db(env.DB_NAME).collection(DERBYNAMES)

    const [derbyName] = await collection.find({
      generatedCode : payload.generatedCode
    })

      if (derbyName.length === 0)
      return utils.toError("code invalide", 400)

      await collection.updateOne({ _id: derbyName._id }, { $set: { emailConfirmed: true, generatedCode: null } })

  // delete all other entries with the same email
      await collection.deleteMany({ email: derbyName.email, _id: { $ne: derbyName._id } })
      
      return utils.toJSON({
        name: derbyName.name,
      })
    }
    catch (e) {
      console.error(e)
      return utils.toError("problème connexion MdB", 500)
    }

  },

}

