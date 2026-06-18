#pragma once

void generateSine(int signalId, float amplitude, float frequency, float phase);
int amModulate(
    int messageSignalId,
    float carrierFrequency,
    float carrierAmplitude,
    float modulationIndex
);