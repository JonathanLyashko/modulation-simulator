#include "signal.hpp"

#include <memory>
#include <vector>

namespace {
std::vector<std::unique_ptr<Signal>> gSignals;

bool isValidSignalId(int id) {
    return id >= 0 && static_cast<std::size_t>(id) < gSignals.size() && gSignals[id] != nullptr;
}
}  // namespace

int createSignal(int length, int sampleRate) {
    if (length <= 0 || sampleRate <= 0) {
        return -1;
    }

    auto signal = std::make_unique<Signal>();
    signal->samples.assign(static_cast<std::size_t>(length), 0.0f);
    signal->sampleRate = sampleRate;

    for (std::size_t index = 0; index < gSignals.size(); ++index) {
        if (gSignals[index] == nullptr) {
            gSignals[index] = std::move(signal);
            return static_cast<int>(index);
        }
    }

    gSignals.push_back(std::move(signal));
    return static_cast<int>(gSignals.size() - 1);
}

int cloneSignal(int sourceId) {
    Signal* source = getSignal(sourceId);
    if (source == nullptr) {
        return -1;
    }

    const int cloneId = createSignal(
        static_cast<int>(source->samples.size()),
        source->sampleRate
    );
    Signal* clone = getSignal(cloneId);
    if (clone == nullptr) {
        return -1;
    }

    clone->samples = source->samples;
    return cloneId;
}

void destroySignal(int id) {
    if (!isValidSignalId(id)) {
        return;
    }

    gSignals[id].reset();
}

Signal* getSignal(int id) {
    if (!isValidSignalId(id)) {
        return nullptr;
    }

    return gSignals[id].get();
}

float* getSignalPointer(int id) {
    Signal* signal = getSignal(id);
    if (signal == nullptr || signal->samples.empty()) {
        return nullptr;
    }

    return signal->samples.data();
}

int getSignalLength(int id) {
    Signal* signal = getSignal(id);
    if (signal == nullptr) {
        return 0;
    }

    return static_cast<int>(signal->samples.size());
}

int getSignalSampleRate(int id) {
    Signal* signal = getSignal(id);
    if (signal == nullptr) {
        return 0;
    }

    return signal->sampleRate;
}

float getSignalDurationSeconds(int id) {
    Signal* signal = getSignal(id);
    if (signal == nullptr || signal->sampleRate <= 0) {
        return 0.0f;
    }

    return static_cast<float>(signal->samples.size()) /
        static_cast<float>(signal->sampleRate);
}

float getSignalSample(int id, int index) {
    Signal* signal = getSignal(id);
    if (signal == nullptr || index < 0) {
        return 0.0f;
    }

    const std::size_t sampleIndex = static_cast<std::size_t>(index);
    if (sampleIndex >= signal->samples.size()) {
        return 0.0f;
    }

    return signal->samples[sampleIndex];
}

bool setSignalSample(int id, int index, float value) {
    Signal* signal = getSignal(id);
    if (signal == nullptr || index < 0) {
        return false;
    }

    const std::size_t sampleIndex = static_cast<std::size_t>(index);
    if (sampleIndex >= signal->samples.size()) {
        return false;
    }

    signal->samples[sampleIndex] = value;
    return true;
}

std::size_t getSignalCount() {
    return gSignals.size();
}
