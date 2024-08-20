import * as Realm from 'realm-web';
import * as utils from './utils';
import { derbyNameController } from './ctrl/derbyname.ctrl';
import { indexCtrl } from './ctrl/index.ctrl';
import type { ExportedHandlerType , Router} from './utils';


let App: Realm.App;


const worker: ExportedHandler<ExportedHandlerType> = {
  async fetch(req, env) {
    const url = new URL(req.url);

  
    App = App || new Realm.App(env.ATLAS_APPID);

    const method = req.method;
    const path = url.pathname.replace(/[/]$/, '');

    const router: Router  = { 
      "": indexCtrl ,
      "/": indexCtrl ,
      "/derbynames": derbyNameController 
    }
    const controller = router?.[path]?.[method]
    return typeof controller === "function" ? await controller(req, env, App) : utils.toError("not found", 404)
  }
}

export default worker;
