'use client'
import React, { useEffect, useRef } from 'react';
import { LAppDelegate } from '@/live2dConfig/lappdelegate';
import { LAppGlManager } from '@/live2dConfig/lappglmanager';
import * as LAppDefine from '@/live2dConfig/lappdefine';
import { LAppLive2DManager } from '@/live2dConfig/lapplive2dmanager';

interface Live2dProps {
  wavFile: string;
  isTTSPlaying: boolean;
  setTTSPlaying: (isPlaying: boolean) => void;
}

function Live2d({ wavFile, isTTSPlaying, setTTSPlaying }: Live2dProps) {
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

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

  useEffect(() => {
    if (wavFile && !isTTSPlaying) {
      console.log('wavFile:', wavFile);
      console.log('isTTSPlaying:', isTTSPlaying);
      handleVoice(wavFile);
    }
  }, [wavFile, isTTSPlaying]);

  // useEffect(() => {
  //   if (!isTTSPlaying && audioSourceRef.current) {
  //     audioSourceRef.current.stop();
  //     audioSourceRef.current = null;
  //   }
  //   LAppLive2DManager.getInstance().getModel(0)._lipsync = isTTSPlaying;
  // }, [isTTSPlaying]);

  function handleVoice(base64Wav: string) {
    // 将base64编码的wav文件转换为ArrayBuffer
    setTTSPlaying(true);
    const binaryString = window.atob(base64Wav);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const arrayBuffer = bytes.buffer;
    const arrayBufferCopy = arrayBuffer.slice(0);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContext.decodeAudioData(arrayBuffer, (buffer: AudioBuffer) => {
      const source: AudioBufferSourceNode = audioContext.createBufferSource();
      audioSourceRef.current = source;
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
      source.onended = () => {
        // setTTSPlaying(false);
        audioSourceRef.current = null;
      };
    });
    // 传递给LAppLive2DManager处理
    LAppLive2DManager.getInstance().getModel(0)._wavFileHandler.loadWavFile(arrayBufferCopy);
  }

  return (
    <div className='live2d-container h-full w-full'>
    </div>
  );
}

export default Live2d;