/* ───────────────────────── UNIVERSITIES ───────────────────────── */
const UNIS = [
  ["University of Aberdeen","S"],
  ["Abertay University","S"],
  ["Aberystwyth University","W"],
  ["Anglia Ruskin University","E"],
  ["Arts University Bournemouth","E"],
  ["Aston University","E"],
  ["Bangor University","W"],
  ["University of Bath","E"],
  ["Bath Spa University","E"],
  ["University of Bedfordshire","E"],
  ["University of Birmingham","E"],
  ["Birmingham City University","E"],
  ["Birkbeck, University of London","L"],
  ["Bournemouth University","E"],
  ["BPP University","L"],
  ["University of Bradford","E"],
  ["University of Brighton","E"],
  ["University of Bristol","E"],
  ["Brunel University of London","L"],
  ["University of Buckinghamshire","E"],
  ["Buckinghamshire New University","E"],
  ["University of Cambridge","E"],
  ["Canterbury Christ Church University","E"],
  ["Cardiff University","W"],
  ["Cardiff Metropolitan University","W"],
  ["University of Central Lancashire","E"],
  ["University of Chester","E"],
  ["University of Chichester","E"],
  ["City St George's, University of London","L"],
  ["Coventry University","E"],
  ["Cranfield University","E"],
  ["University for the Creative Arts","E"],
  ["University of Cumbria","E"],
  ["De Montfort University","E"],
  ["University of Derby","E"],
  ["University of Dundee","S"],
  ["Durham University","E"],
  ["University of East Anglia","E"],
  ["University of East London","L"],
  ["Edge Hill University","E"],
  ["University of Edinburgh","S"],
  ["Edinburgh Napier University","S"],
  ["University of Essex","E"],
  ["University of Exeter","E"],
  ["Falmouth University","E"],
  ["University of Glasgow","S"],
  ["Glasgow Caledonian University","S"],
  ["University of Gloucestershire","E"],
  ["Goldsmiths, University of London","L"],
  ["University of Greenwich","L"],
  ["Harper Adams University","E"],
  ["Heriot-Watt University","S"],
  ["University of Hertfordshire","E"],
  ["University of Huddersfield","E"],
  ["University of Hull","E"],
  ["Imperial College London","L"],
  ["Keele University","E"],
  ["University of Kent","E"],
  ["King's College London","L"],
  ["Kingston University","L"],
  ["Lancaster University","E"],
  ["University of Leeds","E"],
  ["Leeds Beckett University","E"],
  ["University of Leicester","E"],
  ["University of Lincoln","E"],
  ["University of Liverpool","E"],
  ["Liverpool John Moores University","E"],
  ["London Metropolitan University","L"],
  ["London School of Economics (LSE)","L"],
  ["London South Bank University","L"],
  ["Loughborough University","E"],
  ["University of Manchester","E"],
  ["Manchester Metropolitan University","E"],
  ["Middlesex University","L"],
  ["Newcastle University","E"],
  ["Northumbria University","E"],
  ["University of Northampton","E"],
  ["University of Nottingham","E"],
  ["Nottingham Trent University","E"],
  ["Open University","E"],
  ["University of Oxford","E"],
  ["Oxford Brookes University","E"],
  ["University of Plymouth","E"],
  ["University of Portsmouth","E"],
  ["Queen Margaret University","S"],
  ["Queen Mary University of London","L"],
  ["Queen's University Belfast","N"],
  ["University of Reading","E"],
  ["Robert Gordon University","S"],
  ["Roehampton University","L"],
  ["Royal Holloway, University of London","E"],
  ["University of Salford","E"],
  ["University of Sheffield","E"],
  ["Sheffield Hallam University","E"],
  ["SOAS University of London","L"],
  ["University of Southampton","E"],
  ["Solent University","E"],
  ["University of St Andrews","S"],
  ["St Mary's University, Twickenham","L"],
  ["Staffordshire University","E"],
  ["University of Stirling","S"],
  ["University of Strathclyde","S"],
  ["University of Suffolk","E"],
  ["University of Sunderland","E"],
  ["University of Surrey","E"],
  ["University of Sussex","E"],
  ["Swansea University","W"],
  ["Teesside University","E"],
  ["University College London (UCL)","L"],
  ["Ulster University","N"],
  ["University of the Arts London","L"],
  ["University of the West of England (UWE Bristol)","E"],
  ["University of the West of Scotland","S"],
  ["University of Wales Trinity Saint David","W"],
  ["University of Warwick","E"],
  ["University of Westminster","L"],
  ["University of Winchester","E"],
  ["University of Wolverhampton","E"],
  ["University of Worcester","E"],
  ["Wrexham University","W"],
  ["University of York","E"],
  ["York St John University","E"]
];  // nation: E England, S Scotland, W Wales, N Northern Ireland, L London (England)
const UCL_NAME = "University College London (UCL)";


/* ───────────────────────── MAPPED UNIVERSITIES ─────────────────────────
   Per-university versions of services, checked against each university's official pages (Nov 2026).
   Anything not listed falls back to the generic "ask your university" version. */
