// Household content: whole-house cleans, home care schedule, projects, design.
// Jobs are [text, personId]. Jeanne's jobs are seated/light (follow surgeon's restrictions).
const HOUSE_LISTS = {
  whole:{title:'Whole-house blitz',intro:'Everyone, one big push. Music on, 90 minutes, finish with pizza. Jeanne does seated jobs only.',zones:[
    {z:'🍳 Kitchen',jobs:[['Clear + wipe counters, bar, table, stovetop','sophie'],['Load/run dishwasher, wash pots','sam'],['Wipe fridge front, microwave, small appliances','jack'],['Sweep + mop floor','eli'],['Empty all trash/recycling, new bags','jack'],['Seated: wipe cabinet fronts, make a grocery/supplies list','jeanne']]},
    {z:'🛋️ Living room + hall',jobs:[['Put toys, shoes, cups, laundry baskets where they belong','jack'],['Dust built-ins, TV, fan, mantel, baseboards','sam'],['Vacuum/sweep + mop tile, under furniture','eli'],['Wipe windows, glass doors, switches, door handles','sophie'],['Seated: fluff + fold blankets and pillows, sort the mail pile','jeanne']]},
    {z:'🚽 Bathrooms',jobs:[['Scrub toilets, sinks, mirrors','sophie'],['Scrub tub/shower, wipe tile','sam'],['Floors, trash, restock paper + towels','jack']]},
    {z:'🛏️ Bedrooms',jobs:[['Sophie: strip + wash bed, clear floor/desk','sophie'],['Sam: strip + wash bed, clear floor/desk','sam'],['Jack: strip + wash bed, clear floor/desk','jack'],['Eli + Jeanne\u2019s room: strip/wash bed, clear surfaces','eli']]},
    {z:'🧺 Laundry',jobs:[['Run + move loads through washer/dryer','eli'],['Seated: fold + sort laundry into each person\u2019s pile','jeanne'],['Everyone puts their own pile away (after dinner)','sam']]},
    {z:'🚗 Garage + litter',jobs:[['Scoop + wash garage litter box, fresh litter, sweep around it','sophie'],['Haul one load: trash / donate / keep sort (aim: car fits!)','eli'],['Help Eli carry + stack donations','sam']]},
    {z:'🪜 Upstairs landing',jobs:[['Scoop litter box, wipe area, vacuum landing + stairs','jack']]},
    {z:'🌿 Outside + patio',jobs:[['Screened patio: sweep + hose droppings (chickens)','sam'],['Sweep porch, wipe doors, shake out mats','jack'],['Trash walk + pick up sticks/dog waste in yard','sophie'],['Blow off driveway + walkways','eli']]},
  ]},
  upstairs:{title:'Upstairs deep-clean weekend',intro:'Sophie\u2019s old suite, the landing, and Eli\u2019s office. Work top to bottom (fan, shelves, then floors). Good Saturday + Sunday morning project.',zones:[
    {z:'🛏️ Sophie\u2019s old bedroom suite',jobs:[['Empty closet + drawers: keep / donate / trash','sophie'],['Strip bed, wash bedding + curtains','sophie'],['Dust fan, vents, blinds, shelves, baseboards','sam'],['Wash windows + sills','jack'],['Vacuum under bed + corners, mop floor','eli'],['Seated: decide what the room becomes (guest room? craft/study?)','jeanne']]},
    {z:'🚿 Suite bathroom',jobs:[['Scrub toilet, tub/shower, grout; check for mildew (humid!)','sophie'],['Clean vent fan cover, mirror, sink','sam'],['Mop floor, wash rugs + towels, empty trash','jack']]},
    {z:'🪜 Landing + stairs',jobs:[['Scoop/wash litter box, wipe wall + floor around it','sophie'],['Dust railings, vacuum stairs + landing','jack']]},
    {z:'💻 Eli\u2019s office',jobs:[['Sort paper pile: shred / file / scan; clear desk','eli'],['Dust electronics + screens with microfiber, tidy cables','eli'],['Vacuum, wipe windows, empty trash','sam'],['Seated: help Eli decide what to keep, label bins','jeanne']]},
  ]},
};

