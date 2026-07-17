import https from 'https';

/** Optional self-ping — enable with ENABLE_KEEP_ALIVE=1 (not needed on AWS Elastic Beanstalk). */
function resolveSelfUrl(): string {
  const serverUrl = (process.env.SERVER_URL || process.env.APP_URL || '').trim().replace(/\/$/, '');
  if (serverUrl) return serverUrl;
  return '';
}

function pingOnce(selfUrl: string) {
  const url = `${selfUrl.replace(/\/$/, '')}/api/health`;
  https
    .get(url, (res) => {
      // eslint-disable-next-line no-console
      console.log(`[KeepAlive] Status: ${res.statusCode} at ${new Date().toISOString()}`);
      res.resume();
    })
    .on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[KeepAlive] Ping failed:', err.message);
    });
}

export default function keepAlive() {
  if (process.env.ENABLE_KEEP_ALIVE !== '1') return;

  const selfUrl = resolveSelfUrl();
  if (!selfUrl) {
    console.warn('[KeepAlive] ENABLE_KEEP_ALIVE=1 but SERVER_URL is not set — skipping.');
    return;
  }

  pingOnce(selfUrl);
  setInterval(() => pingOnce(selfUrl), 14 * 60 * 1000);
}
