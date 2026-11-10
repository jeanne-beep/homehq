// Static content: people, routines, recipes, mental-health mini-plans.
const PEOPLE = [
  {id:'jeanne', name:'Jeanne', emoji:'🌻', born:null, parent:true, color:'#f9a8d4'},
  {id:'eli', name:'Eli', emoji:'🛠️', born:null, parent:true, color:'#93c5fd'},
  {id:'sophie', name:'Sophie', emoji:'🚗', born:'2008-04-02', color:'#c4b5fd'},
  {id:'sam', name:'Sam', emoji:'🎮', born:'2011-04-19', color:'#6ee7b7'},
  {id:'jack', name:'Jack', emoji:'🎺', born:'2014-05-12', color:'#fcd34d'},
];

// days: omitted = every day. 0=Sun..6=Sat. school:true = weekdays only. pts = incentive points.
const TASKS = [
  // ---- Jeanne (recovery mode: gentle; follow surgeon's restrictions) ----
  {id:'j1',who:'jeanne',t:'07:30',title:'Wake, meds + water, 2 min gentle breathing',pts:5},
  {id:'j2',who:'jeanne',t:'09:00',title:'Short flat walk / PT movements (as cleared by surgeon)',pts:10},
  {id:'j3',who:'jeanne',t:'12:00',title:'Lunch with protein + meds on schedule',pts:5},
  {id:'j4',who:'jeanne',t:'13:00',title:'Rest block: neck supported, no lifting/bending',pts:5},
  {id:'j5',who:'jeanne',t:'16:30',title:'Plan dinner vote & delegate tonight\u2019s jobs (sit-down task)',pts:5},
  {id:'j6',who:'jeanne',t:'21:30',title:'10-min mini-plan + wind down',pts:10},
  // ---- Eli ----
  {id:'e1',who:'eli',t:'06:30',tw:'05:30',title:'Wake, meds, feed & water dogs + cats',pts:10},
  {id:'e2',who:'eli',t:'07:00',tw:'05:50',title:'Chickens: feed, water, collect eggs (check the patio)',pts:10},
  {id:'e6',who:'eli',t:'06:35',title:'Boys\u2019 breakfast + lunches packed, bags at the door',pts:10,school:true},
  {id:'e7',who:'eli',t:'06:55',title:'Out the door with Sam & Jack',pts:10,school:true},
  {id:'e3',who:'eli',t:'17:00',title:'COOP BLOCK: 45 min on the coop BEFORE any other project',pts:25,days:[1,2,3,4,5,6]},
  {id:'e4',who:'eli',t:'18:30',title:'Family dinner: host & listen',pts:10},
  {id:'e5',who:'eli',t:'21:00',title:'Check on Jeanne, set next-day top 3',pts:10},
  // ---- Sophie ----
  {id:'s1',who:'sophie',t:'07:00',title:'Wake, meds, get ready',pts:5,school:true},
  {id:'s2',who:'sophie',t:'08:00',title:'Check planner: today\u2019s class + shift times',pts:10,school:true},
  {id:'s3',who:'sophie',t:'17:30',title:'Scoop cat litter boxes (garage + upstairs landing)',pts:15,verify:true},
  {id:'s4',who:'sophie',t:'18:30',title:'Family dinner: cook night or clean-up crew',pts:10},
  {id:'s5',who:'sophie',t:'20:00',title:'Weekly plan + budget check (Sun): car note, gas',pts:20,days:[0]},
  {id:'s6',who:'sophie',t:'22:30',title:'Phone on charger outside bed, lights out',pts:5},
  // ---- Sam ----
  {id:'m1',who:'sam',t:'06:00',title:'Wake, meds, get dressed',pts:5,school:true},
  {id:'m0',who:'sam',t:'06:40',title:'Backpack, shoes, water bottle at the door',pts:5,school:true},
  {id:'m2',who:'sam',t:'06:55',title:'Leave the house (on time!)',pts:10,school:true},
  {id:'m3',who:'sam',t:'16:00',title:'Homework first (parent verifies grades portal)',pts:20,verify:true},
  {id:'m4',who:'sam',t:'17:00',title:'30 min outside/active: walk dogs, hoops, or coop help',pts:15,verify:true},
  {id:'m5',who:'sam',t:'18:30',title:'Family dinner: at the table, phone away',pts:15},
  {id:'m6',who:'sam',t:'20:00',title:'Gaming/Discord window (earned, ends 21:00)',pts:0},
  {id:'m7',who:'sam',t:'21:30',title:'Devices out of bedroom, lights out',pts:10},
  // ---- Jack ----
  {id:'k1',who:'jack',t:'06:00',title:'Wake, meds, get dressed',pts:5,school:true},
  {id:'k2',who:'jack',t:'07:00',tw:'06:05',title:'Shower/bath + deodorant (parent checks)',pts:15,verify:true},
  {id:'k0',who:'jack',t:'06:40',title:'Backpack, shoes, band instrument at the door',pts:5,school:true},
  {id:'k9',who:'jack',t:'06:55',title:'Leave the house (on time!)',pts:10,school:true},
  {id:'k3',who:'jack',t:'15:30',title:'Check band/school calendar: write next 3 dates down',pts:10,days:[1,3,5]},
  {id:'k4',who:'jack',t:'16:15',title:'Homework + pack bag for tomorrow',pts:20,verify:true},
  {id:'k5',who:'jack',t:'17:15',title:'Band practice (instrument 15 min)',pts:10},
  {id:'k6',who:'jack',t:'18:30',title:'Family dinner: at the table, phone away',pts:15},
  {id:'k8',who:'jack',t:'21:00',title:'Phone on charger in kitchen, lights out',pts:10},
  // ---- Animals & home (anyone can claim; assigned defaults) ----
  {id:'a1',who:'sam',t:'07:15',tw:'06:10',title:'Dogs: fresh water + breakfast',pts:10,verify:true},
  {id:'a2',who:'jack',t:'17:45',title:'Dogs: dinner + fresh water',pts:10,verify:true},
  {id:'a3',who:'sophie',t:'17:45',title:'Cats: feed both + fresh water',pts:10,verify:true},
  {id:'a4',who:'sam',t:'10:00',title:'Bathe a dog (rotate Dog 1/2/3 each Sat)',pts:25,days:[6],verify:true},
  {id:'a5',who:'jack',t:'10:00',title:'Help bathe dog + towel dry',pts:15,days:[6],verify:true},
  {id:'a6',who:'sophie',t:'11:00',title:'Deep-clean litter boxes (weekly)',pts:20,days:[6],verify:true},
  {id:'a7',who:'sam',t:'11:30',title:'Chicken run: refresh bedding/water (no heavy lifting for Mom)',pts:15,days:[6],verify:true},
  {id:'a8',who:'jack',t:'17:00',title:'Collect eggs + check chicken water',pts:5},
];

