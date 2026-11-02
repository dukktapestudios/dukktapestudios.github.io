/* Stories page lists. Edit this file to add a concept or a book.
   The page reads window.DUKKTAPE_STORIES. */
(function () {
  window.DUKKTAPE_STORIES = {
    /* Shown when the bookshelf has no finished books yet. */
    placeholderNote: "Coming soon — I'll add my books here as I finish them.",

    /*
      Idea bank.

      Add a concept by appending ONE object to concepts:
        { title: "Short title", notes: "The idea, in your words." }

      Leave notes as an empty string to show "Notes coming soon."
      Write only what you already know. Do not pad a card with plot you have not decided.
    */
    concepts: [
      { title: "Null protagonist book", notes: "" },
      { title: "BPD emotion-entity character", notes: "" },
      { title: "Crystal computer idea", notes: "" },
      {
        title: "The Astronaut's Ghost",
        notes: "A ghost or demon attaches to a person to haunt them, but the person is an astronaut, so the entity gets taken to space. It starts ominous, but the entity is terrified and confused in space, and ends up as a great lab assistant helping with experiments and helping the crew get back to Earth out of sheer fear."
      }
    ],

    /*
      Bookshelf.

      Add a finished book by appending ONE object to books. Each object becomes
      a spine. Clicking the spine shows the description, plus a download link
      when pdf is set.

        title        required   text painted on the spine
        description  required   shown when that spine is clicked
        pdf          optional   path or URL, for example "pdfs/my-book.pdf"
        spine        optional   CSS color for the spine, for example "#6b2d3c"

      Example:
        {
          title: "My Novel",
          description: "One or two sentences about the book.",
          pdf: "pdfs/my-novel.pdf",
          spine: "#6b2d3c"
        }

      Leave books as an empty array and the shelf keeps a single placeholder
      spine. Clicking it shows placeholderNote above.
      The Hero's Journey worksheet PDF lives in the Hero's Journey section,
      not on this shelf.
    */
    books: [],

    beats: [
      {
        name: "Ordinary World",
        meaning: "The hero's stuck, restless life before anything big happens.",
        starWars: "Luke is a farm kid on Tatooine, bored and itching to leave.",
        harryPotter: "Harry lives in a cupboard under the stairs, treated as nobody."
      },
      {
        name: "Call to Adventure",
        meaning: "The invite, letter, message, or event that says \"your old life is over.\"",
        starWars: "The droids show up with Leia's plea for help.",
        harryPotter: "Hogwarts letters that will not stop coming."
      },
      {
        name: "Refusal of the Call",
        meaning: "They flinch. Fear, duty, or someone else tries to keep them small.",
        starWars: "Luke says he can't leave the farm.",
        harryPotter: "The Dursleys hide the letters; Harry can barely believe any of it."
      },
      {
        name: "Meeting the Mentor",
        meaning: "Someone who knows the bigger world and hands over the first tool or truth.",
        starWars: "Obi-Wan. Lightsaber, the Force, the truth about Luke's father (as Luke first hears it).",
        harryPotter: "Hagrid at the hut, then Dumbledore as the longer guide."
      },
      {
        name: "Crossing the Threshold",
        meaning: "They leave home for real. No going back to the old normal.",
        starWars: "Luke leaves Tatooine. Mos Eisley is the doorway.",
        harryPotter: "Platform 9¾, then Hogwarts."
      },
      {
        name: "Tests, Allies, Enemies",
        meaning: "New rules. Friends, rivals, small fights. The hero learns how this world works.",
        starWars: "Han and Leia, the Falcon, stormtroopers, the shadow of Vader.",
        harryPotter: "Ron and Hermione, Draco, classes, the first real threats."
      },
      {
        name: "Approach to the Inmost Cave",
        meaning: "They head toward the true stronghold, secret, or dangerous place. Tension tightens.",
        starWars: "Getting onto the Death Star. The rescue is a trap inside the enemy's house.",
        harryPotter: "The trapdoor, the trials under the school, moving toward the Stone."
      },
      {
        name: "Ordeal",
        meaning: "The near-death. Something beloved is lost. The old self dies so a new one can start.",
        starWars: "Obi-Wan is killed. Luke has to step up without his guide.",
        harryPotter: "Facing the thing that killed his parents (this first book: the man with the Stone)."
      },
      {
        name: "Reward",
        meaning: "They come out with a prize: an object, a truth, a new identity, a win.",
        starWars: "The princess is free, the plans matter, Luke is no longer just a farm kid.",
        harryPotter: "The Stone is safe. Harry has a place, friends, a world that wants him."
      },
      {
        name: "The Road Back",
        meaning: "The fight isn't over. They turn toward home or the last battle, with the prize in hand.",
        starWars: "The Empire still has a battle station. The trench run is still ahead.",
        harryPotter: "The year ends. He has to go back to Privet Drive. The war is not done."
      },
      {
        name: "Resurrection",
        meaning: "The biggest test. They use the lesson, not just the weapon. Almost lose everything.",
        starWars: "Luke turns off the targeting computer and trusts the Force. The Death Star dies.",
        harryPotter: "The last confrontation over the Stone. Love, not power, is what saves him."
      },
      {
        name: "Return with the Elixir",
        meaning: "They bring something back that changes the ordinary world (hope, belonging, a gift, a truth).",
        starWars: "The medal ceremony. The farm boy is a hero. The Rebellion has a chance.",
        harryPotter: "He belongs. He takes that self home, even if the cupboard street hasn't changed."
      }
    ],

    blankTemplate: [
      "Hero's Journey book template",
      "Dukktape Studios",
      "",
      "Fill the blanks. One sentence is enough. Star Wars and Harry Potter are only the shape, not the plot to copy.",
      "",
      "When a line is done, tell the Book bot. It will keep this outline and help you write the next beat.",
      "",
      "You don't need it perfect to start.",
      "",
      "------------------------------------------------------------",
      "THE BOOK IN ONE LOOK",
      "------------------------------------------------------------",
      "",
      "Working title:",
      "",
      "Genre (fantasy, thriller, memoir-shaped fiction, etc.):",
      "",
      "Who it's for:",
      "",
      "One-sentence pitch (When ______ happens, ______ must ______ or else ______.):",
      "",
      "Theme (what the hero has to learn, not what happens):",
      "",
      "------------------------------------------------------------",
      "THE PEOPLE",
      "------------------------------------------------------------",
      "",
      "Hero",
      "Name / age:",
      "Ordinary life (before the story starts):",
      "What they WANT (surface goal):",
      "What they NEED (the real lesson):",
      "Flaw or wound that gets in the way:",
      "",
      "Mentor (Obi-Wan / Hagrid-then-Dumbledore type):",
      "",
      "Villain or opposing force (Vader-Empire / Voldemort):",
      "",
      "Ally (Han-Leia / Ron-Hermione):",
      "",
      "First obstacle (the thing or person that blocks leaving the old life):",
      "",
      "------------------------------------------------------------",
      "THE 12 BEATS",
      "------------------------------------------------------------",
      "",
      "For each beat: read the two examples, then write YOUR version on \"My story.\"",
      "",
      "1. Ordinary World",
      "The hero's stuck, restless life before anything big happens.",
      "- Star Wars: Luke is a farm kid on Tatooine, bored and itching to leave.",
      "- Harry Potter: Harry lives in a cupboard under the stairs, treated as nobody.",
      "- My story:",
      "",
      "2. Call to Adventure",
      "The invite, letter, message, or event that says \"your old life is over.\"",
      "- Star Wars: The droids show up with Leia's plea for help.",
      "- Harry Potter: Hogwarts letters that will not stop coming.",
      "- My story:",
      "",
      "3. Refusal of the Call",
      "They flinch. Fear, duty, or someone else tries to keep them small.",
      "- Star Wars: Luke says he can't leave the farm.",
      "- Harry Potter: The Dursleys hide the letters; Harry can barely believe any of it.",
      "- My story:",
      "",
      "4. Meeting the Mentor",
      "Someone who knows the bigger world and hands over the first tool or truth.",
      "- Star Wars: Obi-Wan. Lightsaber, the Force, the truth about Luke's father (as Luke first hears it).",
      "- Harry Potter: Hagrid at the hut, then Dumbledore as the longer guide.",
      "- My story:",
      "",
      "5. Crossing the Threshold",
      "They leave home for real. No going back to the old normal.",
      "- Star Wars: Luke leaves Tatooine. Mos Eisley is the doorway.",
      "- Harry Potter: Platform 9¾, then Hogwarts.",
      "- My story:",
      "",
      "6. Tests, Allies, Enemies",
      "New rules. Friends, rivals, small fights. The hero learns how this world works.",
      "- Star Wars: Han and Leia, the Falcon, stormtroopers, the shadow of Vader.",
      "- Harry Potter: Ron and Hermione, Draco, classes, the first real threats.",
      "- My story:",
      "",
      "7. Approach to the Inmost Cave",
      "They head toward the true stronghold, secret, or dangerous place. Tension tightens.",
      "- Star Wars: Getting onto the Death Star. The rescue is a trap inside the enemy's house.",
      "- Harry Potter: The trapdoor, the trials under the school, moving toward the Stone.",
      "- My story:",
      "",
      "8. Ordeal",
      "The near-death. Something beloved is lost. The old self dies so a new one can start.",
      "- Star Wars: Obi-Wan is killed. Luke has to step up without his guide.",
      "- Harry Potter: Facing the thing that killed his parents (this first book: the man with the Stone).",
      "- My story:",
      "",
      "9. Reward",
      "They come out with a prize: an object, a truth, a new identity, a win.",
      "- Star Wars: The princess is free, the plans matter, Luke is no longer just a farm kid.",
      "- Harry Potter: The Stone is safe. Harry has a place, friends, a world that wants him.",
      "- My story:",
      "",
      "10. The Road Back",
      "The fight isn't over. They turn toward home or the last battle, with the prize in hand.",
      "- Star Wars: The Empire still has a battle station. The trench run is still ahead.",
      "- Harry Potter: The year ends. He has to go back to Privet Drive. The war is not done.",
      "- My story:",
      "",
      "11. Resurrection",
      "The biggest test. They use the lesson, not just the weapon. Almost lose everything.",
      "- Star Wars: Luke turns off the targeting computer and trusts the Force. The Death Star dies.",
      "- Harry Potter: The last confrontation over the Stone. Love, not power, is what saves him.",
      "- My story:",
      "",
      "12. Return with the Elixir",
      "They bring something back that changes the ordinary world (hope, belonging, a gift, a truth).",
      "- Star Wars: The medal ceremony. The farm boy is a hero. The Rebellion has a chance.",
      "- Harry Potter: He belongs. He takes that self home, even if the cupboard street hasn't changed.",
      "- My story:",
      "",
      "------------------------------------------------------------",
      "CHAPTER MAP (fill after the beats)",
      "------------------------------------------------------------",
      "",
      "Match chapters to beats. Split a beat across two chapters if you need to. Skip a number if two beats live in one chapter.",
      "",
      "Ch 1 (Ordinary World):",
      "Ch 2 (Call):",
      "Ch 3 (Refusal):",
      "Ch 4 (Mentor):",
      "Ch 5 (Threshold):",
      "Ch 6 (Tests / allies / enemies):",
      "Ch 7 (Approach):",
      "Ch 8 (Ordeal):",
      "Ch 9 (Reward):",
      "Ch 10 (Road back):",
      "Ch 11 (Resurrection):",
      "Ch 12 (Return):",
      "",
      "------------------------------------------------------------",
      "FIRST PAGE (optional, when you're ready)",
      "------------------------------------------------------------",
      "",
      "Opening image (what we see before anyone talks):",
      "",
      "First line I might use:",
      "",
      "What I want the reader to feel:",
      "",
      "------------------------------------------------------------",
      "HOW TO USE THIS",
      "------------------------------------------------------------",
      "",
      "1. Fill \"The book in one look\" and \"The people\" first.",
      "2. Fill beats 1 to 5 before you write chapter 1.",
      "3. Bring each filled beat to the Book bot and ask it to turn that beat into a scene list or a draft chapter.",
      "4. Do not copy Star Wars or Harry Potter. Steal the spine, invent your world.",
      ""
    ].join("\n")
  };
})();
