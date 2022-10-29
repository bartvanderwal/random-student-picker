import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import { staticFileMiddleware } from './src/middlewares/staticFileMiddleware.ts';
import router from "./src/routes/allRoutes.ts";

const app = new Application();
const PORT = 8080;

app.use(staticFileMiddleware);
app.use(router.routes());
app.use(router.allowedMethods());

console.log(`Application is listening on port: ${PORT}`);

await app.listen({port:PORT});
