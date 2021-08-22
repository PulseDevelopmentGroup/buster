export class ConfigNotFoundError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export class CommandConfigNotSpecifiedError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

export enum IntentAttributeNameLookup {
  TOXICITY = "Toxicity",
  SEVERE_TOXICITY = "Severe Toxicity",
  IDENTITY_ATTACK = "Identity Attack",
  INSULT = "Insult",
  PROFANITY = "Profanity",
  THREAT = "Threat",
  SEXUALLY_EXPLICIT = "Sexually Explicit",
  FLIRTATION = "Flirtation",
}
