#pragma once

struct ToneParameters {
    float amplitude;
    float frequency;
    float phase;
};

struct CarrierParameters {
    float amplitude;
    float frequency;
    float phase;
};

struct AmModulationParameters {
    CarrierParameters carrier;
    float modulationIndex;
};

struct FmModulationParameters {
    CarrierParameters carrier;
    float frequencySensitivity;
};

struct PmModulationParameters {
    CarrierParameters carrier;
    float phaseSensitivity;
};

void generateCarrier(int signalId, const CarrierParameters& parameters);
void generateSine(int signalId, const ToneParameters& parameters);
int amModulate(int messageSignalId, const AmModulationParameters& parameters);
int fmModulate(int messageSignalId, const FmModulationParameters& parameters);
int pmModulate(int messageSignalId, const PmModulationParameters& parameters);
