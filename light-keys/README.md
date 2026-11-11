# Light Keys

A replacement for the ROLI LUMI app. It plays sound from a ROLI LUMI Keys keyboard (also sold as ROLI Piano M) and lights up its keys to teach songs. It's one web page with no ROLI account, server or install, and it runs on iPad.

## Use it on iPad

1. Install the free **Web MIDI Browser** app from the App Store. Safari can't talk to MIDI keyboards.
2. Plug the LUMI into the iPad with a USB-C cable, or use a Lightning to USB 3 Camera Adapter on older iPads.
3. Open the page link in Web MIDI Browser and tap **Start**. The status pill turns green when the LUMI is found.
4. Pick a song and press the keys that light up.

For Bluetooth, pair the LUMI once inside GarageBand (Settings › Advanced › Bluetooth MIDI Devices), then come back. A cable has less lag.

On a Mac or PC, the page works in Chrome or Edge.

## What it does

- **Sound**: built-in grand piano, electric piano, organ, pad and music box. Supports velocity and the sustain pedal.
- **Learn**: lights the next notes on the LUMI and waits for you to play them.
- **Play along**: keeps time and lights each note just before it's due.
- **Listen**: plays the song and lights the keys so you can watch.
- Practice the right hand, the left hand or both, at 30–150% speed.
- Built-in songs (public domain) plus **Open MIDI…** for any `.mid` file.
- Falling-notes view and an on-screen keyboard you can also play by touch.
- LUMI settings: key colour, root colour, brightness, colour mode, scale, key and octave.
- Fits the LUMI's octave to each song and follows the octave buttons.

## How the lights work

The LUMI's factory program lights a key whenever it *receives* a MIDI note-on. The note's velocity (1–127) picks a colour from a built-in rainbow table, and note-off turns the key off. So the song lights need only normal MIDI notes and work even where SysEx is blocked.

The colour, brightness, scale and octave settings use the LUMI's SysEx configuration messages. The community reverse-engineered these messages in [benob/LUMI-lights](https://github.com/benob/LUMI-lights).

If the keys never light, the LUMI may be running a custom program. A factory reset in ROLI Dashboard restores the default one.

## Files

`index.html` holds everything: no build step and no dependencies. You can open it locally, or host it anywhere over HTTPS (for example GitHub Pages).
