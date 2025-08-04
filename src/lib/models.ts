export enum IntentAttributeNameLookup {
  TOXICITY = ":skull: Toxicity",
  SEVERE_TOXICITY = ":skull_crossbones: Severe Toxicity",
  IDENTITY_ATTACK = ":point_right: Identity Attack",
  INSULT = ":cold_face: Insult",
  PROFANITY = ":face_with_symbols_over_mouth: Profanity",
  THREAT = ":dagger: Threat",
  SEXUALLY_EXPLICIT = ":eggplant: Sexually Explicit",
  FLIRTATION = ":kissing_heart: Flirtation",
}

export interface Reminder {
  reminder: string;
  who: string;
  what: string;
  when: Date;
  where: string;
}

/* Useless Conversions */

export enum Measurement {
  length = "length", // meter
  volume = "volume", // liter
  mass = "mass", // gram
  time = "time", // second
  unknown = "unknown",
}

export interface Unit {
  value: number;
  measurement: Measurement;
}

export interface InputUnit extends Unit {
  input: string;
}

export interface StandardUnit extends Unit {
  name: string;
}
