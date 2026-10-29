/**
 * What happens when something breaks.
 *
 * Without this, a single error takes the whole page down and nobody finds
 * out: the visitor sees a blank screen and leaves, and the site carries on
 * with the same mistake for ever. With it, the visitor gets a way out and the
 * error is reported, so it can be fixed.
 *
 * The progress in local storage is not touched, so a player who runs into a
 * problem does not lose their streak.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Reported like any other measurement, so a crash shows up in the same
    // place as everything else.
    trackEvent(ANALYTICS_EVENTS.exception, {
      message: String(error?.message ?? error).slice(0, 200),
      component_stack: String(info?.componentStack ?? '').slice(0, 500),
    });
    // And on the console, so it can be found in development.
    console.error('USA GeoArena crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🛠️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3 font-[Caveat]">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            The game ran into a problem. Your progress is safe - it is stored on
            this device and has not been touched.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => window.location.reload()}
              className="rounded-full font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try again
            </Button>
            <Button asChild variant="outline" className="rounded-full font-semibold">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to the start
              </Link>
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-6 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            The problem has been reported.
          </p>
        </div>
      </div>
    );
  }
}