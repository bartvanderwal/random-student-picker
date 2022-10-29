//import {Context, send} from 'https://deno.land/x/oak@v5.3.1/mod.ts'
import {Context, send} from "https://deno.land/x/oak@v11.1.0/mod.ts"

const defaultDocument = "index.html";

export const staticFileMiddleware = async (context: Context, next: Function) => {
    let requestPath = context.request.url.pathname;

    if (requestPath==='/') {
        requestPath=`/${defaultDocument}`;
    }
    const path = `${Deno.cwd()}/public/${requestPath}`;
  
  if (await fileExists(path)) {
    await send(context, requestPath, {
      root: `${Deno.cwd()}/public`
    })
  } else {
    await next();
  }
}

async function fileExists(path: string) {
  try {
    const stats = await Deno.lstat(path);
    return stats && stats.isFile;
  } catch(e) {
    if (e && e instanceof Deno.errors.NotFound) {
      return false;
    } else {
      throw e;
    }
  }
}
