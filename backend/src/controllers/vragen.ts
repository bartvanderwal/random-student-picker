import { Request, Response } from "https://deno.land/x/oak@v11.1.0/mod.ts";

import db from "../database/connectDB.ts";
import { VraagSchema } from "../schema/vraag.ts";

const vragen = db.collection<VraagSchema>("vragen");

export const postVraag = async({request, response}:{request: Request; response: Response}) => {
    const bodyValue = await request.body();
    const { vraagTekst } = await bodyValue.value;
    if (!vraagTekst) {
        response.status = 400;
        response.body = "Geen 'vraagTekst' gevonden in body: " + JSON.stringify(bodyValue)
    }
    const _id = await vragen.insertOne({
        vraagTekst
    });
    response.body = {message: `Vraag toegevoegd`, id: _id, vraagTekst}
};

export const getVragen = async ({response} : { response: Response }) => {
    const alleVragen = await vragen.find({}).toArray();

    response.status = 200;
    response.body = { vragen: alleVragen};
};

// TODO: Sla geen dubbele vragen op per les, maar overschrijf bij indienen tweede antwoord (gebruik upsert).
// db.example.update({Name: "Rekha"},   // Query parameter  
//    {$set: {Phone: '7841235468 '}, // Update document
//    $setOnInsert: {Gender: 'Female'}},
//    {upsert: true})