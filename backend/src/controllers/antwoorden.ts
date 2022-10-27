import { Request, Response } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { DB } from "https://deno.land/x/sqlite@v3.5.0/mod.ts";
import { V4 } from "https://deno.land/x/uuid@v0.1.2/mod.ts";
import { Status } from "https://deno.land/std@0.161.0/http/http_status.ts";

import { Antwoord } from "../models/antwoord.ts";

// We slaan gegevens op in een lokale sqlite database.
// Het probleem dat deze database er eventueel niet meer is tussen server herstarts zien we als een feature.

// Geef SQLite antwoorden database terug, en maak evt. aan als nog nodig
// Bron: https://deno.land/x/sqlite@v3.5.0

function queryAntwoordenDB(query: string, values?: Array<string>) {
    const antwoordenDb = new DB("antwoorden");

    antwoordenDb.execute(`
        CREATE TABLE IF NOT EXISTS antwoorden (
           ID TEXT PRIMARY KEY,
            VraagTekst TEXT,
            AntwoordTekst TEXT,
            GebruikerId TEXT
            IsGoed INTEGER
        )
    `);
    let result;
    if (query) {
        result = antwoordenDb.query(query, values);
    }
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
    queryAntwoordenDB("INSERT INTO antwoorden (ID, VraagTekst, AntwoordTekst, GebruikerId) VALUES (?, ?, ?, ?)", 
        [id, antwoord.vraagTekst, antwoord.antwoordTekst, antwoord.gebruikerId.toString()]);
  
    response.body = {message: `Antwoord toegevoegd`, id, antwoordTekst: antwoord.antwoordTekst, antwoord}
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
    queryAntwoordenDB("UPDATE antwoorden set (isGoed=? where id equals ${?}", [isGoed, id]);
  
    const logBericht = `Antwoord met id '${id} gemarkeerd als '${isGoed}'.`;
    console.log(logBericht)
    response.body = { message: logBericht, id, isGoed}
};

export const deleteAntwoorden = async({request, response}:{request: Request; response: Response}) => {
    const body = request.body();
    const { wachtwoord } = await body.value;
    console.log('DELETE antwoorden')

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

export const getAntwoordenVoorVraag = ({request, response} : { request: Request, response: Response }) => {
    // const body = request.body();
    // const { vraagTekst } = await body.value;

    const alleAntwoordenAlsRijen = queryAntwoordenDB("SELECT * FROM antwoorden"); // where Vraagtekst=?", [vraagTekst]);
    // const alleAntwoorden: Array<Antwoord> = alleAntwoordenAlsRijen 
    // ? alleAntwoordenAlsRijen.map(a => <Antwoord> <unknown>a)
    // : new Array<Antwoord>();

    response.status = Status.OK;
    response.body = { antwoorden: alleAntwoordenAlsRijen?.map(a => 
        ({ "id": a[0], "vraagTekst": a[1], antwoordTekst: a[2], isGoed: a[3] })) };
};

function getAntwoordFromBody(body: any): Antwoord {
    // Check format van POST request.
    const { vraagTekst, antwoordTekst, gebruikerId } = body;
    // Todo: Checken dat gebruikerId bestaat voor huidige vraag?
    if (!vraagTekst || !antwoordTekst || !gebruikerId) {
        throw new Error(`Ongeldige format POST request, vraagTekst: '${vraagTekst}', antwoordTekst: '${antwoordTekst}', gebruikerId: '${gebruikerId}.`)
    }
    return { vraagTekst, antwoordTekst, gebruikerId }
}
