'use client'
import React, { useEffect, useState } from 'react';
import { LAppDelegate } from '@/live2dConfig/lappdelegate';
import { LAppGlManager } from '@/live2dConfig/lappglmanager';
import * as LAppDefine from '@/live2dConfig/lappdefine';
import { LAppLive2DManager } from '@/live2dConfig/lapplive2dmanager';

function Live2d() {
  const [isTTSPlaying, setTTSPlaying] = useState(false);

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
    if (isTTSPlaying) {
      return;
    }
    const file_path: string = "test.wav";
    setTTSPlaying(true);
    // 读取wav文件为ArrayBuffer
    fetch(file_path)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        const arrayBufferCopy = arrayBuffer.slice(0);
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContext.decodeAudioData(arrayBuffer, (buffer: AudioBuffer) => {
          const source: AudioBufferSourceNode = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);
          source.onended = () => {
            setTTSPlaying(false);
          };
        });

        // 传递给LAppLive2DManager处理
        LAppLive2DManager.getInstance().getModel(0)._wavFileHandler.loadWavFile(arrayBufferCopy)
      })
      .catch(error => {
        console.error('Error loading WAV file:', error);
      });
  }

  return (
    <>
      <div className='live2d-container h-full w-full'>
      </div>
      <button onClick={handleVoice}>Play Voice</button>
    </>
  );
}
export default Live2d;