// Home care. f: weekly | monthly | seasonal. s: seasons for seasonal. w: eli | jeanne | either.
// APPEND ONLY (ids come from position).
const HOME_TASKS = [
  // weekly
  {a:'🏊 Pool',t:'Skim, empty baskets, brush walls/steps, test pH + free chlorine (pH 7.2\u20137.6)',f:'weekly',w:'eli'},
  {a:'🏊 Pool',t:'Check water level, pump/filter pressure, salt cell lights/output',f:'weekly',w:'eli'},
  {a:'🐝 Bees',t:'Landing-board check from the side: traffic, dead-bee pile, robbing, ants, hive stand level',f:'weekly',w:'eli'},
  {a:'🌿 Yard',t:'Mow/trim front + side yard (weekly Mar\u2013Oct, as needed Nov\u2013Feb)',f:'weekly',w:'eli'},
  {a:'🚗 Garage',t:'One 30-minute garage session: sort a shelf or pile until the car fits',f:'weekly',w:'either'},
  {a:'🐔 Patio',t:'Rake/sweep + hose screened patio, fresh bedding while hens are living there',f:'weekly',w:'either'},
  {a:'🧹 House',t:'Quick reset: entry doors/mats, floors, trash + recycling out',f:'weekly',w:'either'},
  // monthly
  {a:'🏊 Pool',t:'Full water test: salt ppm, alkalinity, calcium hardness, stabilizer (CYA); clean filter; inspect salt cell for scale',f:'monthly',w:'eli'},
  {a:'💧 Well',t:'Check pressure tank gauge, listen for pump short-cycling, check filter housing + water smell/taste',f:'monthly',w:'eli'},
  {a:'🐝 Bees',t:'Full hive inspection (every 2\u20133 weeks in active season): brood, queen, stores, space, hive beetle/wax moth',f:'monthly',w:'eli'},
  {a:'🐝 Bees',t:'Varroa mite check (alcohol wash or sugar roll) and treat if needed; refill bee water source',f:'monthly',w:'eli'},
  {a:'🚽 Septic',t:'Look/smell around tank lid + drain field; slow drains or gurgling? No vehicles on field',f:'monthly',w:'either'},
  {a:'🔥 Safety',t:'Test smoke + CO detectors, check fire extinguisher gauge',f:'monthly',w:'either'},
  {a:'❄️ HVAC',t:'Check/replace A/C filter (humid climate: monthly check)',f:'monthly',w:'either'},
  {a:'🐜 Pests',t:'Termite check (mud tubes, soft sills, wings), wasp nests, fire ant mounds',f:'monthly',w:'eli'},
  {a:'🏠 Exterior',t:'Walk the house: gutters/downspouts after rain, driveway-edge puddles, door paint/caulk, roof',f:'monthly',w:'either'},
  {a:'🐔 Chickens',t:'Mite/lice check, refresh dust bath, scrub waterers, check predator-proofing',f:'monthly',w:'either'},
  {a:'🐾 Pets',t:'Flea/tick + heartworm meds for 3 dogs and 2 cats',f:'monthly',w:'jeanne'},
  {a:'🌿 Yard',t:'Edge, weed beds, trim hedges, pick up limbs; check chicken-bare areas',f:'monthly',w:'eli'},
  // seasonal: fall
  {a:'🏊 Pool',t:'Fall/winter care: balance water, shock, winter algaecide + stain/metal control, deep-clean filter, lower salt-cell output when water is under ~60\u00b0F (cell may shut off), cover if you have one, run pump during freezes',f:'seasonal',s:['fall'],w:'eli'},
  {a:'🐝 Bees',t:'Winter prep: confirm heavy stores (feed 2:1 syrup in fall if light), reduce entrance, mouse guard, ventilation/moisture, wind strap, mite treatment done',f:'seasonal',s:['fall'],w:'eli'},
  {a:'🌿 Yard',t:'Rake/mulch leaves, fall pre-emergent for winter weeds, winterizer fertilizer, clean gutters after leaf drop',f:'seasonal',s:['fall'],w:'eli'},
  {a:'💧 Well',t:'Freeze prep: insulate pump + exposed pipes, cover outdoor faucets, know how to drip faucets in a hard freeze',f:'seasonal',s:['fall'],w:'eli'},
  {a:'🚪 Doors',t:'Prime + paint metal side door, restain/finish front door (cool, dry weather window)',f:'seasonal',s:['fall'],w:'either'},
  {a:'❄️ HVAC',t:'Service heating before cold snaps; change filter',f:'seasonal',s:['fall'],w:'either'},
  {a:'🚽 Septic',t:'If due (every 3\u20135 years), schedule inspection/pumping. If you have an aerobic/mechanical system, keep the service contract current.',f:'seasonal',s:['fall'],w:'either'},
  {a:'🐔 Chickens',t:'Winter-proof coop/patio: draft-free but ventilated, dry bedding, waterer that won\u2019t freeze',f:'seasonal',s:['fall'],w:'eli'},
  // winter
  {a:'🌳 Trees',t:'Prune dormant trees/shrubs, remove dead limbs, thin the woodsy side strip while leaves are off',f:'seasonal',s:['winter'],w:'eli'},
  {a:'🐝 Bees',t:'Don\u2019t open the hive below ~55\u00b0F. Heft the box for weight; add fondant/emergency feed if light',f:'seasonal',s:['winter'],w:'eli'},
  {a:'🎨 Indoors',t:'Best season for interior painting (low humidity): do the downstairs',f:'seasonal',s:['winter'],w:'either'},
  {a:'🌿 Yard',t:'Late winter: spring pre-emergent, service mower, sharpen blades',f:'seasonal',s:['winter'],w:'eli'},
  {a:'🏊 Pool',t:'Monthly water checks continue; run pump overnight on freeze nights',f:'seasonal',s:['winter'],w:'eli'},
  // spring
  {a:'🌀 Hurricane',t:'Before June 1: trim limbs over roof, clean gutters, stock supplies, store water (well pump needs power), test generator, photo-inventory the house',f:'seasonal',s:['spring'],w:'either'},
  {a:'🏊 Pool',t:'Open season: raise salt-cell output, shock, check pump seals/o-rings, test salt, clean cell',f:'seasonal',s:['spring'],w:'eli'},
  {a:'🐝 Bees',t:'Swarm season (Mar\u2013May): inspect every 1\u20132 weeks, add supers/space, check queen cells, spring feed',f:'seasonal',s:['spring'],w:'eli'},
  {a:'💧 Well',t:'Annual water test (bacteria, nitrates, iron, pH); replace charcoal/sediment filter per manufacturer',f:'seasonal',s:['spring'],w:'eli'},
  {a:'🐜 Pests',t:'Annual termite inspection/treatment (Formosan termites are common here)',f:'seasonal',s:['spring'],w:'either'},
  {a:'🌿 Yard',t:'Fertilize lawn, mulch beds (keep mulch away from foundation), edge, fire-ant treatment, empty standing water for mosquitoes',f:'seasonal',s:['spring'],w:'eli'},
  {a:'🏠 Exterior',t:'Pressure wash driveway, patio, siding; check caulk + wood trim',f:'seasonal',s:['spring'],w:'eli'},
  {a:'❄️ HVAC',t:'A/C tune-up + clean condenser coils; clean dryer vent',f:'seasonal',s:['spring'],w:'either'},
  {a:'🐔 Chickens',t:'Deep clean coop + replace bedding; check wire/hardware for predators',f:'seasonal',s:['spring'],w:'either'},
  // summer
  {a:'🐝 Bees',t:'Harvest only surplus honey (leave plenty of stores); in Aug dearth watch robbing, hive beetles, wax moths; shade + water',f:'seasonal',s:['summer'],w:'eli'},
  {a:'🏊 Pool',t:'Test 2\u20133x/week; shock after storms/heavy use; keep stabilizer in range; watch pH after rain',f:'seasonal',s:['summer'],w:'eli'},
  {a:'🌀 Hurricane',t:'Peak season Aug\u2013Sep: secure/bring in loose items, fuel + water on hand, charge power banks, review evacuation plan',f:'seasonal',s:['summer'],w:'either'},
  {a:'🌿 Yard',t:'Mow weekly, water new plantings, trim hedges, treat standing water',f:'seasonal',s:['summer'],w:'eli'},
  {a:'🐔 Chickens',t:'Heat plan: shade, extra water, airflow, frozen treats',f:'seasonal',s:['summer'],w:'either'},
];

