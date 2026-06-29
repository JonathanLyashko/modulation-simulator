EMCC = emcc

SRC_DIR = src
INC_DIR = include
OUT_DIR = ../frontend/public/wasm

SRCS = $(wildcard $(SRC_DIR)/*.cpp)

OUT_JS = $(OUT_DIR)/dsp.js
OUT_WASM = $(OUT_DIR)/dsp.wasm

EXPORTS = '["_dsp_create_signal","_dsp_destroy_signal","_dsp_get_signal_ptr","_dsp_get_signal_length","_dsp_get_signal_sample_rate","_dsp_get_signal_sample","_dsp_generate_carrier","_dsp_generate_sine","_dsp_am_modulate","_dsp_fm_modulate","_dsp_pm_modulate"]'
RUNTIME_EXPORTS = '["ccall","cwrap"]'

CXXFLAGS = -I$(INC_DIR) -O3

EMFLAGS = \
	--no-entry \
	-s WASM=1 \
	-s MODULARIZE=1 \
	-s EXPORT_ES6=1 \
	-s ENVIRONMENT=web \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s EXPORTED_FUNCTIONS=$(EXPORTS) \
	-s EXPORTED_RUNTIME_METHODS=$(RUNTIME_EXPORTS)

.PHONY: all clean rebuild

all: $(OUT_JS)

$(OUT_JS): $(SRCS)
	mkdir -p $(OUT_DIR)
	$(EMCC) $(SRCS) $(CXXFLAGS) $(EMFLAGS) -o $(OUT_JS)

clean:
	rm -f $(OUT_JS) $(OUT_WASM)

rebuild: clean all
