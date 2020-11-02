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
