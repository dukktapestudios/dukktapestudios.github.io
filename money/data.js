/* Money Basics content.
   To add a stage later, push an object onto stages.
   Each checklist item needs its own id. Checked boxes are saved on this
   device under those ids, so do not reuse an id for a different sentence.
   Give a new item a new id. Links must be real https pages. */
(function (root) {
  root.MONEY_DATA = {
    storageKey: "dukktape-money-basics-v1",
    stages: [
      {
        id: "crisis",
        title: "Homeless or in crisis",
        blurb: "Safety first. A roof, food, and an ID.",
        intro: "Start with tonight. A safe place, food, and an ID matter more than a budget. Asking for help is a strong move.",
        checklist: [
          { id: "safe-tonight", text: "Find a safe place for tonight. A shelter, a friend, or 211 can help." },
          { id: "call-211", text: "Call 211, or use 211.org, and ask for shelter and food near you." },
          { id: "food-today", text: "Get food today. A shelter meal, a pantry, or SNAP can cover it." },
          { id: "veteran-line", text: "If you served in the military, call 877-424-3838. The call is free." },
          { id: "replace-id", text: "Start replacing your ID, birth certificate, and Social Security card." },
          { id: "health-cover", text: "Ask about Medicaid or other free or low-cost health coverage." },
          { id: "papers-bag", text: "Keep important papers and phone numbers in one bag." },
          { id: "one-person", text: "Tell one trusted person, or a shelter worker, where you are." }
        ],
        next: [
          "Call 211 or open 211.org. Ask for a shelter bed and a meal near you.",
          "If you are a veteran, call 877-424-3838 any time.",
          "Ask a shelter, a library, or 211 how to replace your ID for free or for a small fee."
        ],
        resources: [
          { name: "211", url: "https://211.org/", note: "Call 211. United Way 211 connects you to local shelter, food, and crisis help." },
          { name: "HUD Find Shelter", url: "https://www.hud.gov/findshelter", note: "U.S. Department of Housing and Urban Development tool to find shelter." },
          { name: "HUD homeless help", url: "https://www.hudexchange.info/homelessness-assistance/homeless-help/", note: "HUD Exchange page on how to get homeless assistance." },
          { name: "VA homeless programs", url: "https://www.va.gov/homeless/", note: "For veterans. Call the National Call Center for Homeless Veterans at 877-424-3838." },
          { name: "SNAP", url: "https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program", note: "USDA food benefit. Each state has its own rules and application." },
          { name: "Medicaid and CHIP", url: "https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/", note: "HealthCare.gov explains how to get Medicaid or the Children's Health Insurance Program." },
          { name: "Replace a lost ID", url: "https://www.usa.gov/replace-vital-documents", note: "USA.gov steps for replacing a lost or stolen ID and other vital papers." },
          { name: "988 Lifeline", url: "https://988lifeline.org/", note: "If you might hurt yourself, call or text 988. It is free and open all day and night." }
        ]
      },
      {
        id: "paycheck",
        title: "Low income, or paycheck to paycheck",
        blurb: "Money leaves as fast as it arrives. Make a little space.",
        intro: "You can be careful and still have nothing left. Write this month on one page. Use help you qualify for. Then keep a small stash you do not touch.",
        checklist: [
          { id: "month-list", text: "Write this month's pay and the bills that must be paid." },
          { id: "ask-benefits", text: "Check SNAP, Medicaid, and energy help if food, health, or heat is tight." },
          { id: "file-taxes", text: "File taxes, even if you earned a little. You may get money back." },
          { id: "bank-account", text: "Open a bank or credit union account if you do not have one." },
          { id: "one-bill", text: "Pick one bill to pay the day money arrives, so it is not forgotten." },
          { id: "small-stash", text: "Move any extra, even $5, to a place you do not spend from." },
          { id: "call-early", text: "If rent, food, or a utility may fail, call 211 before the shutoff." }
        ],
        next: [
          "Write one page: money in, and bills that must go out.",
          "Look up SNAP, Medicaid, and LIHEAP if those bills are the ones that hurt.",
          "File taxes with the IRS free e-file page if you have not filed. A refund can start an emergency fund."
        ],
        resources: [
          { name: "211", url: "https://211.org/", note: "Local help for rent, food, utilities, and other basics. Call 211." },
          { name: "SNAP", url: "https://www.fns.usda.gov/snap/supplemental-nutrition-assistance-program", note: "USDA food benefit for people with low income." },
          { name: "Medicaid and CHIP", url: "https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/", note: "HealthCare.gov guide to free or low-cost health coverage." },
          { name: "LIHEAP", url: "https://www.acf.hhs.gov/ocs/programs/liheap", note: "Federal help with heating and cooling bills for people with low income." },
          { name: "Benefit finder", url: "https://www.usa.gov/benefit-finder", note: "USAGov tool that lists government benefits and financial help you can check." },
          { name: "Consumer Financial Protection Bureau", url: "https://www.consumerfinance.gov/", note: "Official plain-language help on budgets, bank accounts, credit, and debt." },
          { name: "IRS free e-file", url: "https://www.irs.gov/e-file-do-your-taxes-for-free", note: "IRS page for filing federal taxes for free, including Free File options." },
          { name: "Earned Income Tax Credit", url: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc", note: "A tax credit for workers who earn a modest amount. You must file to get it." },
          { name: "FDIC Get Banked", url: "https://www.fdic.gov/getbanked", note: "FDIC guide to opening a bank account." },
          { name: "CareerOneStop", url: "https://www.careeronestop.org/", note: "U.S. Department of Labor site for job search, training, and local help." }
        ]
      },
      {
        id: "steady",
        title: "Steady job, about $40,000 to $60,000",
        blurb: "A regular paycheck is a strong base.",
        intro: "Steady pay is a real start. Keep housing near 30% of gross pay if you can. Save a $1,000 starter fund. Then pay extra on high-interest debt.",
        checklist: [
          { id: "know-takehome", text: "Know your take-home pay, not only the yearly salary." },
          { id: "housing-30", text: "Check rent against 30% of gross pay. Use the calculator on this page." },
          { id: "starter-1000", text: "Save a $1,000 starter emergency fund in a separate account." },
          { id: "debt-list", text: "List every debt and its interest rate." },
          { id: "pay-extra", text: "Pay at least the minimum on every debt. Send extra to the highest rate." },
          { id: "credit-report", text: "Get your free credit reports from AnnualCreditReport.com." },
          { id: "learn-match", text: "If work offers a retirement match, learn the rule before you skip it." },
          { id: "file-taxes", text: "File taxes. Use IRS free e-file if it fits you." }
        ],
        next: [
          "Put your pay in the calculator below. Look at take-home, rent, and the 50/30/20 split.",
          "Save the first $1,000 where you will not spend it on wants.",
          "List your debts. Send extra money to the one with the highest interest rate."
        ],
        resources: [
          { name: "Consumer Financial Protection Bureau", url: "https://www.consumerfinance.gov/", note: "Tools and guides for budgets, credit reports, and debt." },
          { name: "Emergency fund guide", url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/", note: "CFPB guide to building an emergency fund." },
          { name: "Annual Credit Report", url: "https://www.annualcreditreport.com/index.action", note: "The official free credit reports from Equifax, Experian, and TransUnion." },
          { name: "Compound interest calculator", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator", note: "Investor.gov calculator that shows how money can grow over time." },
          { name: "Pay off high-interest debt", url: "https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/pay-credit-cards-or-other-high-interest", note: "Investor.gov on paying credit cards and other high-interest debt before investing." },
          { name: "IRS free e-file", url: "https://www.irs.gov/e-file-do-your-taxes-for-free", note: "File a federal tax return for free." },
          { name: "Federal Student Aid", url: "https://studentaid.gov/", note: "Official site for federal student loans, grants, and repayment." },
          { name: "HealthCare.gov", url: "https://www.healthcare.gov/", note: "Marketplace health plans if a job does not offer coverage." }
        ]
      },
      {
        id: "ready",
        title: "Doing OK, ready to invest",
        blurb: "Bills are paid. Finish the safety steps, then invest.",
        intro: "Investing comes after a bigger emergency fund and high-interest debt. Take any free retirement match at work. Then learn an IRA and index funds. Skip anyone who promises fast money.",
        checklist: [
          { id: "fund-months", text: "Save 3 to 6 months of must-pay bills in a savings account." },
          { id: "clear-costly-debt", text: "Pay off credit cards and other high-interest debt." },
          { id: "full-match", text: "Take the full retirement match at work if you get one." },
          { id: "learn-ira", text: "Read what an IRA is before you open one." },
          { id: "learn-index", text: "Read what an index fund, a mutual fund, and an ETF are." },
          { id: "try-calculator", text: "Try the Investor.gov compound calculator with an amount you can keep up." },
          { id: "write-enough", text: "Write one sentence for what \"enough\" means for you." },
          { id: "no-hot-tips", text: "Ignore tips that promise fast or guaranteed money." }
        ],
        next: [
          "Fill a 3 to 6 month emergency fund if it is not full yet.",
          "Capture the employer match. That match is part of your pay.",
          "Read Investor.gov on IRAs and index funds. Then automate an amount you can keep paying."
        ],
        resources: [
          { name: "Introduction to investing", url: "https://www.investor.gov/introduction-investing", note: "Investor.gov starting point from the U.S. Securities and Exchange Commission." },
          { name: "Compound interest calculator", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator", note: "See how a monthly amount can grow. The result is a teaching tool, not a promise." },
          { name: "Save for a rainy day", url: "https://www.investor.gov/introduction-investing/investing-basics/save-and-invest/save-rainy-day", note: "Investor.gov on keeping months of expenses in savings." },
          { name: "Individual retirement accounts", url: "https://www.investor.gov/introduction-investing/investing-basics/investment-accounts/tax-advantaged-accounts/retirement-savings/individual-retirement-accounts-iras", note: "Investor.gov explanation of IRAs." },
          { name: "IRS IRA page", url: "https://www.irs.gov/retirement-plans/individual-retirement-arrangements-iras", note: "IRS rules for traditional and Roth IRAs." },
          { name: "Index fund", url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/index-fund", note: "Short Investor.gov definition of an index fund." },
          { name: "Mutual funds", url: "https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-funds-etfs/mutual-funds", note: "Investor.gov page on how mutual funds work." },
          { name: "Exchange-traded funds", url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/exchange-traded-fund-etf", note: "Short Investor.gov definition of an ETF." },
          { name: "Employer retirement plans", url: "https://www.investor.gov/additional-resources/retirement-toolkit/employer-sponsored-plans", note: "Investor.gov on workplace plans such as a 401(k)." },
          { name: "Understanding fees", url: "https://www.investor.gov/introduction-investing/getting-started/understanding-fees", note: "How fees change what you keep." },
          { name: "BrokerCheck", url: "https://brokercheck.finra.org/", note: "FINRA tool to look up a broker or investment adviser." }
        ]
      },
      {
        id: "wealth",
        title: "Building wealth, or owning a business",
        blurb: "More choices. Keep the safety fund. Do not bet the rent.",
        intro: "Wealth here means choices. You may invest, own a paid-off asset, or run a business. Keep the emergency fund. Keep business money separate from personal money. When income rises, raise savings before you raise spending.",
        checklist: [
          { id: "keep-fund", text: "Keep the emergency fund while you invest or start a business." },
          { id: "broad-funds", text: "Own broad, low-cost funds you can explain in one sentence." },
          { id: "raise-savings", text: "When pay goes up, raise the savings amount before you raise spending." },
          { id: "separate-money", text: "If you start a business, use a separate account for business money." },
          { id: "learn-taxes", text: "Learn self-employed taxes before the bill arrives." },
          { id: "sba-first", text: "Read the SBA pages and use their free counseling before you spend big." },
          { id: "insurance", text: "Review insurance so one accident cannot wipe out the savings." },
          { id: "define-enough", text: "Define \"enough\" so more money does not only mean more stress." }
        ],
        next: [
          "Write one page: what you own, what you owe, and what you add each month.",
          "If a business is the path, read the SBA guide and use the free counseling before you spend savings.",
          "Keep investing on a schedule. Use the compound calculator for the long path, not this month's price."
        ],
        resources: [
          { name: "SBA free counseling", url: "https://www.sba.gov/counseling/", note: "U.S. Small Business Administration page for free counseling and local mentoring." },
          { name: "Launch your business", url: "https://www.sba.gov/business-guide/launch-your-business/choose-business-structure", note: "SBA guide to launching a business and choosing a structure." },
          { name: "IRS small business", url: "https://www.irs.gov/businesses/small-businesses-self-employed", note: "IRS hub for self-employed people and small businesses." },
          { name: "SEP IRA", url: "https://www.irs.gov/retirement-plans/plan-sponsor/simplified-employee-pension-plan-sep", note: "IRS page on a Simplified Employee Pension plan for self-employed people." },
          { name: "Introduction to investing", url: "https://www.investor.gov/introduction-investing", note: "SEC Investor.gov basics before you buy investments." },
          { name: "Compound interest calculator", url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator", note: "A long-run picture of compound growth. Markets do not move in a straight line." },
          { name: "Index fund", url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/index-fund", note: "What an index fund is, in the Investor.gov glossary." },
          { name: "Understanding fees", url: "https://www.investor.gov/introduction-investing/getting-started/understanding-fees", note: "Fees matter more as the balance grows." }
        ]
      }
    ],
    flowchart: [
      { title: "Stabilize", text: "Shelter, an ID, and benefits" },
      { title: "Income", text: "A job, or a small side income" },
      { title: "Budget", text: "Write money in and money out" },
      { title: "Starter fund", text: "Save $1,000 for surprises" },
      { title: "Costly debt", text: "Pay extra on high-interest debt" },
      { title: "Safety fund", text: "Save 3 to 6 months of bills" },
      { title: "Retirement", text: "Take a work match, then an IRA" },
      { title: "Index funds", text: "Own broad funds you understand" },
      { title: "Own assets", text: "A paid-off asset, or a careful business" }
    ],
    rules: [
      { title: "Everything costs twice", text: "The price tag is only the start. A thing also costs upkeep, space, and the money you could have saved instead." },
      { title: "Cost per use", text: "Cost per use is the price divided by the times you will really use it. A cheap item you never touch is expensive." },
      { title: "The replacement test", text: "If it broke today, would you buy the same thing again? If not, do not buy another one now." },
      { title: "Do not upgrade from boredom", text: "If it still works, keep it. A new model is not a need just because you are tired of the old one." },
      { title: "Make spending hard. Make saving automatic.", text: "Take saved cards out of shopping apps. Move savings the day you are paid, before you can spend it." },
      { title: "Rent or borrow before you buy", text: "If you need it once, borrow it or rent it. Buy when you will use it again and again." },
      { title: "One purchase pulls in more", text: "A printer wants ink. A pet wants food and a vet. Ask what else this thing will demand." },
      { title: "Wait before you buy", text: "Give a want one day. A lot of must-have feelings are gone by tomorrow." },
      { title: "Define enough", text: "Write what enough looks like for your home, your time, and your savings. Without a finish line, spending does not stop." },
      { title: "Wealth is choices", text: "Wealth is not a pile of stuff. It is the choice to rest, help someone, switch jobs, or wait." }
    ]
  };
})(typeof window !== "undefined" ? window : globalThis);
