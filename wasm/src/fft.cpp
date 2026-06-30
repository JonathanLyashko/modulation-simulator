#include "fft.hpp"

#include "signal.hpp"

#include <algorithm>
#include <cmath>
#include <complex>
#include <vector>

namespace {
constexpr float kPi = 3.14159265358979323846f;

std::size_t nextPowerOfTwo(std::size_t value) {
    std::size_t result = 1;
    while (result < value) {
        result <<= 1;
    }
    return result;
}

void fftInPlace(std::vector<std::complex<float>>& samples) {
    const std::size_t sampleCount = samples.size();

    std::size_t j = 0;
    for (std::size_t i = 1; i < sampleCount; ++i) {
        std::size_t bit = sampleCount >> 1;
        while ((j & bit) != 0) {
            j ^= bit;
            bit >>= 1;
        }
        j ^= bit;

        if (i < j) {
            std::swap(samples[i], samples[j]);
        }
    }

    for (std::size_t len = 2; len <= sampleCount; len <<= 1) {
        const float angle = -2.0f * kPi / static_cast<float>(len);
        const std::complex<float> wLen(std::cos(angle), std::sin(angle));

        for (std::size_t i = 0; i < sampleCount; i += len) {
            std::complex<float> w(1.0f, 0.0f);
            for (std::size_t jInner = 0; jInner < len / 2; ++jInner) {
                const std::complex<float> even = samples[i + jInner];
                const std::complex<float> odd = samples[i + jInner + len / 2] * w;

                samples[i + jInner] = even + odd;
                samples[i + jInner + len / 2] = even - odd;
                w *= wLen;
            }
        }
    }
}
}  // namespace

int fftMagnitudeSpectrum(int signalId, int requestedFftSize) {
    Signal* signal = getSignal(signalId);
    if (signal == nullptr || signal->samples.empty() || signal->sampleRate <= 0) {
        return -1;
    }

    const std::size_t inputLength = signal->samples.size();
    const std::size_t minimumLength = std::min<std::size_t>(
        inputLength,
        static_cast<std::size_t>(
            requestedFftSize > 0 ? requestedFftSize : static_cast<int>(inputLength)
        )
    );
    const std::size_t fftLength = nextPowerOfTwo(std::max<std::size_t>(minimumLength, 1));
    std::vector<std::complex<float>> fftSamples(fftLength, std::complex<float>(0.0f, 0.0f));

    float windowSum = 0.0f;
    if (minimumLength == 1) {
        fftSamples[0] = std::complex<float>(signal->samples[0], 0.0f);
        windowSum = 1.0f;
    } else {
        for (std::size_t index = 0; index < minimumLength; ++index) {
            const float window =
                0.5f - 0.5f * std::cos(
                    2.0f * kPi * static_cast<float>(index) /
                    static_cast<float>(minimumLength - 1)
                );
            fftSamples[index] = std::complex<float>(signal->samples[index] * window, 0.0f);
            windowSum += window;
        }
    }

    fftInPlace(fftSamples);

    const float normalization = windowSum > 0.0f ? windowSum * 0.5f : 1.0f;
    const int spectrumSignalId = createSignal(
        static_cast<int>(fftLength),
        signal->sampleRate
    );
    Signal* spectrum = getSignal(spectrumSignalId);
    if (spectrum == nullptr) {
        return -1;
    }

    for (std::size_t index = 0; index < fftLength; ++index) {
        const std::size_t shiftedIndex = (index + fftLength / 2) % fftLength;
        spectrum->samples[shiftedIndex] = std::abs(fftSamples[index]) / normalization;
    }

    return spectrumSignalId;
}

int fftMagnitudeSpectrum(int signalId) {
    return fftMagnitudeSpectrum(signalId, 0);
}
