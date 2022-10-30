// Bestand extensie `.d.ts` i.p.v. `.ts` gegeven om te voorkomen dat bestanden met enkel interfaces ook .js bestanden van komen.
// Bron: https://stackoverflow.com/questions/61681780/why-are-my-typescript-interfaces-being-compiled-to-javascript

export interface Antwoord {
  id: string;
  vraagId: string
  vraagTekst: string
  antwoordTekst: string
  gebruikerId: string
  isGoed?: boolean
} 