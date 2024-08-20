import type { ObjectId } from "mongodb"
import type { ExportedHandlerType } from "../utils"
import * as utils from "../utils"
import * as Realm from 'realm-web';
import { sendEmail } from "../emails/sender"

const DERBYNAMES = "derbynames"

export type Derbyname = { _id: ObjectId, name: string, numRoster: string, email: string, club: { name: string, id: string }, emailConfirmed: boolean }

export const derbyNameController = {

  async GET(_req: Request, env: ExportedHandlerType, App: Realm.App) {

    const client = await utils.getClient(env, App)
    if (!client)
      return utils.toError("problème connexion MdB", 500)

    const collection = client.db(env.DB_NAME).collection(DERBYNAMES)

    const derbyNames = await collection.find({
      emailConfirmed: true
    })

    return utils.toJSON(derbyNames.map(d => ({
      name: d.name,
      numRoster: d.numRoster
    })))

  },
  async POST(req: Request, env: ExportedHandlerType, App: Realm.App) {
    const body = await req.json() as Derbyname
    // ====================================
    //todo controller les données
    // ====================================

    const { name: _name, numRoster: _numRoster, email: _email, club:_club } = body

    const isNameValid = typeof _name === "string" && _name.length > 0
    const isNumRosterValid = typeof _numRoster === "string" && _numRoster.length > 0 && _numRoster.length < 5
    const isEmailValid = typeof _email === "string" && _email.length > 0 && _email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,15}$/)
 
    //clean name
    const regex = /<script|<ifr|<em|<img|javascript:/i
    if (regex.test(_name) || regex.test(_numRoster) || regex.test(_email))
      return utils.toError("données invalides", 400)

    const name = _name.trim()
    const email = _email.trim()
    const numRoster = _numRoster.trim()
    const club = {
      name: _club.name,
      id: _club.id
    }

    const player = { name, numRoster, email,club, emailConfirmed: false }

    if (!isNameValid || !isNumRosterValid || !isEmailValid || !club)
      return utils.toError("données invalides", 400)

    const client = await utils.getClient(env, App)
    if (!client)
      return utils.toError("problème connexion MdB", 500)
    const collection = client.db(env.DB_NAME).collection<Derbyname>(DERBYNAMES)
    const newName = await collection.insertOne(player)

    await sendEmail({
      env,
      to: [{
        email,
        name
      }],
      subject: "Hello world !",
      html: "<html><head></head><body><p>Hello,</p> --- This is my first transactional email sent from Brevo.</p></body></html>"
    })


    // ====================================


    return utils.toJSON({ newName })
  }
}

