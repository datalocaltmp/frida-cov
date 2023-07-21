# Android Code Coverage Generation

TODO: Write proper README.

![coverage_path](https://raw.githubusercontent.com/datalocaltmp/frida-cov/main/assets/coverage_path.webp)

## Usage

First adb push your binary, `libgadget.so`, `libgadget.config.so`, and `frida-drcov.js` to your device; then perform the following:

1) Inject frida gadget via `LD_PRELOAD=./libgadget.so`

2) `frida-drcov.js` stores raw coverage data in `/data/local/tmp/rawcov.dat`

3) adb pull `rawcov.dat` from `/data/local/tmp`

5) Use modified `frida-drcov.py` to convert raw data to DragonDance coverage map

6) Import coverage map into Ghidra!

## Example

![example](https://raw.githubusercontent.com/datalocaltmp/frida-cov/main/assets/example_gadget.png)

## Sequence Diagram

![sequence](https://raw.githubusercontent.com/datalocaltmp/frida-cov/main/assets/sequence.png)
