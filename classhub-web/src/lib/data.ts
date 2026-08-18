export const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","Computer Science","English","Tamil","Social Science","Vedic Maths / Abacus","Spoken English / IELTS","Carnatic Vocal Music"];
export const LOCATIONS = ["Adyar","T. Nagar","Anna Nagar","Velachery","Mylapore","Tambaram","Porur","OMR / Sholinganallur"];
export const FORMATS = ["Home visit","At center","Online"];
export const TIME_SLOTS = ["7:00 AM","8:00 AM","4:00 PM","5:00 PM","6:00 PM","7:00 PM"];

export const TUTORS = [
  { id:"t1", name:"Lakshmi Narayanan", kind:"Individual tutor", subjects:["Mathematics","Physics"], grades:"Grades 9–12, CBSE & State Board", location:"Adyar", formats:["Home visit","Online"], fee:650, rating:4.8, reviewsCount:63, experience:"11 years", verified:true,
    bio:"Former HOD of Mathematics at a CBSE school in Adyar, now teaching full-time from home. Focuses on building problem-solving speed for board and entrance exams rather than rote formulas.",
    achievements:["94% of students scored above 85 in Class 12 CBSE boards (2025 batch)","Coached 40+ students into JEE Main qualification since 2019","Author of a self-published Class 10 Maths practice workbook"],
    reviews:[{name:"Meera S.",rating:5,text:"My son went from a C to an A in one term. Explains concepts patiently and never rushes."},{name:"Ganesh R.",rating:5,text:"Very structured. Sends a WhatsApp summary after every class, which parents really appreciate."},{name:"Priya K.",rating:4,text:"Great teaching, slots fill up fast so book a few weeks ahead."}] },
  { id:"t2", name:"Vidya Achievers Academy", kind:"Tuition center", subjects:["Chemistry","Biology","Physics"], grades:"NEET & Class 11–12", location:"Velachery", formats:["At center"], fee:900, rating:4.6, reviewsCount:128, experience:"9 years running", verified:true,
    bio:"A NEET-focused center with five full-time faculty and weekly mock tests. Batches capped at 18 students so doubt-clearing sessions stay personal.",
    achievements:["212 NEET qualifiers in the last 3 years","6 students in Government Medical College, Chennai (2025)","Weekly All-India-style mock test with rank sheet"],
    reviews:[{name:"Divya M.",rating:5,text:"The mock tests are exactly the difficulty level of the real exam. Huge help."},{name:"Suresh V.",rating:4,text:"Good faculty, though the center can get crowded during peak evening slots."}] },
  { id:"t3", name:"Karthik Subramaniam", kind:"Individual tutor", subjects:["Computer Science"], grades:"Class 11–12, B.Tech 1st year, Python & DSA", location:"Porur", formats:["Online","At center"], fee:750, rating:4.9, reviewsCount:41, experience:"6 years", verified:true,
    bio:"Software engineer by day, teaches Python, DSA and Class 12 Computer Science by evening. Uses real coding assignments instead of only theory.",
    achievements:["Ex-tutor at a Chennai coding bootcamp, 500+ students taught","Built a free DSA practice sheet used by 2,000+ students online"],
    reviews:[{name:"Aravind T.",rating:5,text:"Explains recursion better than my college professor did. Very hands-on."},{name:"Fathima N.",rating:5,text:"Great for interview prep too, not just the syllabus."}] },
  { id:"t4", name:"Anitha Krishnan", kind:"Individual tutor", subjects:["Vedic Maths / Abacus"], grades:"Ages 5–12", location:"Anna Nagar", formats:["At center","Home visit"], fee:400, rating:4.7, reviewsCount:89, experience:"8 years", verified:true,
    bio:"Runs small-group abacus and Vedic Maths classes for young children, with a focus on making mental arithmetic fun rather than stressful.",
    achievements:["Certified Abacus Level 8 instructor","Students regularly place in inter-school abacus competitions"],
    reviews:[{name:"Revathi P.",rating:5,text:"My daughter actually looks forward to Maths class now. That says a lot."},{name:"Bala Murugan","rating:4,text":"Good pacing for younger kids, small batch sizes."}] },
  { id:"t5", name:"Rohan Balaji", kind:"Individual tutor", subjects:["Spoken English / IELTS","English"], grades:"Adults & Class 9–12", location:"T. Nagar", formats:["Online","At center"], fee:550, rating:4.5, reviewsCount:34, experience:"5 years", verified:false,
    bio:"IELTS-certified trainer helping working professionals and students with spoken fluency, grammar and exam-specific writing practice.",
    achievements:["Students averaging Band 7+ in IELTS over the last 2 years","Runs a free weekend conversation club in T. Nagar"],
    reviews:[{name:"Shalini R.",rating:4,text:"Helped me get my IELTS score up for my Canada visa. Practical tips."},{name:"Vignesh M.",rating:5,text:"Very encouraging with beginners, no judgment about mistakes."}] },
  { id:"t6", name:"Meena Rajagopal", kind:"Individual tutor", subjects:["Biology","Chemistry"], grades:"NEET & Class 11–12", location:"Mylapore", formats:["Home visit"], fee:700, rating:4.8, reviewsCount:52, experience:"10 years", verified:true,
    bio:"NEET Biology specialist who visits students at home in and around Mylapore. Known for diagram-heavy notes that are easy to revise from.",
    achievements:["58 students cleared NEET with Biology scores above 320/360","Publishes free NCERT-based revision notes on a Telegram channel"],
    reviews:[{name:"Kavya S.",rating:5,text:"Her diagrams are honestly better than my textbook. Made revision so much faster."}] },
  { id:"t7", name:"Brightsparks Learning Center", kind:"Tuition center", subjects:["Mathematics","Physics","Chemistry","English"], grades:"Class 6–10, all boards", location:"Tambaram", formats:["At center"], fee:500, rating:4.4, reviewsCount:76, experience:"7 years running", verified:true,
    bio:"A neighbourhood center covering all core subjects for middle and high school, with daily homework support slots after regular classes.",
    achievements:["Consistent 90%+ pass rate across batches since 2020","Free daily homework-help hour for enrolled students"],
    reviews:[{name:"Elango K.",rating:4,text:"Affordable and reliable. My twins have been going here for two years."}] },
  { id:"t8", name:"Deepa Chandrasekaran", kind:"Individual tutor", subjects:["Carnatic Vocal Music"], grades:"Ages 7 and up", location:"OMR / Sholinganallur", formats:["Online","At center"], fee:450, rating:4.9, reviewsCount:45, experience:"14 years", verified:true,
    bio:"Trained under a senior Carnatic vidwan in Chennai, now teaching vocal music from beginner geethams to advanced kritis, online and in person.",
    achievements:["Students regularly perform at Margazhi season sabha concerts","Runs an annual arangetram-prep intensive"],
    reviews:[{name:"Lalitha N.",rating:5,text:"Patient with beginners, and pushes advanced students just the right amount."}] },
];

export const MOCK_BOOKINGS = [
  { id:"b1", studentName:"Ramesh Iyer (for Sanjana, Gr 10)", subject:"Mathematics", date:"18 Aug", time:"5:00 PM", status:"Confirmed", amount:650 },
  { id:"b2", studentName:"Kavitha Balan (for self)", subject:"Physics", date:"19 Aug", time:"7:00 PM", status:"Pending", amount:650 },
  { id:"b3", studentName:"Arjun Menon (for Aditya, Gr 9)", subject:"Mathematics", date:"21 Aug", time:"4:00 PM", status:"Confirmed", amount:650 },
  { id:"b4", studentName:"Nithya Raman (for Keerthi, Gr 11)", subject:"Physics", date:"22 Aug", time:"6:00 PM", status:"Completed", amount:650 },
];
