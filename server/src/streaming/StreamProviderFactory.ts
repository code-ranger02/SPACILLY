import type { StreamProvider, StreamProviderType } from "./types.js";
import { YouTubeProvider } from "./providers/YouTubeProvider.js";
import { MuxProvider } from "./providers/MuxProvider.js";
import { AwsIVSProvider } from "./providers/AwsIVSProvider.js";
import { CloudflareProvider } from "./providers/CloudflareProvider.js";
import { AgoraProvider } from "./providers/AgoraProvider.js";
import { LiveKitProvider } from "./providers/LiveKitProvider.js";
import { VimeoProvider } from "./providers/VimeoProvider.js";
import { SelfHostedProvider } from "./providers/SelfHostedProvider.js";

import { WebRTCProvider } from "./providers/WebRTCProvider.js";

const DEFAULT_PROVIDER: StreamProviderType =
  (process.env.DEFAULT_STREAM_PROVIDER as StreamProviderType) || 'webrtc';

export class StreamProviderFactory {
  static create(type?: string): StreamProvider {
    const key = (type || DEFAULT_PROVIDER).toLowerCase() as StreamProviderType;
    switch (key) {
      case 'webrtc':
        return new WebRTCProvider();
      case 'youtube':
        return new YouTubeProvider();
      case 'mux':
        return new MuxProvider();
      case 'aws-ivs':
        return new AwsIVSProvider();
      case 'cloudflare':
        return new CloudflareProvider();
      case 'agora':
        return new AgoraProvider();
      case 'livekit':
        return new LiveKitProvider();
      case 'vimeo':
        return new VimeoProvider();
      case 'selfhosted':
        return new SelfHostedProvider();
      default:
        return new WebRTCProvider();
    }
  }

  static supportedProviders(): StreamProviderType[] {
    return [
      'webrtc',
      'youtube',
      'mux',
      'aws-ivs',
      'cloudflare',
      'agora',
      'livekit',
      'vimeo',
      'selfhosted',
    ];
  }
}
