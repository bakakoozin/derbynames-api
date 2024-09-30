import { Buffer } from 'node:buffer';
import type { ExportedHandlerType } from "../utils"
import * as utils from "../utils"
import * as jose from 'jose'
import { sendEmail } from "../emails/sender"


export type Derbyname = {  name: string, numRoster: string, email: string, club: { name: string, id: string }, emailConfirmed: boolean }

export const derbyNameController = {

  async GET(_req: Request, env: ExportedHandlerType) {

    const derbyNamesStr = await env.derbyname.get('names') || '[]'
    const derbyNames =  JSON.parse(derbyNamesStr) 
    return utils.toJSON(derbyNames.map((dn: Derbyname) => ({ name: dn.name, numRoster: dn.numRoster, email: dn.email, club: dn.club.name })))

  },
  async POST(req: Request, env: ExportedHandlerType) {
    const body = await req.json() as Derbyname

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

  const derbyNamesExistStr =  await env.derbyname.get(name.trim().toLowerCase());

  const derbyNamesExist = derbyNamesExistStr ? JSON.parse(await env.derbyname.get(derbyNamesExistStr)) : null

    if (derbyNamesExist?.emailConfirmed) return utils.toError("nom déjà pris", 400)

    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString() 
    const player = { name, numRoster, email ,club, emailConfirmed: false  }

    if (!isNameValid || !isNumRosterValid || !isEmailValid || !club)
      return utils.toError("données invalides", 400)


    // ====== Génération du token JWT ======
    const secret = Buffer.from(env.JWT_SECRET, 'hex')
    
    const jwt = await new jose.EncryptJWT({
      generatedCode
    })
      .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
      .setIssuedAt()
      .setIssuer('derbynames.ovh_back')
      .setAudience('derbynames.ovh_front')
      .setExpirationTime('20m')
      .encrypt(secret)

    await env.derbyname.put(name.trim().toLowerCase(), email);
    await env.derbyname.put(email, JSON.stringify(player));
    await env.derbyname.put(`gen_${generatedCode}`, email);

    await sendEmail({
      env,
      to: [{
        email,
        name
      }],
      subject: "DERBY NAME !",
      html: `<html><head></head><body>
      <h1>DERBY NAMES</h1>
      <h2>Confirmation de votre adresse email</h2>
      <p>Bonjour ${name},</p>
      <p>Vous avez récemment demandé à valider votre derbyname sur notre site. Pour confirmer votre adresse email et valider votre derbyname, veuillez cliquer sur le lien ci-dessous :</p>
      <a href="https://derbynames.ovh/validate/${jwt}">Confirmer mon adresse email et valider mon derbyname</a>
      </body></html>
`
    })


    // ====================================


    return utils.toJSON({ player })
  }
}