// One-time projects. when: urgency label. Parents mark status.
const HOME_PROJECTS = [
  {id:'pool',p:1,when:'Now (Nov)',title:'🏊 Pool fall/winter care',cost:'$',steps:['Test + balance water, shock','Add winter algaecide + stain/metal control','Deep-clean filter, inspect salt cell','Lower cell output when water is under ~60\u00b0F','Cover (if any); know the freeze-protect setting on the pump']},
  {id:'coop',p:1,when:'Now',title:'🐔 Finish the coop so hens leave the patio',cost:'$$',steps:['Follow the Coop milestone list in Coop & Pets','Hardware cloth (not chicken wire), buried apron, raccoon-proof latches','Once hens are out: deep-clean + screen-check the patio']},
  {id:'sidedoor',p:1,when:'Now (cool, dry weather)',title:'🚪 Redo the metal side door',cost:'$',steps:['Remove or tape hardware; scrape all loose/cracking paint','Sand edges smooth; wire-brush any rust, treat with rust converter/primer','Degrease + scuff (deglosser or TSP substitute); let dry fully','Prime with a bonding/rust-inhibiting metal primer','2 thin coats of 100% acrylic exterior door/trim enamel; paint when 50\u201385\u00b0F, shade, low humidity','Paint the top and bottom edges; add new weatherstrip + sweep','Peeling usually means glossy/rusty surface, no bonding primer, or painting in hot sun/humidity']},
  {id:'driveway',p:1,when:'Now',title:'🚗 Fix the sunken driveway edge',cost:'$$',steps:['Call 811 (free) before digging; know where septic + well lines run','Find the cause: washed-out base? roof runoff? low spot?','Fill and compact crushed limestone/gravel; slope water away from the driveway','Add edging (paver/concrete edge restraint) or a gravel-filled French drain that exits to a lower spot','Add downspout extensions if roof water lands here','Finish with gravel shoulder, pavers, or plants that tolerate wet feet']},
  {id:'garage',p:2,when:'Next 1\u20132 months',title:'🧰 Garage: make the car fit',cost:'$',steps:['Pick a weekend; pull everything out in sections','Four piles: keep, donate, sell, trash. Rent a dumpster or schedule bulk pickup','Shelving on the walls, labeled bins, hooks','Give the litter box a defined, ventilated spot','Weekly 30-minute session in Home Care until done']},
  {id:'upstairs',p:2,when:'Next 1\u20132 months',title:'🧽 Upstairs deep-clean weekend',cost:'Free',steps:['Use the Whole House tab \u2192 Upstairs list','Do it before painting/furniture arrives so dust doesn\u2019t land on new things','Decide what Sophie\u2019s old suite becomes (guest room, hobby room, Eli\u2019s overflow)']},
  {id:'paint',p:2,when:'Winter (low humidity)',title:'🎨 Paint downstairs in one cohesive palette',cost:'$$',steps:['Choose palette in Paint & Palette; test 3 samples on 2 walls','Paint BEFORE the new couches arrive (or cover/move them)','Order: patch + caulk, prime stains, ceilings, walls, trim/built-ins','Use low-VOC, mildew-resistant paint (satin kitchen, matte/eggshell living)','One room per weekend; start with the living room']},
  {id:'couch',p:2,when:'When couches arrive',title:'🛋️ Power couches: safe cord plan',cost:'$',steps:['Follow the Cord Plan tab; measure sofa position to nearest outlet','Buy raceway + floor cord cover before delivery','Check the manufacturer\u2019s power-supply notes (plug into wall surge protector, not daisy-chained)']},
  {id:'frontdoor',p:3,when:'Winter/Spring',title:'🚪 Front wooden door facelift',cost:'$',steps:['Check for water damage/rot; sand to bare wood if finish is failing','Stain + 3 coats of exterior spar urethane (UV protection), or paint in a deep accent color','New hardware, weatherstrip, house numbers, wreath/lantern']},
  {id:'woods',p:3,when:'Winter (leaves down)',title:'🌲 Manicure the woodsy strip between houses',cost:'$',steps:['Confirm property line with the neighbor/survey','Remove dead limbs, vines, invasives (Chinese tallow, privet)','Limb up trees to ~7 ft, thin brush for airflow (fewer mosquitoes)','Pine straw or wood-chip path; shade-friendly plants; solar path lights','Have an arborist look at anything leaning toward either house']},
  {id:'backyard',p:3,when:'After coop is done',title:'🌱 Restore the backyard from dirt',cost:'$$',steps:['Move chickens to the new run first','Split the yard into zones; rotate with portable fencing','Wood-chip/mulch high-traffic mud areas','Sow clover/rye in the resting zone; fence from hens until established']},
  {id:'beeyard',p:3,when:'Any time',title:'🐝 Bee yard upkeep',cost:'$',steps:['Level hive stand 18 in. off the ground, away from walkways','Mow/trim around hives, add windbreak + afternoon shade','Keep a bee water source with stones; keep dogs/kids away from the flight path']},
];

