import type { ExportedHandlerType } from "../utils"
import * as utils from "../utils"

export const checkUsed = {

    async GET(req: Request, env: ExportedHandlerType) {
        const queryParams = new URLSearchParams(req.url.split("?")[1])
        const derbyName: string = queryParams.get("derbyName") || ''

        const name = derbyName.trim().toLowerCase()

        const count = await env.derbyname.get(name)
        return utils.toJSON({ count: count ? 1: 0 })
    }
}