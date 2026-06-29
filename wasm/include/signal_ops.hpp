#pragma once

bool clearSignal(int signalId);
bool fillSignal(int signalId, float value);
bool copySignalSamples(int sourceSignalId, int targetSignalId);
bool scaleSignal(int signalId, float factor);
float getSignalPeakAbs(int signalId);
bool normalizeSignalPeak(int signalId, float targetPeak = 1.0f);
