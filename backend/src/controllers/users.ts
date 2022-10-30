import { Request, Response } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create } from "https://deno.land/x/djwt@v2.4/mod.ts";

import db from "../database/connectDB.ts";
import { UserSchema } from "../schema/UserSchema.ts";
import { key } from "../utils/apiKey.ts";

const Users = db.collection<UserSchema>("users");

// Create a user.
export const signup = async({request, response}:{request: Request; response: Response}) => {
    if (!request) {
        response.status = 500;
        return;
    }
    const body = await request.body().value
    if(!body.username || !body.password) {
        response.status = 400 // Invalid request.
        response.body = {message: `invalid request body: '${body}'`}
    }
    // console.log('body.username: ', body.password)

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const _id = await Users.insertOne({
        username: body.username,
        password: hashedPassword
    });
    response.status = 201;
    response.body = {message: `User '${body.username}' created`, userId: _id, user: body.username}
};

// Sign in a user.
export const signin = async ({request, response}:{request: Request; response: Response}) => {

    const body = await request.body();
    const {username, password} = await body.value;

    const user = await Users.findOne({username});

    if(!user) {
        response.body = 404;
        response.body = {message: `user "${username}" not found`};
        return;
    }

    const confirmPassword = await bcrypt.compare(password, user.password);
    if (!confirmPassword){
        response.body = 404;
        response.body = {message: "Incorrect password"};
        return;
    }

    // Authenticate a user.
    const payload = {
        id: user._id,
        name: username
    }

    const jwt =  await create({ alg: "HS512", typ: "JWT" }, { payload }, key);
    if(jwt) {
        response.status = 200;
        response.body = {
            userId: user._id,
            username: user.username,
            token: jwt,
        }
    } else {
        response.status = 500;
        response.body = {
            message: "internal server error"
        }
    }
    return;
};