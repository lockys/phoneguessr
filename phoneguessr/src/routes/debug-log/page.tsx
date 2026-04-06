import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-context';

interface ApiResult {
  url: string;
  status: number | string;
  body: unknown;
}

export default function DebugLog() {
  const { user, loading, isTelegram } = useAuth();
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);

  useEffect(() => {
    const endpoints = ['/api/auth/me'];
    Promise.all(
      endpoints.map(url =>
        fetch(url)
          .then(async res => ({ url, status: res.status, body: await res.json() }))
          .catch(err => ({ url, status: 'error', body: String(err) })),
      ),
    ).then(setApiResults);
  }, []);

  const twa = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

  const sections: { label: string; value: unknown }[] = [
    { label: 'Auth loading', value: loading },
    { label: 'Auth user', value: user },
    { label: 'isTelegram', value: isTelegram },
    {
      label: 'Telegram.WebApp present',
      value: typeof window !== 'undefined' ? !!window.Telegram?.WebApp : false,
    },
    { label: 'Telegram.WebApp.initData present', value: !!twa?.initData },
    { label: 'Telegram.WebApp.version', value: twa?.version ?? null },
    { label: 'Telegram.WebApp.platform', value: twa?.platform ?? null },
    { label: 'Telegram.WebApp.colorScheme', value: twa?.colorScheme ?? null },
    {
      label: 'Telegram.WebApp.initDataUnsafe',
      value: twa?.initDataUnsafe ?? null,
    },
    { label: 'navigator.userAgent', value: typeof navigator !== 'undefined' ? navigator.userAgent : null },
    { label: 'document.cookie (keys)', value: typeof document !== 'undefined'
        ? document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(Boolean)
        : [] },
  ];

  return (
    <div style={{ fontFamily: 'monospace', padding: '16px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '16px' }}>Debug Log</h2>

      <h3>State</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
        <tbody>
          {sections.map(({ label, value }) => (
            <tr key={label} style={{ borderBottom: '1px solid #333' }}>
              <td style={{ padding: '6px 12px 6px 0', color: '#aaa', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                {label}
              </td>
              <td style={{ padding: '6px 0', wordBreak: 'break-all' }}>
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {JSON.stringify(value, null, 2)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>API responses</h3>
      {apiResults.length === 0 ? (
        <p style={{ color: '#aaa' }}>Loading…</p>
      ) : (
        apiResults.map(r => (
          <div key={r.url} style={{ marginBottom: '16px' }}>
            <div style={{ color: '#aaa', marginBottom: '4px' }}>
              {r.url} — HTTP {r.status}
            </div>
            <pre style={{ background: '#111', padding: '10px', borderRadius: '4px', fontSize: '12px', overflow: 'auto' }}>
              {JSON.stringify(r.body, null, 2)}
            </pre>
          </div>
        ))
      )}
    </div>
  );
}
