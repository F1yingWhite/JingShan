import React, { useEffect, useMemo, useState } from 'react';
import { LAppDelegate } from '@/live2dConfig/lappdelegate';
import { LAppGlManager } from '@/live2dConfig/lappglmanager';
import Script from 'next/script';
function Live2d() {
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  useEffect(() => {
    if (LAppGlManager.getInstance() && LAppDelegate.getInstance().initialize()) {
      LAppDelegate.getInstance().run();
    }
    // return () => {
    //   LAppDelegate.releaseInstance();
    // }
  }, []);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!window.matchMedia("(orientation: landscape)").matches) {
        setCanvasWidth(document.body.clientWidth);
        setCanvasHeight(document.body.clientHeight * 0.3);
      } else {
        setCanvasWidth(document.body.clientWidth * 0.3);
        setCanvasHeight(document.body.clientHeight * 0.6);
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, []);

  return (
    <div className='live2d-container'>
      <Script src="Core/live2dcubismcore.js" strategy='beforeInteractive'/>
      <div className='live2d-canvas'>
        <canvas
          id='live2d'
          className="live2d"
          color="#f5f5f9"
          width={canvasWidth}
          height={canvasHeight}
        />
      </div>
    </div>
  );
}

export default Live2d;