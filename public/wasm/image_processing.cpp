#include <stdint.h>
extern "C" {
    // Invert Filter
    void invert(uint8_t* data, int length) {
        for (int i = 0; i < length; i += 4) {
            data[i]     = 255 - data[i];     // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
            // Alpha (data[i + 3]) is left unchanged
        }
    }
    // Grayscale Filter
    void grayscale(uint8_t* data, int length) {
        for (int i = 0; i < length; i += 4) {
            uint8_t r = data[i];
            uint8_t g = data[i + 1];
            uint8_t b = data[i + 2];
            // Standard luminosity formula optimized for integers
            uint8_t gray = (r * 77 + g * 150 + b * 29) >> 8;
            data[i]     = gray;
            data[i + 1] = gray;
            data[i + 2] = gray;
            // Alpha remains unchanged
        }
    }

}