const UNI_MAP = {
  "King's College London": {
    unigp:{title:"Register with King's College NHS Health Centre",body:"An NHS GP practice for King's students and staff, on the Strand campus. Register online through the practice website and have evidence of your student status ready.",meta:[["Where","Bush House SE Wing, 3rd floor, Strand"],["Call","020 4548 9842"]],link:"https://www.kcl.ac.uk/students/looking-after-your-health-at-university"},
    counselling:{title:"King's Counselling & Mental Health Support Service",body:"Free, confidential in-person and online support for King's students. King's Mental Health Advisors can also help you register with a GP and find the right support.",meta:[["Cost","Free"]],link:"https://www.kcl.ac.uk/counselling"},
    ucl247:{title:"King's Counselling Online",body:"Short-term (up to 6 sessions), solution-focused counselling with Spectrum Life for low to moderate needs, including in the evenings, at weekends and on closure days, when daytime services are shut.",meta:[["When","Out of hours, weekends, closure days"]],link:"https://www.kcl.ac.uk/counselling"},
    faf:{title:"King's hardship funds",body:"King's runs hardship funds for help with day-to-day living costs like rent and bills: the King's Hardship Fund for Home fee students (up to £3,500) and the International Hardship Fund for international and EU students facing an unforeseen change in circumstances.",meta:[["Covers","Rent, bills, living costs"]],link:"https://self-service.kcl.ac.uk/article/KA-01793/en-us"},
    debt:{title:"King's Money & Housing Advice service",body:"Advice, guidance and advocacy on money and housing for all King's students, run with the University of London Housing Service.",meta:[],link:"https://www.kcl.ac.uk/campuslife/services/student-advice-support"},
    advice:{title:"KCLSU Advice + King's Money & Housing Advice",body:"KCLSU Advice gives free, confidential advice, independent of King's, on issues affecting your studies. For tenancy and housing problems, King's Money & Housing Advice service can help.",meta:[],link:"https://www.kclsu.org/help/advice/service/"},
    reportsupport:{title:"King's Report + Support",body:"Report bullying, harassment or sexual misconduct, anonymously or with your details. You can choose support only, support with informal action, or support with a formal investigation. If you're in immediate danger, call 999.",meta:[["How","Online, anonymous option"]],link:"https://www.kcl.ac.uk/students/report-support"},
    societies:{title:"Join 1–2 KCLSU clubs or societies",body:"KCLSU has over 400 societies, sports and activity groups. {schedNote}",meta:[["Where","KCLSU"]],link:"https://www.kcl.ac.uk/study/student-experience/kclsu"},
  },
  "London School of Economics (LSE)": {
    unigp:{title:"Register with St Philips Medical Centre (on LSE's campus)",body:"The GP practice on LSE's campus. LSE advises registering at the start of term so it's easy to get an appointment when you need one. Check you live in the catchment area, or use the NHS finder.",meta:[["Call","020 7611 5131"]],link:"https://info.lse.ac.uk/current-students/estates-division/facilities-guide/medical-and-childcare-provision"},
    counselling:{title:"Book a Wellbeing Appointment at LSE",body:"LSE's Student Wellbeing Service starts with a Wellbeing Appointment, which can refer you to free short-term counselling (up to 6 sessions), workshops or peer support. Online or in person.",meta:[["Call","020 7955 7767"],["Email","student.wellbeing@lse.ac.uk"]],link:"https://info.lse.ac.uk/current-students/student-wellbeing/Student-Wellbeing-and-Counselling-Service/about-counselling.aspx"},
    ucl247:{title:"LSE 24/7 mental health support line",body:"Sponsored by LSE through Spectrum.Life. Every call is answered by a trained counsellor or psychotherapist, at any hour.",meta:[["Call","0808 189 01 03"],["When","24/7"]],link:"https://info.lse.ac.uk/current-students/student-wellbeing/disability-wellbeing/"},
    sswsmh:{title:"LSE Disability and Mental Health Service",body:"Meet a Mental Health Adviser to set up support and \"My Adjustments\" (LSE's agreed reasonable adjustments) for your studies.",meta:[["When","Mon–Fri 9.30am–5pm"]],link:"https://info.lse.ac.uk/current-students/student-wellbeing/disability-wellbeing/disability-and-mental-health-service"},
    disability:{title:"LSE Disability and Mental Health Service",body:"Confidential advice for disabled students and those with long-term conditions or specific learning differences. After a first appointment you get a lead adviser and can set up \"My Adjustments\".",meta:[["When","Mon–Fri 9.30am–5pm"]],link:"https://info.lse.ac.uk/current-students/student-wellbeing/disability-wellbeing/disability-and-mental-health-service"},
    rarexam:{title:"Set up your LSE \"My Adjustments\" early",body:"Exam and study adjustments at LSE go through \"My Adjustments\", which you set up with a Disability or Mental Health Adviser. Book well before assessments.",meta:[],link:"https://info.lse.ac.uk/current-students/student-wellbeing/booking-an-appointment.aspx"},
    faf:{title:"LSE Hardship Fund",body:"LSE's Financial Support Office supports students who fall into short-term, unforeseen hardship. Financial support drop-ins can help with emergency assistance and applications.",meta:[],link:"https://info.lse.ac.uk/current-students/Assets/Articles/cost-of-living-support-at-LSE"},
    sarah:{title:"LSESU Hardship Fund",body:"Run by the LSESU Advice Service and open to all registered LSE students facing unforeseen hardship (normally up to two applications a year). Apply by emailing the form and evidence to su.advice@lse.ac.uk.",meta:[["Email","su.advice@lse.ac.uk"]],link:"https://lsesu.com/support/funding/hardship"},
    advice:{title:"LSESU Advice Service",body:"Free, confidential advice, independent of LSE, on academic and housing issues. It also runs the LSESU hardship funds.",meta:[["Email","su.advice@lse.ac.uk"],["Call","020 7955 7158"]],link:"http://www.lsesu.com/support/advice/"},
    debt:{title:"LSESU Advice Service",body:"Free, confidential, independent advice, plus access to the LSESU Hardship, Childcare and Graduation Support funds.",meta:[["Email","su.advice@lse.ac.uk"]],link:"http://www.lsesu.com/support/advice/"},
    reportsupport:{title:"LSE Report + Support",body:"LSE's online tool for reporting bullying, harassment, discrimination or sexual misconduct, anonymously or with contact details so an adviser can help. If you're in immediate danger, call 999.",meta:[["How","Online, anonymous option"]],link:"https://reportandsupport.lse.ac.uk"},
  },
  "Imperial College London": {
    unigp:{title:"Register with Imperial College Health Centre",body:"The NHS GP practice on the South Kensington campus, nearest to most Imperial halls. Check you live in its catchment area. You can't register through the NHS website, so contact the practice directly.",meta:[["Where","40 Princes Gardens, SW7 1LY"],["Call","020 7584 6301"]],link:"https://www.imperial.ac.uk/student-support-zone/your-health/doctor-and-dentist"},
    counselling:{title:"Imperial Student Counselling & Mental Health Advice Service",body:"Free and confidential for all registered Imperial students. Complete the referral form (open 24/7) to arrange a first conversation. Options include brief counselling (up to 6 sessions) and the Student Mental Health Intervention team.",meta:[["Cost","Free"]],link:"https://www.imperial.ac.uk/students/counselling/how-to-contact-us/"},
    ucl247:{title:"SilverCloud: 24/7 online self-help",body:"Imperial gives students access to SilverCloud, online CBT-based programmes you can use at any hour. If you need to talk to someone right now, Samaritans (116 123) and Shout (text SHOUT to 85258) are always open.",meta:[["When","24/7"]],link:"https://www.imperial.ac.uk/students/counselling/"},
    disability:{title:"Imperial Disability Advisory Service",body:"Support and adjustments for disabled students and those with long-term conditions or neurodivergence. The service can also subsidise DSA needs assessments.",meta:[["When","Mon–Fri 9:30–16:30"]],link:"https://www.imperial.ac.uk/disability-advisory-service/"},
    faf:{title:"Imperial Student Support Fund",body:"For all enrolled students facing unexpected hardship with living costs (not tuition or visas), up to £5,000. Decisions usually come within 15 working days. Awards aren't usually made in the first term unless something changes after you start.",meta:[["Up to","£5,000"]],link:"https://www.imperial.ac.uk/students/fees-and-funding/general-support/financial-assistance/student-support-fund/"},
    stl:{title:"Imperial emergency interest-free loan",body:"If your funding is delayed, the Student Support Fund can offer interest-free emergency loans for cash-flow problems. If it's urgent, email Student Financial Support.",meta:[["Email","scholarships@imperial.ac.uk"]],link:"https://www.imperial.ac.uk/students/fees-and-funding/general-support/financial-assistance/student-support-fund/"},
    advice:{title:"Imperial College Union Advice Service",body:"Free, confidential and independent from Imperial. Help with academic issues, problems in Imperial halls, and complaints.",meta:[["Email","advice@imperial.ac.uk"]],link:"https://www.imperialcollegeunion.org/advice"},
    reportsupport:{title:"Imperial Report + Support",body:"Disclose bullying, harassment, sexual misconduct or discrimination, anonymously or not. Using it doesn't make a formal report: it puts you in touch with specialist Student Support Advisers. If you're in immediate danger, call 999.",meta:[["How","Online, anonymous option"]],link:"https://www.imperial.ac.uk/students/preventing-harassment-and-sexual-misconduct"},
    chaplaincy:{title:"Imperial Chaplaincy Multi-Faith Centre",body:"Pastoral support for students of any faith or none.",meta:[],link:"https://www.imperial.ac.uk/study/apply/undergraduate/offer-holders/support/"},
  },
};