const DEFAULT_REWARDS = [
  {id:'r1',name:'30 extra min gaming (before 9pm)',cost:60,emoji:'🎮'},
  {id:'r2',name:'Pick the family movie night',cost:80,emoji:'🍿'},
  {id:'r3',name:'Skip one chore (not animals/hygiene)',cost:100,emoji:'🎟️'},
  {id:'r4',name:'$5 into your bank',bank:5,cost:150,emoji:'💵'},
  {id:'r5',name:'Friend over / hangout (pre-approved)',cost:180,emoji:'🧑‍🤝‍🧑'},
  {id:'r6',name:'1-on-1 outing with a parent',cost:220,emoji:'🍦'},
  {id:'r7',name:'Pick Friday dinner takeout spot',cost:260,emoji:'🍕'},
  {id:'r8',name:'$20 into your bank',bank:20,cost:500,emoji:'🎁'},
];

// Family-wide goal: team points unlock a shared reward.
const FAMILY_GOAL = {name:'Family pizza + movie night at home', target:1500, emoji:'🍕'};

const MEAT_OPTIONS = [
  {id:'chicken',name:'Chicken',emoji:'🍗'},{id:'beef',name:'Beef',emoji:'🥩'},
  {id:'pork',name:'Pork',emoji:'🥓'},{id:'meatless',name:'Meatless',emoji:'🥦'},
];

