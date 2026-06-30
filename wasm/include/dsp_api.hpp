#pragma once

extern "C" {
    int dsp_create_signal(int length, int sample_rate);
    void dsp_destroy_signal(int signal_id);

    float* dsp_get_signal_ptr(int signal_id);
    int dsp_get_signal_length(int signal_id);
    int dsp_get_signal_sample_rate(int signal_id);
    float dsp_get_signal_sample(int signal_id, int sample_index);
    int dsp_fft_magnitude_spectrum(int signal_id);
    void dsp_clear_signal(int signal_id);
    void dsp_add_sine_component(
        int signal_id,
        float amplitude,
        float frequency,
        float phase
    );
    void dsp_add_cosine_component(
        int signal_id,
        float amplitude,
        float frequency,
        float phase
    );

    void dsp_generate_carrier(
        int signal_id,
        float carrier_amplitude,
        float carrier_frequency,
        float initial_phase
    );

    void dsp_generate_sine(
        int signal_id,
        float amplitude,
        float frequency,
        float phase
    );

    int dsp_am_modulate(
        int message_signal_id,
        float carrier_frequency,
        float carrier_amplitude,
        float modulation_index,
        float initial_phase
    );

    int dsp_dsb_sc_modulate(
        int message_signal_id,
        float carrier_frequency,
        float carrier_amplitude,
        float initial_phase
    );

    int dsp_fm_modulate(
        int message_signal_id,
        float carrier_frequency,
        float carrier_amplitude,
        float frequency_sensitivity,
        float initial_phase
    );

    int dsp_pm_modulate(
        int message_signal_id,
        float carrier_frequency,
        float carrier_amplitude,
        float phase_sensitivity,
        float initial_phase
    );
}
