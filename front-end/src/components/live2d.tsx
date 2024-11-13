'use client'
import React, { useEffect } from 'react';
import { LAppDelegate } from '@/live2dConfig/lappdelegate';
import { LAppGlManager } from '@/live2dConfig/lappglmanager';
import * as LAppDefine from '@/live2dConfig/lappdefine';
import { LAppPal } from '@/live2dConfig/lapppal';
import { LAppLive2DManager } from '@/live2dConfig/lapplive2dmanager';
import Script from 'next/script';
import { Button } from 'antd';

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

  function handleVoice() {
    console.log(LAppPal.getDeltaTime());
    const file_path: string = "test.wav";

    // 读取wav文件为ArrayBuffer
    fetch(file_path)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        const arrayBufferCopy = arrayBuffer.slice(0);

        // 播放声音
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.decodeAudioData(arrayBuffer, (buffer: AudioBuffer) => {
          const source: AudioBufferSourceNode = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);
        });

        // 传递给LAppLive2DManager处理
        LAppLive2DManager.getInstance().getModel(0)._wavFileHandler.loadWavFile(arrayBufferCopy)
          .then(result => {
            console.log(result);
          })
          .catch(error => {
            console.error('Error processing WAV file:', error);
          });
      })
      .catch(error => {
        console.error('Error loading WAV file:', error);
      });
  }

  return (
    <>
      <div className='live2d-container h-full w-full'>
        <Script src="Core/live2dcubismcore.js" strategy='beforeInteractive' />
      </div>
      <button onClick={handleVoice}>Play Voice</button>
    </>
  );
}
export default Live2d;