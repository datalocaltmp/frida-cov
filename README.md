# Android Code Coverage Generation

This tool allows a user to generate code coverage for a binary executed within an Android shell context.

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

## MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
