import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { Status } from "https://deno.land/std@0.161.0/http/http_status.ts";

export const admin = async (ctx: Context, next: any) => {
    try {
        // Uitlezen omgevingsvariabele als extra security
        // Bron: https://examples.deno.land/environment-variables
        const adminPassword = Deno.env.get("ADMIN_PASSWORD")
        const body = ctx.request.body();
        const { wachtwoord } = await body.value;
        
        if (!wachtwoord || wachtwoord!==adminPassword) {
            ctx.response.body = { message: `Geen correct admin wachtwoord '${wachtwoord}' in request aanwezig, zoals vereist.` };
            ctx.response.status = Status.Unauthorized;
        } else {
            await next();
        }
    } catch (error) {
        ctx.response.status = 401;
        ctx.response.body ={message: "Je hebt geen toegang voor dit endpoint. Error: " + error}
    }
}
