export const translations = {
  en: {
    play: 'Play',
    howToPlay: 'How to Play',
    sendMagicLink: 'Send Magic Link',
    backToMenu: 'Back to Main Menu',
    movementSpeed: 'Movement Speed',
    language: 'Language',
    showTileLabels: 'Show Tile Labels',
    dialogueAnimation: 'Dialogue Animation',
    resetSettings: 'Reset All Settings',
    settings: 'Settings',
    items: 'Items',
    save: 'Save',
    load: 'Load',
    close: 'Close',
    loginPrompt: 'Enter email',
    logOut: 'Log Out',
    loggedInAs: 'Logged in as:',
    noItems: 'No items',
    saveGame: 'Save Game',
    loadGame: 'Load Game',
    slot: 'Slot',
    empty: 'Empty',
    saveToSlot: 'Save to Slot',
    loadSlot: 'Load Slot',
    deleteSlot: 'Delete Slot',
    howToPlayTitle: 'How to Play:',
    instructionMove: 'Tap a gray tile to move.',
    instructionInteract: 'Double tap a colored circle (NPC) to interact.',
    instructionWalls: 'Dark tiles are walls — they block movement.',
    checkEmail: 'Check your email for a magic login link.'
  },
  nl: {
    play: 'Spelen',
    howToPlay: 'Hoe te spelen',
    sendMagicLink: 'Stuur magische link',
    backToMenu: 'Terug naar menu',
    movementSpeed: 'Bewegingssnelheid',
    language: 'Taal',
    showTileLabels: 'Tegeltekst tonen',
    dialogueAnimation: 'Dialooganimatie',
    resetSettings: 'Reset instellingen',
    settings: 'Instellingen',
    items: 'Voorwerpen',
    save: 'Opslaan',
    load: 'Laden',
    close: 'Sluiten',
    loginPrompt: 'Voer e-mail in',
    logOut: 'Uitloggen',
    loggedInAs: 'Ingelogd als:',
    noItems: 'Geen items',
    saveGame: 'Spel opslaan',
    loadGame: 'Spel laden',
    slot: 'Slot',
    empty: 'Leeg',
    saveToSlot: 'Opslaan naar slot',
    loadSlot: 'Laad slot',
    deleteSlot: 'Verwijder slot',
    howToPlayTitle: 'Spelregels:',
    instructionMove: 'Tik op een grijze tegel om te bewegen.',
    instructionInteract: 'Dubbel tik op een gekleurde cirkel (NPC) om te praten.',
    instructionWalls: 'Donkere tegels zijn muren — ze blokkeren beweging.',
    checkEmail: 'Controleer je e-mail voor de magische link.'
  }
} as const;

type Language = keyof typeof translations;
type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang?: Language): string {
  const langStrings = translations[lang ?? 'en'] || translations.en;
  return langStrings[key] ?? translations.en[key] ?? key;
}
