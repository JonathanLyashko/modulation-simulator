#include "modulation.hpp"

#include "signal.hpp"
#include "signal_ops.hpp"

#include <cmath>

namespace {
constexpr float kPi = 3.14159265358979323846f;

Signal* getWritableSignal(int signalId) {
    Signal* signal = getSignal(signalId);
    if (signal == nullptr || signal->sampleRate <= 0) {
        return nullptr;
    }

    return signal;
}

int createOutputLike(const Signal& source) {
    return createSignal(static_cast<int>(source.samples.size()), source.sampleRate);
}
}

void generateCarrier(int signalId, const CarrierParameters& parameters) {
    Signal* signal = getWritableSignal(signalId);
    if (signal == nullptr) {
        return;
    }

    const float angularFrequency = 2.0f * kPi * parameters.frequency;

    for (std::size_t index = 0; index < signal->samples.size(); ++index) {
        const float time = static_cast<float>(index) / static_cast<float>(signal->sampleRate);
        signal->samples[index] =
            parameters.amplitude * std::cos(angularFrequency * time + parameters.phase);
    }
}

void generateSine(int signalId, const ToneParameters& parameters) {
    Signal* signal = getWritableSignal(signalId);
    if (signal == nullptr) {
        return;
    }

    const float angularFrequency = 2.0f * kPi * parameters.frequency;

    for (std::size_t index = 0; index < signal->samples.size(); ++index) {
        const float time = static_cast<float>(index) / static_cast<float>(signal->sampleRate);
        signal->samples[index] =
            parameters.amplitude * std::sin(angularFrequency * time + parameters.phase);
    }
}

int amModulate(int messageSignalId, const AmModulationParameters& parameters) {
    Signal* message = getWritableSignal(messageSignalId);
    if (message == nullptr) {
        return -1;
    }

    const int outputSignalId = createOutputLike(*message);

    Signal* output = getSignal(outputSignalId);
    if (output == nullptr) {
        return -1;
    }

    const float angularFrequency = 2.0f * kPi * parameters.carrier.frequency;
    float messagePeak = 0.0f;

    for (const float sample : message->samples) {
        messagePeak = std::max(messagePeak, std::fabs(sample));
    }

    const float normalizationFactor = messagePeak > 0.0f ? 1.0f / messagePeak : 0.0f;

    for (std::size_t index = 0; index < message->samples.size(); ++index) {
        const float time = static_cast<float>(index) / static_cast<float>(message->sampleRate);
        const float carrier =
            std::cos(angularFrequency * time + parameters.carrier.phase);
        const float normalizedMessage = message->samples[index] * normalizationFactor;
        output->samples[index] =
            parameters.carrier.amplitude *
            (1.0f + parameters.modulationIndex * normalizedMessage) *
            carrier;
    }

    return outputSignalId;
}

int fmModulate(int messageSignalId, const FmModulationParameters& parameters) {
    Signal* message = getWritableSignal(messageSignalId);
    if (message == nullptr) {
        return -1;
    }

    const int outputSignalId = createOutputLike(*message);
    Signal* output = getSignal(outputSignalId);
    if (output == nullptr) {
        return -1;
    }

    float phase = parameters.carrier.phase;
    const float samplePeriod = 1.0f / static_cast<float>(message->sampleRate);

    for (std::size_t index = 0; index < message->samples.size(); ++index) {
        output->samples[index] = parameters.carrier.amplitude * std::cos(phase);

        const float instantaneousFrequency =
            parameters.carrier.frequency +
            parameters.frequencySensitivity * message->samples[index];
        phase += 2.0f * kPi * instantaneousFrequency * samplePeriod;
    }

    return outputSignalId;
}

int pmModulate(int messageSignalId, const PmModulationParameters& parameters) {
    Signal* message = getWritableSignal(messageSignalId);
    if (message == nullptr) {
        return -1;
    }

    const int outputSignalId = createOutputLike(*message);
    Signal* output = getSignal(outputSignalId);
    if (output == nullptr) {
        return -1;
    }

    const float angularFrequency = 2.0f * kPi * parameters.carrier.frequency;

    for (std::size_t index = 0; index < message->samples.size(); ++index) {
        const float time = static_cast<float>(index) / static_cast<float>(message->sampleRate);
        const float phase =
            angularFrequency * time +
            parameters.carrier.phase +
            parameters.phaseSensitivity * message->samples[index];
        output->samples[index] = parameters.carrier.amplitude * std::cos(phase);
    }

    return outputSignalId;
}
