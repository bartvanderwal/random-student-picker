import { Request, Response } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.30.0/mod.ts";

import db from "../database/connectDB.ts";
import { VraagSchema } from "../schema/VraagSchema.ts";
import { Vraag } from "../../shared/models/Vraag.d.ts";

const vragen = db.collection<VraagSchema>("vragen");

export const postVraag = async({request, response}:{request: Request; response: Response}) => {
    const bodyValue = await request.body();
    const { vraagTekst } = await bodyValue.value;
    if (!vraagTekst) {
        response.status = 400;
        response.body = "Geen 'vraagTekst' gevonden in body (of waarde is leeg): " + JSON.stringify(bodyValue)
        return;
    } else {
        const _id = await vragen.insertOne(
            { vraagTekst }
        );
        // TODO: Sla geen dubbele vragen op per les, maar overschrijf bij indienen tweede keer zelfde vraagtekst (e.g. gebruik upsert).
        // Bron upsert docs: https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/write-operations/upsert/
        // const _id2 = await vragen.updateOne(
        //     { vraagTekst },           // Query parameter  
        //     { $set: { vraagTekst }},  // Update document
        //     { upsert: true}           // Options
        // )
        response.status = 200;
        response.body = {message: `Vraag toegevoegd`, id: _id, vraagTekst}
    }
};

export const getVragen = async ({response}: { response: Response }) => {
    const alleVragen = await vragen.find({}).toArray();
    const result: Array<Vraag> = alleVragen.map(v => ({ id: v._id.toString(), vraagTekst: v.vraagTekst, lesId: v.les}))
    response.status = 200;
    response.body = { vragen: result };
};

export const deleteVraag = async ({
    params,
    response,
}:{
    params: {vraagId: string};
    response: Response;
}) => {
    const vraagId = params.vraagId
    console.log('DELETE, vraagId: ', vraagId)
    const vraag = await vragen.deleteOne({_id: new ObjectId(vraagId)});
    response.status = 200;
    response.body = { message:"Vraag verwijderd", vraag };
};
