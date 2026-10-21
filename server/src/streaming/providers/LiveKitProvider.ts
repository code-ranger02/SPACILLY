import { StubProvider } from "./StubProvider.js";

export class LiveKitProvider extends StubProvider {
  constructor() {
    super('livekit', 'LiveKit');
  }
}
