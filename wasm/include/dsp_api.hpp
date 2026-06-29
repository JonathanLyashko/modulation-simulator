#pragma once

extern "C" {
    int dsp_create_signal(int length, int sample_rate);
    void dsp_destroy_signal(int signal_id);

    float* dsp_get_signal_ptr(int signal_id);
    int dsp_get_signal_length(int signal_id);
    int dsp_get_signal_sample_rate(int signal_id);
    float dsp_get_signal_sample(int signal_id, int sample_index);

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
        float modulation_index
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
