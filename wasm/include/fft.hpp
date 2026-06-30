#pragma once

#include <vector>

int fftMagnitudeSpectrum(int signalId);
int fftMagnitudeSpectrum(int signalId, int fftSize);
bool computeHilbertTransform(
    const std::vector<float>& inputSamples,
    std::vector<float>* outputSamples
);