/* ───────────────────────── STEP-BY-STEP GUIDES ───────────────────────── */
const GUIDES = {
 "base": {
  "samaritans": [
   "Call 116 123, free from any phone, at any time.",
   "You don't need to give your name or explain everything at once. Start with how you're feeling right now.",
   "Prefer writing? Email jo@samaritans.org (replies can take a while)."
  ],
  "shout": [
   "Text SHOUT to 85258.",
   "A trained volunteer replies, usually within minutes.",
   "It's free, so you can keep texting for as long as you need."
  ],
  "stayalive": [
   "Download Stay Alive free from the App Store or Google Play.",
   "Fill in your safety plan: warning signs, reasons for living, people to contact.",
   "Add trusted contacts so help is one tap away."
  ],
  "ucl247": [
   "Save 0808 238 0077 in your phone now, before you need it.",
   "Call any time, day or night. It's free and confidential.",
   "You can ask for support in your own language."
  ],
  "counselling": [
   "Make sure you're registered with a GP first, because UCL counselling needs it.",
   "Open UCL Counselling Services and complete the online registration form.",
   "Expect to hear back within 24 hours for triage.",
   "You'll then be offered support, including up to 6 free sessions this year."
  ],
  "nightline": [
   "Save 020 7631 0101.",
   "Call or use the online chat between 6pm and 8am.",
   "Talk about anything. Volunteers are students who listen without judging."
  ],
  "studentminds": [
   "Open studentminds.org.uk.",
   "Browse guides on stress, sleep, homesickness and exams.",
   "Use them alongside professional support, not instead of it."
  ],
  "sswsmh": [
   "Log in to askUCL and choose 'Log an enquiry'.",
   "Say you'd like to register a mental health condition with Student Support and Wellbeing.",
   "Gather any medical evidence you have. An adviser will tell you what's needed.",
   "Meet the adviser to agree support and adjustments."
  ],
  "nhs111mh": [
   "Call 111. It's free, 24/7.",
   "Choose the mental health option when asked.",
   "Say where you are and what's happening. They'll advise you or arrange urgent help."
  ],
  "lifeline": [
   "Call 0808 808 8000. It's free, 24/7.",
   "Trained counsellors answer, and you can talk about anything.",
   "If you're in immediate danger, call 999."
  ],
  "ridgmount": [
   "Open UCL's 'Registering with a GP' page and follow the link to register with Ridgmount Practice.",
   "Fill in your details and term-time address. In England you don't need ID, proof of address or an NHS number to register online.",
   "Once you're confirmed, book a new-patient check with a nurse or GP."
  ],
  "unigp": [
   "Use the NHS finder to find your university's GP practice.",
   "Register online or at reception."
  ],
  "findgp": [
   "Open the GP finder and enter your term-time postcode.",
   "Pick a surgery that covers your address.",
   "Register online or at reception. In England you don't need ID or proof of address to register online."
  ],
  "gpintl": [
   "Register with a GP as soon as you arrive. It's free.",
   "Keep your passport, visa and term-time address handy in case the surgery asks.",
   "Use your GP for illness and ongoing care, a pharmacy for minor problems, NHS 111 if you're unsure, and A&E only for emergencies."
  ],
  "vaccines": [
   "Check your records, or ask your family, whether you've had MenACWY and two doses of MMR.",
   "If not, or if you're unsure, ask your new GP surgery to book them.",
   "Do it early: these spread fast during freshers' weeks."
  ],
  "meds": [
   "Register with a GP where you study.",
   "Ask your new surgery to set up your repeat prescription. Bring the medication box or prescription slip.",
   "Nominate a pharmacy near you, e.g. in the NHS App."
  ],
  "disability": [
   "Log in to askUCL and choose 'Log an enquiry'.",
   "Ask to register with Disability and Neurodiversity support, and gather any evidence you have.",
   "Meet an adviser to agree your support.",
   "Then apply for Reasonable Academic Adjustments on Portico."
  ],
  "dsa": [
   "Apply through your student finance account (Student Finance England, Wales or NI, or SAAS in Scotland).",
   "Send evidence of your condition, e.g. a letter from your doctor or a diagnostic report.",
   "Go to a needs assessment, which recommends equipment and support.",
   "Apply early: it can take several weeks."
  ],
  "rarexam": [
   "Register with disability support first.",
   "On Portico, go to Student Disability Services and apply for Reasonable Academic Adjustments.",
   "Check this year's deadline for central exams and apply well before it."
  ],
  "allergycat": [
   "Email or visit your hall's catering team in week one.",
   "Tell them exactly what you can't eat and how severe it is.",
   "Ask how allergens are labelled at each meal, and check every time.",
   "Carry your own prescribed medication, e.g. an adrenaline auto-injector."
  ],
  "allergyout": [
   "Tell staff about your allergy before ordering, every time.",
   "Ask to see the allergen information. They have to give it for the 14 major allergens.",
   "If you're not sure, don't eat it."
  ],
  "coeliac": [
   "Go to coeliac.org.uk.",
   "Use the venue and food guides to find safe places and products.",
   "Ask your GP whether gluten-free staples on prescription are available where you live."
  ],
  "pantry": [
   "Go to 25 Gordon Street, 1st floor (Advice Service reception), Mon–Fri 10:00–16:00.",
   "Ask for the Essentials Pantry and have your UCL student ID with you.",
   "It's newly launched, so check the SU financial support page before you go."
  ],
  "tgtg": [
   "Download Too Good To Go and Olio.",
   "Set your location and browse nearby surprise bags or free listings.",
   "Reserve, then collect in the pick-up window."
  ],
  "batch": [
   "Pick 2 cooking days, e.g. Sunday and Wednesday.",
   "Cook 4 portions of one cheap dish (chilli, curry, pasta bake).",
   "Split it into portions and refrigerate or freeze.",
   "Shop with a list built around cheap staples."
  ],
  "catered": [
   "Check which meals your plan covers, and when.",
   "Plan your weekend and lunch spending around them.",
   "Tell catering about any dietary needs."
  ],
  "stl": [
   "Check you're eligible: your loan, scholarship or stipend payment is delayed.",
   "Log in to askUCL and request the Short Term Loan Questionnaire.",
   "Send it back with any evidence of the delayed payment.",
   "It's up to £250, interest-free, and usually repaid after a month."
  ],
  "faf": [
   "Read this year's guidance and dates on the Financial Assistance Fund page.",
   "Gather your bank statements and evidence of your income and costs.",
   "Apply via askUCL.",
   "If it's urgent, tell Student Funding."
  ],
  "sarah": [
   "Contact the Students' Union Advice Service.",
   "Explain your situation, and an adviser will check which fund fits.",
   "Emergency grants of up to £150 may be available."
  ],
  "debt": [
   "Book an appointment with the Students' Union Advice Service.",
   "Before you go, write down your debts and your monthly income and costs.",
   "Ask about budgeting, overdrafts and payment plans."
  ],
  "col": [
   "Open the UCL Cost of Living Hub.",
   "Go through each section: funds, food, housing, budgeting.",
   "Use it to find anything this plan hasn't covered."
  ],
  "oyster": [
   "Apply for an 18+ Student Oyster photocard on the TfL website.",
   "Your university confirms you're enrolled.",
   "Upload a digital photo and pay the fee.",
   "Then buy Travelcards or bus passes at 30% off."
  ],
  "railcard": [
   "Buy a 16–25 Railcard online or in the app.",
   "Add it to your phone and show it with your ticket.",
   "It saves a third on most rail fares."
  ],
  "work": [
   "If you have a visa, check its conditions before you accept a job.",
   "Look at your university's careers service and Students' Union job listings.",
   "Keep your term-time hours realistic around your timetable."
  ],
  "bank": [
   "Compare student accounts on overdraft limits and terms, not freebies.",
   "Apply online with your passport and proof that you're a student.",
   "Set a weekly budget and a low-balance alert."
  ],
  "sfe": [
   "Log in to your Student Finance account and check for messages or missing details.",
   "Check that your university has confirmed your enrolment.",
   "If it's still delayed, call Student Finance and ask your university about emergency loans."
  ],
  "sra": [
   "Find your SRA's name and contact details on your hall noticeboard or in your welcome email.",
   "Message them or knock on their door. Helping you is their job.",
   "Go to one hall event this week."
  ],
  "societies": [
   "Browse the Students' Union clubs and societies list.",
   "Pick two that meet at times you're free.",
   "Go to a taster session this week."
  ],
  "intl": [
   "Open the International Student Support page.",
   "Sign up for welcome events and workshops.",
   "Ask them any questions about visas, banking or settling in."
  ],
  "tutor": [
   "Find your personal tutor's name in your student record or a department email.",
   "Email them to ask for a short meeting.",
   "Bring a list of what's worrying you."
  ],
  "advice": [
   "Call the SU Advice Service on 020 3549 5232 or visit 25 Gordon Street.",
   "Bring your contract, or any emails and letters about the problem.",
   "They'll explain your options and can help you respond."
  ],
  "ec": [
   "Read UCL's guidance on Extenuating Circumstances.",
   "Collect evidence, e.g. a doctor's note or a letter.",
   "Submit your claim on Portico as soon as you can.",
   "Tell your department and your personal tutor."
  ],
  "emergencyhousing": [
   "Contact UCL straight away, before you lose your housing.",
   "Find the emergency accommodation guidance on the Cost of Living Hub.",
   "Ask the SU Advice Service about your rights as a tenant."
  ],
  "carebursary": [
   "Confirm your care-leaver status in your Student Finance application.",
   "UCL assesses you automatically. There's no separate form.",
   "First-years: email studentfunding@ucl.ac.uk to ask about the £200 transition advance."
  ],
  "estrangedbursary": [
   "Fill in the Confirmation of Estrangement form with Student Finance.",
   "Once you're assessed as independent, UCL will contact you.",
   "If you become estranged during the year, email studentfunding@ucl.ac.uk."
  ],
  "carers": [
   "Open UCL's page on support for students with children.",
   "Contact the SU Officer for Students with Caring Responsibilities, or join the Parents and Carers Network.",
   "Check gov.uk for the Childcare Grant and Parents' Learning Allowance."
  ],
  "reportsupport": [
   "If you're in danger, call 999 first.",
   "Open Report + Support and choose whether to report anonymously or with your details.",
   "Choose to speak to an adviser if you'd like support with your options."
  ],
  "chaplaincy": [
   "Email chaplaincy@ucl.ac.uk or call 020 3108 8942.",
   "Ask to talk to a chaplain. You don't need to be religious."
  ],
  "lgbt": [
   "Call the UCL 24/7 Student Support Line and ask for an LGBTQ+-trained adviser.",
   "Join the SU LGBTQ+ Students' Network.",
   "If it's relevant to you, look at the Gender Expression Fund."
  ],
  "resteam": [
   "Introduce yourself at reception.",
   "Ask what welfare support and events they run.",
   "Report problems early."
  ]
 },
 "alt": {
  "counselling": [
   "Search your university's website for 'counselling' or 'wellbeing'.",
   "Complete their registration or referral form.",
   "Register with a GP too, because some services ask for it."
  ],
  "ucl247": [
   "Find your university's wellbeing or student support page.",
   "Save any out-of-hours number they list.",
   "If you need help right now, call Samaritans on 116 123."
  ],
  "sswsmh": [
   "Find your university's disability or wellbeing service.",
   "Register, and send any evidence you have.",
   "Meet an adviser to agree support and adjustments."
  ],
  "disability": [
   "Find your university's disability support service.",
   "Register, and send any evidence you have.",
   "Meet an adviser to agree support and adjustments."
  ],
  "rarexam": [
   "Register with disability support.",
   "Ask when the deadline for exam arrangements is.",
   "Apply well before it."
  ],
  "pantry": [
   "Ask your Students' Union advice service about food support.",
   "Check whether there's a pantry, community fridge or meal vouchers."
  ],
  "stl": [
   "Email your university's student funding team and explain the delay.",
   "Ask whether they offer emergency loans.",
   "Check your Student Finance account for missing details."
  ],
  "faf": [
   "Search your university's website for 'hardship fund'.",
   "Read the eligibility rules and deadlines.",
   "Gather your bank statements and apply."
  ],
  "sarah": [
   "Find your Students' Union advice service.",
   "Ask whether they have emergency grants or a hardship fund."
  ],
  "debt": [
   "Find your Students' Union advice service.",
   "Book an appointment and bring a list of your debts, income and costs."
  ],
  "col": [
   "Search your university's website for 'cost of living'.",
   "Go through the support for funds, food and budgeting."
  ],
  "sra": [
   "Find the contact details for your hall's residence life team.",
   "Introduce yourself, and go to one hall event this week."
  ],
  "intl": [
   "Find your university's international student support page.",
   "Sign up for welcome events."
  ],
  "advice": [
   "Find your Students' Union advice service.",
   "Book an appointment and bring any documents about the problem."
  ],
  "ec": [
   "Search your university's website for 'extenuating' or 'mitigating circumstances'.",
   "Collect evidence, e.g. a doctor's note.",
   "Apply before the deadline and tell your department."
  ],
  "emergencyhousing": [
   "Contact your university's accommodation or student support team today.",
   "Get free housing advice from Shelter."
  ],
  "carebursary": [
   "Ask your university's student funding team what you're entitled to.",
   "Make sure Student Finance knows you're care-experienced."
  ],
  "estrangedbursary": [
   "Ask your university's student funding team what support they offer.",
   "Ask Student Finance about being assessed as independent."
  ],
  "carers": [
   "Ask your university's student support team what's available for parents and carers.",
   "Check gov.uk for the Childcare Grant."
  ],
  "reportsupport": [
   "If you're in danger, call 999 first.",
   "Search your university's website for 'report harassment'.",
   "Report anonymously, or ask to speak to an adviser."
  ],
  "chaplaincy": [
   "Search your university's website for 'chaplaincy' or 'faith centre'.",
   "Get in touch to arrange a chat."
  ],
  "lgbt": [
   "Look up your Students' Union's LGBTQ+ society.",
   "Contact Switchboard for confidential national support."
  ],
  "nightline": [
   "Check nightline.ac.uk to see whether your university has a Nightline.",
   "Save the number and the opening hours."
  ],
  "resteam": [
   "Introduce yourself at reception.",
   "Ask what welfare support and events they run."
  ]
 },
 "map": {
  "King's College London": {
   "unigp": [
    "Go to the King's College NHS Health Centre website and register online.",
    "Have proof that you're a King's student ready.",
    "Can't register online? Go in person to Bush House, South East Wing, 3rd floor."
   ],
   "counselling": [
    "Open the King's Counselling & Mental Health Support Service page.",
    "Register through Student Services Online.",
    "Not sure what you need? Ask a Mental Health Advisor to help you choose."
   ],
   "ucl247": [
    "Open the King's Counselling page and find King's Counselling Online.",
    "Book a session for an evening, a weekend or a closure day."
   ],
   "faf": [
    "Open the King's hardship funds page and choose the right fund: Home or International.",
    "Gather your bank statements and evidence of your situation.",
    "Apply online."
   ],
   "debt": [
    "Contact King's Money & Housing Advice service.",
    "Bring a list of your debts, income and costs."
   ],
   "advice": [
    "Housing problem? Contact King's Money & Housing Advice service.",
    "Academic problem? Contact KCLSU Advice for independent advice.",
    "Bring any documents or emails about the problem."
   ],
   "reportsupport": [
    "If you're in danger, call 999 first.",
    "Open King's Report + Support.",
    "Report anonymously or with your name, and choose support only, informal action or a formal investigation."
   ]
  },
  "London School of Economics (LSE)": {
   "unigp": [
    "Check that you live in St Philips Medical Centre's catchment area.",
    "Register online through the NHS website, or call the practice on 020 7611 5131."
   ],
   "counselling": [
    "Email student.wellbeing@lse.ac.uk or call 020 7955 7767 to book a Wellbeing Appointment.",
    "Talk through what's going on.",
    "Your adviser can refer you to counselling (up to 6 sessions)."
   ],
   "ucl247": [
    "Save 0808 189 01 03 in your phone.",
    "Call at any time. A counsellor or psychotherapist answers."
   ],
   "sswsmh": [
    "Complete the 'meet an adviser' form on the Disability and Mental Health Service page.",
    "Have evidence of your condition ready if you have it.",
    "Agree your 'My Adjustments' with your lead adviser."
   ],
   "disability": [
    "Complete the 'meet an adviser' form on the Disability and Mental Health Service page.",
    "Have evidence of your condition ready.",
    "Agree your 'My Adjustments' with your lead adviser."
   ],
   "rarexam": [
    "Book an appointment with a Disability or Mental Health Adviser.",
    "Set up your My Adjustments well before assessments."
   ],
   "faf": [
    "Read LSE's cost of living support page.",
    "Go to a financial support drop-in.",
    "Apply to the Financial Support Office's hardship fund."
   ],
   "sarah": [
    "Read the LSESU Hardship Fund guidance.",
    "Complete the form and gather your bank statements.",
    "Email them to su.advice@lse.ac.uk."
   ],
   "advice": [
    "Email su.advice@lse.ac.uk or call 020 7955 7158.",
    "Book an appointment and bring any documents about the problem."
   ],
   "debt": [
    "Email su.advice@lse.ac.uk to book an appointment.",
    "Ask about the LSESU hardship funds too."
   ],
   "reportsupport": [
    "If you're in danger, call 999 first.",
    "Open LSE Report + Support.",
    "Report anonymously, or leave contact details so an adviser can help."
   ]
  },
  "Imperial College London": {
   "unigp": [
    "Check that you live in the Health Centre's catchment area.",
    "Call 020 7584 6301, email imperialcollege.hc@nhs.net, or collect a form at 40 Princes Gardens.",
    "Outside the catchment area? Use the NHS GP finder."
   ],
   "counselling": [
    "Open the Counselling Service's 'How to contact us' page.",
    "Complete the referral form, which is open 24/7.",
    "The service will contact you to arrange a first conversation."
   ],
   "ucl247": [
    "Find SilverCloud on Imperial's counselling page and sign up.",
    "Pick a programme, e.g. for stress or anxiety."
   ],
   "disability": [
    "Contact the Disability Advisory Service (Mon–Fri 9:30–16:30).",
    "Register and share any evidence you have.",
    "Agree your adjustments."
   ],
   "faf": [
    "Read the Student Support Fund guidance, including any requirements.",
    "Gather your bank statements and evidence.",
    "Apply online. Decisions usually come within 15 working days."
   ],
   "stl": [
    "Email scholarships@imperial.ac.uk and explain the delay.",
    "Ask about an interest-free emergency loan."
   ],
   "advice": [
    "Email advice@imperial.ac.uk or request advice online.",
    "Bring any documents about the problem."
   ],
   "reportsupport": [
    "If you're in danger, call 999 first.",
    "Open Imperial's Report + Support.",
    "Choose to be contacted by a Student Support Adviser if you'd like help."
   ],
   "chaplaincy": [
    "Visit the Chaplaincy Multi-Faith Centre page for chaplains' contact details.",
    "Get in touch to arrange a chat."
   ]
  }
 }
};

