'use client';

import {
  RECORDED_MESSAGE_MAX_BANDWIDTH_HZ,
  RECORDED_MESSAGE_TARGET_SAMPLE_RATE,
} from "@/app/components/workspace/constants";
import type { RecordedMessageClip } from "@/app/components/workspace/types";

let audioContextPromise: Promise<AudioContext> | null = null;
let activeRecorder: MediaRecorder | null = null;
let activeStream: MediaStream | null = null;
let recordedChunks: Blob[] = [];
let activeResultPromise: Promise<RecordedMessageClip> | null = null;

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

function stopActiveStream() {
  if (!activeStream) {
    return;
  }

  for (const track of activeStream.getTracks()) {
    track.stop();
  }

  activeStream = null;
}

function extractMonoSamples(audioBuffer: AudioBuffer) {
  const { numberOfChannels, length } = audioBuffer;
  const monoSamples = new Float32Array(length);

  for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex += 1) {
    const channelData = audioBuffer.getChannelData(channelIndex);
    for (let sampleIndex = 0; sampleIndex < length; sampleIndex += 1) {
      monoSamples[sampleIndex] += channelData[sampleIndex] / numberOfChannels;
    }
  }

  let peak = 0;
  for (let sampleIndex = 0; sampleIndex < monoSamples.length; sampleIndex += 1) {
    peak = Math.max(peak, Math.abs(monoSamples[sampleIndex]));
  }

  const normalization = peak > 0 ? 1 / peak : 1;
  for (let sampleIndex = 0; sampleIndex < monoSamples.length; sampleIndex += 1) {
    monoSamples[sampleIndex] *= normalization;
  }

  return {
    samples: monoSamples,
    peak,
  };
}

async function bandLimitRecordedAudio(audioBuffer: AudioBuffer) {
  const targetSampleRate = Math.max(
    RECORDED_MESSAGE_TARGET_SAMPLE_RATE,
    RECORDED_MESSAGE_MAX_BANDWIDTH_HZ * 2
  );
  const targetLength = Math.max(
    1,
    Math.ceil(audioBuffer.duration * targetSampleRate)
  );
  const offlineContext = new OfflineAudioContext(1, targetLength, targetSampleRate);
  const source = offlineContext.createBufferSource();
  const lowpassFilter = offlineContext.createBiquadFilter();

  lowpassFilter.type = "lowpass";
  lowpassFilter.frequency.value = RECORDED_MESSAGE_MAX_BANDWIDTH_HZ;
  lowpassFilter.Q.value = 0.707;

  source.buffer = audioBuffer;
  source.connect(lowpassFilter);
  lowpassFilter.connect(offlineContext.destination);
  source.start();

  return offlineContext.startRendering();
}

export async function cancelAudioRecording() {
  if (activeRecorder && activeRecorder.state !== "inactive") {
    activeRecorder.ondataavailable = null;
    activeRecorder.onstop = null;
    activeRecorder.onerror = null;
    activeRecorder.stop();
  }

  activeRecorder = null;
  activeResultPromise = null;
  recordedChunks = [];
  stopActiveStream();
}

export async function startAudioRecording() {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new Error("Microphone recording is not supported in this browser.");
  }

  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not supported in this browser.");
  }

  await cancelAudioRecording();

  activeStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });

  recordedChunks = [];
  activeRecorder = new MediaRecorder(activeStream);
  activeRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  activeResultPromise = new Promise<RecordedMessageClip>((resolve, reject) => {
    if (!activeRecorder) {
      reject(new Error("Recording did not initialize."));
      return;
    }

    activeRecorder.onerror = () => {
      stopActiveStream();
      activeRecorder = null;
      activeResultPromise = null;
      recordedChunks = [];
      reject(new Error("Microphone recording failed."));
    };

    activeRecorder.onstop = async () => {
      try {
        const blob = new Blob(recordedChunks, {
          type: activeRecorder?.mimeType || "audio/webm",
        });
        const arrayBuffer = await blob.arrayBuffer();
        const audioContext = await getAudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
        const processedAudioBuffer = await bandLimitRecordedAudio(audioBuffer);
        const monoSignal = extractMonoSamples(processedAudioBuffer);

        resolve({
          samples: monoSignal.samples,
          sampleRate: processedAudioBuffer.sampleRate,
          durationSeconds: processedAudioBuffer.duration,
          peak: monoSignal.peak,
        });
      } catch (cause) {
        reject(
          cause instanceof Error
            ? cause
            : new Error("Failed to decode the recorded audio clip.")
        );
      } finally {
        recordedChunks = [];
        stopActiveStream();
        activeRecorder = null;
        activeResultPromise = null;
      }
    };
  });

  activeRecorder.start();
}

export async function stopAudioRecording() {
  if (!activeRecorder || !activeResultPromise) {
    throw new Error("No active microphone recording is in progress.");
  }

  if (activeRecorder.state !== "inactive") {
    activeRecorder.stop();
  }

  return activeResultPromise;
}
