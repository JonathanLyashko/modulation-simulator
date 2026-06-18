#pragma once

#include <vector>
#include <memory>

struct Signal {
    std::vector<float> samples;
    int sampleRate;
};

int createSignal(int length, int sampleRate);
void destroySignal(int id);

Signal* getSignal(int id);
float* getSignalPointer(int id);
int getSignalLength(int id);
int getSignalSampleRate(int id);