/* ───────────────────────── QUESTIONS ───────────────────────── */
const STEPS = [
  { title:"About you", qs:[
    {id:"uni", label:"Which university are you going to?", type:"uni"},
    {id:"origin", label:"Where are you from?", type:"one", opts:[["home","UK (home student)"],["eu","EU"],["intl","Outside the EU"]]},
    {id:"living", label:"Where are you living this year?", type:"one", opts:[["halls_cat","Halls with meals (catered)"],["halls_self","Halls, self-catered"],["pbsa","Private student halls"],["private","Private flat or house"],["family","With family"]]},
    {id:"area", label:"Which part of London?", show:a=>uniInfo(a).ucl, type:"one", opts:[["central","Bloomsbury / central"],["east","East (near UCL East)"],["other","Elsewhere in London"]]},
    {id:"circ", label:"Do any of these apply to you?", hint:"Pick all that apply", type:"many", opts:[["first","First in my family at university"],["care","Care-experienced"],["estranged","Estranged from my parents"],["carer","Parent or carer"],["none","None of these"]]},
  ]},
  { title:"Mental health", qs:[
    {id:"mood", label:"How have you been feeling lately?", type:"one", opts:[["good","Mostly fine"],["stressed","Stressed or anxious"],["low","Low, struggling to cope"],["crisis","I'm not safe / in crisis right now"]]},
    {id:"mhcond", label:"Do you have a diagnosed mental health condition?", type:"one", opts:[["no","No"],["yes","Yes"],["unsure","Not sure"]]},
    {id:"worries", label:"Is anything in particular on your mind?", hint:"Pick all that apply", type:"many", opts:[["homesick","Homesickness"],["academic","Pressure from my course"],["relationships","Relationships or family"],["grief","Bereavement"],["unsafe","Harassment or feeling unsafe"],["none","Nothing specific"]]},
  ]},
  { title:"Physical health", qs:[
    {id:"gp", label:"Are you registered with a GP (doctor) near your university?", type:"one", opts:[["yes","Yes"],["no","No"],["unsure","Not sure / still at my home GP"]]},
    {id:"conditions", label:"Anything that affects your studies or daily life?", hint:"Pick all that apply", type:"many", opts:[["longterm","Long-term physical condition"],["disability","Disability"],["neuro","ADHD / autism / dyslexia"],["meds","Regular medication"],["none","None"]]},
  ]},
  { title:"Food", qs:[
    {id:"diet", label:"Allergies or dietary needs?", hint:"Pick all that apply", type:"many", opts:[["nuts","Nut allergy"],["gluten","Coeliac / gluten-free"],["dairy","Dairy-free"],["veg","Vegetarian / vegan"],["halal","Halal / kosher"],["none","None"]]},
    {id:"food", label:"Weekly food budget", type:"range", min:10, max:100, step:5, unit:"£", suffix:"/ week", def:40},
  ]},
  { title:"Money", qs:[
    {id:"money", label:"Money left each month after rent", type:"range", min:0, max:1000, step:50, unit:"£", suffix:"/ month", def:400},
    {id:"moneyissue", label:"Anything going on with money?", hint:"Pick all that apply", type:"many", opts:[["delay","My loan / funding is delayed"],["unexpected","Unexpected cost or change in circumstances"],["debt","Getting into debt / overdraft"],["work","Looking for part-time work"],["none","Nothing right now"]]},
  ]},
  { title:"Home & studies", qs:[
    {id:"housing", label:"How are things where you live?", type:"one", opts:[["fine","Fine"],["dispute","Problems with flatmates, landlord or contract"],["risk","I might lose my housing"]]},
    {id:"course", label:"How's your course going?", type:"one", opts:[["fine","OK so far"],["behind","Falling behind or overwhelmed"],["event","Illness or an event is affecting my deadlines"]]},
  ]},
  { title:"Schedule & social", qs:[
    {id:"schedule", label:"When are you usually free?", type:"one", opts:[["day","Daytime is fine"],["evenings","Mostly evenings & weekends"],["packed","Barely ever: lectures, labs, work"]]},
    {id:"social", label:"How's the social side?", type:"one", opts:[["good","Good, settling in"],["some","Know a few people"],["lonely","Feeling lonely or homesick"]]},
    {id:"identity", label:"Would support with any of these help?", hint:"Optional", optional:true, type:"many", opts:[["lgbt","LGBTQ+ identity"],["faith","Faith or religion"],["none","No thanks"]]},
  ]},
];

