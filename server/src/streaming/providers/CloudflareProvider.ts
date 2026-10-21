import { StubProvider } from "./StubProvider.js";

export class CloudflareProvider extends StubProvider {
  constructor() {
    super('cloudflare', 'Cloudflare Stream');
  }
}
