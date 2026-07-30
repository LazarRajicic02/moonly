
'use client';

import { useEffect, useState } from 'react';

const TOKEN_KEY = 'luna_access_token';

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/** Safe for SSR — token is null until after mount, avoiding hydration mismatch. */
export function useAccessToken() {
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(getAccessToken());
    setReady(true);
  }, []);

  return { token, ready };
}
