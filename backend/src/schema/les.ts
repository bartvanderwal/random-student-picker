import { ObjectId } from "https://deno.land/x/mongo@v0.30.0/mod.ts";

export interface LesSchema {
  _id: ObjectId;
  cursus: string; // OWE, maar gaat in OSIRIS geloof ik ook 'cursus' heten, bijvoorbeeld WTIS, Propedeuse vak WebTech Implementation & Security
  onderwerp: string; // Onderwerp van de les, bijvoorbeeld 'Media Queries' uit OWE WTUX.
  lesnr: string; // Bv. 'les 7' of '3-2', les 2 in week 3
}