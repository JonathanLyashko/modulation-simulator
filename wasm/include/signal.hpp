#pragma once

#include <cstddef>
#include <vector>

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
std::size_t getSignalCount();
