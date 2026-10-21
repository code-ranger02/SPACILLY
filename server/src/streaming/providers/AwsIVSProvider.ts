import { StubProvider } from "./StubProvider.js";

export class AwsIVSProvider extends StubProvider {
  constructor() {
    super('aws-ivs', 'AWS IVS');
  }
}