const PALETTE = [
  {n:'Agreeable Gray',b:'Sherwin-Williams SW 7029',hex:'#d1cbc1',use:'Main walls everywhere downstairs. Warm greige that works with grey OR beige couches and the tan tile.'},
  {n:'Accessible Beige',b:'Sherwin-Williams SW 7036',hex:'#d1c7b8',use:'Slightly warmer option if the couches look more beige than grey in your light.'},
  {n:'Pale Oak',b:'Benjamin Moore OC-20',hex:'#ddd6cb',use:'Lighter, brighter option for the kitchen/dining area.'},
  {n:'Alabaster',b:'Sherwin-Williams SW 7008',hex:'#ede9de',use:'Trim, built-ins, mantel, kitchen cabinets: one consistent warm white.'},
  {n:'Evergreen Fog',b:'Sherwin-Williams SW 9130',hex:'#95978a',use:'Sage accent (one wall, door, or built-in interiors); nods to the garden + chickens.'},
  {n:'Muted navy',b:'e.g., Sherwin-Williams SW 6244 Naval',hex:'#2f3e5c',use:'Optional accent that ties to the kitchen\u2019s blue pendant lights.'},
];

const DECOR = [
  {id:'rug',e:'🧶',cat:'Rug',name:'8x10 washable low-pile rug, warm ivory/greige',why:'Anchors the sofa on the tile, warms the room, and hides a flat cord cover. Washable = pets and kids.',price:'$150\u2013$300',q:'8x10 washable area rug low pile ivory greige'},
  {id:'cords',e:'🔌',cat:'Cord safety',name:'Paintable cord-cover raceway + low-profile floor cord cover',why:'Wall raceway up/along the baseboard; flat cover only where a cord must cross floor.',price:'$20\u2013$50',q:'cord cover floor low profile paintable cable raceway'},
  {id:'chew',e:'🐾',cat:'Cord safety',name:'Hard split-loom / cord-guard tubing',why:'Cats and dogs chew cords. Use as a second layer under the cover.',price:'$10\u2013$20',q:'chew proof cord protector split loom pets'},
  {id:'curtain',e:'🪟',cat:'Windows',name:'Linen-look lined curtains (oatmeal/warm white), 96 in.',why:'Softens the multi-pane windows; add blackout lining for movie nights.',price:'$40\u2013$100',q:'linen look lined curtains 96 inch oatmeal'},
  {id:'pillows',e:'🛋️',cat:'Textiles',name:'Throw pillow covers: sage, honey, navy, oatmeal (washable)',why:'Easy way to add color to a light sofa.',price:'$25\u2013$50',q:'throw pillow covers 20x20 sage honey navy oatmeal'},
  {id:'throw',e:'🧣',cat:'Textiles',name:'Washable chunky throws',why:'Cozy; protects leather from claws.',price:'$25\u2013$45 each',q:'washable chunky knit throw blanket oatmeal'},
  {id:'lamps',e:'💡',cat:'Lighting',name:'Warm 2700K bulbs + 2 table lamps + arc floor lamp',why:'Your room reads dark and yellow in photos; layered warm light fixes it.',price:'$80\u2013$200',q:'arc floor lamp warm white drum shade'},
  {id:'table',e:'🪵',cat:'Furniture',name:'Rounded wood coffee table with lower shelf',why:'Rounded corners for kids; ties to your dark wood mirror.',price:'$120\u2013$300',q:'round wood coffee table storage shelf'},
  {id:'art',e:'🖼️',cat:'Wall art',name:'Gallery wall: botanical/honeybee prints + family photos in natural wood frames',why:'Replaces the dark painting over the mantel with something lighter that fits the farm theme.',price:'$50\u2013$150',q:'botanical honeycomb bee framed wall art set natural wood'},
  {id:'plants',e:'🪴',cat:'Plants',name:'Pet-safe plants: parlor palm, spider plant, Boston fern',why:'Non-toxic to cats and dogs; or use good faux ones.',price:'$15\u2013$40',q:'parlor palm spider plant pet safe plants'},
  {id:'baskets',e:'🧺',cat:'Storage',name:'Lidded baskets + storage ottoman',why:'Hide blankets, controllers, dog toys; clears the cluttered surfaces.',price:'$30\u2013$100',q:'woven lidded storage basket large storage ottoman'},
  {id:'mirror',e:'🪞',cat:'Existing',name:'Keep the dark wood mirror and add matching wood accents',why:'It is a strong anchor piece; repeat that tone in the coffee table + frames.',price:'owned',q:'wood tone picture frames set'},
  {id:'dehum',e:'💨',cat:'Comfort',name:'Dehumidifier for living area',why:'Louisiana humidity makes leather sticky and encourages mildew.',price:'$150\u2013$250',q:'dehumidifier 50 pint energy star'},
  {id:'paint',e:'🎨',cat:'Paint',name:'Sample pots + painter\u2019s tape + drop cloths',why:'Test colors on the wall before buying gallons.',price:'$30',q:'paint sample peel and stick swatches'},
];