const PERSONAS = [
  {name:"Sofia, 18", desc:"From Brazil, King's College London, anxious, no GP yet, £35/week", a:{uni:"King's College London",origin:"intl",living:"private",area:"central",mood:"stressed",mhcond:"no",gp:"no",conditions:["none"],diet:["veg"],food:35,money:300,moneyissue:["work"],schedule:"evenings",social:"lonely",circ:["none"],worries:["homesick"],housing:"fine",course:"fine",identity:[]}},
  {name:"Tom, 19", desc:"UCL, first in family, coeliac, loan delayed, ill before a deadline", a:{uni:UCL_NAME,origin:"home",living:"halls_cat",area:"central",mood:"good",mhcond:"no",gp:"unsure",conditions:["longterm","meds"],diet:["gluten"],food:25,money:50,moneyissue:["delay"],schedule:"day",social:"some",circ:["first"],worries:["none"],housing:"fine",course:"event",identity:[]}},
  {name:"Amira, 18", desc:"UCL, estranged, ADHD, struggling, housing dispute", a:{uni:UCL_NAME,origin:"home",living:"halls_self",area:"east",mood:"low",mhcond:"yes",gp:"yes",conditions:["neuro"],diet:["halal"],food:20,money:150,moneyissue:["unexpected","debt"],schedule:"packed",social:"lonely",circ:["estranged"],worries:["academic"],housing:"dispute",course:"behind",identity:["faith"]}},
];

