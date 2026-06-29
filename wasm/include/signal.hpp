#pragma once

#include <cstddef>
#include <vector>

struct AdditiveToneParameters {
    float amplitude;
    float frequency;
    float phaseDegrees;
};

struct Signal {
    std::vector<float> samples;
    int sampleRate;
};

int createSignal(int length, int sampleRate);
int cloneSignal(int sourceId);
void destroySignal(int id);

Signal* getSignal(int id);
float* getSignalPointer(int id);
int getSignalLength(int id);
int getSignalSampleRate(int id);
float getSignalDurationSeconds(int id);
float getSignalSample(int id, int index);
bool setSignalSample(int id, int index, float value);
void zeroSignalSamples(int id);
bool addSineComponent(int id, const AdditiveToneParameters& parameters);
bool addCosineComponent(int id, const AdditiveToneParameters& parameters);
std::size_t getSignalCount();
