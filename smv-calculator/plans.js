/* Concrete, respectful next steps for the three lowest bars. */
var SMVPlans = (function () {
  var PACKS = {
    usa: {
      work: "Healthcare support, software and IT support, and the skilled trades (electrical, HVAC, plumbing) are the usual places US public career guides tell people to look. Check the outlook where you actually live before you pick one.",
      workLinks: [
        ["Occupational Outlook Handbook", "https://www.bls.gov/ooh/"],
        ["CareerOneStop", "https://www.careeronestop.org/"],
        ["Apprenticeship.gov", "https://www.apprenticeship.gov/"]
      ],
      learn: "A community college certificate or a registered apprenticeship is often a faster path than another general degree.",
      learnLinks: [
        ["Find training on CareerOneStop", "https://www.careeronestop.org/FindTraining/find-training.aspx"]
      ],
      money: "If your job offers a 401(k) match, take the match first. Then a small automatic transfer to an emergency fund. High-interest debt comes before investing in anything flashy.",
      moneyLinks: [
        ["Investor.gov", "https://www.investor.gov/"],
        ["Consumer Financial Protection Bureau", "https://www.consumerfinance.gov/"]
      ],
      health: "CDC's adult activity guide is the simple version: strength work plus walking most days. For tobacco, 1-800-QUIT-NOW is the national line.",
      healthLinks: [
        ["CDC physical activity", "https://www.cdc.gov/physical-activity/"],
        ["CDC quit smoking", "https://www.cdc.gov/tobacco/campaign/tips/quit-smoking/"],
        ["Rethinking Drinking (NIAAA)", "https://www.rethinkingdrinking.niaaa.nih.gov/"]
      ]
    },
    gbr: {
      work: "The National Careers Service is the public starting point. Health and social care, construction trades, and digital roles are the ones public pages keep pointing at. NHS careers is worth a look if you want a stable path with training built in.",
      workLinks: [
        ["National Careers Service", "https://nationalcareers.service.gov.uk/"],
        ["Find a job (GOV.UK)", "https://www.gov.uk/find-a-job"],
        ["NHS careers", "https://www.healthcareers.nhs.uk/"]
      ],
      learn: "Apprenticeships and Skills Bootcamps are the public routes. You do not have to start with a new university degree.",
      learnLinks: [
        ["Become an apprentice", "https://www.gov.uk/become-apprentice"]
      ],
      money: "Join the workplace pension if you opted out, and use MoneyHelper before you pay anyone for a money course.",
      moneyLinks: [
        ["MoneyHelper", "https://www.moneyhelper.org.uk/"]
      ],
      health: "NHS Live Well covers activity, sleep, and alcohol in plain language. The Better Health quit-smoking service is free.",
      healthLinks: [
        ["NHS Live Well", "https://www.nhs.uk/live-well/"],
        ["NHS quit smoking", "https://www.nhs.uk/better-health/quit-smoking/"]
      ]
    },
    can: {
      work: "Job Bank's career search shows wages and prospects by province. Red Seal trades are a concrete credential employers recognize across provinces.",
      workLinks: [
        ["Job Bank", "https://www.jobbank.gc.ca/"],
        ["Jobs and the workplace", "https://www.canada.ca/en/services/jobs.html"],
        ["Red Seal trades", "https://www.red-seal.ca/"]
      ],
      learn: "Start with a provincial apprenticeship or a public college program tied to a license, then layer a degree only if the job requires it.",
      learnLinks: [
        ["Job Bank career planning", "https://www.jobbank.gc.ca/career-planning"]
      ],
      money: "A TFSA and an RRSP do different jobs. The public consumer agency explains both without a sales pitch. Take any employer pension match first.",
      moneyLinks: [
        ["Financial Consumer Agency of Canada", "https://www.canada.ca/en/financial-consumer-agency.html"]
      ],
      health: "Canada's food guide and the physical activity guideline are enough to start. The quit line is 1-866-366-3667.",
      healthLinks: [
        ["Canada's food guide", "https://food-guide.canada.ca/en/"],
        ["Quit smoking", "https://www.canada.ca/en/health-canada/services/smoking-tobacco/quit-smoking.html"]
      ]
    },
    aus: {
      work: "Your Career is the public occupation guide. Apprenticeships are a normal route into trades, not a fallback.",
      workLinks: [
        ["Your Career", "https://www.yourcareer.gov.au/"],
        ["Australian apprenticeships", "https://www.apprenticeships.gov.au/"]
      ],
      learn: "A TAFE certificate aimed at a named job beats a stack of unrelated online courses.",
      learnLinks: [
        ["Your Career: courses and training", "https://www.yourcareer.gov.au/learn-and-train"]
      ],
      money: "Superannuation is the main long-term vehicle. Check that your employer is paying it, and use MoneySmart for the emergency-fund and debt basics.",
      moneyLinks: [
        ["MoneySmart", "https://moneysmart.gov.au/"]
      ],
      health: "Healthdirect summarizes the activity guidelines. Quitline is 13 7848.",
      healthLinks: [
        ["Healthdirect: healthy living", "https://www.healthdirect.gov.au/healthy-living"],
        ["Quit", "https://www.quit.org.au/"]
      ]
    },
    nzl: {
      work: "Careers New Zealand has job profiles with pay ranges and the study path for each one.",
      workLinks: [
        ["Careers New Zealand", "https://www.careers.govt.nz/"],
        ["Work and Income", "https://www.workandincome.govt.nz/"]
      ],
      learn: "Pick a qualification that a job profile on Careers New Zealand actually names.",
      learnLinks: [
        ["Careers New Zealand: study options", "https://www.careers.govt.nz/courses/"]
      ],
      money: "KiwiSaver is the default long-term account. Contribute at least enough to get the full government and employer contribution you qualify for.",
      moneyLinks: [
        ["KiwiSaver", "https://www.ird.govt.nz/kiwisaver"]
      ],
      health: "Use the WHO activity guide below, and Quitline 0800 778 778.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    irl: {
      work: "JobsIreland and the public employment service are the local boards. FetchCourses lists public training.",
      workLinks: [
        ["JobsIreland", "https://www.jobsireland.ie/"],
        ["FetchCourses", "https://www.fetchcourses.ie/"]
      ],
      learn: "A FetchCourses certificate tied to a job ad you have actually seen is the right size of goal.",
      learnLinks: [
        ["FetchCourses", "https://www.fetchcourses.ie/"]
      ],
      money: "Join the workplace pension. Citizens Information explains the Irish pension types in plain language.",
      moneyLinks: [
        ["Citizens Information: pensions", "https://www.citizensinformation.ie/en/money-and-tax/personal-finance/pensions/"]
      ],
      health: "HSE is the public health starting point for activity, smoking, and alcohol.",
      healthLinks: [
        ["HSE", "https://www2.hse.ie/living-well/"]
      ]
    },
    deu: {
      work: "The Federal Employment Agency (Arbeitsagentur) lists jobs and vocational training. Ausbildung, the dual vocational path, is a respected route into skilled work.",
      workLinks: [
        ["Bundesagentur für Arbeit", "https://www.arbeitsagentur.de/"],
        ["Make it in Germany", "https://www.make-it-in-germany.com/en/"]
      ],
      learn: "Ask the Arbeitsagentur which Ausbildung or Weiterbildung matches the job you want. Public advice is free.",
      learnLinks: [
        ["Bundesagentur für Arbeit", "https://www.arbeitsagentur.de/"]
      ],
      money: "The statutory pension (Deutsche Rentenversicherung) is the baseline. Add a workplace scheme if you have one, and build a small cash buffer first.",
      moneyLinks: [
        ["Deutsche Rentenversicherung", "https://www.deutsche-rentenversicherung.de/"]
      ],
      health: "Use the WHO activity guide, and the BZgA pages for smoking and alcohol if you need them.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["BZgA", "https://www.bzga.de/"]
      ]
    },
    fra: {
      work: "France Travail (the public employment service) and Service-Public are the official doors. A CAP or another vocational certificate is a normal way into a trade.",
      workLinks: [
        ["France Travail", "https://www.francetravail.fr/"],
        ["Service-Public", "https://www.service-public.fr/"]
      ],
      learn: "Compte Personnel de Formation (CPF) can pay for a named course. Spend it on a credential a job posting asks for.",
      learnLinks: [
        ["Service-Public", "https://www.service-public.fr/"]
      ],
      money: "Keep the public retirement account in good standing and automate a small savings transfer. Avoid paid 'wealth coaches.'",
      moneyLinks: [
        ["Service-Public: money", "https://www.service-public.fr/"]
      ],
      health: "Manger Bouger is the public activity and food campaign.",
      healthLinks: [
        ["Manger Bouger", "https://www.mangerbouger.fr/"],
        ["Tabac Info Service", "https://www.tabac-info-service.fr/"]
      ]
    },
    nld: {
      work: "UWV is the public employment service. MBO vocational programs are the usual path into skilled work.",
      workLinks: [
        ["UWV", "https://www.uwv.nl/"],
        ["EURES", "https://europa.eu/eures/portal/en/home"]
      ],
      learn: "Ask the UWV or your municipality which MBO or course matches openings near you.",
      learnLinks: [
        ["UWV", "https://www.uwv.nl/"]
      ],
      money: "Use the tax authority and Nibud (a public-interest budget institute) for household budget basics.",
      moneyLinks: [
        ["Nibud", "https://www.nibud.nl/"]
      ],
      health: "The RIVM and WHO guides are enough to set an activity and sleep target.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    eu: {
      work: "Use your national public employment service, and EURES if you can work across the EU. Look at skilled trades, health care, and technical roles the public portal actually lists as open.",
      workLinks: [
        ["EURES", "https://europa.eu/eures/portal/en/home"],
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      learn: "A vocational certificate or an apprenticeship-style program is a solid goal. Match it to a job ad, not to a trend video.",
      learnLinks: [
        ["EURES", "https://europa.eu/eures/portal/en/home"]
      ],
      money: "Join the workplace or statutory pension you already have access to. Build one month of essential expenses in cash before you buy investments.",
      moneyLinks: [
        ["EURES: living and working", "https://europa.eu/eures/portal/en/home"]
      ],
      health: "WHO's physical activity fact sheet is a country-neutral starting point: muscle-strengthening twice a week, plus walking or similar on most days.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["WHO tobacco", "https://www.who.int/news-room/fact-sheets/detail/tobacco"]
      ]
    },
    jpn: {
      work: "Hello Work (the public employment office) is the free matching service. Technical and care-work roles are widely recruited; confirm the license in your prefecture.",
      workLinks: [
        ["Hello Work (Ministry of Health, Labour and Welfare)", "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/hellowork.html"]
      ],
      learn: "A public vocational course through Hello Work is the practical next step if you want a new skill.",
      learnLinks: [
        ["Hello Work", "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/hellowork.html"]
      ],
      money: "Use the workplace pension and any public individual scheme you already qualify for. A cash buffer comes before extra risk.",
      moneyLinks: [
        ["Ministry of Health, Labour and Welfare", "https://www.mhlw.go.jp/"]
      ],
      health: "Start from the WHO activity guide. Local health centers (hokenjo) can help with smoking cessation.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    kor: {
      work: "Work24 (the public employment service) lists jobs and training. Skilled technical certificates are widely recognized.",
      workLinks: [
        ["Work24", "https://www.work24.go.kr/"]
      ],
      learn: "Pick one national technical certificate that job ads in your field name, and study for that.",
      learnLinks: [
        ["Work24", "https://www.work24.go.kr/"]
      ],
      money: "Keep national pension contributions current and automate a small savings amount on payday.",
      moneyLinks: [
        ["Work24", "https://www.work24.go.kr/"]
      ],
      health: "Use the WHO activity guide and a local public health center for quit-smoking support.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["WHO tobacco", "https://www.who.int/news-room/fact-sheets/detail/tobacco"]
      ]
    },
    mex: {
      work: "The labor ministry (STPS) and the public employment service are the official boards. Trades, logistics, and technical support are practical targets.",
      workLinks: [
        ["Secretaría del Trabajo", "https://www.gob.mx/stps"],
        ["OECD skills", "https://www.oecd.org/en/topics/policy-issues/skills.html"]
      ],
      learn: "A CONOCER or other public certificate tied to a trade is a concrete goal.",
      learnLinks: [
        ["Gobierno de México: STPS", "https://www.gob.mx/stps"]
      ],
      money: "AFORE is the retirement account system. Check that contributions are arriving before you add anything else.",
      moneyLinks: [
        ["CONSAR (retirement savings)", "https://www.gob.mx/consar"]
      ],
      health: "Use the WHO activity guide. CENAPRECE and your local health center are the public path for smoking and alcohol.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    ind: {
      work: "National Career Service is the public job and counseling portal. Short technical skills (IT support, electrical, healthcare assistance) and apprenticeships are more direct than another generic exam cycle.",
      workLinks: [
        ["National Career Service", "https://www.ncs.gov.in/"],
        ["Skill India", "https://www.skillindia.gov.in/"]
      ],
      learn: "One completed certificate you can show an employer beats three half-finished online courses.",
      learnLinks: [
        ["Skill India", "https://www.skillindia.gov.in/"]
      ],
      money: "EPF and NPS are the mainstream long-term accounts. SEBI's investor site is the public explanation of markets, not a tip sheet.",
      moneyLinks: [
        ["SEBI investor site", "https://investor.sebi.gov.in/"],
        ["Reserve Bank of India", "https://www.rbi.org.in/"]
      ],
      health: "WHO's activity guide travels well. A local government hospital or national quit line is the right place for tobacco, which is common and worth quitting.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["WHO tobacco", "https://www.who.int/news-room/fact-sheets/detail/tobacco"]
      ]
    },
    chn: {
      work: "Local human-resources bureaus and the public employment service are the formal channel. Technical certificates and skilled trades are practical targets in a huge and varied job market.",
      workLinks: [
        ["Ministry of Human Resources and Social Security", "http://www.mohrss.gov.cn/"],
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      learn: "Finish one publicly recognized vocational certificate that matches ads in your city.",
      learnLinks: [
        ["Ministry of Human Resources and Social Security", "http://www.mohrss.gov.cn/"]
      ],
      money: "Keep housing-fund and social-insurance contributions in order. A cash buffer of essential expenses comes before speculative investments.",
      moneyLinks: [
        ["Ministry of Human Resources and Social Security", "http://www.mohrss.gov.cn/"]
      ],
      health: "Use the WHO activity guide. Public hospitals and community health centers are the place for smoking cessation.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    bra: {
      work: "The Ministry of Labor's public channels and SINE (the national employment system) are the official boards. Technical courses from public institutes (the Federal Network) are a strong, low-cost path.",
      workLinks: [
        ["Ministério do Trabalho e Emprego", "https://www.gov.br/trabalho-e-emprego"],
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      learn: "One SENAI, SENAC, or federal-institute course aimed at a job you can name.",
      learnLinks: [
        ["Gov.br work and employment", "https://www.gov.br/trabalho-e-emprego"]
      ],
      money: "Keep INSS contributions current if you are in formal work. Build a small cash reserve before anything riskier.",
      moneyLinks: [
        ["Gov.br", "https://www.gov.br/"]
      ],
      health: "SUS is the public health system, including help to stop smoking. WHO's activity guide sets the weekly target.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["WHO tobacco", "https://www.who.int/news-room/fact-sheets/detail/tobacco"]
      ]
    },
    zaf: {
      work: "The Department of Employment and Labour and the ESSA job site are the public boards. Artisan trades and health-care support are concrete paths.",
      workLinks: [
        ["Department of Employment and Labour", "https://www.labour.gov.za/"],
        ["ESSA jobs", "https://essa.labour.gov.za/"]
      ],
      learn: "A TVET college program or a trade test aimed at an artisan qualification.",
      learnLinks: [
        ["Department of Employment and Labour", "https://www.labour.gov.za/"]
      ],
      money: "Join a retirement fund if your employer offers one. A small emergency stash comes before investment products.",
      moneyLinks: [
        ["South African government services", "https://www.gov.za/"]
      ],
      health: "Use a local clinic plus the WHO activity and tobacco guides.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["WHO tobacco", "https://www.who.int/news-room/fact-sheets/detail/tobacco"]
      ]
    },
    latam: {
      work: "Start with your ministry of labor's public job board. Skilled trades, logistics, and technical support are practical targets you can verify against live ads.",
      workLinks: [
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      learn: "One public technical certificate that a current job ad names.",
      learnLinks: [
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      money: "Check that any public or employer retirement contribution is actually being paid. Save a month of essential costs before you invest.",
      moneyLinks: [
        ["ILO", "https://www.ilo.org/"]
      ],
      health: "WHO's activity and tobacco fact sheets are the country-neutral baseline. A local public clinic can personalize them.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["WHO tobacco", "https://www.who.int/news-room/fact-sheets/detail/tobacco"]
      ]
    },
    mena: {
      work: "Use the ministry of human resources or the national job portal, and look at skilled trades, logistics, and technical roles that sponsor training.",
      workLinks: [
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      learn: "A recognized vocational certificate beats an unstructured stack of videos.",
      learnLinks: [
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      money: "Build a cash reserve of essential expenses. Be careful with any scheme that promises fast returns.",
      moneyLinks: [
        ["ILO", "https://www.ilo.org/"]
      ],
      health: "Heat changes how you train: walk and lift at cooler hours, and use the WHO guide for the weekly dose.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    isr: {
      work: "The Israel Employment Service is the public board. Tech support, health care, and skilled trades are practical places to aim, matched to ads you can read.",
      workLinks: [
        ["Gov.il employment", "https://www.gov.il/en/departments/topics/employment"],
        ["OECD skills", "https://www.oecd.org/en/topics/policy-issues/skills.html"]
      ],
      learn: "A short public course or a professional license that a posting requires.",
      learnLinks: [
        ["Gov.il", "https://www.gov.il/en"]
      ],
      money: "Use the workplace pension (pension and keren hishtalmut rules are specific; the public pages explain them). Cash buffer first.",
      moneyLinks: [
        ["Gov.il", "https://www.gov.il/en"]
      ],
      health: "WHO activity guide, plus your health fund (kupat holim) for smoking cessation.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    hkg: {
      work: "Jobs.gov.hk is the public vacancy site. Construction, care, and technology support roles are regularly posted.",
      workLinks: [
        ["Jobs.gov.hk", "https://www.jobs.gov.hk/"]
      ],
      learn: "Employees Retraining Board courses are a public, low-cost way to add a specific skill.",
      learnLinks: [
        ["Employees Retraining Board", "https://www.erb.org/"]
      ],
      money: "MPF is the retirement system. Check your fund fees and contribute consistently. Keep a cash buffer.",
      moneyLinks: [
        ["MPF Authority", "https://www.mpfa.org.hk/"]
      ],
      health: "Department of Health activity advice, or the WHO guide if you want the short version.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    sgp: {
      work: "MyCareersFuture is the public job site. Workforce Singapore schemes can offset training for citizens and permanent residents.",
      workLinks: [
        ["MyCareersFuture", "https://www.mycareersfuture.gov.sg/"],
        ["Workforce Singapore", "https://www.wsg.gov.sg/"]
      ],
      learn: "One SkillsFuture course that a job ad names.",
      learnLinks: [
        ["SkillsFuture", "https://www.skillsfuture.gov.sg/"]
      ],
      money: "CPF is the central system. Understand the accounts you already have before adding private products.",
      moneyLinks: [
        ["CPF Board", "https://www.cpf.gov.sg/"]
      ],
      health: "HealthHub and the WHO guide both set a clear weekly activity target.",
      healthLinks: [
        ["HealthHub", "https://www.healthhub.sg/"],
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ]
    },
    africa: {
      work: "Start with your ministry of labour's public service and current local ads. Trades, logistics, health-care support, and practical digital skills are easier to verify than vague 'online business' offers.",
      workLinks: [
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"],
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"]
      ],
      learn: "One completed certificate from a public or well-known technical college, matched to a job you can name.",
      learnLinks: [
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      money: "A written budget and a small cash reserve matter more than a trading app. Ignore anyone promising guaranteed returns.",
      moneyLinks: [
        ["ILO", "https://www.ilo.org/"]
      ],
      health: "A local public clinic plus the WHO activity and tobacco guides. Strength training can be done with little equipment.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["WHO tobacco", "https://www.who.int/news-room/fact-sheets/detail/tobacco"]
      ]
    },
    asia: {
      work: "Use the public employment service or labor ministry in your country, and compare any course with live job ads. Technical certificates and health-care support skills travel well.",
      workLinks: [
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"],
        ["OECD skills (policy context)", "https://www.oecd.org/en/topics/policy-issues/skills.html"]
      ],
      learn: "Finish one credential a real posting asks for. Stop there until it is on your résumé.",
      learnLinks: [
        ["ILO skills and employability", "https://www.ilo.org/resource/skills-and-employability"]
      ],
      money: "Use any statutory retirement or housing-fund account you already have. One month of essential expenses in cash is the first savings goal.",
      moneyLinks: [
        ["ILO", "https://www.ilo.org/"]
      ],
      health: "WHO's activity fact sheet: strengthening work at least twice a week, and walking or similar on most days.",
      healthLinks: [
        ["WHO physical activity", "https://www.who.int/news-room/fact-sheets/detail/physical-activity"],
        ["WHO tobacco", "https://www.who.int/news-room/fact-sheets/detail/tobacco"]
      ]
    }
  };

  function packFor(country) {
    return PACKS[country.pack] || PACKS.asia;
  }

  function links(pairs) {
    return pairs.map(function (p) { return { label: p[0], href: p[1] }; });
  }

  function local(country, key) {
    var pack = packFor(country);
    return {
      heading: "In " + country.name,
      text: pack[key],
      links: links(pack[key + "Links"] || [])
    };
  }

  function item(id, title, lead, skills, short, medium, long, country, localKey) {
    return {
      id: id,
      title: title,
      lead: lead,
      skills: skills,
      short: short,
      medium: medium,
      long: long,
      local: localKey ? local(country, localKey) : null
    };
  }

  function healthItem(person, country) {
    var bits = [];
    if (person.smoking === "daily" || person.smoking === "some") {
      bits.push("Smoking is the highest-leverage health change on this form. A quit line or a clinician beats willpower alone. Set a quit date within two weeks, tell one person, and remove tobacco from the places you spend time.");
    }
    if (person.drinking === "heavy") {
      bits.push("Heavy drinking is worth treating as a health project, not a personality. A clinician or a local health service can help you cut back safely. In the meantime, pick two alcohol-free days and do not drink to cope with a bad day.");
    }
    if (person.sleep === "under5" || person.sleep === "five" || person.sleep === "over9") {
      bits.push("Sleep is the base under mood, training, and how you look. A steady wake time seven days a week matters more than a perfect bedtime.");
    }
    if (!bits.length) {
      bits.push("Your health inputs are already decent. The plan is to keep the floor under them so the other goals have somewhere to stand.");
    }
    return item(
      "health",
      "Health habits",
      bits.join(" "),
      [
        "A fixed wake time, including your days off",
        "Caffeine stopped by early afternoon",
        "A phone that charges outside the bed",
        "A walk most days, even a short one"
      ],
      [
        "This week: write your usual sleep window and move wake time toward one you can keep. Aim for a 7–9 hour chance to sleep.",
        "If you smoke, look up the quit service in the links and book the first call.",
        "If drinking is heavy, tell a doctor or a public clinic. Do not do a dangerous cold-turkey plan on your own if you drink a lot every day."
      ],
      [
        "Eight weeks of the same wake time. Track it with a check mark, not a gadget you have to buy.",
        "Two strength or brisk-walking sessions a week so health is not only the absence of a habit.",
        "If you quit nicotine, the goal for month six is still quit, plus a plan for the afternoon slump that does not involve a cigarette."
      ],
      [
        "Two years from now, sleep and tobacco should be boring. Boring is the goal.",
        "A clinician is the right person if snoring, chest pain, or low mood is in the picture. This page is not a diagnosis."
      ],
      country,
      "health"
    );
  }

  function educationItem(person, country) {
    var lead = "Education here means a credential you can finish and use. It is not a moral ranking.";
    var skills = ["Reading a job ad and underlining the one credential it actually requires"];
    if (person.education === "less" || person.education === "secondary") {
      lead = "Finishing secondary school, or a trade certificate, changes which jobs will talk to you. You do not need to decide on a university today.";
      skills.push("A weekly study block on the calendar, same time, two hours");
      skills.push("One person who has the job you want, and a single question for them");
    } else if (person.education === "trade") {
      lead = "You already have a practical credential. The next step is using it, or adding the license a posting keeps asking for.";
      skills.push("A list of three jobs that name your certificate");
    } else {
      lead = "Another diploma is not automatically the next move. A license, a portfolio, or supervised experience often pays off sooner than a second general degree.";
      skills.push("A portfolio piece or a case note from work that shows the skill");
      skills.push("A license checklist, if your field has one");
    }
    return item(
      "education",
      "Education",
      lead,
      skills,
      [
        "This week: pick one program or one missing license and find the enrollment date. Write it down.",
        "Email or call the public training office in the links and ask what the cheapest recognized option is."
      ],
      [
        "Six months: finish the first term or the first half of the certificate. Drop extra courses that are not on that path.",
        "Put the unfinished credential on a résumé only if you can say what you can already do."
      ],
      [
        "Two years: the certificate or license is done, and you have used it in a job, an apprenticeship, or a serious volunteer role.",
        "If the program is not leading to work, change the program. Do not quietly add a third one."
      ],
      country,
      "learn"
    );
  }

  function careerItem(person, country) {
    var lead = "Career here means skill and responsibility you can point to. It is not about ranking yourself against other men.";
    var short = [
      "This week: write five things you did in the last year that helped someone or finished a job. That is the raw material of a résumé.",
      "Update one page. Ask one person who hires, or who does the job you want, what they would want to see."
    ];
    if (person.career === "seeking") {
      lead = "Being between roles is a project with hours, not a verdict. A daily block for applications and a daily block for skill practice keeps the week from dissolving.";
      short.unshift("Treat the search as a workday: a start time, a stop time, and a short list of target roles.");
    } else if (person.career === "student") {
      lead = "Student is a real status. The useful move is a foot in the field: a placement, a campus job, or a small project you can show.";
    } else if (person.career === "other") {
      lead = "Caregiving, retirement, or time away from paid work is not a hole in your worth. If you want paid work later, keep one skill warm. If you do not, build the plan around health and people instead.";
    }
    return item(
      "career",
      "Career",
      lead,
      [
        "Explaining your work in three sentences, without jargon",
        "Asking for one piece of responsibility you can finish",
        "A weekly look at real job ads, even if you are not moving yet"
      ],
      short,
      [
        "Six months: one visible project at work, school, or in a volunteer role, finished and written up.",
        "A target role named in your own words, taken from the public career guide for your country, not from a influencer's list."
      ],
      [
        "Two years: either a step up in skill (a license, a lead role, a finished apprenticeship) or a deliberate choice to stay where you are because the life around the job is working.",
        "Pay goals come from official wage pages. If a number only exists on social media, ignore it."
      ],
      country,
      "work"
    );
  }

  function incomeItem(person, country) {
    var bench = "";
    if (country.income) {
      bench = country.income.kind === "oecd"
        ? " The benchmark on this page for " + country.name + " is about " + SMVScore.money(country.income.value) + " (OECD average full-time wage, " + country.income.year + ", purchasing-power dollars)."
        : " The benchmark on this page for " + country.name + " is about " + SMVScore.money(country.income.value) + " a year per person (World Bank median, " + country.income.year + "). That is a living-standards figure, not a salary, so compare carefully.";
    } else {
      bench = " This country has height data in the file but no paycheck benchmark, so use your national statistical office for a local wage and treat the ideas below as the plan.";
    }
    return item(
      "income",
      "Income",
      "Income moves when a skill meets a buyer. The work is specific: one role, one skill, one place that hires." + bench,
      [
        "Reading wage pages from a public source",
        "A one-page description of what you can do this month",
        "Asking for the top of a posted range, calmly, with evidence"
      ],
      [
        "This week: write your current pay, the benchmark above, and the gap. Update the résumé. Have one conversation with someone who has the job you want.",
        "If you are underpaid for the work you already do, script a raise ask with two examples of value. Ask this month."
      ],
      [
        "Six months: finish one portfolio piece or one public course that a posting names. Send thoughtful applications on a schedule you can keep, such as five a week, and track replies.",
        "Add a skill employers list over and over in your city (a software tool, a license, a language, a machine)."
      ],
      [
        "Two years: a credential, apprenticeship, or promotion with a pay target copied from an official source.",
        "If the industry's public wage data says the ceiling is low, change industry rather than working longer hours in the same role forever."
      ],
      country,
      "work"
    );
  }

  function wealthItem(person, country) {
    var ageNote = "At your age the page uses a simple life-stage factor of " + SMVScore.ageFactor(person.age) + " times the country's median adult wealth, when that median is in the file. Young adults with little saved are ordinary.";
    return item(
      "wealth",
      "Net worth",
      "Net worth is built slowly: spend less than you earn, knock down expensive debt, and use the retirement account your country already set up. " + ageNote,
      [
        "A one-page list of debts, cash, and retirement accounts",
        "An automatic transfer on payday, even a small one",
        "Saying no to guaranteed-return pitches"
      ],
      [
        "This week: write the balances. If you do not know them, that is the task. Set one automatic transfer for the day after you are paid.",
        "If a debt's interest is very high, that debt is the savings goal until it is smaller."
      ],
      [
        "Six months: one month of essential expenses set aside, then aim at three months if your income is steady.",
        "Retirement contribution at least at the level that captures any employer match."
      ],
      [
        "Two years: the emergency fund exists, high-interest debt is falling on a written plan, and retirement contributions are boring and automatic.",
        "A target net worth copied from a public pension or savings guide, not from a stranger's screenshot."
      ],
      country,
      "money"
    );
  }

  function build(person, country, result) {
    var makers = {
      looks: function () {
        return item(
          "looks",
          "Looks and grooming",
          "This bar is your own rating, so part of the work is presentation and part of it is not being a harsh judge. Grooming, sleep, teeth, and posture change what people see. Surgery is not the plan.",
          [
            "A haircut on a schedule, before you feel shaggy",
            "Sunscreen in the morning",
            "A dentist visit on the calendar",
            "Standing tall: ribs stacked over hips, chin level, shoulders relaxed"
          ],
          [
            "This week: book the haircut or do the tidy version you can do yourself. Wash the clothes you actually wear. One dentist or clinic appointment if you are overdue.",
            "Ask one trusted friend what reads as polished on you. Ignore anonymous ratings."
          ],
          [
            "Six months: the grooming tasks are on a calendar (hair, nails, dentist, a basic skin routine of cleanser and sunscreen).",
            "Photos of you should look like you on a normal good day, because that is most days."
          ],
          [
            "Two years: these are habits, not a project. If skin, teeth, or posture still bother you, a dentist, a doctor, or a physical therapist is the professional. Not a forum."
          ],
          country,
          "health"
        );
      },
      fitness: function () {
        return item(
          "fitness",
          "Fitness",
          "Training is a skill. The target is strength you can use and a body you can live in, not a photograph. If you have pain or a medical condition, a clinician sets the plan. These are general ideas.",
          [
            "A full-body session: squat, hinge, push, pull, and a carry or a plank",
            "Walking most days",
            "Protein at meals, about a palm-sized portion as a simple cue",
            "Writing down the sessions so the week is real"
          ],
          [
            "This month: two strength workouts a week and a daily walk you can finish even on a bad day. Learn the movements with light weight or with body weight.",
            "If you are starting from zero push-ups, the first target is one clean push-up, or knee push-ups you can do for 5."
          ],
          [
            "Six months: three workouts a week. A fair target is 3 sets of 8 of a squat pattern, a push, and a pull, with a weight or variation that is challenging and still lets you keep your form.",
            "Clothes fit a little more loosely at the waist, or a waist measurement taken monthly, not daily."
          ],
          [
            "Two years: a named strength goal. Examples that suit a lot of men: a deadlift around your body weight with coached form, or 3 sets of 8 pull-ups, or the lat-pulldown equivalent if pull-ups are not available yet.",
            "Keep the habit when life gets busy. Two sessions still count."
          ],
          country,
          "health"
        );
      },
      height: function () {
        return item(
          "height",
          "Height",
          "Height is mostly settled by the time you are an adult. This is not a moral failing and it is not a project to 'fix.' The useful move is to spend your effort on the next bar you can actually change, and to present yourself well.",
          [
            "Posture: ears over shoulders, shoulders over hips",
            "Clothes that fit your real proportions, hemmed if needed",
            "Strength training, which changes how you carry yourself",
            "Leaving internet height arguments alone"
          ],
          [
            "This month: one posture check a day (stand against a wall, heels and head lightly touching, then walk away keeping that stack).",
            "Hem or tailor one pair of trousers so they break cleanly on your shoes."
          ],
          [
            "Six months: posture and lifting are habits. Shoes are in good shape and match the outfit. You are not buying gimmick inserts.",
            "Put the energy you used to spend worrying about height into the next item on this plan."
          ],
          [
            "Two years: height is a fact you mention, if at all, without apologizing. The bars that moved are the ones that were movable."
          ],
          country,
          null
        );
      },
      health: function () { return healthItem(person, country); },
      style: function () {
        return item(
          "style",
          "Style",
          "Style is fit, cleanliness, and a repeating outfit that suits your climate and your life. It is not a personality transplant and it is not expensive brands.",
          [
            "Fit over logos: shoulders of a shirt sit at your shoulders",
            "One repeating formula: trousers, a plain top, a layer if the weather needs it, clean shoes",
            "A tailor or a friend with a good eye, once",
            "Retiring items that are worn through"
          ],
          [
            "This month: pick one pair of trousers and one shirt that fit, and give away or repair one item you would not want to be seen in.",
            "Clean and condition the shoes you wear most, or replace them if the sole is gone."
          ],
          [
            "Six months: you can dress for work, for a walk, and for seeing people from the same small set of clothes. Nothing heroic.",
            "Learn one care skill: hemming, sewing a button, or knowing which cleaner to use."
          ],
          [
            "Two years: a yearly pass over the clothes. Buy less, and buy the thing that fits. Climate and culture decide the uniform, not a feed from another country."
          ],
          country,
          null
        );
      },
      social: function () {
        return item(
          "social",
          "Social skills",
          "Confidence is a record of reps. The easiest reps happen inside a repeating activity, where talking is a side effect of doing something.",
          [
            "Asking a follow-up question and then letting the person answer",
            "Remembering one detail and mentioning it next time",
            "Showing up to the same group often enough that people expect you",
            "Putting the phone away while someone is talking"
          ],
          [
            "This month: join one weekly thing with the same people. A class, a sport, a volunteer shift, a faith community, a board-game night, a language table.",
            "Have one short conversation there each time. A question about the activity counts."
          ],
          [
            "Six months: you know a few names, and you have followed up once outside the activity (a message, a coffee, a walk).",
            "Practice one skill on purpose: wait until they finish, then ask one more question before you tell your story."
          ],
          [
            "Two years: a small circle you see without it being a special occasion. If you want to date, this circle is a healthier place to meet people than a stack of apps used in isolation.",
            "Be direct and kind about what you are looking for. Do not treat friends as a funnel."
          ],
          country,
          null
        );
      },
      humor: function () {
        return item(
          "humor",
          "Humor and charisma",
          "Charisma is mostly attention. Humor that works in a relationship punches at situations, not at people you want to respect you.",
          [
            "Noticing what made a room laugh, and what made it go quiet",
            "Telling a true story with one small turn",
            "Listening longer than feels natural",
            "Leaving insult humor alone while you practice"
          ],
          [
            "This month: write down three true things that happened to you that have a beginning and a small surprise. Tell one to a friend.",
            "In conversations, aim to learn one thing about the other person before you perform."
          ],
          [
            "Six months: if you want stage practice, a local storytelling night, improv drop-in, or comedy class is the structured version. If you do not, keep practicing in ordinary conversations.",
            "Ask a friend which stories of yours they actually like. Do more of those."
          ],
          [
            "Two years: people relax around you. That is the test, not whether you can hold a monologue.",
            "Keep the phone off the table. Remember names."
          ],
          country,
          null
        );
      },
      income: function () { return incomeItem(person, country); },
      wealth: function () { return wealthItem(person, country); },
      education: function () { return educationItem(person, country); },
      career: function () { return careerItem(person, country); }
    };

    var items = result.weakest.map(function (c) { return makers[c.id](); });
    return {
      items: items,
      strengths: result.strongest,
      goals: goalsCopy(person.goals),
      firstStep: items[0].short[0]
    };
  }

  function goalsCopy(goals) {
    if (goals === "family") {
      return {
        title: "Because you want a long-term partnership and children",
        points: [
          "Say that out loud, early, to people you date. The right person is relieved. The wrong person leaves before anyone wastes a year.",
          "Practice the unglamorous skills of a household: repairing a calm conversation after a disagreement, keeping a basic budget, showing up when you are tired.",
          "Health habits are part of this goal. Sleep, not smoking, and a body you can move in are gifts to a future co-parent as well as to you.",
          "Meet people through a repeating activity. Tell friends you are looking for a serious relationship. Let them introduce you."
        ]
      };
    }
    if (goals === "partner") {
      return {
        title: "Because you want a long-term partnership",
        points: [
          "Be specific and kind about what you want. 'Seeing where it goes' is fine for a month, not for a year, if you already know you want a partner.",
          "Listening is the skill: repeat back what you heard before you argue with it.",
          "A stable week (sleep, work, a friend or two) makes you easier to build a life with than a burst of intense attention.",
          "Look in the places your real week already happens, and in one new weekly activity."
        ]
      };
    }
    if (goals === "casual") {
      return {
        title: "Because you are dating casually for now",
        points: [
          "Say so. Casual is a fair preference when the other person is choosing it too. It is unkind when you let someone hope for a future you do not want.",
          "Enthusiastic consent and basic courtesy are the whole etiquette: be on time, be clear, check in, and do not disappear.",
          "The same grooming, fitness, and conversation skills still apply. They are about being good company, not about running a strategy.",
          "If what you want changes, say that too."
        ]
      };
    }
    if (goals === "unsure") {
      return {
        title: "Because you are unsure, or you want friendship first",
        points: [
          "That is a complete answer. You do not have to pick a relationship script to work on health, work, and friendships.",
          "Widen the circle without treating anyone as a lead. Notice which kinds of company leave you feeling steady.",
          "When you do want something more, you will already know how to show up, listen, and be clear."
        ]
      };
    }
    return {
      title: "Because you are not looking right now",
      points: [
        "Then dating advice can wait. Friendships, family, health, and work are the plan.",
        "A weekly social rep still matters. Isolation makes every other bar harder.",
        "If you start looking later, the habits above are the preparation. Nothing here requires a partner to be worth doing."
      ]
    };
  }

  return { build: build };
})();
