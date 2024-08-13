
import * as Realm from 'realm-web';
import * as utils from './utils';
import { derbyNameController } from './ctrl/derbyname.ctrl';
import type { ExportedHandlerType } from './utils';


let App: Realm.App;

const worker: ExportedHandler<ExportedHandlerType> = {
  async fetch(req, env) {
    const url = new URL(req.url);

    console.log("url", env.ATLAS_APPID)
    App = App || new Realm.App(env.ATLAS_APPID);


    const method = req.method;
    const path = url.pathname.replace(/[/]$/, '');
    const router: Record<string, Record<string, (req: Request, env: ExportedHandlerType, App: Realm.App) => Promise<Response>>> = { "/derbynames": derbyNameController }
    const controller = router?.[path]?.[method]
    return typeof controller === "function" ? await controller(req, env, App) : utils.toError("not found", 404)
  }
}

export default worker;
