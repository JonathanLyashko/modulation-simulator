#include "signal_ops.hpp"

#include "signal.hpp"

#include <algorithm>
#include <cmath>

bool clearSignal(int signalId) {
    return fillSignal(signalId, 0.0f);
}

bool fillSignal(int signalId, float value) {
    Signal* signal = getSignal(signalId);
    if (signal == nullptr) {
        return false;
    }

    std::fill(signal->samples.begin(), signal->samples.end(), value);
    return true;
}

bool copySignalSamples(int sourceSignalId, int targetSignalId) {
    Signal* source = getSignal(sourceSignalId);
    Signal* target = getSignal(targetSignalId);
    if (source == nullptr || target == nullptr) {
        return false;
    }

    if (source->sampleRate != target->sampleRate ||
        source->samples.size() != target->samples.size()) {
        return false;
    }

    target->samples = source->samples;
    return true;
}

bool scaleSignal(int signalId, float factor) {
    Signal* signal = getSignal(signalId);
    if (signal == nullptr) {
        return false;
    }

    for (float& sample : signal->samples) {
        sample *= factor;
    }

    return true;
}

float getSignalPeakAbs(int signalId) {
    Signal* signal = getSignal(signalId);
    if (signal == nullptr || signal->samples.empty()) {
        return 0.0f;
    }

    float peak = 0.0f;
    for (const float sample : signal->samples) {
        peak = std::max(peak, std::fabs(sample));
    }

    return peak;
}

bool normalizeSignalPeak(int signalId, float targetPeak) {
    if (targetPeak <= 0.0f) {
        return false;
    }

    const float peak = getSignalPeakAbs(signalId);
    if (peak <= 0.0f) {
        return false;
    }

    return scaleSignal(signalId, targetPeak / peak);
}
