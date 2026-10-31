# Horse Watch

Horse Watch is a starter observation page. It runs in the browser. A photo, a video, or the camera stays on the device. The page can download a horse-box model into the browser. It does not send the picture anywhere.

The horse box comes from COCO-SSD (TensorFlow.js). That model only draws a box around something it thinks is a horse. It does not find joints. Poll, hooves, and saddle points are placed by tapping. Stride times come from the footfall buttons.

This is an early-warning notebook. It is not a veterinarian and it is not a saddle fitter.

## How to change things

Open `config.js`. Each setting has a short note. Refresh the page after you save.

### Gait flags

- `gait.symmetryFlag` is how large a left/right stride gap must be before the page raises a flag. `0.12` means 12 percent. Raise it if the flag appears too often. Lower it if you want an earlier hint.
- `gait.headBobFlag` is the head-line wobble, as a fraction of the horse box height. `0.08` means the top of the box moved by more than 8 percent of the box height after the slow drift is taken out.
- `gait.sampleMs` is how often the page looks for a horse box during video or camera playback. A larger number is easier on a phone.

### Saddle tilt

- `saddle.levelDegrees` is the tilt, in degrees, that still counts as about level.
- `saddle.frontId` and `saddle.backId` must match point ids in `points`. Those two taps are the only saddle-tilt measurement.
- `saddle.checks` is the manual list. Add an object with a new `id` and `label` to add a row. Old saved notes keep the ids they were stored with.

### Health log

- `health.fields` is the quick checks. Add a field the same way, with a new `id` and `label`.
- `health.choices` is the menu on each check. The body condition score stays 1 through 9 in the page, separate from this menu.
- `healthStorageKey` is the browser save name. Change it if you want to start a fresh log without deleting the old one by hand. Export a CSV first if you still want the old rows.

### Points and colors

- `points` builds the tap buttons and the overlay dots. `id` is the stored name. `label` is what the page shows. `color` is the dot.
- Removing a point hides it. Already saved saddle notes are not rewritten.

### The horse box

- `model.scoreMin` is how sure the box model must be. Higher means fewer boxes.
- `model.className` should stay `horse` unless you deliberately switch models.
- `model.tfjsUrl` and `model.cocoUrl` are the files the browser downloads. The picture is not part of that request.

Colors and spacing for the page itself are in `style.css`.
