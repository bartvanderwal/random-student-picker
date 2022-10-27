import { Application } from "https://deno.land/x/oak/mod.ts";
import router from "./src/routes/allRoutes.ts";

const app = new Application();
const PORT = 8080;

app.use(router.routes());
app.use(router.allowedMethods());

// app.use((ctx, next) => {
//     ctx.response.body = 'Welcome';
//     next();
// });

console.log(`Application is listening on port: ${PORT}`);

await app.listen({port:PORT});
