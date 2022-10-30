import { Request, Response } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DB, Row } from "https://deno.land/x/sqlite@v3.5.0/mod.ts";
import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { Status } from "https://deno.land/std@0.161.0/http/http_status.ts";

import { Antwoord } from "../../shared/models/antwoord.d.ts";

// We slaan gegevens op in een lokale sqlite database.
// Het probleem dat deze database er eventueel niet meer is tussen server herstarts zien we als een feature.

// Geef SQLite antwoorden database terug, en maak evt. aan als nog nodig
// Bron: https://deno.land/x/sqlite@v3.5.0

let last_insert_rowid: number = -1;

function queryAntwoordenDB(query: string, values?: Array<string>): Array<Row> {
    const antwoordenDb = new DB("antwoordenDB");

    antwoordenDb.execute(`
        CREATE TABLE IF NOT EXISTS antwoorden (
            ID TEXT PRIMARY KEY,
            VraagId TEXT,
            VraagTekst TEXT,
            AntwoordTekst TEXT,
            GebruikerId TEXT,
            IsGoed INTEGER,
            UNIQUE(VraagId, GebruikerId)
        )
    `);
    let result;
    if (query) {
        result = antwoordenDb.query(query, values);
    } else {
        result = new Array<Row>();
    }
    last_insert_rowid = antwoordenDb.lastInsertRowId
    antwoordenDb.close();
    return result;
}

export const postAntwoord = async({request, response}:{request: Request; response: Response}) => {
    const body = await request.body();

    const antwoord: Antwoord = getAntwoordFromBody(await body.value);
    
    // TODO Refactor SQLite specifieke code naar apart repository object.
    // We gebruiken de '?' syntax in SQLite om SQL Injectie te voorkomen. Checken of dit voldoende is.
    // Bron: https://deno.land/std@0.160.0/uuid/README.md?source=
    // Voeg vraag toe in database
    // Generate a v4 UUID. For this we use the browser standard `crypto.randomUUID` function.
    const id = crypto.randomUUID();

    // Een upsert; insert als nieuw antwoord, update als zelfde gebruiker bij zelfde vraagId al eerder antwoord had
    // SQLite Upsert documentatie: https://www.sqlite.org/lang_UPSERT.html
    queryAntwoordenDB("insert into antwoorden (ID, VraagId, VraagTekst, AntwoordTekst, GebruikerId) values (?, ?, ?, ?, ?)" +
            "ON CONFLICT DO UPDATE SET AntwoordTekst=?", 
        [id, antwoord.vraagId, antwoord.vraagTekst, antwoord.antwoordTekst, antwoord.gebruikerId, antwoord.antwoordTekst]);

    // Bekijk of het een insert of update was, via hack, bij conflict (e.g. update) is last_insert_rowid namelijk 0
    // Bron: https://sqlite.org/forum/info/1ead75e2c45de9a580c998cbe6d4d9216437fcfe237479e940107ed3b011affb 
    console.log('postantwoord last_insert_rowid:' + last_insert_rowid)
    if (last_insert_rowid===0) {
        response.body = {message: `Antwoord gewijzigd`, id, antwoordTekst: antwoord.antwoordTekst, antwoord}
    } else {
        response.body = {message: `Antwoord toegevoegd`, id, antwoordTekst: antwoord.antwoordTekst, antwoord}
    }
};

export const markeerAntwoord = async({request, response}:{request: Request; response: Response}) => {
    const body = request.body();
    const { isGoed, id } = await body.value;

    // Validate the v4 UUID.
    if (isGoed===undefined || !id || !V4.isValid(id)) {
        throw new Error(`Missende of ongeldige antwoord GUID '${id} of status '${isGoed}'.`)
    }

    // TODO Refactor SQLite specifieke code naar apart repository object.
    // We gebruiken de '?' syntax in SQLite om SQL Injectie te voorkomen. Checken of dit voldoende is.
    // Voeg vraag toe in database
    queryAntwoordenDB("UPDATE antwoorden set isGoed=? where id equals ?", [isGoed, id]);
  
    const logBericht = `Antwoord met id '${id} gemarkeerd als '${isGoed}'.`;
    console.log(logBericht)
    response.body = { message: logBericht, id, isGoed}
};

export const deleteAntwoorden = async({request, response}:{request: Request; response: Response}) => {
    const body = request.body();
    const { wachtwoord } = await body.value;

    // Bron: Uitlezen omgevingsvariabele als extra security: https://examples.deno.land/environment-variables
    const adminPassword = Deno.env.get("ADMINPASSWORD")
    if (!wachtwoord || wachtwoord!==adminPassword) {
        response.body = { message: `Wachtwoord '${wachtwoord}' in request niet correct: antwoorden NIET gewist.` };
        console.log("adminPassword: ", adminPassword);
        response.status = Status.Unauthorized;
    } else {
        queryAntwoordenDB("delete from antwoorden");
        response.status = Status.OK;
        response.body = { message: `Antwoorden verwijderd` };
    }
    console.log(response.body)
};

export const getAntwoordenVoorVraag = (
    {params, _request, response} : {
        params: {vraagId: string },
        _request: Request,
        response: Response 
    }) => {
    const vraagId = params.vraagId;
    const alleAntwoordenAlsRijen: Array<Row> | undefined = queryAntwoordenDB("SELECT * FROM antwoorden where VraagId=?", [vraagId]);
    const alleAntwoorden: Array<Antwoord> = alleAntwoordenAlsRijen.map((a: Row)  => 
        <Antwoord> ({ "id": a[0], "vraagId": a[1], "vraagTekst": a[2], "antwoordTekst": a[3], "gebruikerId": a[4] }));

    response.status = Status.OK;
    response.body = { antwoorden: alleAntwoorden }
};

function getAntwoordFromBody(body: any): Antwoord {
    // Check format van POST request.
    const { id, vraagId, vraagTekst, antwoordTekst, gebruikerId } = body;
    // Todo: Checken dat gebruikerId bestaat voor huidige vraag?
    if (!vraagTekst || !antwoordTekst || !gebruikerId) {
        throw new Error(`Ongeldige format POST request, vraagTekst: '${vraagTekst}', antwoordTekst: '${antwoordTekst}', gebruikerId: '${gebruikerId}.`)
    }
    return { id, vraagId, vraagTekst, antwoordTekst, gebruikerId }
}
