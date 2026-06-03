import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install banner if the user hasn't dismissed it in this session
      const dismissed = sessionStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('OOTD App was installed.');
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa_dismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800/80 shadow-2xl rounded-3xl p-5 z-50 flex items-start gap-4 animate-slide-up">
      <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl shrink-0">
        <Download size={22} />
      </div>
      
      <div className="flex-1">
        <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1">
          홈 화면에 설치하기
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-3">
          이 앱을 기기에 설치하면 모바일 앱처럼 독립적인 화면으로 빠르고 편리하게 실행할 수 있습니다.
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            앱 설치
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs transition-all"
          >
            나중에
          </button>
        </div>
      </div>

      <button
        onClick={handleDismiss}
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};
