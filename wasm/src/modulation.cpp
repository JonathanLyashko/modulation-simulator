#include "modulation.hpp"

#include "signal.hpp"

#include <cmath>

namespace {
constexpr float kPi = 3.14159265358979323846f;
}

void generateSine(int signalId, float amplitude, float frequency, float phase) {
    Signal* signal = getSignal(signalId);
    if (signal == nullptr || signal->sampleRate <= 0) {
        return;
    }

    const float angularFrequency = 2.0f * kPi * frequency;

    for (std::size_t index = 0; index < signal->samples.size(); ++index) {
        const float time = static_cast<float>(index) / static_cast<float>(signal->sampleRate);
        signal->samples[index] = amplitude * std::sin(angularFrequency * time + phase);
    }
}

int amModulate(
    int messageSignalId,
    float carrierFrequency,
    float carrierAmplitude,
    float modulationIndex
) {
    Signal* message = getSignal(messageSignalId);
    if (message == nullptr || message->sampleRate <= 0) {
        return -1;
    }

    const int outputSignalId = createSignal(
        static_cast<int>(message->samples.size()),
        message->sampleRate
    );

    Signal* output = getSignal(outputSignalId);
    if (output == nullptr) {
        return -1;
    }

    const float angularFrequency = 2.0f * kPi * carrierFrequency;

    for (std::size_t index = 0; index < message->samples.size(); ++index) {
        const float time = static_cast<float>(index) / static_cast<float>(message->sampleRate);
        const float carrier = std::cos(angularFrequency * time);
        output->samples[index] =
            carrierAmplitude * (1.0f + modulationIndex * message->samples[index]) * carrier;
    }

    return outputSignalId;
}
