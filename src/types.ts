export interface Environment {
  botToken: string;
  tenorToken: string;
  config: string;
  prefix: string;
}

export interface Configuration {
  owners: string[];
  commands: Record<string, { [key: string]: any }>;
}
