#include "dsp_api.hpp"

#include "fft.hpp"
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

float dsp_get_signal_sample(int signal_id, int sample_index) {
    return getSignalSample(signal_id, sample_index);
}

bool dsp_set_signal_sample(int signal_id, int sample_index, float value) {
    return setSignalSample(signal_id, sample_index, value);
}

int dsp_fft_magnitude_spectrum(int signal_id) {
    return fftMagnitudeSpectrum(signal_id);
}

int dsp_fft_magnitude_spectrum_sized(int signal_id, int fft_size) {
    return fftMagnitudeSpectrum(signal_id, fft_size);
}

void dsp_clear_signal(int signal_id) {
    zeroSignalSamples(signal_id);
}

void dsp_add_sine_component(
    int signal_id,
    float amplitude,
    float frequency,
    float phase
) {
    addSineComponent(signal_id, AdditiveToneParameters{
        amplitude,
        frequency,
        phase,
    });
}

void dsp_add_cosine_component(
    int signal_id,
    float amplitude,
    float frequency,
    float phase
) {
    addCosineComponent(signal_id, AdditiveToneParameters{
        amplitude,
        frequency,
        phase,
    });
}

void dsp_generate_carrier(
    int signal_id,
    float carrier_amplitude,
    float carrier_frequency,
    float initial_phase
) {
    generateCarrier(signal_id, CarrierParameters{
        carrier_amplitude,
        carrier_frequency,
        initial_phase,
    });
}

void dsp_generate_sine(
    int signal_id,
    float amplitude,
    float frequency,
    float phase
) {
    generateSine(signal_id, ToneParameters{
        amplitude,
        frequency,
        phase,
    });
}

int dsp_am_modulate(
    int message_signal_id,
    float carrier_frequency,
    float carrier_amplitude,
    float modulation_index,
    float initial_phase
) {
    return amModulate(message_signal_id, AmModulationParameters{
        CarrierParameters{
            carrier_amplitude,
            carrier_frequency,
            initial_phase,
        },
        modulation_index,
    });
}

int dsp_dsb_sc_modulate(
    int message_signal_id,
    float carrier_frequency,
    float carrier_amplitude,
    float initial_phase
) {
    return dsbScModulate(message_signal_id, DsbScModulationParameters{
        CarrierParameters{
            carrier_amplitude,
            carrier_frequency,
            initial_phase,
        },
    });
}

int dsp_ssb_modulate(
    int message_signal_id,
    float carrier_frequency,
    float carrier_amplitude,
    float initial_phase,
    int sideband
) {
    return ssbModulate(message_signal_id, SsbModulationParameters{
        CarrierParameters{
            carrier_amplitude,
            carrier_frequency,
            initial_phase,
        },
        sideband > 0 ? SsbSideband::Upper : SsbSideband::Lower,
    });
}

int dsp_fm_modulate(
    int message_signal_id,
    float carrier_frequency,
    float carrier_amplitude,
    float frequency_sensitivity,
    float initial_phase
) {
    return fmModulate(message_signal_id, FmModulationParameters{
        CarrierParameters{
            carrier_amplitude,
            carrier_frequency,
            initial_phase,
        },
        frequency_sensitivity,
    });
}

int dsp_pm_modulate(
    int message_signal_id,
    float carrier_frequency,
    float carrier_amplitude,
    float phase_sensitivity,
    float initial_phase
) {
    return pmModulate(message_signal_id, PmModulationParameters{
        CarrierParameters{
            carrier_amplitude,
            carrier_frequency,
            initial_phase,
        },
        phase_sensitivity,
    });
}
}
