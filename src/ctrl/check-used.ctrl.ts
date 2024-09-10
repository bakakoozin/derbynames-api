import { Buffer } from 'node:buffer';
import type { ObjectId } from "mongodb"
import type { ExportedHandlerType } from "../utils"
import * as utils from "../utils"
import * as Realm from 'realm-web';
import * as jose from 'jose'
import { sendEmail } from "../emails/sender"

const DERBYNAMES = "derbynames"

export const checkUsed = {

    async GET(req: Request, env: ExportedHandlerType, App: Realm.App) {
        const queryParams = new URLSearchParams(req.url.split("?")[1])
        const derbyName: string = queryParams.get("derbyName") || ''

        const name = derbyName.trim().toLowerCase()

        const client = await utils.getClient(env, App)
        if (!client)
            return utils.toError("problème connexion MdB", 500)

        const collection = client.db(env.DB_NAME).collection(DERBYNAMES)

        const count = await collection.count({
            name
        })

        return utils.toJSON({ count })
    }


}