const SHOPS = [
  ['Walmart','https://www.walmart.com/search?q='],
  ['Amazon','https://www.amazon.com/s?k='],
  ['Target','https://www.target.com/s?searchTerm='],
  ['Wayfair','https://www.wayfair.com/keyword.php?keyword='],
  ['Home Depot','https://www.homedepot.com/s/'],
  ['Compare prices','https://www.google.com/search?tbm=shop&q='],
];

const CORD_PLAN = {
  intro:'Your sofa is the Signature Design by Ashley Boyington gray power reclining sofa: 86 in. wide, about 40 in. deep, needs about 9 in. between its back and the wall to recline, and comes with a 132 in. (11 ft) power cord. It has heated seats, massage, USB ports, a lit drop-down console and blue LED underglow, so it must be plugged into a wall outlet. In your photos the only outlet is on the wall by the kitchen bar, and the floor is tile.',
  options:[
    ['Best: put the sofa within an 11 ft cord run of an outlet','The cord is 11 ft. Measure the actual path along the wall, not straight across. Leave 9 in. behind the sofa for recline. Cost: free.'],
    ['Wall raceway + baseboard run','Paintable raceway runs the cord up/along the baseboard to the sofa. Looks clean; renter-safe adhesive versions exist. $15\u2013$40.'],
    ['Low-profile floor cord cover (flat rubber/PVC)','Only for the short stretch across tile. Pick a wide, ramped, ADA-style cover so no one trips and the dogs don\u2019t catch it. $15\u2013$30.'],
    ['Rug over a cord cover','Flat cover under a large rug hides it; never run a bare cord under a rug (heat + wear). $0 extra if you buy the rug anyway.'],
    ['Battery pack','Ask Ashley or the store whether a compatible rechargeable battery pack exists for this model; I could not confirm one. If so, no cord is needed while sitting.'],
    ['Electrician: floor outlet or sofa-back receptacle','Cleanest long-term fix. Cutting into a slab is costly; a wall receptacle with a short run to the sofa back is cheaper. Get a quote.'],
  ],
  rules:[
    'Plug the sofa power supply directly into a wall outlet or a heavy-duty surge protector, per the manufacturer\u2019s manual. Don\u2019t daisy-chain extension cords.',
    'No cord crosses a walking path without a cover. No staples or nails through cords.',
    'Cats and dogs chew: add hard split-loom over any cord they can reach.',
    'Keep the power box and plugs off the floor away from water/pet accidents (sit them on a shelf or raised bracket).',
    'Don\u2019t cover the sofa power box with blankets (heat).',
    'Check cords monthly for nicks or warmth, and unplug when away on trips.',
  ],
};

