export type DisclosureLocale =
  | 'en'
  | 'fi'
  | 'de'
  | 'fr'
  | 'es'
  | 'nl'
  | 'it'
  | 'pt';

const MESSAGES: Record<
  DisclosureLocale,
  { short: string; withHuman: string }
> = {
  en: {
    short: 'This experience may be powered by artificial intelligence.',
    withHuman:
      'This conversation is powered by artificial intelligence. A human operator is available upon request.',
  },
  fi: {
    short: 'Tama kokemus voi perustua tekoalyyn.',
    withHuman:
      'Tama keskustelu kayttaa tekoalya. Ihminen on saatavilla pyynnosta.',
  },
  de: {
    short: 'Dieses Erlebnis kann KI-gestutzt sein.',
    withHuman:
      'Dieses Gesprach wird durch kunstliche Intelligenz unterstutzt. Ein menschlicher Ansprechpartner ist auf Anfrage verfugbar.',
  },
  fr: {
    short: 'Cette experience peut etre assistee par une intelligence artificielle.',
    withHuman:
      'Cette conversation est assistee par une intelligence artificielle. Un operateur humain est disponible sur demande.',
  },
  es: {
    short: 'Esta experiencia puede estar asistida por inteligencia artificial.',
    withHuman:
      'Esta conversacion esta asistida por inteligencia artificial. Un operador humano esta disponible bajo solicitud.',
  },
  nl: {
    short: 'Deze ervaring kan met kunstmatige intelligentie worden ondersteund.',
    withHuman:
      'Dit gesprek wordt ondersteund door kunstmatige intelligentie. Een menselijke medewerker is op verzoek beschikbaar.',
  },
  it: {
    short: 'Questa esperienza puo essere supportata da intelligenza artificiale.',
    withHuman:
      'Questa conversazione e supportata da intelligenza artificiale. Un operatore umano e disponibile su richiesta.',
  },
  pt: {
    short: 'Esta experiencia pode ser apoiada por inteligencia artificial.',
    withHuman:
      'Esta conversa e apoiada por inteligencia artificial. Um operador humano esta disponivel mediante pedido.',
  },
};

export function getDisclosure(
  locale: DisclosureLocale = 'en',
  options?: { humanAvailable?: boolean },
): string {
  const pack = MESSAGES[locale] ?? MESSAGES.en;
  return options?.humanAvailable ? pack.withHuman : pack.short;
}