/* ───────────────────────── SERVICE CATALOGUE ─────────────────────────
   Checked against official UCL / Students' Union UCL / NHS / charity pages, Nov 2026. */
const R = {
  samaritans:{pillar:"mental",title:"Samaritans",body:"Free, confidential listening, any time, about anything.",meta:[["Call","116 123"],["When","24/7"]],link:"https://www.samaritans.org"},
  shout:{pillar:"mental",title:"Shout",body:"Free, confidential text support if you'd rather type than talk.",meta:[["Text","SHOUT to 85258"],["When","24/7"]],link:"https://giveusashout.org"},
  stayalive:{pillar:"mental",title:"Stay Alive app",body:"Free suicide-prevention app: build a safety plan and find help fast.",meta:[["Get it","App Store / Google Play"]],link:"https://stayalive.prevent-suicide.org.uk"},
  ucl247:{pillar:"mental",title:"UCL 24/7 Student Support Line",body:"Free, confidential talk support for stress, anxiety, homesickness, money worries and more, in 35+ languages. Not for emergencies.",meta:[["Call","0808 238 0077"],["When","24/7, 365 days"]],link:"https://www.ucl.ac.uk/students/support-and-wellbeing/mental-health-and-wellbeing/ucl-247-student-support-line",uni:"ucl",alt:{title:"{uni}'s wellbeing support",body:"Your university's wellbeing or student support team can talk through stress, homesickness and money worries, and refer you on. For 24/7 support, Samaritans (116 123) and Shout (text SHOUT to 85258) are always open.",meta:[["24/7","Samaritans 116 123"]],link:"search:{uni} student wellbeing support"}},
  counselling:{pillar:"mental",title:"Register with UCL Counselling Services",body:"Up to 6 free counselling sessions a year. Everyone is triaged within 24 hours of registering. You need to be registered with a GP.",meta:[["Cost","Free"],["Where","3–4 Taviton Street, WC1H 0BT"]],link:"https://www.ucl.ac.uk/students/support-and-wellbeing/student-psychological-and-counselling-services",uni:"ucl",alt:{title:"Register with {uni}'s counselling service",body:"Most UK universities offer free, confidential counselling. Register early so you're in the system before you need it. Some ask you to be registered with a GP.",meta:[["Cost","Usually free"]],link:"search:{uni} counselling service"}},
  nightline:{pillar:"mental",title:"London Nightline",body:"A listening service run by students, for students, overnight, by phone or online chat.",meta:[["Call","020 7631 0101"],["When","6pm–8am"]],link:"https://nightline.org.uk",london:true,alt:{title:"Your local Nightline",body:"Many universities have a Nightline: a confidential listening service run by students, for students, overnight. Find out whether {uni} has one.",meta:[["When","Overnight"]],link:"https://www.nightline.ac.uk"}},
  lifeline:{pillar:"mental",title:"Lifeline: crisis support in Northern Ireland",body:"Free, confidential crisis helpline for anyone in Northern Ireland who is in distress or despair.",meta:[["Call","0808 808 8000"],["When","24/7"]],link:"https://www.lifelinehelpline.info"},
  railcard:{pillar:"money",title:"Get a 16–25 Railcard",body:"Saves a third on most rail fares across Great Britain, including trips home. It usually pays for itself in a couple of journeys.",meta:[["Saves","1/3 on rail fares"]],link:"https://www.16-25railcard.co.uk"},
  resteam:{pillar:"social",title:"Get to know your building's resident team",body:"Private student halls usually have an on-site team and welcome events. Tell them early if something's wrong, and ask what welfare support they offer.",meta:[["Where","Your building's reception"]],link:"search:{uni} private student accommodation welfare support"},
  studentminds:{pillar:"mental",title:"Student Minds",body:"The UK student mental health charity (now includes Student Space): guides and tools for the ups and downs of student life.",meta:[["Cost","Free"]],link:"https://www.studentminds.org.uk"},
  sswsmh:{pillar:"mental",title:"Register your condition with Student Support & Wellbeing",body:"Telling UCL about a mental health condition lets the Mental Health & Wellbeing team set up support and Reasonable Academic Adjustments. Same-day appointments are bookable through askUCL.",meta:[["How","askUCL → Log an enquiry"],["Phone","020 3108 8836"]],link:"https://www.ucl.ac.uk/study/support-and-wellbeing/disability-and-neurodiversity/support-we-offer/registering-support",uni:"ucl",alt:{title:"Tell {uni} about your mental health condition",body:"Registering a condition with your university's disability or wellbeing team lets them put support and adjustments in place before deadlines hit.",meta:[],link:"search:{uni} register disability mental health support"}},
  nhs111mh:{pillar:"mental",title:"NHS 111: urgent mental health",body:"If you need urgent help but it isn't life-threatening, call 111 and choose the mental health option.",meta:[["Call","111"],["When","24/7"]],link:"https://www.nhs.uk/nhs-services/mental-health-services/where-to-get-urgent-help-for-mental-health/"},

  ridgmount:{pillar:"physical",title:"Register with Ridgmount Practice (UCL's partner GP)",body:"You aren't automatically given a GP when you move. Ridgmount, in Bloomsbury, sees thousands of students a year and covers most of central and north London. Register online, then book a check-in with a nurse or GP.",meta:[["Call","020 7387 6306"],["Do it","Within 2 weeks of arriving"]],link:"https://www.ucl.ac.uk/students/support-and-wellbeing/health-care/registering-doctor-gp"},
  unigp:{pillar:"physical",title:"Register with your university's GP practice",body:"",meta:[],link:"{gpLink}"},
  findgp:{pillar:"physical",title:"Register with a GP near where you live",body:"Pick a surgery close to where you live. You need a GP for prescriptions and referrals, and often for university counselling too.",meta:[["Do it","Within 2 weeks of arriving"]],link:"{gpLink}"},
  gpintl:{pillar:"physical",title:"How the NHS works for international students",body:"Anyone in England can register with a GP, whatever their immigration status. Your GP is your first stop for physical and mental health, and A&E is for emergencies only.",meta:[["Guide","UCL international healthcare page"]],link:"https://www.ucl.ac.uk/students/international-students/international-support/healthcare-uk/accessing-healthcare-uk",uni:"ucl",alt:{body:"International students can register with a GP. Your GP is your first stop for physical and mental health, and A&E is for emergencies only.",link:"https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/"}},
  vaccines:{pillar:"physical",title:"Check your MenACWY and MMR vaccines",body:"UCL urges all new students to have the meningitis (MenACWY) and MMR vaccines. Ask your new GP if you're not sure you've had them.",meta:[["Where","Your GP"]],link:"https://www.ucl.ac.uk/parents-guardians-of-ucl-students/health-and-wellbeing",uni:"ucl",alt:{body:"New students are advised to have the meningitis (MenACWY) and MMR vaccines. Ask your new GP if you're not sure you've had them.",link:"https://www.nhs.uk/vaccinations/menacwy-vaccine/"}},
  meds:{pillar:"physical",title:"Move your repeat prescription",body:"Once you're registered, ask your new GP to take over your repeat prescriptions so you don't run out mid-term.",meta:[["Where","Your new GP"]],link:"https://www.nhs.uk/nhs-services/prescriptions/"},
  disability:{pillar:"physical",title:"Register with Disability & Neurodiversity support",body:"Get personalised support and Reasonable Academic Adjustments (e.g. exam arrangements, assistive tech). Apply for adjustments on Portico once you're registered.",meta:[["How","askUCL → Log an enquiry"],["Phone","020 3108 8836"]],link:"https://www.ucl.ac.uk/study/support-and-wellbeing/disability-and-neurodiversity/support-we-offer/registering-support",uni:"ucl",alt:{title:"Register with {uni}'s disability support team",body:"Get personalised support and reasonable adjustments (e.g. exam arrangements, assistive tech). Register as early as you can, ideally before term starts.",meta:[],link:"search:{uni} disability support register"}},
  dsa:{pillar:"physical",title:"Apply for Disabled Students' Allowance (DSA)",body:"A non-repayable grant for study costs caused by a disability or long-term condition, such as equipment or support. Not eligible? Talk to a UCL adviser about other options.",meta:[["Cost","Non-repayable"]],link:"https://www.gov.uk/disabled-students-allowance-dsa"},
  rarexam:{pillar:"physical",title:"Get exam adjustments in before the deadline",body:"Reasonable Academic Adjustments for central exams have yearly deadlines. Apply early so they're in place before your first assessments.",meta:[["Where","Portico → Student Disability Services"]],link:"https://www.ucl.ac.uk/students/support-and-wellbeing-services/disability-and-neurodiversity/your-reasonable-academic-adjustments",uni:"ucl",alt:{title:"Get exam adjustments in place early",body:"Universities set deadlines for exam arrangements. Ask {uni}'s disability team when yours is.",meta:[],link:"search:{uni} exam adjustments deadline"}},

  allergycat:{pillar:"food",title:"Tell your hall catering team about your {diet}",body:"Food businesses in the UK must tell you which of the 14 major allergens are in their food. Flag your needs with your hall's catering team in week one, and ask to see allergen information at every meal.",meta:[["Who","Hall catering / reception"]],link:"https://www.food.gov.uk/safety-hygiene/food-allergy-and-intolerance"},
  allergyout:{pillar:"food",title:"Eating out safely with {diet}",body:"In the UK you can ask any café or restaurant, including campus outlets, for allergen information on the 14 major allergens. Ask every time, even somewhere you've eaten before.",meta:[["Your right","Allergen information on request"]],link:"https://www.food.gov.uk/safety-hygiene/food-allergy-and-intolerance"},
  coeliac:{pillar:"food",title:"Coeliac UK",body:"Gluten-free food guides, a venue directory and an app for scanning products. Gluten-free staples can be prescribed in some areas, so ask your GP.",meta:[["Cost","Free resources"]],link:"https://www.coeliac.org.uk"},
  pantry:{pillar:"food",title:"Students' Union Essentials Pantry",body:"Free food, drink and hygiene products for UCL students who are struggling to afford everyday items. Ask at Advice Service reception. (Newly launched, so check it's open before you go.)",meta:[["Where","25 Gordon Street, 1st floor"],["When","Mon–Fri 10:00–16:00"]],link:"https://studentsunionucl.org/financial-support",uni:"ucl",alt:{title:"Free and low-cost food at {uni}",body:"Many Students' Unions run a food pantry, community fridge or cheap-meal scheme. Ask your SU advice service what {uni} offers.",meta:[],link:"search:{uni} students union food pantry"}},
  tgtg:{pillar:"food",title:"Too Good To Go & Olio",body:"Apps for cheap surplus food from cafés, bakeries and supermarkets (Too Good To Go) and free food from neighbours (Olio). Most cities have lots of pick-ups.",meta:[["Cost","Free apps"]],link:"https://www.toogoodtogo.com/en-gb"},
  batch:{pillar:"food",title:"Batch-cook twice a week",body:"With £{food}/week and a {schedule} schedule, cooking 2 big batches (e.g. Sunday and Wednesday) saves both time and money. Plan around cheap staples: lentils, eggs, oats, frozen veg, rice.",meta:[["Saves","Time + money"]],link:"https://www.nhs.uk/healthier-families/recipes/"},
  catered:{pillar:"food",title:"Make the most of your catered meals",body:"Your meal plan already covers most food. Keep your £{food}/week for weekends and lunches on campus, and don't let meals you've paid for go to waste.",meta:[],link:"https://www.ucl.ac.uk/accommodation",uni:"ucl",alt:{link:"search:{uni} catered halls"}},

  stl:{pillar:"money",title:"UCL Short Term Loan: up to £250, interest-free",body:"For students whose loan, scholarship or stipend payment is delayed. Usually repaid after one month. Apply via askUCL with the Short Term Loan Questionnaire.",meta:[["Amount","Up to £250"],["Interest","0%"]],link:"https://www.ucl.ac.uk/study/student-finances/funding/loans/short-term-loans",uni:"ucl",alt:{title:"Emergency loan or funding-delay help at {uni}",body:"Many universities offer short-term emergency loans when your funding is delayed. Ask {uni}'s student funding team, and contact Student Finance too.",meta:[],link:"search:{uni} emergency loan students"}},
  faf:{pillar:"money",title:"UCL Financial Assistance Fund",body:"UCL's hardship fund for students in unexpected financial difficulty. It covers living costs (not tuition). Check this year's dates and eligibility on the page.",meta:[["Covers","Rent, food, bills"],["Apply","askUCL"]],link:"https://www.ucl.ac.uk/study/student-finances/funding/financial-assistance-fund",uni:"ucl",alt:{title:"{uni}'s hardship fund",body:"Most UK universities run a hardship fund for students in unexpected financial difficulty, usually for living costs. Check {uni}'s eligibility and deadlines.",meta:[],link:"search:{uni} hardship fund"}},
  sarah:{pillar:"money",title:"Sarah Douglas Hardship Fund & SU emergency grants",body:"Run by the Students' Union Advice Service for students in financial need who can't get UCL's Financial Assistance Fund, including emergency grants of up to £150.",meta:[["Amount","Emergency grants up to £150"]],link:"https://studentsunionucl.org/financial-support/sarah-douglas-hardship-fund",uni:"ucl",alt:{title:"Students' Union emergency support",body:"Many Students' Unions have small grants or emergency funds for students who can't get university hardship funding.",meta:[],link:"search:{uni} students union hardship fund"}},
  debt:{pillar:"money",title:"Free money & debt advice from the Students' Union",body:"Independent, confidential advice on budgeting, overdrafts and debt before it snowballs.",meta:[["Where","25 Gordon Street"]],link:"https://studentsunionucl.org/financial-support",uni:"ucl",alt:{title:"Free money & debt advice from your Students' Union",body:"Most Students' Unions run independent advice on money, debt, housing and academic issues.",meta:[],link:"search:{uni} students union advice service"}},
  col:{pillar:"money",title:"UCL Cost of Living Hub",body:"All of UCL's money help in one place, including emergency accommodation guidance and budgeting resources.",meta:[],link:"https://www.ucl.ac.uk/students/cost-living-hub",uni:"ucl",alt:{title:"{uni}'s cost of living support",body:"Most universities keep their money help in one place. Look for their cost of living or money advice page.",meta:[],link:"search:{uni} cost of living support students"}},
  oyster:{pillar:"money",title:"Get an 18+ Student Oyster photocard",body:"30% off adult-rate Travelcards and Bus & Tram Pass season tickets in London. If you also travel by train, a 16–25 Railcard saves a third on rail fares.",meta:[["Saves","30% on season tickets"]],link:"https://tfl.gov.uk/fares/free-and-discounted-travel/18-plus-student-discount"},
  work:{pillar:"money",title:"Part-time work: know your limits",body:"{workRule} UCL's careers service and the Students' Union both advertise student-friendly jobs.",meta:[],link:"https://www.ucl.ac.uk/careers",uni:"ucl",alt:{body:"{workRule} Your university's careers service and Students' Union usually advertise student-friendly jobs.",link:"search:{uni} careers service student jobs"}},
  bank:{pillar:"money",title:"Open a UK student bank account",body:"Most offer an interest-free overdraft. Compare them on terms, not freebies, and keep a weekly budget: £{money}/month after rent is about £{weekly}/week.",meta:[],link:"https://www.moneysavingexpert.com/students/student-bank-accounts/"},
  sfe:{pillar:"money",title:"Chase your Student Finance payment",body:"Delays usually come down to enrolment not being confirmed yet or missing details. Check your Student Finance account (SAAS in Scotland), and ask your university to confirm your enrolment.",meta:[["Where","Student Finance England account"]],link:"https://www.gov.uk/student-finance-register-login"},

  sra:{pillar:"social",title:"Say hi to your Student Residence Adviser",body:"SRAs live in your halls and are your first point of contact for anything welfare-related, from noise to homesickness. They also run community events.",meta:[["Where","Your halls"]],link:"https://www.ucl.ac.uk/study/support-and-wellbeing/mental-health-and-wellbeing/how-we-can-support-your-mental-health-and-wellbeing",uni:"ucl",alt:{title:"Meet your hall's residence life team",body:"University halls usually have residence assistants or wardens. They're your first point of contact for welfare, noise or homesickness, and they run community events.",meta:[["Where","Your halls"]],link:"search:{uni} residence life team"}},
  societies:{pillar:"social",title:"Join 1–2 Students' Union clubs or societies",body:"The quickest way to build a routine and meet people with shared interests. {schedNote}",meta:[["Where","studentsunionucl.org"]],link:"https://studentsunionucl.org/clubs-societies",uni:"ucl",alt:{title:"Join 1–2 Students' Union clubs or societies",body:"The quickest way to build a routine and meet people with shared interests. {schedNote}",meta:[["Where","{uni} Students' Union"]],link:"search:{uni} students union societies"}},
  intl:{pillar:"social",title:"UCL International Student Support",body:"Help adjusting to life in the UK, plus workshops and events for international students.",meta:[["Call","020 3108 4043"]],link:"https://www.ucl.ac.uk/students/international-students",uni:"ucl",alt:{title:"{uni}'s international student support",body:"Most universities have a team for international students, covering settling in, visas and events.",meta:[],link:"search:{uni} international student support"}},
  advice:{pillar:"study",title:"Students' Union Advice Service",body:"Free, confidential advice, independent of UCL, on academic issues, housing contracts and disputes, money and employment rights.",meta:[["Call","020 3549 5232"],["When","Mon–Fri 10:00–16:00"],["Where","25 Gordon Street, 1st floor"]],link:"https://studentsunionucl.org/advice-and-support/find-help/advice-service",uni:"ucl",alt:{title:"Your Students' Union advice service",body:"Most Students' Unions offer free, confidential advice, independent of the university, on academic issues, housing contracts and disputes, and money.",meta:[],link:"search:{uni} students union advice"}},
  ec:{pillar:"study",title:"Apply for Extenuating Circumstances",body:"If something sudden, unexpected and beyond your control (illness, bereavement, a crisis) affects an assessment, you can apply for mitigation such as an extension. Apply through Portico and tell your department promptly.",meta:[["Where","Portico"]],link:"https://www.ucl.ac.uk/study/section-3-short-term-illness-and-other-extenuating-circumstances-0",uni:"ucl",alt:{title:"Apply for extenuating (or mitigating) circumstances",body:"If something sudden and beyond your control affects an assessment, most universities let you apply for mitigation such as an extension. The name and process vary, so check {uni}'s policy and apply promptly.",meta:[],link:"search:{uni} extenuating mitigating circumstances"}},
  emergencyhousing:{pillar:"study",title:"UCL emergency accommodation guidance",body:"If you're an enrolled student and might suddenly have nowhere to stay, UCL can help you find somewhere. Speak to them before it becomes an emergency.",meta:[["Where","UCL Cost of Living Hub"]],link:"https://www.ucl.ac.uk/students/cost-living-hub",uni:"ucl",alt:{title:"Emergency housing help",body:"If you might lose your housing, contact {uni}'s accommodation or student support team now. The housing charity Shelter also gives free advice.",meta:[],link:"https://www.shelter.org.uk"}},
  carebursary:{pillar:"money",title:"UCL Care Experienced Bursary: £1,000 a year",body:"For UK (Home fee) undergraduates under 25 who were in local-authority care. There's no separate application: confirm your care-leaver status with Student Finance and UCL assesses you automatically. First-years can ask for a £200 advance for transition costs.",meta:[["Amount","£1,000 / year"],["Contact","studentfunding@ucl.ac.uk"]],link:"https://www.ucl.ac.uk/scholarships/care-leaver-bursary",uni:"ucl",alt:{title:"Support for care-experienced students",body:"Many UK universities offer extra bursaries and support for care-experienced students. Ask {uni}'s student funding team what you're entitled to.",meta:[],link:"search:{uni} care experienced bursary"}},
  estrangedbursary:{pillar:"money",title:"UCL Estranged Student Bursary: £1,000 a year",body:"For UK (Home fee) undergraduates under 25 whom Student Finance assesses as independent because of estrangement. Fill in a Confirmation of Estrangement form with Student Finance, and UCL contacts you. Became estranged during the year? Contact Student Funding.",meta:[["Amount","£1,000 / year"],["Contact","studentfunding@ucl.ac.uk"]],link:"https://www.ucl.ac.uk/scholarships/estranged-student-bursary",uni:"ucl",alt:{title:"Support for estranged students",body:"Many UK universities offer extra bursaries and support for students estranged from their parents. Ask {uni}'s student funding team, and ask Student Finance about being assessed as independent.",meta:[],link:"search:{uni} estranged student support"}},
  carers:{pillar:"social",title:"Support for student parents and carers",body:"UCL and the Students' Union run support for students with caring responsibilities, including an Officer for Students with Caring Responsibilities and a Parents and Carers Network. Full-time students in England may be eligible for a Childcare Grant or Parents' Learning Allowance.",meta:[["Who","SU Officer for Students with Caring Responsibilities"]],link:"https://www.ucl.ac.uk/study/support-and-wellbeing/specialist-support/students-children",uni:"ucl",alt:{title:"Support for student parents and carers",body:"Ask {uni}'s student support team about support for students with caring responsibilities. Full-time students in England may be eligible for a Childcare Grant or Parents' Learning Allowance.",meta:[],link:"https://www.gov.uk/childcare-grant"}},
  reportsupport:{pillar:"mental",title:"UCL Report + Support",body:"Report bullying, harassment, sexual misconduct or violence, anonymously or with your details, or ask to speak to an adviser about your options. If you're in immediate danger, call 999.",meta:[["How","Online, anonymous option"]],link:"https://report-support.ucl.ac.uk",uni:"ucl",alt:{title:"Report harassment at {uni}",body:"Most universities have an online reporting tool, often with an anonymous option, and advisers who can talk through your options. If you're in immediate danger, call 999.",meta:[],link:"search:{uni} report harassment"}},
  chaplaincy:{pillar:"social",title:"UCL Chaplaincy",body:"Pastoral support for religious or faith concerns, and for students of any faith or none.",meta:[["Email","chaplaincy@ucl.ac.uk"],["Call","020 3108 8942"]],link:"https://www.ucl.ac.uk/students/support-and-wellbeing-services",uni:"ucl",alt:{title:"{uni}'s chaplaincy or faith centre",body:"Most universities have chaplains or a faith centre offering pastoral support to students of any faith or none.",meta:[],link:"search:{uni} chaplaincy"}},
  lgbt:{pillar:"social",title:"LGBTQ+ support",body:"The UCL 24/7 Student Support Line can connect you with an adviser trained in LGBTQ+ issues. The Students' Union also has an LGBTQ+ Students' Network and a Gender Expression Fund for trans, non-binary and gender non-conforming students.",meta:[["24/7 line","0808 238 0077"]],link:"https://studentsunionucl.org/gender-affirmation-fund",uni:"ucl",alt:{title:"LGBTQ+ support",body:"Most Students' Unions have an LGBTQ+ society or network. Switchboard runs a national LGBTQ+ support line.",meta:[],link:"https://switchboard.lgbt"}},
  tutor:{pillar:"social",title:"Book a chat with your Personal Tutor",body:"Every taught student has one. They can help with settling in and academic worries, and point you to specialist help.",meta:[["How","Email via your department"]],link:"https://www.ucl.ac.uk/students/support-and-wellbeing-services",uni:"ucl",alt:{title:"Book a chat with your Personal Tutor",body:"Most universities give every student a personal or academic tutor. They can help with settling in and academic worries, and point you to specialist help.",meta:[["How","Email via your department"]],link:"search:{uni} personal tutor"}},
};
