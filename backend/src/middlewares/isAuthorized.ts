import { verify } from "https://deno.land/x/djwt@v2.4/mod.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { Status } from "https://deno.land/std@0.161.0/http/http_status.ts";

import { key } from "../utils/apiKey.ts";

export const authorized = async (ctx: Context, next: any) => {
    try{   
        const headers: Headers = ctx.request.headers;
        const authorization = headers.get('Authorization');
        if(!authorization) {
            ctx.response.status = Status.Unauthorized;
            return;
        }
        const jwt = authorization.split(' ')[1];

        if(!jwt) {
            ctx.response.status = 401;
            return;
        }
        const payload = await verify(jwt, key);

        if(!payload){
            throw new Error("!payload")
        }
        await next();    
    } catch (error) {
        ctx.response.status = 401;
        ctx.response.body ={message: "Je hebt geen toegang voor dit endpoint. Error: " + error}
    }
}
