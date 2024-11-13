'use client'
import React, { useEffect } from 'react';
import { LAppDelegate } from '@/live2dConfig/lappdelegate';
import { LAppGlManager } from '@/live2dConfig/lappglmanager';
import * as LAppDefine from '@/live2dConfig/lappdefine';
import Script from 'next/script';

function Live2d() {
  useEffect(() => {
    const handleLoad = (): void => {
      const glManager = LAppGlManager.getInstance();
      const appDelegate = LAppDelegate.getInstance();

      if (!glManager || !appDelegate.initialize()) {
        return;
      }
      appDelegate.run();
    };

    const handleBeforeUnload = (): void => {
      LAppDelegate.releaseInstance();
    };

    const handleResize = (): void => {
      if (LAppDefine.CanvasSize === 'auto') {
        LAppDelegate.getInstance().onResize();
      }
    };

    handleLoad();
    window.addEventListener('beforeunload', handleBeforeUnload, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className='live2d-container h-full w-full'>
      <Script src="Core/live2dcubismcore.js" strategy='beforeInteractive' />
    </div>
  );
}

export default Live2d;