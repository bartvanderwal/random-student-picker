import { ObjectId } from "https://deno.land/x/mongo@v0.30.0/mod.ts";

export interface VraagSchema {
  _id: ObjectId;
  vraagTekst: string;
  les?: ObjectId;
}