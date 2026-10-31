(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CLUCK_CARDS = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var roosters = [
    { id: "blazecomb", name: "Blazecomb, Dawn Champion", flock: "Sunfire", hp: 130, weak: "Duskcomb", retreat: 2, emoji: "☀️",
      flavor: "He crows once, and the sunrise shows up early.",
      special: { type: "signature", key: "solar", name: "Solar Flare Crow", text: "Once per game, deal 40 damage to each enemy rooster." },
      attacks: [
        { name: "Sunrise Strike", cost: 1, dmg: 30, hit: 3, dice: 1, text: "30 damage." },
        { name: "Inferno Spur", cost: 3, dmg: 90, hit: 4, dice: 2, text: "90 damage. Discard 1 Grain from Blazecomb.", effects: ["discard1"] }
      ] },
    { id: "hothead", name: "Hothead Brawler", flock: "Sunfire", hp: 90, weak: "Duskcomb", retreat: 1, emoji: "🥊",
      flavor: "Thinks first. Just not before punching.",
      special: { type: "trait", key: "shortFuse", name: "Short Fuse", text: "His attacks do +20 if he came off the bench this turn." },
      attacks: [
        { name: "Headbutt", cost: 1, dmg: 20, hit: 3, dice: 1, text: "20 damage." },
        { name: "Wild Swing", cost: 2, dmg: 60, hit: 5, dice: 1, text: "60 damage. Flip a coin. Tails: 20 damage to himself.", effects: ["coinTails20"] }
      ] },
    { id: "molten", name: "Molten Wattle Bruiser", flock: "Sunfire", hp: 110, weak: "Duskcomb", retreat: 3, emoji: "🌋",
      flavor: "His wattle glows when he is angry. It always glows.",
      special: { type: "trait", key: "hotBlood", name: "Hot Blood", text: "Takes 20 less damage from Wildroost attacks." },
      attacks: [
        { name: "Ember Peck", cost: 1, dmg: 20, hit: 3, dice: 1, text: "20 damage. Burn: 10 more at the end of each enemy turn.", effects: ["burn"] },
        { name: "Lava Belly Flop", cost: 3, dmg: 80, hit: 4, dice: 1, text: "80 damage." }
      ] },
    { id: "grizzle", name: "Old Guard Grizzlecrest", flock: "Ironbeak", hp: 160, weak: "Stormfeather", retreat: 3, emoji: "🚪",
      flavor: "He has stood at this gate longer than the gate.",
      special: { type: "signature", key: "lastStand", name: "Last Stand at the Gate", text: "Once per game, take no damage during your opponent's next turn." },
      attacks: [
        { name: "Shield Bash", cost: 2, dmg: 40, hit: 3, dice: 1, text: "40 damage." },
        { name: "Iron Fortress", cost: 3, dmg: 70, hit: 4, dice: 1, text: "70 damage. Take 30 less damage next turn.", effects: ["fortress"] }
      ] },
    { id: "steel", name: "Steel Feather Hen", flock: "Ironbeak", hp: 120, weak: "Stormfeather", retreat: 2, emoji: "🛡️",
      flavor: "Mother of twelve. Fear her.",
      special: { type: "trait", key: "mothersWrath", name: "Mother's Wrath", text: "+30 damage if one of your roosters was knocked out last turn." },
      attacks: [
        { name: "Wing Slap", cost: 1, dmg: 20, hit: 2, dice: 1, text: "20 damage." },
        { name: "Protective Peck", cost: 2, dmg: 50, hit: 3, dice: 1, text: "50 damage. Heal 20 from a bench rooster.", effects: ["healBench20"] }
      ] },
    { id: "fence", name: "Fence Post Sentry", flock: "Ironbeak", hp: 100, weak: "Stormfeather", retreat: 2, emoji: "🪵",
      flavor: "He does not move. That is the job.",
      special: { type: "trait", key: "rooted", name: "Rooted", text: "Enemy cards can't force him to switch." },
      attacks: [
        { name: "Stand Firm", cost: 1, dmg: 10, hit: 2, dice: 1, text: "10 damage. Heal 20 from himself.", effects: ["healSelf20"] },
        { name: "Post Pound", cost: 2, dmg: 50, hit: 4, dice: 1, text: "50 damage." }
      ] },
    { id: "zephra", name: "Thunderwing Zephra", flock: "Stormfeather", hp: 120, weak: "Wildroost", retreat: 1, emoji: "⚡",
      flavor: "Lightning asks her for advice.",
      special: { type: "signature", key: "eye", name: "Eye of the Storm", text: "Once per game, use any attack of an enemy rooster for free." },
      attacks: [
        { name: "Static Peck", cost: 1, dmg: 20, hit: 3, dice: 1, text: "20 damage. Draw a card.", effects: ["draw1"] },
        { name: "Thunder Dive", cost: 3, dmg: 80, hit: 4, dice: 1, rerollMiss: true, text: "80 damage. Reroll misses. Does 20 to one enemy bench rooster too.", effects: ["bench20"] }
      ] },
    { id: "cloud", name: "Cloud Strutter", flock: "Stormfeather", hp: 90, weak: "Wildroost", retreat: 0, emoji: "☁️",
      flavor: "He has never once touched the ground on purpose.",
      special: { type: "trait", key: "skywalk", name: "Skywalk", text: "His switch cost is 0." },
      attacks: [
        { name: "Gust", cost: 1, dmg: 10, hit: 3, dice: 1, text: "10 damage. Switch the enemy active rooster with one of their bench roosters.", effects: ["gust"] },
        { name: "Sky Kick", cost: 2, dmg: 50, hit: 3, dice: 1, text: "50 damage." }
      ] },
    { id: "pullet", name: "Static Pullet", flock: "Stormfeather", hp: 70, weak: "Wildroost", retreat: 1, emoji: "🐥",
      flavor: "Her feathers stand straight up. Always.",
      special: { type: "trait", key: "lightningRod", name: "Lightning Rod", text: "When she is knocked out, deal 40 damage to the enemy active rooster." },
      attacks: [
        { name: "Zap", cost: 1, dmg: 30, hit: 3, dice: 1, text: "30 damage." },
        { name: "Overcharge", cost: 2, dmg: 60, hit: 5, dice: 1, text: "60 damage. Discard all Grain on her.", effects: ["discardAllGrain"] }
      ] },
    { id: "mama", name: "Big Mama Mossfeather", flock: "Wildroost", hp: 170, weak: "Sunfire", retreat: 4, emoji: "🌳",
      flavor: "The forest grew around her nest, not the other way around.",
      special: { type: "signature", key: "mother", name: "Mother of the Forest", text: "Once per game, heal 60 from each of your roosters." },
      attacks: [
        { name: "Vine Wrap", cost: 2, dmg: 30, hit: 3, dice: 1, text: "30 damage. Enemy active rooster can't switch next turn.", effects: ["noSwitch"] },
        { name: "Forest Stomp", cost: 4, dmg: 120, hit: 5, dice: 1, text: "120 damage." }
      ] },
    { id: "charger", name: "Corn Field Charger", flock: "Wildroost", hp: 120, weak: "Sunfire", retreat: 2, emoji: "🌽",
      flavor: "Fed on nothing but corn. Built like a barn.",
      special: { type: "trait", key: "cornFed", name: "Corn Fed", text: "+10 HP for each Grain on him." },
      attacks: [
        { name: "Trample", cost: 2, dmg: 40, hit: 3, dice: 1, text: "40 damage. 10 to each enemy bench rooster.", effects: ["bench10all"] },
        { name: "Harvest Horn", cost: 3, dmg: 70, hit: 4, dice: 1, text: "70 damage." }
      ] },
    { id: "seed", name: "Seed Pecker", flock: "Wildroost", hp: 80, weak: "Sunfire", retreat: 1, emoji: "🌱",
      flavor: "Finds every seed. Shares none.",
      special: { type: "trait", key: "hoarder", name: "Hoarder", text: "Once each turn, you may attach 1 extra Grain to him." },
      attacks: [
        { name: "Peck Peck", cost: 1, dmg: 0, hit: 2, dice: 1, scaleGrain: 10, text: "10 damage times the Grain on him." },
        { name: "Seed Spit", cost: 2, dmg: 40, hit: 4, dice: 1, text: "40 damage." }
      ] },
    { id: "nightspur", name: "Nightspur the Shade", flock: "Duskcomb", hp: 110, weak: "Ironbeak", retreat: 1, emoji: "🌙",
      flavor: "He only crows at midnight. Nobody hears it coming.",
      special: { type: "signature", key: "midnight", name: "Midnight Crow", text: "Once per game, knock out an enemy rooster with 50 HP or less left." },
      attacks: [
        { name: "Shadow Slash", cost: 1, dmg: 30, hit: 3, dice: 1, text: "30 damage." },
        { name: "Moonless Strike", cost: 3, dmg: 70, hit: 4, dice: 1, text: "70 damage. Opponent discards a card.", effects: ["discardOpp"] }
      ] },
    { id: "grave", name: "Graveyard Rooster", flock: "Duskcomb", hp: 100, weak: "Ironbeak", retreat: 2, emoji: "🪦",
      flavor: "He keeps getting back up. It's rude.",
      special: { type: "trait", key: "wontStay", name: "Won't Stay Down", text: "The first time he would be knocked out, he stays at 10 HP." },
      attacks: [
        { name: "Grave Scratch", cost: 1, dmg: 20, hit: 3, dice: 1, text: "20 damage." },
        { name: "Bone Rattle", cost: 2, dmg: 50, hit: 4, dice: 1, text: "50 damage. Heal 20 from himself.", effects: ["healSelf20"] }
      ] },
    { id: "bantam", name: "Shadow Bantam", flock: "Duskcomb", hp: 70, weak: "Ironbeak", retreat: 0, emoji: "👢",
      flavor: "Small enough to hide in a boot.",
      special: { type: "trait", key: "pickpocket", name: "Pickpocket", text: "When he deals damage, look at your opponent's hand." },
      attacks: [
        { name: "Sneak Bite", cost: 1, dmg: 20, hit: 2, dice: 1, ignoreReduction: true, text: "20 damage. Ignores damage reduction." },
        { name: "Hex Peck", cost: 2, dmg: 40, hit: 4, dice: 1, text: "40 damage. Enemy active rooster's attacks cost 1 more next turn.", effects: ["hex"] }
      ] }
  ];

  var supports = [
    { id: "grain", name: "Grain", type: "Grain", flock: "Any", text: "Attach 1 to a rooster each turn. Pays for attacks and switch costs.", flavor: "The fuel of champions.", emoji: "🌾" },
    { id: "golden", name: "Golden Grain", type: "Grain", flock: "Any", text: "Counts as 2 Grain, but only for a rooster of your lineup's main flock.", flavor: "Grown under a full sun.", emoji: "✨" },
    { id: "sunrise", name: "Sunrise Crow", type: "Action", flock: "Sunfire", text: "Deal 30 damage to an enemy rooster.", flavor: "The loudest alarm clock in the valley.", emoji: "📣" },
    { id: "flame", name: "Flame Spur Kick", type: "Action", flock: "Sunfire", text: "Your active rooster's next attack this turn does +30.", flavor: "Spurs out, heat on.", emoji: "🦶" },
    { id: "phoenix", name: "Phoenix Coop", type: "Coop", flock: "Sunfire", text: "Your Sunfire roosters roll 1 extra die on their attacks.", flavor: "Rebuilt seven times. Still on fire.", emoji: "🏠" },
    { id: "lockdown", name: "Coop Lockdown", type: "Counter", flock: "Ironbeak", text: "Play on your opponent's turn when they attack: that attack does 0 damage.", flavor: "Nope. Not today.", emoji: "🚫" },
    { id: "shield", name: "Shield of Straw and Steel", type: "Gear", flock: "Ironbeak", text: "The rooster with this takes 20 less damage.", flavor: "Mostly straw. The steel part matters.", emoji: "🛡️" },
    { id: "ironroost", name: "Iron Roost", type: "Coop", flock: "Ironbeak", text: "Your Ironbeak roosters get a 5+ Armor roll: on a 5 or 6, an attack against them does half damage.", flavor: "Built from old tractor parts and pride.", emoji: "🏚️" },
    { id: "squawk", name: "Squawk Back", type: "Counter", flock: "Stormfeather", text: "Play when your opponent plays an Action: cancel it.", flavor: "Whatever you said, he said it louder.", emoji: "🗣️" },
    { id: "gust", name: "Gust of Feathers", type: "Action", flock: "Stormfeather", text: "Switch your active rooster with a bench rooster for free.", flavor: "Go home. And take your tail with you.", emoji: "💨" },
    { id: "stormloft", name: "Storm Loft", type: "Coop", flock: "Stormfeather", text: "Once each turn, reroll 1 missed die for a Stormfeather rooster.", flavor: "The roof leaks electricity.", emoji: "⛈️" },
    { id: "frenzy", name: "Feed Frenzy", type: "Action", flock: "Wildroost", text: "Attach 2 Grain from your discard pile to one rooster.", flavor: "Second breakfast. Third breakfast.", emoji: "🍽️" },
    { id: "root", name: "Root and Rumble", type: "Action", flock: "Wildroost", text: "Heal 50 from a rooster.", flavor: "The ground itself helps him stand.", emoji: "🌿" },
    { id: "thorn", name: "Thorn Hedge Nest", type: "Coop", flock: "Wildroost", text: "Your Wildroost roosters get +1 to hit with attacks that cost 3 or more Grain.", flavor: "Every thorn is a cousin.", emoji: "🪺" },
    { id: "scratch", name: "Midnight Scratch", type: "Action", flock: "Duskcomb", text: "Your opponent discards a card at random.", flavor: "Your plans just fell off the table.", emoji: "🖐️" },
    { id: "hexward", name: "Hex Ward", type: "Counter", flock: "Duskcomb", text: "Play when an enemy uses a Signature move: cancel it. They don't get it back.", flavor: "Not on my watch. Not at midnight.", emoji: "🧿" },
    { id: "moonless", name: "Moonless Henhouse", type: "Coop", flock: "Duskcomb", text: "Enemy roosters get -1 to hit against your Duskcomb roosters.", flavor: "The lights never come on in here.", emoji: "🌑" },
    { id: "thanks", name: "Farmer's Thanks", type: "Action", flock: "Any", text: "Draw 3 cards.", flavor: "She baked him a pie. He cried a little.", emoji: "🥧" },
    { id: "trough", name: "Water Trough", type: "Action", flock: "Any", text: "Heal 30 from your active rooster.", flavor: "Cold, clean, and full of bugs.", emoji: "💧" },
    { id: "horseshoe", name: "Lucky Horseshoe", type: "Gear", flock: "Any", text: "Once per game, when this rooster would be knocked out, it stays at 10 HP. Discard this.", flavor: "Found it behind the barn.", emoji: "🧲" },
    { id: "dummy", name: "Training Dummy", type: "Gear", flock: "Any", text: "The rooster with this gets +1 to hit.", flavor: "Made of hay and grudges.", emoji: "🎯" },
    { id: "swap", name: "Coop Swap", type: "Action", flock: "Any", text: "Switch your active rooster with a bench rooster. Pay half its switch cost (round down).", flavor: "Tag out!", emoji: "🔁" },
    { id: "feather", name: "Lucky Feather", type: "Action", flock: "Any", text: "This turn, reroll any dice from one attack or ability.", flavor: "Plucked from a champion. He didn't notice.", emoji: "🪶" },
    { id: "scarecrow", name: "Scarecrow Decoy", type: "Counter", flock: "Any", text: "Play after an enemy hit roll: they must reroll all their hit dice.", flavor: "He's been fooling crows for years.", emoji: "🎃" },
    { id: "bell", name: "Wake-Up Bell", type: "Action", flock: "Any", text: "Move all Grain from one of your roosters to another of your roosters.", flavor: "Ding ding. Round two.", emoji: "🔔" }
  ];

  function pack(pairs) {
    var list = [];
    pairs.forEach(function (p) { list.push({ id: p[0], n: p[1] }); });
    return list;
  }

  var decks = [
    { id: "dawn", name: "Dawn Patrol", flock: "Sunfire", blurb: "Fast Sunfire hitters, with Steel Feather Hen covering Duskcomb.",
      roosters: ["blazecomb", "hothead", "steel"],
      cards: pack([["grain", 11], ["golden", 2], ["sunrise", 2], ["flame", 2], ["phoenix", 2], ["shield", 2], ["lockdown", 2], ["thanks", 2], ["trough", 2], ["dummy", 1], ["swap", 2]]) },
    { id: "night", name: "Night Forest", flock: "Duskcomb", blurb: "Nightspur plus a slow Wildroost bench that hits like a barn.",
      roosters: ["nightspur", "mama", "seed"],
      cards: pack([["grain", 12], ["golden", 2], ["frenzy", 2], ["root", 2], ["thorn", 1], ["scratch", 2], ["hexward", 2], ["moonless", 1], ["horseshoe", 2], ["feather", 2], ["bell", 2]]) },
    { id: "sunfire", name: "Sunfire Roost", flock: "Sunfire", blurb: "Three Sunfire roosters. Big hits, burns, and extra dice.",
      roosters: ["blazecomb", "hothead", "molten"],
      cards: pack([["grain", 12], ["golden", 2], ["sunrise", 2], ["flame", 2], ["phoenix", 2], ["thanks", 2], ["trough", 2], ["dummy", 2], ["swap", 2], ["feather", 2]]) },
    { id: "ironbeak", name: "Ironbeak Wall", flock: "Ironbeak", blurb: "Three Ironbeak roosters. Armor, healing, and a locked gate.",
      roosters: ["grizzle", "steel", "fence"],
      cards: pack([["grain", 12], ["golden", 2], ["lockdown", 2], ["shield", 2], ["ironroost", 2], ["thanks", 2], ["trough", 2], ["horseshoe", 2], ["dummy", 2], ["swap", 2]]) },
    { id: "storm", name: "Stormfeather Skies", flock: "Stormfeather", blurb: "Three Stormfeather roosters. Free switches, rerolls, and counters.",
      roosters: ["zephra", "cloud", "pullet"],
      cards: pack([["grain", 12], ["golden", 2], ["squawk", 2], ["gust", 2], ["stormloft", 2], ["thanks", 2], ["feather", 2], ["scarecrow", 2], ["swap", 2], ["dummy", 2]]) },
    { id: "wild", name: "Wildroost Thicket", flock: "Wildroost", blurb: "Three Wildroost roosters. Pile up Grain, then stomp.",
      roosters: ["mama", "charger", "seed"],
      cards: pack([["grain", 14], ["golden", 2], ["frenzy", 2], ["root", 2], ["thorn", 2], ["thanks", 2], ["bell", 2], ["trough", 2], ["horseshoe", 2]]) },
    { id: "dusk", name: "Duskcomb Midnight", flock: "Duskcomb", blurb: "Three Duskcomb roosters. Discard, hexes, and a rooster who gets back up.",
      roosters: ["nightspur", "grave", "bantam"],
      cards: pack([["grain", 12], ["golden", 2], ["scratch", 2], ["hexward", 2], ["moonless", 2], ["thanks", 2], ["horseshoe", 2], ["scarecrow", 2], ["feather", 2], ["dummy", 2]]) }
  ];

  var roosterById = {};
  roosters.forEach(function (r) { roosterById[r.id] = r; });
  var supportById = {};
  supports.forEach(function (s) { supportById[s.id] = s; });

  return { roosters: roosters, supports: supports, decks: decks, roosterById: roosterById, supportById: supportById };
});