// High-protein, lower-carb. 'src' = suggested place to buy near Slidell 70461.
const RECIPES = {
  chicken:[
    {name:'Garlic Parmesan Chicken Thighs + Roasted Broccoli',protein:'42g',carbs:'8g',time:'40 min',
     ing:[['Bone-in skin-on chicken thighs (2 lb)','Rouses / Winn-Dixie meat counter, Costco'],['Parmesan, grated','Walmart, Rouses'],['Garlic, olive oil','Walmart'],['Broccoli crowns (2)','Walmart, Winn-Dixie produce']],
     steps:['Heat oven to 425°F.','Toss thighs in oil, garlic, salt, pepper; top with parmesan.','Roast with broccoli on a sheet pan 30\u201335 min until 175°F internal.']},
    {name:'Creole Chicken & Cauliflower Rice Skillet',protein:'38g',carbs:'10g',time:'30 min',
     ing:[['Chicken breast (1.5 lb)','Costco, Winn-Dixie'],['Frozen riced cauliflower','Walmart'],['Creole seasoning','Walmart (Tony Chachere\u2019s)'],['Bell pepper, celery, onion','Walmart, Rouses']],
     steps:['Season & sear diced chicken 6 min.','Add trinity veg, cook 4 min.','Stir in cauliflower rice 5 min. Done.']},
    {name:'Slow-Cooker Salsa Chicken Lettuce Tacos',protein:'36g',carbs:'7g',time:'4h (5 min prep)',
     ing:[['Chicken breast (2 lb)','Costco, Walmart'],['Salsa (1 jar)','Walmart'],['Romaine or butter lettuce','Walmart'],['Shredded cheese, sour cream','Walmart']],
     steps:['Slow cooker: chicken + salsa on low 4\u20136h.','Shred. Serve in lettuce cups. Great for low-energy days.']},
  ],
  beef:[
    {name:'Taco Skillet (no shells) with Cheddar',protein:'35g',carbs:'6g',time:'20 min',
     ing:[['Ground beef 90/10 (2 lb)','Costco, Winn-Dixie'],['Taco seasoning','Walmart'],['Diced tomatoes & chiles (can)','Walmart'],['Cheddar, lettuce, avocado','Walmart, Rouses']],
     steps:['Brown beef, drain.','Add seasoning + tomatoes, simmer 8 min.','Top with cheese, serve over lettuce.']},
    {name:'Sheet-Pan Steak Bites & Green Beans',protein:'40g',carbs:'9g',time:'25 min',
     ing:[['Sirloin steak (2 lb)','Costco, Rouses'],['Fresh green beans','Walmart, Winn-Dixie'],['Butter, garlic','Walmart']],
     steps:['Cube steak, toss with beans, oil, garlic.','Roast 450°F 12\u201315 min. Finish with butter.']},
    {name:'Beef & Broccoli Stir-Fry (coconut aminos)',protein:'34g',carbs:'11g',time:'25 min',
     ing:[['Flank steak (1.5 lb)','Winn-Dixie, Costco'],['Broccoli florets','Walmart'],['Coconut aminos / low-sodium soy','Walmart, Rouses'],['Ginger, garlic','Walmart']],
     steps:['Slice steak thin, sear hot 3 min.','Add broccoli + sauce, cover 4 min.']},
  ],
  pork:[
    {name:'Herb Pork Tenderloin + Roasted Asparagus',protein:'38g',carbs:'5g',time:'35 min',
     ing:[['Pork tenderloin (2)','Costco, Winn-Dixie'],['Asparagus','Walmart, Rouses'],['Italian herbs, garlic, oil','Walmart']],
     steps:['Rub pork with herbs; sear 8 min.','Roast 400°F 15\u201318 min to 145°F; rest 5 min.','Roast asparagus 10 min alongside.']},
    {name:'Smoked Sausage & Cabbage Skillet',protein:'28g',carbs:'10g',time:'25 min',
     ing:[['Andouille/smoked sausage (2 pk)','Rouses, Winn-Dixie'],['Green cabbage','Walmart'],['Onion, Cajun seasoning','Walmart']],
     steps:['Brown sliced sausage.','Add cabbage + onion, cook 12 min.']},
    {name:'Slow-Cooker Pulled Pork Bowls',protein:'36g',carbs:'8g',time:'6h (10 min prep)',
     ing:[['Pork shoulder (3 lb)','Costco, Winn-Dixie'],['Sugar-free BBQ rub/sauce','Walmart'],['Coleslaw mix (no sugar dressing)','Walmart']],
     steps:['Rub pork, slow cook low 8h / high 5h.','Shred; serve over slaw. Leftovers for lunch.']},
  ],
  meatless:[
    {name:'Greek Yogurt Egg Scramble + Veg Bake',protein:'30g',carbs:'9g',time:'25 min',
     ing:[['Eggs (18 ct)','Walmart, or our own hens! \ud83d\udc14'],['Spinach, peppers','Walmart'],['Feta','Walmart, Rouses']],
     steps:['Whisk eggs + feta, pour over sautéed veg in oven-safe pan.','Bake 375°F 18 min.']},
    {name:'Tofu Cauliflower Fried "Rice"',protein:'28g',carbs:'12g',time:'25 min',
     ing:[['Extra-firm tofu (2)','Walmart, Rouses'],['Frozen riced cauliflower','Walmart'],['Eggs, frozen peas/carrots, coconut aminos','Walmart']],
     steps:['Crisp cubed tofu 8 min.','Add veg + cauliflower rice + egg, season.']},
    {name:'Black Soybean & Cheese Stuffed Peppers',protein:'26g',carbs:'13g',time:'40 min',
     ing:[['Black soybeans (canned)','Walmart (Eden), Rouses'],['Bell peppers (4)','Walmart'],['Cheese, salsa','Walmart']],
     steps:['Fill halved peppers with beans, salsa, cheese.','Bake 375°F 30 min.']},
  ],
};

