/* Coverage and privacy checks for the ESP32 Crash Course.
   Run from the repo root: node esp32-crash-course/page.test.js */
var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var html = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
var home = fs.readFileSync(path.join(root, "index.html"), "utf8");
var sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

assert.ok(html.indexOf("<title>ESP32 Crash Course | Dukktape Studios</title>") !== -1);
assert.ok(html.indexOf('name="viewport"') !== -1);
assert.ok(html.indexOf(":focus-visible") !== -1);
assert.ok(html.indexOf("prefers-reduced-motion: reduce") !== -1);
assert.ok(html.indexOf("--column: 740px") !== -1);
assert.ok(html.indexOf("overflow-x: auto") !== -1);
assert.ok(html.indexOf("font-size: 14px") !== -1);
assert.ok(html.indexOf("white-space: pre") !== -1);
assert.ok(html.indexOf("white-space: pre-wrap") === -1);
assert.ok(html.indexOf("min-width: 36rem") !== -1);
assert.ok(html.indexOf('class="skip"') !== -1);
assert.ok(html.indexOf('href="/#guides"') !== -1);
assert.ok(html.indexOf('href="#content">Back to top</a>') !== -1);
assert.ok(html.indexOf("© 2026 Dukktape Studios") !== -1);
assert.ok(html.indexOf('class="dts-donate"') !== -1);
assert.ok(html.indexOf("Free to use. Donations welcome — they keep this going.") !== -1);
assert.ok(html.indexOf("Stay on low voltage until you really know the wiring.") !== -1);

var sections = ["what", "variants", "capabilities", "kits", "setup", "lessons", "projects", "safety", "plan", "resources"];
sections.forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, "missing section " + id);
});

var toc = html.split('aria-label="Contents"')[1].split("</nav>")[0];
var tocIds = [];
var tocRe = /href="#([^"]+)"/g;
var tocMatch;
while ((tocMatch = tocRe.exec(toc))) tocIds.push(tocMatch[1]);
assert.deepStrictEqual(tocIds, sections);

["lesson-blink", "lesson-button", "lesson-temp", "lesson-web", "lesson-notify", "lesson-sleep", "lesson-now", "lesson-cam"].forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, id);
});
assert.strictEqual((html.match(/<h3>\d\. /g) || []).length, 8, "eight lessons in order");
assert.ok(html.indexOf("In Arduino IDE, install the OneWire library") !== -1);
assert.ok(html.indexOf("You still need the OneWire and DallasTemperature libraries from Lesson 3.") !== -1);

["chip-esp32", "chip-s3", "chip-c3", "chip-c6", "chip-cam"].forEach(function (id) {
  assert.ok(html.indexOf('id="' + id + '"') !== -1, id);
});
assert.ok(html.indexOf('id="can-do"') !== -1);
assert.ok(html.indexOf('id="cannot-do"') !== -1);
assert.ok(html.indexOf("GPIO digital pins") !== -1);
assert.ok(html.indexOf("Not a drone flight controller") !== -1);
assert.ok(html.indexOf(">What it can do</h3>") !== -1);
assert.ok(html.indexOf(">What it cannot do well</h3>") !== -1);

assert.strictEqual((html.match(/<pre><code>/g) || []).length, 9, "eight sketches plus the board URL");
assert.ok(html.indexOf("#include <") === -1, "angle brackets in sketches are escaped");
assert.ok(html.indexOf("#include &lt;WiFi.h&gt;") !== -1);
assert.ok(html.indexOf("#include &lt;OneWire.h&gt;") !== -1);
assert.ok(html.indexOf("&lt;h1&gt;Coop sensor&lt;/h1&gt;&lt;p&gt;") !== -1);
assert.ok(html.indexOf("&lt;/p&gt;&lt;p&gt;Refresh to update.&lt;/p&gt;") !== -1);
assert.ok(html.indexOf("<h1>Coop") === -1);
assert.ok(html.indexOf("YOUR_WIFI_SSID") !== -1);
assert.ok(html.indexOf("YOUR_WIFI_PASSWORD") !== -1);
assert.ok(html.indexOf("YOUR_UNIQUE_TOPIC") !== -1);
assert.ok(html.indexOf("package_esp32_index.json") !== -1);

assert.ok(html.indexOf("OBD2 monitor for a truck") !== -1);
assert.ok(html.indexOf("Arena scoring display or projector prototype") !== -1);
assert.ok(html.indexOf("Goal: join your home Wi-Fi and show the temperature") !== -1);
assert.ok(html.indexOf("Join home Wi-Fi and serve a page on your phone.") !== -1);

var resources = [
  "https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html",
  "https://docs.espressif.com/projects/arduino-esp32/en/latest/",
  "https://documentation.espressif.com/esp32_datasheet_en.html",
  "https://documentation.espressif.com/esp32-s3_datasheet_en.html",
  "https://documentation.espressif.com/esp32-c3_datasheet_en.html",
  "https://documentation.espressif.com/esp32-c6_datasheet_en.html",
  "https://randomnerdtutorials.com/getting-started-with-esp32/",
  "https://randomnerdtutorials.com/projects-esp32/",
  "https://docs.micropython.org/en/latest/esp32/quickref.html",
  "https://esphome.io/install/getting-started/",
  "https://docs.ntfy.sh/publish/",
  "https://github.com/espressif/arduino-esp32/tree/master/libraries/ESP32/examples/Camera/CameraWebServer",
  "https://docs.espressif.com/projects/arduino-esp32/en/latest/api/ledc.html",
  "https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html",
  "https://www.arduino.cc/en/software",
  "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers",
  "https://www.wch-ic.com/downloads/CH341SER_EXE.html",
  "https://www.wch-ic.com/downloads/CH341SER_MAC_ZIP.html",
  "https://micropython.org/download/",
  "https://www.home-assistant.io/",
  "https://us.elegoo.com/products/elegoo-esp-32-super-starter-kit",
  "https://docs.sunfounder.com/projects/elite-explorer-kit/en/latest/",
  "https://docs.arduino.cc/hardware/uno-r4-wifi",
  "https://www.espressif.com/en/products/devkits/esp32-s3-eye/overview"
];
resources.forEach(function (url) {
  assert.ok(html.indexOf('href="' + url + '"') !== -1, "missing link " + url);
});

var guides = home.split('id="guides"')[1].split('id="tools"')[0];
assert.ok(guides.indexOf("https://dukktapestudios.github.io/esp32-crash-course/") !== -1);
assert.ok(sitemap.indexOf("https://dukktapestudios.github.io/esp32-crash-course/") !== -1);

var banned = [
  /Starlink/i,
  /Tacoma/,
  /Horse-show/,
  /\bAlexander\b/,
  /\bDESKTOP-/,
  /C:\\Users/i,
  /\b\d{3}-\d{3}-\d{4}\b/,
  /mailto:/i
];
banned.forEach(function (pattern) {
  assert.ok(!pattern.test(html), "privacy pattern " + pattern);
});

var emails = html.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
assert.deepStrictEqual(emails, [], "no plain email addresses");
assert.strictEqual((html.match(/dukktapestudios%40gmail\.com/g) || []).length, 1, "studio donation link only");

console.log("ESP32 Crash Course checks passed.");
