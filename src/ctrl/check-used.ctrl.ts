import type { ExportedHandlerType } from "../utils"
import * as utils from "../utils"

export const checkUsed = {

    async GET(req: Request, env: ExportedHandlerType) {
        const queryParams = new URLSearchParams(req.url.split("?")[1])
        const derbyName: string = queryParams.get("derbyName") || ''
        const name = derbyName.trim().toLowerCase()
        const email = await env.derbyname.get(name)
        const existStr = await env.derbyname.get(email)
        const exist = JSON.parse(existStr||'{}')
        return utils.toJSON({ count: exist?.emailConfirmed ? 1: 0, exist })
    }
}