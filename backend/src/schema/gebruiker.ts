import {ObjectId} from "https://deno.land/x/mongo@v0.30.0/mod.ts";

export interface GebruikerSchema {
    _id: ObjectId;
    gebruikerId: number;
    jwt: string;
  }