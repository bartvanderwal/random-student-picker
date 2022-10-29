export interface Antwoord {
  id?: string;
  gebruikerId: number
  vraagTekst: string;
  antwoordTekst: string;
  isGoed?: boolean
} 