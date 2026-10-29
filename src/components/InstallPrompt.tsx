import { useEffect, useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  canInstall,
  initInstallPrompt,
  isInstalled,
  isIosSafari,
  promptInstall,
  subscribeToInstallPrompt,
} from '@/lib/pwa';

/**
 * "Get the app" button.
 *
 * On Chrome and Edge the browser offers an install prompt, which we show
 * behind a button of our own. On iOS there is no such prompt, so the button
 * explains how to add the app to the home screen instead.
 */
export default function InstallPrompt() {
  const [installable, setInstallable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    initInstallPrompt();
    setInstalled(isInstalled());

    const update = () => {
      setInstallable(canInstall());
      setInstalled(isInstalled());
    };

    update();
    return subscribeToInstallPrompt(update);
  }, []);

  // Nothing to offer if it is already installed, or if the browser will
  // never fire an install prompt and the visitor is not on iOS.
  if (installed) return null;
  if (!installable && !isIosSafari()) return null;

  const handleClick = async () => {
    if (installable) {
      await promptInstall();
    } else {
      setShowIosHelp(true);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="rounded-full border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
      >
        <Download className="w-4 h-4 mr-1.5" />
        Get the app
      </Button>

      {showIosHelp && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowIosHelp(false)}
          role="dialog"
          aria-modal="true"
          aria-label="How to install the app"
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setShowIosHelp(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4">
              <Smartphone className="w-7 h-7 text-white" />
            </div>

            <h3 className="text-xl font-bold text-gray-800 font-script mb-2">
              Add USA GeoArena to your home screen
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              On iPhone and iPad, apps are added through the share sheet.
            </p>

            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                  1
                </span>
                <span>
                  Tap the <Share className="w-4 h-4 inline align-text-bottom" /> share button in
                  Safari
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                  2
                </span>
                <span>Scroll down and choose "Add to Home Screen"</span>
              </li>
              <li className="flex gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                  3
                </span>
                <span>Tap "Add" - USA GeoArena opens like any other app</span>
              </li>
            </ol>

            <Button
              onClick={() => setShowIosHelp(false)}
              className="rounded-full w-full mt-6"
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
