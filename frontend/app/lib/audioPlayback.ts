'use client';

let audioContextPromise: Promise<AudioContext> | null = null;
let activeSource: AudioBufferSourceNode | null = null;

export type AudioPlaybackSession = {
  durationSeconds: number;
};

async function getAudioContext() {
  if (!audioContextPromise) {
    const audioWindow = window as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextCtor =
      audioWindow.AudioContext ?? audioWindow.webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error("Web Audio is not supported in this browser.");
    }

    audioContextPromise = Promise.resolve(new AudioContextCtor());
  }

  return audioContextPromise;
}

export async function stopAudioPlayback() {
  if (activeSource) {
    activeSource.stop();
    activeSource.disconnect();
    activeSource = null;
  }
}

export async function playSignalSamples(
  samples: Float32Array,
  sampleRate: number,
  options?: { loop?: boolean }
): Promise<AudioPlaybackSession> {
  if (samples.length === 0 || sampleRate <= 0) {
    throw new Error("Signal data is not available for audio preview.");
  }

  const audioContext = await getAudioContext();
  await audioContext.resume();
  await stopAudioPlayback();

  const audioBuffer = audioContext.createBuffer(1, samples.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);

  let peak = 0;
  for (let index = 0; index < samples.length; index += 1) {
    peak = Math.max(peak, Math.abs(samples[index]));
  }

  const normalization = peak > 1 ? 1 / peak : 1;
  for (let index = 0; index < samples.length; index += 1) {
    channelData[index] = samples[index] * normalization;
  }

  const source = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();
  const fadeDurationSeconds = Math.min(0.01, audioBuffer.duration / 4);
  const now = audioContext.currentTime;
  const loop = options?.loop ?? false;

  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.9, now + fadeDurationSeconds);
  if (loop) {
    gainNode.gain.setValueAtTime(0.9, now + fadeDurationSeconds);
  } else {
    gainNode.gain.setValueAtTime(
      0.9,
      Math.max(now + fadeDurationSeconds, now + audioBuffer.duration - fadeDurationSeconds)
    );
    gainNode.gain.linearRampToValueAtTime(0, now + audioBuffer.duration);
  }

  source.buffer = audioBuffer;
  source.loop = loop;
  source.connect(gainNode);
  gainNode.connect(audioContext.destination);
  source.start();
  activeSource = source;

  source.onended = () => {
    source.disconnect();
    gainNode.disconnect();
    if (activeSource === source) {
      activeSource = null;
    }
  };

  return {
    durationSeconds: audioBuffer.duration,
  };
}
