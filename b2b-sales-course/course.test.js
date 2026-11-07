var lessons = require("./lessons-a.js").concat(require("./lessons-b.js"));
var practice = require("./practice.js");
var failed = 0;
function assert(cond, message) {
  if (!cond) { failed += 1; console.error("FAIL: " + message); }
}
assert(lessons.length >= 16, "at least 16 lessons, got " + lessons.length);
lessons.forEach(function (lesson) {
  ["objective", "bad", "good", "why", "assignment"].forEach(function (key) {
    assert(lesson[key] && lesson[key].length > 40, lesson.id + " " + key);
  });
  assert(lesson.concept.length >= 4, lesson.id + " concept");
  assert(lesson.steps.length >= 5, lesson.id + " steps");
  assert(lesson.example.length >= 1, lesson.id + " example");
  assert(lesson.sample.length >= 1, lesson.id + " sample");
  assert(lesson.pass.length >= 3, lesson.id + " pass");
});
var discovery = lessons.filter(function (lesson) { return lesson.id === "discovery"; })[0];
assert(discovery.dialogue.length >= 15 && discovery.dialogue.length <= 20, "discovery turns " + discovery.dialogue.length);
assert(practice.roleplays.length >= 6, "roleplays");
assert(practice.drills.length >= 6, "drills");
assert(practice.quizzes.length >= 12, "quizzes");
var positions = {};
practice.quizzes.forEach(function (item, index) {
  assert(item.correct >= 0 && item.correct < item.options.length, "quiz " + index + " key");
  positions[item.correct] = true;
  practice.quizzes.forEach(function (other, otherIndex) {
    if (otherIndex !== index) assert(item.q !== other.q, "duplicate question");
  });
});
assert(Object.keys(positions).length >= 3, "answer position varies");
practice.roleplays.forEach(function (play) {
  assert(play.nodes[play.start], play.id + " start");
  var ends = 0;
  Object.keys(play.nodes).forEach(function (id) {
    var node = play.nodes[id];
    if (node.model) ends += 1;
    (node.choices || []).forEach(function (choice) {
      assert(play.nodes[choice.to], play.id + " missing " + choice.to);
    });
  });
  assert(ends >= 2, play.id + " needs more than one ending");
});
if (failed) { console.error(failed + " failed"); process.exit(1); }
console.log("Course structure checks passed. Lessons: " + lessons.length + ". Roleplays: " + practice.roleplays.length + ". Drills: " + practice.drills.length + ". Checks: " + practice.quizzes.length + ".");