const GAME_EXTRA = [
  {z:'🧼 High-touch sanitize',zi:null,jobs:['Wipe every light switch + door handle','Wipe remotes, game controllers, tablets','Wipe faucet handles, fridge + microwave handles','Wipe the shoe/key basket + backpack straps']},
  {z:'🚽 Bathroom disinfect',zi:null,jobs:['Spray toilet, sink, faucet, counters with disinfectant','Leave it wet for the time on the label, then wipe','Swap in clean hand towels']},
  {z:'🗑️ Trash + floors',zi:null,jobs:['Empty every trash can, new bags','Sweep or vacuum the floors in the zone','Wipe the trash can lids']},
];
const GAME_WILD = ['Wipe all baseboards in the hallway','Scrub a toilet (gloves on)','Sanitize every remote + controller','Wash the dog bowls + wipe the food mats','Wipe the inside of the microwave','Wipe the glass doors + low windows','Wipe the washer + dryer tops and knobs','Disinfect the garbage + recycling bins','Wipe fridge handles + front, door to door'];

const DESIGN_ROOMS = ['Living room','Kitchen/dining','Sophie\u2019s room','Sam\u2019s room','Jack\u2019s room','Other'];

const DESIGN_NOTES = {
  living:[
    ['What you have (from your photos)','Warm taupe/greige walls, white built-ins + white mantel, whitewashed brick hearth, tan/peach diagonal tile, dark wood mirror, wrought-iron and dark frames, fleur-de-lis art, blue pendants in the kitchen, white cabinets, roman shades, current dark leather recliner.'],
    ['Direction: Honey & Sage Farmhouse Calm','Soft greige walls, one warm white for all trim and built-ins, sage + honey + muted navy accents, natural wood and woven textures. Honey ties to the bees and sage to the garden.'],
    ['Biggest wins','1) Lighter, consistent wall + trim color. 2) A big rug to warm the tile and hide the cord cover. 3) Layered warm lighting. 4) Declutter surfaces with baskets. 5) Lighter art over the mantel.'],
    ['With the new sofa','Light greige leather will look cleaner against warm greige walls than against grey-blue ones. Avoid cool/blue-greys: they fight the peach tile. Put a dark/wood element (coffee table) in front so the light sofa doesn\u2019t float.'],
    ['Tile floor','The peach tone is warm. A cream/ivory rug with a little blue or sage pattern bridges floor, sofa and pendants.'],
    ['Eventually other rooms','Reuse the same greige + Alabaster trim through the downstairs hall, kitchen and dining. Let each room have one accent color: sage (dining), navy (office/boys), honey (kitchen).'],
  ],
};
