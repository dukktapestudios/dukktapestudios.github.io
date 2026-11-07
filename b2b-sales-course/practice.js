(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.B2BPractice = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var quizzes = [
    { q: "What does booked revenue mean in this course?", options: ["Any meeting a buyer accepted", "Pipeline you feel good about", "A sale the company counts after its own rules, usually a signed order", "OTE divided by quota"], correct: 2, why: "Pipeline and feelings are not booked. A signature your company recognizes is the teaching bar." },
    { q: "Harbor's implementation fee belongs in which bucket?", options: ["ARR and ACV", "A one-time fee, separate from ARR", "MRR times 12 plus the fee", "Commission"], correct: 1, why: "Implementation does not renew. Putting it in ARR inflates the forecast." },
    { q: "A buyer says 'do not email me again.' What is the course standard?", options: ["Stop, log the channel and date, and do not hand them to a teammate", "Send one breakup note that restates the value", "Wait 10 business days, then try the phone", "Ask them to explain the objection first"], correct: 0, why: "Stop means stop. The legal clock is an outside limit, not a suggestion to squeeze in another pitch." },
    { q: "Which Calder number is safe to multiply into a payback before finance confirms it?", options: ["The entire $9,000 expedite figure", "None of the unverified cash lines", "600 exceptions times a planner salary", "A 70 percent adoption guess"], correct: 1, why: "Unverified cash stays in the assumption box. Adoption scales hours, and only when you label it as an assumption." },
    { q: "Riley likes a demo and will not introduce finance. Riley is a:", options: ["Confirmed champion", "Economic buyer", "Interested user, champion test failed so far", "Procurement owner"], correct: 2, why: "A champion spends access. Refusing the introduction is a failed test, not a small delay." },
    { q: "CAN-SPAM, as taught here, applies to:", options: ["Only email to personal Gmail accounts", "Only email over 500 recipients a day", "LinkedIn messages and nothing else", "Commercial email, including product email sent to a business address"], correct: 3, why: "A business inbox is not an exemption. LinkedIn has its own rules and is not the statute." },
    { q: "The National Do Not Call Registry FAQ, in the course's reading, says business-to-business calling:", options: ["Makes every mobile dial legal", "May be part of a registry exemption you judge with counsel, not a blanket pass", "Does not exist as a topic", "Replaces the need for an opt-out on email"], correct: 1, why: "The registry page lists B2B among possible exemptions and tells you the decision is a legal one. It does not bless every call." },
    { q: "A good 'send me info' reply does what?", options: ["Attaches the full deck and a meeting invite", "Asks what decision the page would feed, and can end in a stop", "Promises a case study from Harbor", "Offers a Friday discount"], correct: 1, why: "Information without a decision is a way to end the conversation politely or to send one specific page." },
    { q: "Who may sign the Harbor contract in this exercise?", options: ["You, once the math works", "Jordan, because Jordan feels the pain", "The bookkeeper", "Pat, on the buyer side, and only an authorized seller on the other side"], correct: 3, why: "Pain is not signature authority. You are not the authorized seller in this course." },
    { q: "Capacity dollars are:", options: ["Added to cash benefit", "Hours times a wage, shown separately, not cash unless a hire or overtime actually changes", "Always the payback numerator", "ARR"], correct: 1, why: "Freed time is capacity. Cash is overtime stopped, a hire cancelled, a tool cancelled, or non-labor fees." },
    { q: "A demo agenda should start from:", options: ["The longest feature list", "Buyer lines they already confirmed", "A competitor's screenshot", "The security certification"], correct: 1, why: "Unconfirmed features and missing certifications stay off the screen." },
    { q: "Closed-lost can be a passing capstone when:", options: ["The verified cash no longer covers the price and you logged the reason", "You hid the loss", "The buyer ghosted and you left the stage at commit", "You need the ARR to hit a practice quota"], correct: 0, why: "An honest stop is competence. Padding the forecast is not." }
  ];

  function node(say, choices, model) {
    var item = { say: say };
    if (choices) item.choices = choices;
    if (model) item.model = model;
    return item;
  }
  function choice(label, to) { return { label: label, to: to }; }

  var roleplays = [
    {
      id: "open",
      title: "Harbor opener",
      setup: "You are practicing aloud. Jordan answers. Nothing is dialed.",
      start: "a",
      nodes: {
        a: node("Jordan: Harbor and Pine, this is Jordan.", [
          choice("Pretend you are returning their call.", "badopen"),
          choice("Name yourself, name the sales purpose, and offer a no.", "goodopen"),
          choice("Open with a customer result you do not have.", "fake")
        ]),
        badopen: node("Jordan: I didn't call you. What is this?", null, "The fake callback burned the first five seconds. Restart. Say who you are and that they did not ask for the call."),
        fake: node("Jordan: Which customer? I want the name.", null, "You have no approved story. Harbor itself is not a reference. Stop the claim and restart with a question."),
        goodopen: node("Jordan: Okay. What do you want?", [
          choice("Ask for 20 minutes tomorrow at a time you picked.", "push"),
          choice("Ask whether afternoon ship-date rework is even true, and accept no.", "fit")
        ]),
        push: node("Jordan: You don't know my week. Send nothing.", null, "You spent the permission before you earned a problem. The better branch asks a sourced question and keeps the no."),
        fit: node("Jordan: It's true, and I'm busy. A short call next week is possible if you don't bring a slide circus.", null, "Model: book only what they offered, restate the single topic, and put a date in the note. Do not attach a deck.")
      }
    },
    {
      id: "stop",
      title: "They tell you to stop",
      setup: "Email practice. Jordan replies to a draft that was never actually sent.",
      start: "a",
      nodes: {
        a: node("Jordan: Please don't email me again.", [
          choice("Send a short breakup that restates the freight savings.", "bump"),
          choice("Confirm you will stop, and write the CRM line.", "stop"),
          choice("Call the bookkeeper instead.", "around")
        ]),
        bump: node("Jordan does not reply. Your teammate later asks why the domain blocked you.", null, "A value restatement after stop is still a commercial email. Critical fail."),
        around: node("The bookkeeper forwards your note to Jordan with the words 'they went around you.'", null, "A new person at the same request is still ignoring the instruction. Critical fail."),
        stop: node("Your note is the only thing you send, and it says you will not write again.", null, "Model CRM line: 'Opt-out, email, date, do not contact Harbor & Pine from this sequence.' Tell the AE the same sentence.")
      }
    },
    {
      id: "info",
      title: "Send me some info",
      setup: "Morgan at Calder procurement is polite and noncommittal.",
      start: "a",
      nodes: {
        a: node("Morgan: Send me some info.", [
          choice("Send the full deck and a calendar hold.", "dump"),
          choice("Ask what decision the info would feed.", "ask"),
          choice("Promise Harbor as a case study.", "lie")
        ]),
        dump: node("Morgan's auto-reply files the deck. No decision appears.", null, "A deck without a decision is a closed file you mistook for progress."),
        lie: node("Morgan: Send the reference's phone number.", null, "There is no reference. Inventing one is a critical fail."),
        ask: node("Morgan: I only need to know if this replaces HelioWorks.", [
          choice("Say it might, if they want it to.", "waffle"),
          choice("Say it does not replace HelioWorks, and offer to stop.", "clear")
        ]),
        waffle: node("Morgan: Then I don't know what you sell.", null, "You blurred a product limit. The clear branch is the pass."),
        clear: node("Morgan: Thank you. We don't need a second ERP conversation.", null, "Model: log no-go, reason 'asked for a full ERP replacement,' no next step. Disqualification is a pass.")
      }
    },
    {
      id: "budget",
      title: "The price does not fit the cash",
      setup: "Pat has seen the Harbor math.",
      start: "a",
      nodes: {
        a: node("Pat: $1,500 a month is more than the $700 you say we would net.", [
          choice("Explain that productivity makes up the rest.", "stack"),
          choice("Agree the gap is real and ask what verified cash you may use.", "gap"),
          choice("Offer $1,000 a month on your own authority.", "gift")
        ]),
        stack: node("Pat: So the $700 wasn't real.", null, "You treated capacity as cash after showing a cash gap. Trust drops."),
        gift: node("Pat: Email that price so I can hold you to it.", null, "You are not authorized. A gift discount with nothing in return is a failed log."),
        gap: node("Pat: The overtime is real. The courier number was a guess.", [
          choice("Drop the courier from the case and recompute before you speak.", "recompute"),
          choice("Keep the courier because the story needs it.", "keep")
        ]),
        keep: node("Pat: You're keeping a number I just took back.", null, "A withdrawn fact is not a fact. Recompute."),
        recompute: node("You remove $400. Net cash becomes $300 on a $1,500 subscription. Payback is blank.", null, "Model: say the subscription is not covered, offer a smaller scope only if someone authorized can discuss it, or stop. Do not invent a new savings line.")
      }
    },
    {
      id: "status",
      title: "The spreadsheet is fine",
      setup: "Chris at the plant is loyal to the current workaround.",
      start: "a",
      nodes: {
        a: node("Chris: The spreadsheet works if people just fill it in.", [
          choice("Tell Chris the spreadsheet is the reason freight is high.", "blame"),
          choice("Ask what breaks on the day the spreadsheet is right and the ship date is still wrong.", "break"),
          choice("Skip Chris and demo Avery.", "skip")
        ]),
        blame: node("Chris ends the call.", null, "You insulted the tool they use to survive the week. Status quo replies start with their sentence."),
        skip: node("Avery asks whether the plant will use it. You say you have not asked.", null, "You single-threaded upward. The plant can still kill adoption."),
        break: node("Chris: The date in HelioWorks doesn't change when the yard is short, so we call.", [
          choice("Ask to show every module.", "dump"),
          choice("Offer to show only the promise flipping when stock changes, and invite Samir if data moves.", "narrow")
        ]),
        dump: node("Chris: I don't have an hour.", null, "The narrow branch matches the demo lesson."),
        narrow: node("Chris: Twenty minutes, and security if you're reading our orders.", null, "Model: agenda of two behaviors, limit spoken, Samir on the invite before data moves.")
      }
    },
    {
      id: "discount",
      title: "A discount you cannot approve",
      setup: "Avery asks for a lower enterprise price. Your fictional manager is the only approver, and you have not asked.",
      start: "a",
      nodes: {
        a: node("Avery: Come back at $6,000 a month or we're done.", [
          choice("Say the price dies Friday if they wait.", "fake"),
          choice("Say you cannot approve it, and ask what Avery will trade.", "trade"),
          choice("Agree, then tell your manager later.", "yes")
        ]),
        fake: node("Avery: Who set Friday?", null, "You invented scarcity. Critical fail. There is no such rule in the pack."),
        yes: node("Your manager rejects the price. Avery has your email.", null, "You committed the company without authority."),
        trade: node("Avery: I'll put Samir and Morgan on one call if the price can at least be discussed.", [
          choice("Promise the $6,000 price because the access is good.", "overpay"),
          choice("Take the access as the get, and take the price request upstairs without agreeing.", "log")
        ]),
        overpay: node("You still do not have approval. Access does not mint authority.", null, "Log the request. Do not agree on the call."),
        log: node("Avery accepts a meeting with no price change yet.", null, "Model log: asked $6,000, gave nothing, got a dated meeting with security and procurement, approver still blank.")
      }
    },
    {
      id: "champion",
      title: "Is Riley a champion?",
      setup: "After a good discovery, you test Riley.",
      start: "a",
      nodes: {
        a: node("You ask Riley to include Avery before any payback slide.", [
          choice("If Riley hesitates, fill the slide anyway.", "slide"),
          choice("Treat hesitation as a failed test and keep the stage at working.", "hold"),
          choice("Tell Riley champions always do this, so they should comply.", "label")
        ]),
        slide: node("Avery sees numbers Riley did not bless.", null, "You went around the test. The map lesson says not to sneak."),
        label: node("Riley: Don't coach me with your sales word.", null, "MEDDICC stays in your notes. The ask has to be about their risk, not your checklist."),
        hold: node("Riley: Give me until Tuesday to ask the analyst first.", [
          choice("Forecast the subscription because Tuesday exists.", "forecast"),
          choice("Put Tuesday on the plan and forecast $0 ARR.", "zero")
        ]),
        forecast: node("Tuesday slips. Your forecast is now a story.", null, "A date on an analyst question is not booked revenue."),
        zero: node("The CRM shows a dated next step and zero forecasted ARR.", null, "Model: possible champion, untested until the analyst path happens. Forecast stays at zero while the proposal is only a count.")
      }
    },
    {
      id: "record",
      title: "They ask you to record the call",
      setup: "Chris asks if the demo will be recorded.",
      start: "a",
      nodes: {
        a: node("Chris: Are you recording?", [
          choice("Say it's fine because this is B2B.", "exempt"),
          choice("Stop, say you are not recording, and that you would need everyone and your own counsel before you did.", "ask"),
          choice("Keep a quiet recording for your notes.", "secret")
        ]),
        exempt: node("Chris: That is not a policy.", null, "There is no blanket B2B recording exemption in this course. State law depends on where people are."),
        secret: node("The trust is gone if they notice.", null, "A secret recording is a critical fail."),
        ask: node("Chris: Good. Don't.", null, "Model: do not record. Take notes. If a real job wants recordings, counsel writes the rule and the words you say at the start of the call.")
      }
    }
  ];

  var drills = [
    { id: "d-budget", prompt: "Pat: We don't have budget this year.", weak: "Every customer finds budget when the ROI is 10x.", stronger: "If this year's cash is closed, the honest move is to stop or to ask what would have to be true next year. I won't invent a 10x." },
    { id: "d-competitor", prompt: "Morgan: HelioWorks said they can do this too.", weak: "They're terrible and late on every release.", stronger: "Ask Morgan which promise-date behavior is actually on the list, and include do-nothing. Do not insult a vendor you have not been asked to assess in writing." },
    { id: "d-timing", prompt: "Riley: Call me next quarter.", weak: "I'll put a hold on your calendar for the first Monday.", stronger: "Ask what changes next quarter. If the answer is 'nothing, I'm busy,' offer to close the file. If there is a real event, put that event's date in the note and no forecast." },
    { id: "d-info", prompt: "Dana: Send the contract.", weak: "I'll send our paper and assume legal will sign the standard version.", stronger: "Ask which issues Dana needs to see first, and do not call the paper standard. You are not authorized to sign it in this exercise." },
    { id: "d-security", prompt: "Samir: Are you SOC 2?", weak: "Yes, enterprise vendors always are.", stronger: "The fact pack has no report. Say you don't have it in front of you and you will not guess. Offer to bring the person who would know, or stop the data path." },
    { id: "d-no", prompt: "Jordan: Not interested.", weak: "I only need thirty seconds of why.", stronger: "Thank them and stop. One sentence. No new reason to stay on the line." }
  ];

  var scorecard = [
    "Buyer spoke about as often as the seller.",
    "At least one follow-up used the buyer's last noun.",
    "A number was either confirmed or marked untrusted.",
    "Cash, time, and risk were not mashed into one total.",
    "A person who can block the deal was named.",
    "The last step has an owner and a date, or the call stopped cleanly.",
    "No feature appeared before the buyer asked to see something.",
    "No unsourced customer story appeared."
  ];

  var criticalFails = [
    "I would keep contacting someone after they said stop.",
    "I would invent a customer result, a certification, or a quote.",
    "I would book verbal interest as closed revenue.",
    "I would promise a price or a deadline I am not allowed to promise.",
    "I would record a person without a clear yes.",
    "I would put unverified freight or capacity dollars into cash savings."
  ];

  return { quizzes: quizzes, roleplays: roleplays, drills: drills, scorecard: scorecard, criticalFails: criticalFails };
});