// ~10-minute mini mental-health plans. Evidence-informed (CBT, DBT, behavioral activation, mindfulness, ADHD coaching).
const WELLNESS = {
  jeanne:{title:'Recovery & Reset',mins:10,steps:[
    ['2 min','Box breathing (4-4-4-4). Keep shoulders soft, neck supported.'],
    ['2 min','Body scan: where is pain? Rate 0\u201310. Note, don\u2019t fight it.'],
    ['3 min','Brain dump + pick the ONE thing that matters today. Delegate the rest.'],
    ['2 min','Self-compassion: "I\u2019m recovering. Asking for help is part of the plan."'],
    ['1 min','Name one thing Eli or the kids did well; tell them at dinner.']]},
  eli:{title:'Anchor & Finish',mins:10,steps:[
    ['2 min','Slow breathing: in 4, out 6, five times.'],
    ['3 min','Write today\u2019s Top 3. #1 is always the coop block. Phone out of reach.'],
    ['3 min','Brain-dump the distracting ideas into a "Parking Lot" list \u2014 not today.'],
    ['2 min','Caregiver check: what does Jeanne need? What do I need? Ask for one thing.']]},
  sophie:{title:'Plan Ahead',mins:10,steps:[
    ['2 min','Grounding 5-4-3-2-1 senses.'],
    ['4 min','Write tomorrow: class times, work shift, gas/car cost, one chore.'],
    ['2 min','Pick 1 small step for each big task (break it down).'],
    ['2 min','Set 2 phone alarms: "leave on time" and "start prep".']]},
  sam:{title:'Reconnect',mins:10,steps:[
    ['2 min','Mood check: pick a word (tired, bored, anxious, mad, ok). No judgment.'],
    ['3 min','Move: push-ups, stretch, or step outside for fresh air + sunlight.'],
    ['3 min','Text/talk to ONE in-person person (family, teammate, friend).'],
    ['2 min','Choose one thing to look forward to this week offline. Tell Mom/Dad.']]},
  jack:{title:'Calm & Plan',mins:10,steps:[
    ['2 min','Smell the flower, blow the candle: 5 slow breaths.'],
    ['3 min','Write 3 school/band things coming up in your planner.'],
    ['3 min','Pick a calm activity: draw, play 1 song, stretch.'],
    ['2 min','Say: one good thing, one hard thing.']]},
};

