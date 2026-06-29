#include "dsp_api.hpp"

#include "modulation.hpp"
#include "signal.hpp"

extern "C" {
int dsp_create_signal(int length, int sample_rate) {
    return createSignal(length, sample_rate);
}

void dsp_destroy_signal(int signal_id) {
    destroySignal(signal_id);
}

float* dsp_get_signal_ptr(int signal_id) {
    return getSignalPointer(signal_id);
}

int dsp_get_signal_length(int signal_id) {
    return getSignalLength(signal_id);
}

int dsp_get_signal_sample_rate(int signal_id) {
    return getSignalSampleRate(signal_id);
}

void dsp_generate_sine(
    int signal_id,
    float amplitude,
    float frequency,
    float phase
) {
    generateSine(signal_id, amplitude, frequency, phase);
}

int dsp_am_modulate(
    int message_signal_id,
    float carrier_frequency,
    float carrier_amplitude,
    float modulation_index
) {
    return amModulate(
        message_signal_id,
        carrier_frequency,
        carrier_amplitude,
        modulation_index
    );
}
}
