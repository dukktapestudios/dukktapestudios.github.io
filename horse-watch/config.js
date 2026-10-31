/* Horse Watch settings.
   Change numbers and labels here. You do not need to edit app.js for a new
   checklist line, a stricter gait flag, or a different save name.
   See README.md, section "How to change things". */
window.HORSE_WATCH = {
  /* localStorage names. Changing a name starts a fresh list on this browser. */
  healthStorageKey: "horse-watch-health-v1",
  saddleStorageKey: "horse-watch-saddle-v1",

  /* In-browser horse box. Joints are not estimated by this model.
     The files download into the browser. Photos and video are not sent back. */
  model: {
    tfjsUrl: "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js",
    cocoUrl: "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js",
    className: "horse",
    scoreMin: 0.4
  },

  /* Tap targets. saddleFront and saddleBack are the two points used for tilt. */
  points: [
    { id: "poll", label: "Poll", color: "#1d4e89" },
    { id: "withers", label: "Withers", color: "#0f6b32" },
    { id: "croup", label: "Croup", color: "#157a45" },
    { id: "saddleFront", label: "Saddle front", color: "#8d3e16" },
    { id: "saddleBack", label: "Saddle back", color: "#a85b20" },
    { id: "nearFore", label: "Near fore", color: "#6b2d5b" },
    { id: "offFore", label: "Off fore", color: "#8e3d78" },
    { id: "nearHind", label: "Near hind", color: "#1a5270" },
    { id: "offHind", label: "Off hind", color: "#2471a3" }
  ],

  gait: {
    /* Near-side mean stride vs off-side mean stride. 0.12 means a 12% gap. */
    symmetryFlag: 0.12,
    /* Head-line wobble, as a fraction of the horse box height. */
    headBobFlag: 0.08,
    /* How often to look for a horse box while video or the camera is running. */
    sampleMs: 400,
    limbs: [
      { id: "nearFore", label: "Near fore lands" },
      { id: "offFore", label: "Off fore lands" },
      { id: "nearHind", label: "Near hind lands" },
      { id: "offHind", label: "Off hind lands" }
    ]
  },

  saddle: {
    frontId: "saddleFront",
    backId: "saddleBack",
    /* Abs tilt under this many degrees is called about level. */
    levelDegrees: 3,
    checks: [
      { id: "levelSeat", label: "Level seat" },
      { id: "witherClearance", label: "Wither clearance in fingers" },
      { id: "slipping", label: "Slipping" },
      { id: "unevenSweat", label: "Uneven sweat marks" },
      { id: "drySpots", label: "Dry spots" },
      { id: "backSoreness", label: "Back soreness" }
    ]
  },

  health: {
    choices: ["OK", "Watch", "Concern"],
    fields: [
      { id: "eyes", label: "Eyes" },
      { id: "nose", label: "Nose" },
      { id: "hooves", label: "Hooves" },
      { id: "coat", label: "Coat" },
      { id: "attitude", label: "Attitude" },
      { id: "appetite", label: "Appetite" },
      { id: "manure", label: "Manure" }
    ]
  }
};