// Daily checklist everyone owns. verifyFor = people whose item needs parent verification.
const CORE = [
  {id:'bed',t:'07:10',early:'06:15',title:'Make your bed',pts:3},
  {id:'dress',t:'07:15',early:'06:20',title:'Get dressed (clean clothes)',pts:3},
  {id:'teethAM',t:'07:20',early:'06:30',title:'Brush teeth (morning)',pts:4,verifyFor:['jack']},
  {id:'dishes',t:'19:15',title:'Clear your dishes + help clean up dinner',pts:5},
  {id:'tidy',t:'20:00',title:'10-minute tidy of your space + dirty laundry in hamper',pts:5},
  {id:'teethPM',t:'21:00',title:'Brush teeth (night)',pts:4,verifyFor:['jack']},
];

// Optional extra chores for bonus points; any person may claim.
const DEFAULT_EXTRAS = [
  {id:'x1',name:'Vacuum living room + hall',pts:15},
  {id:'x2',name:'Clean a bathroom (sink, toilet, mirror)',pts:25},
  {id:'x3',name:'Wash and vacuum a car',pts:30},
  {id:'x4',name:'Take out all trash + recycling',pts:10},
  {id:'x5',name:'Mow / rake / pick up yard',pts:30},
  {id:'x6',name:'Help Eli with the coop (1 hour)',pts:35},
  {id:'x7',name:'Fold + put away a load of laundry',pts:15},
  {id:'x8',name:'Wipe kitchen counters, stove, table',pts:10},
  {id:'x9',name:'Organize garage or closet shelf',pts:25},
];

// Outing ideas near Slidell, LA. Check hours/prices before going.
const OUTING_IDEAS = [
  {type:'weekly',title:'Walk / picnic at Camp Salmen Nature Park (Slidell)',cost:'Free-$'},
  {type:'weekly',title:'Frozen yogurt or snoballs + sit by the water',cost:'$'},
  {type:'weekly',title:'Backyard campfire, s\u2019mores and board games',cost:'$'},
  {type:'weekly',title:'Library or bookstore trip, each picks a book',cost:'Free-$'},
  {type:'weekly',title:'Bike ride or fishing at Slidell waterfront',cost:'Free'},
  {type:'weekly',title:'Movie night at home: winner picks, family-made popcorn',cost:'$'},
  {type:'weekly',title:'Cook a new recipe together (kids choose)',cost:'$'},
  {type:'monthly',title:'Honey Island Swamp airboat/boat tour',cost:'$$$'},
  {type:'monthly',title:'Audubon Zoo or Aquarium (New Orleans)',cost:'$$$'},
  {type:'monthly',title:'Fontainebleau State Park day (beach, trails)',cost:'$'},
  {type:'monthly',title:'City Park New Orleans: Botanical Garden, rides',cost:'$$'},
  {type:'monthly',title:'Abita Springs: trail, root beer, mystery house',cost:'$$'},
  {type:'monthly',title:'Gulf Coast beach day (Bay St. Louis / Waveland)',cost:'$$'},
  {type:'monthly',title:'Escape room or bowling/arcade night',cost:'$$'},
];

const MOODS = [['😄','Great'],['🙂','Good'],['😐','Meh'],['😟','Anxious'],['😠','Angry'],['😢','Sad']];

const DINNER_PROMPTS = [
  'Rose, bud, thorn: best part, something to look forward to, hardest part of today.',
  'What is one thing you\u2019re proud of that nobody noticed?',
  'What\u2019s a funny thing a chicken, dog, or cat did this week?',
  'If we planned a free Saturday, what would YOU pick (no screens)?',
  'Who helped you today? Say thank you out loud.',
  'What\u2019s one thing that\u2019s stressing you that we can help with?',
  'Teach us something you learned this week.',
];

const COOP_MILESTONES = [
  'Pick final design & size (check parish rules)','Buy materials list','Clear & level site','Build floor/frame',
  'Walls + hardware cloth (predator-proof)','Roof + ventilation','Nest boxes + roosts','Run fencing',
  'Door latch (raccoon-proof)','Move hens in!'];

const STORES = [
  {name:'Walmart (Slidell)',q:'https://www.walmart.com/search?q='},
  {name:'Costco / Sam\u2019s (bulk meat)',q:'https://www.google.com/maps/search/costco+near+70461'},
  {name:'Rouses Markets',q:'https://www.google.com/maps/search/rouses+near+70461'},
  {name:'Winn-Dixie',q:'https://www.google.com/maps/search/winn-dixie+near+70461'},
];

