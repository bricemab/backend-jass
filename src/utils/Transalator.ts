export enum Language {
  FR = "fr",
  EN = "en",
  DE = "de"
}

export interface Word {
  french: string;
  english: string;
  german: string;
}

export default class Translator {
  static t(key: string, language: Language) {
    const word = Translator.words[key];

    if (word) {
      switch (language) {
        case Language.DE:
          return word.german;
        case Language.FR:
          return word.french;
        case Language.EN:
          return word.english;
        default:
          return key;
      }
    }
    return key;
  }

  static words: { [key: string]: Word } = {
    "idea.newIdeaSubject": {
      french: "Boite à idée: merci de votre message",
      english: "Prénom",
      german: "Vorname"
    },
    "user.resetPasswordSubject": {
      french: "Réinitialisation du mot de passe de votre compte E-Jass",
      english: "Reset your E-Jass account password",
      german: "Zurücksetzen des Passworts für Ihr E-Jass-Konto"
    },
  };
}
