/**
 * Landing page for the OAuth and magic-link redirect.
 *
 * Supabase detects the session in the URL when the client boots. The page waits
 * for that session, then returns the visitor to the home page.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabase) {
      navigate('/', { replace: true });
      return;
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      navigate('/', { replace: true });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) finish();
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish();
    });

    // A cancelled provider redirect should never leave a blank page.
    const timeout = window.setTimeout(finish, 4000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}
