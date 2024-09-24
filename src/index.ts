import * as utils from './utils';
import { derbyNameController } from './ctrl/derbyname.ctrl';
import { indexCtrl } from './ctrl/index.ctrl';
import { validatedEmailController } from './ctrl/validate-email.ctrl';

import type { ExportedHandlerType , Router} from './utils';
import { checkUsed } from './ctrl/check-used.ctrl';


const worker: ExportedHandler<ExportedHandlerType> = {
  async fetch(req, env) {
    const url = new URL(req.url);
  

    const method = req.method;
    const path = url.pathname.replace(/[/]$/, '');

    if(method === "OPTIONS") return utils.toOptions()
    
    const router: Router  = { 
      "": indexCtrl ,
      "/": indexCtrl ,
      "/derbynames": derbyNameController,
      '/validate': validatedEmailController,
      "/check_used": checkUsed,
    }
    const controller = router?.[path]?.[method]
    return typeof controller === "function" ? await controller(req, env) : utils.toError("not found", 404)
  }
}

export default worker;
