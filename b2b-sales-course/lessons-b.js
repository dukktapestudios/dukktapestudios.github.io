(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.B2BLessonsB = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return [
    {
      id: "no",
      title: "No, stop, and the polite disqualification",
      minutes: 40,
      prereq: "Lesson 8.",
      objective: "End a conversation cleanly when the buyer is unfit, uninterested, or opted out, and log it so nobody on your team calls them again by accident.",
      concept: [
        "A no is data. An opt-out is an instruction. A disqualification is a decision you make when the problem is not one Northline can honestly serve. All three should shrink your list, not bruise your ego.",
        "If someone says stop, do not ask 'just one more question.' The CAN-SPAM teaching point is that a commercial email opt-out gets honored, and the statute's outside clock is 10 business days. Your personal standard in this course is faster: you stop the practice sequence the moment they say stop, and you write the date. On a real team you follow the company's suppression list the same day, and you still meet the legal clock. You do not sell the list of people who opted out.",
        "Phone and text refusals are the same kind of instruction even when a registry question is complicated. 'Please don't call this number' means you do not call that number. You do not switch to text to 'be lighter.' You do not ask a colleague to try from their phone.",
        "Disqualification sounds like respect. 'You want a full ERP replaced in a month. We do not do that, so I should not take a meeting.' Then stop pitching. Offer to end the call. If they ask for a name of someone who does replace ERPs, say you will not invent one.",
        "Log the reason in words a teammate can obey: 'Opt-out by email 2026-04-02, do not contact.' 'No-go, wants an on-time delivery guarantee.' 'Not now, said to try again next April, and only by email.' A smiley face is not a log."
      ],
      steps: [
        "Write three endings: not interested, opt-out, and no-go. Each ending is two sentences and does not add a new pitch.",
        "For the opt-out, write the CRM line a stranger could follow six months later.",
        "Practice the not-interested ending out loud without explaining your product again.",
        "Take a buyer who is fit but busy. Offer one specific later time and also offer to close the file. Both choices are honorable.",
        "Review a bad sequence that 'bumps' five times after a stop. Mark it as a critical fail, not as persistence."
      ],
      example: [
        "Jordan: 'We're fine, please don't email me.' You: 'Understood. I will not email you again at this address. I'll mark the note so my teammates don't either.' Then you stop. You do not send the 'breakup email' that is still a pitch.",
        "A buyer wants a guarantee of zero late shipments. You: 'We can't sign that, and I don't want to pretend a demo will change it. I should let you go.' That is a win. The meeting you did not book is clean pipeline."
      ],
      bad: "No problem, I'll try you next quarter anyway, and I'll loop in my colleague so you hear a different voice.",
      good: "You asked me to stop. I stopped. The note says do not contact, with the date and the channel.",
      why: "Working around a no is how sales teams get reported, blocked, and distrusted. Persistence is for unanswered questions, not for overridden refusals.",
      assignment: "Write the three endings for Harbor and the CRM lines. Then write what you would tell an AE who asks you to 'take one more run' at Jordan after the opt-out.",
      sample: [
        "I would tell the AE: Jordan opted out on this date. I will not call or email. If you have a separate, prior relationship Jordan asked for, that is your note to document. My sequence is closed."
      ],
      pass: [
        "The opt-out ending contains no new benefit statement.",
        "The CRM line names the channel and the date.",
        "The reply to the AE refuses the extra run."
      ]
    },
    {
      id: "discovery",
      title: "A discovery call that earns a number",
      minutes: 75,
      prereq: "Lessons 3, 7, and 9.",
      objective: "Run a 15-to-20-turn discovery that follows the buyer's words, confirms a number the buyer owns, and leaves with a dated next step or a clean stop.",
      concept: [
        "Discovery is a conversation that turns a slogan into a cost the buyer recognizes. You listen, you repeat what you heard, you ask what it costs, and you ask how they know. You do not arrive with Northline's slides.",
        "A useful call is about 25 minutes in this exercise. The transcript below is 18 turns. Count a turn as one person's speak. The shape is: open, their words for the pain, a number, who else feels it, what they have tried, what a pilot would have to prove, and a next step with a date. If the number is the seller's number, it does not count.",
        "Follow-ups sound small. 'When you say the afternoon is gone, gone for whom?' 'Is the $9,000 freight number all bad promises, or is some of it the carrier?' The second question protects you from the double count in the business-case lesson.",
        "Impact has three buckets. Cash that leaves the account, time that is payroll whether or not you buy software, and risk the buyer can describe but not yet price. Label the bucket. Do not add them into one 'ROI' because they are different substances.",
        "End with a sentence the buyer can correct. 'What I heard is 600 exceptions, you are not sure which plant, and you will check with finance before anyone builds a payback. Did I miss?' If they correct you, write the correction. That correction is the point."
      ],
      steps: [
        "Write a six-question spine. At least four questions cannot be answered from the pack. Those are the ones you ask.",
        "Read the 18-turn transcript. Mark each seller turn as open, follow-up, number, people, or close.",
        "Circle any seller turn that mentions a feature. You should find almost none. That is the standard.",
        "Replace one weak question with a follow-up that uses the buyer's last noun.",
        "Score the transcript with the discovery scorecard. Do not give full points for a number the seller suggested and the buyer only grunted at."
      ],
      dialogue: [
        ["Alex", "Riley, I have 25 minutes and a stopwatch. I sell Northline Ledger. I want to learn whether ship-date exceptions are actually expensive at Calder, and no is a fine outcome. Where should we start?"],
        ["Riley", "Start with the spreadsheet. Planners don't trust the ship date by Wednesday."],
        ["Alex", "When you say they don't trust it, what do they do instead?"],
        ["Riley", "They call the plant. Chris Alvarez's team gets a lot of those calls."],
        ["Alex", "So the date in HelioWorks stays on the screen, and a phone call decides what is real. How often is that call happening?"],
        ["Riley", "The last ops review said about 600 exception lines a month. I didn't audit the sheet myself."],
        ["Alex", "Thank you for the caveat. If you haven't audited it, I won't treat 600 as finance-grade. Which plant shows up most in that review, if one does?"],
        ["Riley", "Chris's plant. The other three are quieter, or they're quieter on that report."],
        ["Alex", "What does one exception cost on a bad day? I'm not looking for a perfect number. I'm looking for the bucket: extra hours, extra freight, or a customer credit."],
        ["Riley", "Freight. Finance waved around nine thousand a month in expedites. I don't know how much was our promise versus the carrier."],
        ["Alex", "That split matters. If I put all nine thousand on a slide, I'd be guessing. Would Avery know the split, or would someone on Avery's team?"],
        ["Riley", "Avery's analyst. I can ask. I don't want you emailing Avery cold."],
        ["Alex", "I won't. If you ask, what question will you use?"],
        ["Riley", "How much of last quarter's expedites were because we promised a date we didn't have."],
        ["Alex", "If that answer comes back 'we don't track it,' what should we do with a business case?"],
        ["Riley", "Then we shouldn't invent one. Maybe a four-week count at Chris's plant."],
        ["Alex", "A four-week count at one plant, with a question Avery's analyst already recognizes. Should Samir hear about a count that reads order data before it starts?"],
        ["Riley", "Yes. If data moves, Samir is in the room. Don't surprise security."]
      ],
      example: [
        "The transcript is the worked example. Notice Alex repeats the caveat about the unaudited 600. Notice the freight figure stays split. Notice the next step is Riley's question to an analyst, plus a warning about security, not a demo date. A demo before the split would be a feature tour in search of a problem.",
        "A 19th turn you may add in practice: Alex asks when Riley will have the analyst's answer, and they pick a date. Without that date the call is a nice chat. Add it in your assignment."
      ],
      bad: "Six hundred exceptions times a planner's salary times twelve is your ROI, and I can show you the dashboard that fixes it.",
      good: "You said 600 and you also said you have not audited it. I will not multiply it. The next proof is the analyst's split, on a date you pick.",
      why: "The bad line steals the buyer's number, upgrades its confidence, and jumps to a product. That is how sellers get thrown out of second meetings.",
      assignment: "Add turns 19 and 20 in which a date is set and Alex restates the plan in one sentence Riley can edit. Then score the full dialogue on the scorecard. Write one question you almost asked that would have been a pitch, and why you cut it.",
      sample: [
        "Turn 19, Alex: 'What day will you know whether the analyst can split last quarter?' Riley: 'Next Tuesday.' Turn 20, Alex: 'Tuesday we learn if the freight split exists. If it does not, we talk about a four-week count at Chris's plant and Samir is invited before any data moves. Did I miss?'",
        "Cut question: 'Want to see how Northline flags the double book?' It is a demo ask. The buyer has not asked to see anything. The cost is still unaudited."
      ],
      pass: [
        "At least 15 turns are present when yours are added, and the buyer speaks roughly half of them.",
        "A number the buyer did not fully trust is not multiplied.",
        "The last turn has an owner and a date.",
        "Security is not skipped once data movement is mentioned."
      ]
    },
    {
      id: "qualify",
      title: "Qualification without an interrogation",
      minutes: 45,
      prereq: "Lesson 10.",
      objective: "Use MEDDICC and BANT as checklists after a conversation, not as a script read at the buyer, and decide if a deal is real enough to forecast.",
      concept: [
        "MEDDICC is a widely used sales checklist: metrics, economic buyer, decision criteria, decision process, identify pain, champion, and competition. It is not a government standard and not a personality test. BANT is an older four-word list: budget, authority, need, timeline. Use either as a mirror after the call. If you need a fact, ask it in the buyer's language, not as 'What's your BANT?'",
        "Metrics means a measure the buyer will use to say the project worked. 'Fewer angry calls' is a direction. 'The analyst's split of expedite freight, counted again after four weeks' is a metric. If you do not have a metric, you do not have a business case. You have enthusiasm.",
        "Economic buyer means the person who can commit the cash. At Calder that is not proven to be Avery, but Avery is the person who would have to be. Decision criteria are the rules of yes: security questionnaire, payback the CFO believes, a plant that will host a count. Decision process is the order of those rules. Pain is the workflow in their words. Champion is tested, from lesson 7. Competition includes 'do nothing' and the spreadsheet, not only another logo.",
        "A deal is forecastable in this course only when pain is in their words, a metric is identified even if not yet measured, a next step has an owner and a date, and you know at least one person who can block it. Missing any of those, the stage name stays 'working,' not 'commit.'",
        "Do not grill. Three questions a buyer experiences as a form: 'What's your budget?' 'Are you the decision maker?' 'What's your timeline?' Ask those ideas sideways once you have earned them. 'Who else has to be comfortable before money moves?' is a human question. 'Who is the economic buyer?' is a seminar question."
      ],
      steps: [
        "After the Calder transcript, fill MEDDICC with 'known,' 'unknown,' or a pack fact. Do not upgrade unknown to known.",
        "Fill BANT the same way. Notice budget and timeline are mostly unknown. That is the correct sheet.",
        "Write the one question you will ask next, aimed at the largest unknown.",
        "Decide the stage: working, or not an opportunity. Write the exit rule you used.",
        "Compare with a Harbor call in which Pat says, 'If the clerk's overtime drops, I can look at $1,500 a month.' That is a small budget signal. It is still not a signature."
      ],
      example: [
        "Calder after the transcript: pain known in Riley's words, metric not yet measured, economic buyer unconfirmed, process includes Samir before data moves, champion untested, competition is the spreadsheet and the carrier. Stage: working. Next step: Riley's Tuesday check. It would be a forecast error to call this 'proposal.'",
        "Harbor: need is plausible, authority is Pat, budget is a sentence not a signature, timeline is unstated. Still working. The SDR may book the call. The AE may not forecast ARR."
      ],
      bad: "I asked the eight MEDDICC words in order. They answered. The deal is qualified.",
      good: "I filled the checklist after the call. Budget is unknown. I will not hide that unknown under a stage called Commit.",
      why: "Checklists used as scripts make buyers perform. Checklists used afterward make sellers honest. Forecasts break when unknown is stored as yes.",
      assignment: "Complete both checklists for Calder from the transcript only. Highlight three unknowns. Write the next question for each in plain language. State the stage and the exit criteria you are refusing to skip.",
      sample: [
        "Unknown metric quality: 'When the analyst replies, can we see the query, or only a sentence?' Unknown economic buyer: 'Who can say no to $9,000 a month even if the plant likes a count?' Unknown competition: 'Are you also looking at a HelioWorks add-on, or is the spreadsheet the only other plan?' Stage stays working until a dated answer exists."
      ],
      pass: [
        "MEDDICC and BANT are filled after the story, and unknowns stay unknown.",
        "Questions do not use the words MEDDICC or BANT out loud.",
        "The stage name matches the exit rule, not the seller's hope."
      ]
    },
    {
      id: "demo",
      title: "A demo that follows their goals",
      minutes: 45,
      prereq: "Lesson 11.",
      objective: "Build a demo storyline mapped to one buyer's confirmed goals, and leave every unconfirmed feature out.",
      concept: [
        "A demo is a story about the buyer's day, told with the product in the supporting role. Feature dumps reverse that. The buyer remembers a blur and not a reason to invite finance.",
        "Before you open the product, write three buyer lines you are allowed to use because they confirmed them. For Riley: planners do not trust the date, they call Chris's plant, and freight might be mixed with carrier problems. Your demo may show a date that changes and a flag that the same stock is promised twice, because those are the product's actual limits in the pack. You may not show payroll, a pretty executive scorecard that is not in the product, or a 'guaranteed promise' button.",
        "Say the limit out loud. 'This screen does not know if the carrier will fail. It only shows whether our promise matched the stock we had.' Buyers trust the sentence that draws the edge.",
        "Invite the skeptic. If Chris will live in the screen, Chris should see it before Avery sees a slide. A demo for executives only is how you discover, too late, that the plant will not adopt it. Adoption percent in the business case is a fantasy until a user has tried the workflow.",
        "End the demo with a check: 'Did this match the Wednesday problem, or did I show off?' Then be quiet."
      ],
      steps: [
        "List the confirmed buyer lines. Cross out anything only the seller said.",
        "Pick two product behaviors from the fact pack that touch those lines. Name one behavior you will refuse to show.",
        "Write a 12-minute agenda: 2 minutes restating their words, 8 minutes on the two behaviors, 2 minutes for their correction.",
        "Write the limit sentence you will say in the middle, not in an appendix.",
        "Write who must be in the room and who must not be surprised afterward. Include Samir if the screen uses order data."
      ],
      example: [
        "Agenda for Chris and Riley: 'You said the date on the screen is not the date you ship. I will change a stock quantity and we will watch the promise flip. Then I will try to promise the same pallet twice and we will watch it block. I will not open the finance module because we still do not have the freight split. Samir, if you are here, tell me if this data path is even allowed before I go further.'",
        "If Samir is not there, the honest move is to pause the data portion and book Samir first. A slick demo on forbidden data is a security incident in costume."
      ],
      bad: "Let me click through all 40 screens. Most customers love the dashboard.",
      good: "Two clicks, both tied to the phone call you described. Tell me if the second one is irrelevant and I will stop.",
      why: "The bad demo spends the buyer's attention on the seller's favorite toys and cites customers who do not exist in the pack. The good demo is short enough that a plant manager will stay.",
      assignment: "Write the 12-minute agenda for Calder and a shorter 8-minute agenda for Harbor aimed at Jordan and Pat. For Harbor, the only goal you may use is afternoon rework of promised dates. Include the limit sentence in both.",
      sample: [
        "Harbor limit sentence: 'This will not replace Stockwell. It reads a file Stockwell may or may not export. If it cannot export, this demo is a dead end and I need to say so.' That sentence belongs in minute two, not minute eight."
      ],
      pass: [
        "Every demo minute maps to a confirmed buyer line.",
        "A product limit is spoken in the agenda, not hidden.",
        "The room list includes the person who can veto the data, or the demo waits."
      ]
    },
    {
      id: "case",
      title: "A business case that survives finance",
      minutes: 70,
      prereq: "Lessons 2, 10, and the fact-pack numbers.",
      objective: "Compute cash, capacity, and payback separately, with adoption and unverified numbers left out of the cash total.",
      concept: [
        "Finance does not buy a feeling. They buy a movement of cash, or they knowingly buy a change in capacity. If you add those together, you double-count or you counterfeit cash.",
        "Hours freed equal adopted orders times the minute change, divided by 60. Capacity dollars equal those hours times a cash wage the buyer agrees is real payroll. Capacity dollars are not savings unless a hire is cancelled or overtime pay actually stops. The worksheet never adds capacity into the cash benefit. That is the whole trick, and it is the honest one.",
        "Cash benefit in this course may include only four verified lines: overtime pay that will stop, a hire that will not happen, a tool invoice that will be cancelled, and non-labor cash such as courier or expedite fees. Each line needs a person who confirmed it. A seller's estimate is not confirmation.",
        "Adoption is a percent from 0 to 100. It scales the hours. It does not scale a freight number unless the buyer says the freight moves only on the adopted orders. If you do not know, leave freight at the verified cash figure or at zero. Zero is allowed.",
        "Payback months equal implementation cash divided by monthly net cash. Monthly net cash is cash benefit minus the subscription and other monthly costs. If net cash is not positive, payback is blank. Do not show a negative month count and do not 'solve' it by tossing capacity dollars into the numerator. First-year net cash is twelve months of net cash minus implementation. It can be negative. Negative is an answer."
      ],
      steps: [
        "Write Harbor's verified cash lines from the fact pack: $1,200 overtime, $600 cancelled add-on, $400 courier. Subscription $1,500. Implementation $12,000.",
        "Run the worksheet. Confirm monthly net cash is $700 and payback is about 17.1 months. Hours can be zero in this check so you prove cash stands alone.",
        "Build the trap: 1,000 orders, 6 minutes down to 2, 50 percent adoption, $30 an hour. Confirm about 33.3 hours and $1,000 of capacity, and confirm cash benefit stays $0 if you did not enter a verified cash line.",
        "For Calder, list the $9,000 expedite and the $4,000 overtime as unverified until the analyst and the CFO speak. Put them in the assumption box, not in the cash total.",
        "Show Avery a one-page case with three stacked boxes: verified cash, capacity not in the total, and unknowns. Ask which box Avery is willing to fund."
      ],
      example: [
        "Harbor, as packed: cash in $2,200 a month, subscription $1,500, net $700, implementation $12,000, payback 12,000 / 700 = 17.14 months. Say 'about 17 months if Pat's three cash lines stay true.' Do not also multiply the clerk's hours by $22 and add that to the $1,200. The $1,200 is already the overtime cash.",
        "Calder trap: 600 exceptions times 15 minutes is 150 hours. Times $45 is $6,750 of payroll tied up. Adding $6,750 plus $4,000 overtime plus $9,000 freight produces a fantasy stack. Some of those hours are the overtime. The freight is not all bad promises. The honest slide says the stack is not yet a case."
      ],
      bad: "One hundred fifty hours times forty-five dollars plus overtime plus all the freight, divided into a two-month payback.",
      good: "Verified cash is not in yet. Capacity is 150 hours only if all 600 exceptions are real and fully adopted. I will not divide implementation by a number Avery has not blessed.",
      why: "The bad stack spends the same hour twice and spends unverified freight once. A CFO who catches it will not trust the next slide either.",
      assignment: "Complete three worksheet runs: Harbor's positive payback, the capacity-only trap, and a Calder run with every unverified cash line set to zero. Write the sentence you would say to Avery under the third run. Export is optional. The numbers must match the worksheet, not a hand-wavy total.",
      sample: [
        "To Avery: 'With nothing verified, the subscription is $9,000 a month of new cash out and an implementation check on top. I do not have a payback. If your analyst confirms a freight slice and you confirm overtime actually stops, we recompute. Until then the honest recommendation is a measured count, not a purchase order.'"
      ],
      pass: [
        "Harbor payback matches implementation divided by monthly net cash, about 17.1 months.",
        "Capacity dollars are shown and are absent from cash benefit.",
        "The Calder zero-verification run does not produce a triumphant payback.",
        "No double-counted overtime appears in the written sentence."
      ]
    },
    {
      id: "proposal",
      title: "Proposal, procurement, security, and legal",
      minutes: 55,
      prereq: "Lessons 12 and 13.",
      objective: "Write a proposal that states scope, price, and what is not included, and route it through the people who can block it.",
      concept: [
        "A proposal is a document the buyer can circulate without you in the room. If it only makes sense when you are presenting, it will be rewritten by someone tired. Use their words, the verified numbers, the price from the pack, the implementation as its own line, and a list titled 'Not included.'",
        "Not included, for Northline, always includes: full ERP replacement, payroll, tax calculation, a guarantee of on-time delivery, and any security certification that is not in the pack. Repeating the limit is a feature of the proposal.",
        "Procurement will ask about price, term, cancellation, and whether you followed their paper path. Morgan Ellis is not an obstacle to sneak past. Ask Morgan what a complete packet contains before you send a surprise PDF to Riley. A surprise PDF becomes an unsanctioned vendor and dies in a queue.",
        "Security reviews look at data, access, and subprocessors. You do not promise 'we are secure' or invent a SOC report. You say what you know, which in this exercise is nothing certified, and you offer to bring the person at your fictional company who can answer. If that person does not exist in the exercise, the review cannot be completed. An incomplete review is not a yes.",
        "Legal reads the contract, the liability cap, and the data terms. Dana Brooks is not convinced by a demo. Do not tell Dana the paper is 'standard and everyone signs it.' Send the paper early enough that a comment is not a crisis. A mutual action plan, in the next lesson's close, is where those dates live."
      ],
      steps: [
        "Draft a one-page proposal for Harbor: problem in Jordan's words, three verified cash lines, price, implementation, term you are willing to discuss, and not-included.",
        "Draft a Calder cover note that says the business case is incomplete and the proposal is for a four-week count, not for a $9,000 subscription, unless Avery says otherwise.",
        "List the packet questions you will ask Morgan before sending anything.",
        "Write Samir's section as questions, not promises.",
        "Add a signature block that says who at the seller is allowed to sign. A fictional AE is not that person unless the exercise names them as authorized. In this course, the AE is not authorized. The proposal can be recommended. It cannot be 'executed' by enthusiasm."
      ],
      example: [
        "Harbor price block: Starter subscription $1,500 per month, billed annually in the pack's rule, implementation $12,000, courier and overtime assumptions owned by Pat. Not included: replacing Stockwell. Validity: 'This draft dies when the pack changes,' which is a classroom rule. In a real job, validity is a date your company sets, not a date you invent to rush the buyer.",
        "Calder: 'This is a proposal to count exceptions at Chris's plant for four weeks. Subscription pricing is attached only so procurement can see the possible later cost. It is not an offer to start billing.'"
      ],
      bad: "Sign this week and I will throw in security certification and a 40 percent discount my manager has not seen.",
      good: "Here is the scope, here is what we will not do, and here is the packet question I still need Morgan to answer before this is an offer.",
      why: "Unauthorized discounts and invented certifications are how sellers create contracts their own company repudiates. The buyer then trusts nobody.",
      assignment: "Write Harbor's one-page proposal and Calder's count proposal. Include a not-included list and a 'who else must read this' list. Mark the signature line 'not authorized in this exercise.'",
      sample: [
        "Who must read Calder's note: Riley, Chris, Samir, Morgan. Avery receives it only after the freight split, because a price exhibit without the split invites a no you earned. Dana receives the contract only when there is a contract. A count may need a lighter paper. Ask Dana which one. Do not guess."
      ],
      pass: [
        "Subscription and implementation are separate lines.",
        "Not-included lists the delivery guarantee and the missing security report.",
        "The seller signature is explicitly unauthorized in the exercise.",
        "Procurement is asked, not bypassed."
      ]
    },
    {
      id: "negotiate",
      title: "Objections and trades you can actually make",
      minutes: 60,
      prereq: "Lessons 9 and 14.",
      objective: "Answer budget, competitor, status quo, timing, and 'send me info' without pressure, and log every concession against something you received.",
      concept: [
        "An objection is information about a missing piece. Budget means the cash case is not believed or the money sits in another year. A competitor means another path exists. Status quo means the spreadsheet still feels cheaper than change. Timing means a real calendar or a polite no. 'Send me info' often means 'I do not have a reason to meet.' Treat it as a fork, not as a victory.",
        "The fork for 'send me info': ask what decision the information would feed, and offer to send only that. If they cannot name a decision, do not send a 20-page deck. Offer to close the loop. The roleplay drill on this page branches here. Use it.",
        "Negotiation is give-to-get. You may trade things the exercise allows: a longer implementation calendar, a smaller plant count before a subscription, payment terms your fictional finance team would have to approve, or a reduction in scope. You may not trade a certification you do not have, a discount nobody authorized, or a deadline you made up. Scarcity you invented ('the price dies Friday' with no company rule) is a critical fail.",
        "Authority is part of the trade. If you cannot approve a discount, say so and take the request back to the person who can. Coming back with a real answer is strength. Pretending you 'checked' when you did not is fraud in a nicer shirt.",
        "Write concessions in a log: what they asked, what you gave, what you got, who approved, and the date. A discount with nothing in return is a gift. Gifts train the next buyer to wait you out. Getting 'a verbal yes' is not getting something. A dated security review or a named economic buyer can be something."
      ],
      steps: [
        "For each of the five objections, write a two-line reply: one line that acknowledges, one line that asks a question or offers a scoped trade.",
        "Run the on-page drills. Read the model note after your choice. Do not skip to the model first if you want the practice to count.",
        "Build a concession log for a Harbor request: 'Pat wants the first year at $1,000 a month.' You are not authorized to say yes. Write the path.",
        "Build a Calder status-quo reply that does not insult the spreadsheet or HelioWorks.",
        "Mark any reply that uses a fake deadline and rewrite it."
      ],
      example: [
        "Budget: 'If the verified cash is $700 a month and the subscription is $1,500, I agree the gap is real. The trade I can discuss, and not approve alone, is a smaller starting scope. What would Pat need to see in 60 days to keep going?'",
        "Send me info: 'I can send the one-page limit list. It will not tell you whether Stockwell exports a file. If that is the decision, the page will not make it. Should I send the page, or should we stop?'",
        "Competitor: 'If HelioWorks has an add-on that already splits promises, you should use it. If it does not, the comparison is add-on versus Northline versus the spreadsheet. Which of those three is actually on Morgan's list?'"
      ],
      bad: "If you don't sign this month you'll lose the implementation team, every competitor is worse, and I'll send a deck plus a calendar invite for tomorrow.",
      good: "I can't approve a lower price. I can ask the person who can, if you tell me what you will put on the other side of the trade. If the answer is nothing, the price stays.",
      why: "Fake urgency is memorable in the worst direction. Buyers compare notes. A seller who invents a deadline is a seller whose security answers also sound optional.",
      assignment: "Write five replies and one concession log. Then do the branching drills for budget, send-info, and the discount ask. Paste the path you chose into your notes.",
      sample: [
        "Concession log: Pat asked for $1,000 a month. I gave nothing yet. I asked what overtime cut Pat will confirm in writing. Approver: not me. Date: the day of the exercise. Status: waiting on Pat's number and on my fictional manager, who does not exist, so the discount remains unapproved."
      ],
      pass: [
        "Each reply contains a question or a scoped trade, not a speech.",
        "No fake deadline and no invented certification appears.",
        "The concession log shows approval as missing when it is missing.",
        "The 'send info' path can end in a stop."
      ]
    },
    {
      id: "close",
      title: "The ask, the plan, the forecast, and the handoff",
      minutes: 65,
      prereq: "Lessons 14, 15, and 13.",
      objective: "Ask for a specific decision, keep a mutual plan with owners and dates, and forecast only what the exit criteria allow.",
      concept: [
        "Interest is not a close. A close in this course is a written agreement the seller is authorized to sign and the buyer is authorized to sign. Your practice AE is not authorized. So your 'win' in the capstone is a packet that is ready for an authorized signer, or a clear closed-lost note. Both can pass. A pretend signature does not.",
        "The ask is specific. 'Are we moving forward?' is fog. 'Will you sign the four-week count at Chris's plant, with Samir reviewing the data path first, by the date on the plan?' is an ask. The buyer can say no. You want that no early if it is coming.",
        "A mutual action plan is a shared list: step, owner, date, and what 'done' means. For Calder a realistic skeleton is: analyst split, Samir's questions, Morgan's packet list, a count proposal Riley and Chris accept, Dana's view on whether the count needs a contract, then a later decision on any subscription. Dates you invent to pressure the buyer are not on the plan. Dates they agree to are.",
        "CRM hygiene is the ask made durable. Every open record needs a next step and a date. Stages need exit criteria. Teaching stages for this course: working (a dated next step), evaluating (a metric and a known blocker), contracting (paper is with the people who can sign), booked (authorized signatures), closed-lost (a reason and a do-not-contact flag if they asked). Pipeline is the value of working and evaluating and contracting. It is not booked. Forecast is the slice you would defend. If a stage's exit criteria are missing, the record drops back. It does not stay because moving backward feels embarrassing.",
        "After a loss, write what was true: no-go, no cash, lost to do-nothing, or you broke trust. A loss with a reason is a lesson. A loss blamed on 'they ghosted' usually means the next step had no date and no second person. Handoff to an implementation team happens only after booked, and it includes the limits you promised, not a new set of limits the seller added to win."
      ],
      steps: [
        "Write the exact ask for Harbor and the exact ask for Calder. They should be different decisions.",
        "Build a six-line mutual plan for Calder with owners from the map. Leave a date blank where the buyer has not agreed, and label it blank.",
        "Place the deal in a stage. Write the exit criterion you have and the one you lack.",
        "Write a closed-lost version that still passes the course: Pat says the overtime will not be cut. Compute the case again with overtime at zero and show why you stop.",
        "Write the handoff note you would give a fictional implementation lead if, and only if, an authorized signature existed. Include the not-included list so delivery does not 'discover' a promise you never made."
      ],
      example: [
        "Harbor ask: 'Pat, the case pays back in about 17 months only if the $1,200 overtime, the $600 add-on, and the $400 courier all stay true. Will you confirm those three in writing this week, or should we stop?' Confirmation is not the contract. It is the step in front of a contract your company has not authorized you to sign.",
        "Closed-lost math: remove the $1,200. Cash benefit falls to $1,000. Subscription is $1,500. Net is negative $500. Payback is blank. CRM: closed-lost, reason 'verified cash does not cover the subscription,' next step none, do not recycle next quarter unless Pat reopens it.",
        "Forecast hygiene: a Calder record with no Tuesday date is not in the forecast. A record with Tuesday's analyst task is pipeline at the working stage with $0 forecasted ARR, because the proposal on the table is a count, not a subscription."
      ],
      bad: "They said they love it, so I moved it to commit and put $108,000 ARR on the forecast. I'll get the signature later.",
      good: "Verbal interest, no signer, no date. Stage working or closed-lost. Forecast ARR zero. The love goes in the notes, not in the number.",
      why: "Forecasts that include unsigned affection make the company spend money it does not have. That is the AE mistake managers remember.",
      assignment: "Complete the AE capstone checklist through either a ready-for-signature packet or a closed-lost note. Include the mutual plan, the stage, the forecast number, and the sentence that says you are not the authorized signer. Then write what you would still need from a real manager before any live outreach.",
      sample: [
        "Before live outreach I would need: a named opt-out mailbox someone monitors, a postal address, permission to contact this account, a recording rule from counsel, and a price I am allowed to say. This course supplies none of those. The capstone stays fictional."
      ],
      pass: [
        "The ask names the decision, the owner, and what no looks like.",
        "Blank dates stay blank.",
        "Forecast dollars match the stage rules. A count is not booked ARR.",
        "Closed-lost is available as a passing outcome.",
        "The handoff does not add promises that were not in the proposal."
      ]
    }
  ];
});
