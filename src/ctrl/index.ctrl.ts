import * as utils from "../utils"

export const indexCtrl = {
  async GET() {
    return utils.toJSON({ msg: "Hello World!" })
  }
}