const dayColours = {1:'#d94f33',2:'#0f766e',3:'#7c3aed',4:'#b7791f'};
const hotel = { lat:25.04618, lng:121.51476 };

const tripDays = [
{
  day:1,
  label:'Fri 20 Aug',
  title:'Arrival, old Taipei & Ningxia',
  transport:'Airport MRT + walking',
  distance:'Easy arrival day',
  stops:[
    {time:'11:45',name:'Taoyuan International Airport',lat:25.0777,lng:121.2328,duration:'Arrival',type:'Transport',notes:'Clear immigration, collect luggage and follow signs to the Airport MRT. Buy one EasyCard each.',official:'https://www.taoyuan-airport.com/',maps:'https://www.google.com/maps/search/?api=1&query=Taoyuan+International+Airport'},
    {time:'13:15',name:'Airport MRT to A1 Taipei Main Station',lat:25.04915,lng:121.51415,duration:'35–40 min',type:'Transport',notes:'Take the express train and use lifts with luggage. Keep a little buffer in case immigration is slow.',official:'https://www.tymetro.com.tw/tymetro-new/en/_pages/travel-guide/timetable.php',maps:'https://www.google.com/maps/search/?api=1&query=A1+Taipei+Main+Station'},
    {time:'14:10',name:'Roaders Plus Hotel Taipei Station',lat:25.04618,lng:121.51476,duration:'Check-in',type:'Hotel',notes:'Drop luggage or check in. This remains the route anchor throughout the trip.',official:'https://roadersplushotel.com/en/',maps:'https://www.google.com/maps/search/?api=1&query=Roaders+Plus+Hotel+Taipei+Station'},
    {time:'14:45',name:'Lao Shan Dong Homemade Noodles',lat:25.0467,lng:121.5105,duration:'60 min',type:'Food',notes:'Late lunch near Taipei Main Station. Try handmade beef noodles, dumplings and braised side dishes.',maps:'https://www.google.com/maps/search/?api=1&query=Lao+Shan+Dong+Homemade+Noodles+Taipei'},
    {time:'16:05',name:'North Gate',lat:25.04769,lng:121.51165,duration:'20 min',type:'Sight',notes:'A compact heritage stop and a good visual entry into old Taipei.',official:'https://www.travel.taipei/en/attraction/details/429',maps:'https://www.google.com/maps/search/?api=1&query=North+Gate+Taipei'},
    {time:'16:40',name:'Dihua Street',lat:25.0556,lng:121.5092,duration:'90 min',type:'Shopping',notes:'Tea, ceramics, fabrics, pantry goods and historic shophouses. Good for design-led gifts.',official:'https://www.travel.taipei/en/attraction/details/1686',maps:'https://www.google.com/maps/search/?api=1&query=Dihua+Street+Taipei'},
    {time:'18:10',name:'Dadaocheng Wharf',lat:25.0568,lng:121.5072,duration:'45 min',type:'Sight',notes:'Riverside sunset window. Skip during heavy rain and stay longer on Dihua Street instead.',official:'https://www.travel.taipei/en/attraction/details/1573',maps:'https://www.google.com/maps/search/?api=1&query=Dadaocheng+Wharf'},
    {time:'19:10',name:'Ningxia Night Market',lat:25.0555,lng:121.5153,duration:'90 min',type:'Food',notes:'Share small portions: oyster omelette, braised pork rice, taro snacks, grilled squid and peanut ice-cream roll.',official:'https://www.travel.taipei/en/attraction/details/1692',maps:'https://www.google.com/maps/search/?api=1&query=Ningxia+Night+Market'},
    {time:'21:00',name:'Return to Roaders Plus',lat:25.04618,lng:121.51476,duration:'Rest',type:'Hotel',notes:'Keep the first evening intentionally light.',official:'https://roadersplushotel.com/en/',maps:'https://www.google.com/maps/search/?api=1&query=Roaders+Plus+Hotel+Taipei+Station'}
  ]
},
{
  day:2,
  label:'Sat 21 Aug',
  title:'Old Taipei, culture & design shopping',
  transport:'MRT + walking',
  distance:'Full city day',
  stops:[
    {time:'08:30',name:'Longshan Temple',lat:25.0372,lng:121.4999,duration:'45 min',type:'Sight',notes:'Start in old Wanhua before the crowds and heat build.',official:'https://www.lungshan.org.tw/en/index.php',maps:'https://www.google.com/maps/search/?api=1&query=Longshan+Temple+Taipei'},
    {time:'09:25',name:'Bopiliao Historic Block',lat:25.0363,lng:121.5027,duration:'50 min',type:'Heritage',notes:'A photogenic restored street block with layered Taipei architecture and exhibition spaces.',official:'https://www.travel.taipei/en/attraction/details/506',maps:'https://www.google.com/maps/search/?api=1&query=Bopiliao+Historic+Block'},
    {time:'10:40',name:'Ximending & The Red House',lat:25.0421,lng:121.5069,duration:'120 min',type:'Shopping',notes:'Streetwear, cosmetics, character goods, independent stalls and a casual early lunch.',official:'https://www.redhouse.taipei/en',maps:'https://www.google.com/maps/search/?api=1&query=The+Red+House+Taipei'},
    {time:'13:10',name:'Chiang Kai-shek Memorial Hall',lat:25.0346,lng:121.5219,duration:'75 min',type:'Sight',notes:'Explore Liberty Square and the gardens, then move indoors before the afternoon heat peaks.',official:'https://www.cksmh.gov.tw/en/',maps:'https://www.google.com/maps/search/?api=1&query=Chiang+Kai-shek+Memorial+Hall'},
    {time:'14:40',name:'Yongkang Street',lat:25.0329,lng:121.5290,duration:'90 min',type:'Food',notes:'Choose one proper meal or dessert stop, not three separate queues. Good for mango ice, tea and cafés.',official:'https://www.travel.taipei/en/attraction/details/1712',maps:'https://www.google.com/maps/search/?api=1&query=Yongkang+Street+Taipei'},
    {time:'16:30',name:'Huashan 1914 Creative Park',lat:25.0442,lng:121.5294,duration:'90 min',type:'Design',notes:'Former industrial complex with exhibitions, creative shops, character pop-ups and cafés.',official:'https://www.huashan1914.com/w/huashan1914_en/index',maps:'https://www.google.com/maps/search/?api=1&query=Huashan+1914+Creative+Park'},
    {time:'18:30',name:'Zhongshan & Chifeng Street',lat:25.0536,lng:121.5201,duration:'150 min',type:'Shopping',notes:'Independent Taiwanese labels, stationery, lifestyle stores, small galleries and speciality coffee. Dinner here.',official:'https://www.travel.taipei/en/attraction/details/2433',maps:'https://www.google.com/maps/search/?api=1&query=Chifeng+Street+Taipei'},
    {time:'21:15',name:'Return to Roaders Plus',lat:25.04618,lng:121.51476,duration:'Rest',type:'Hotel',notes:'A short MRT ride or taxi depending on energy and rain.',official:'https://roadersplushotel.com/en/',maps:'https://www.google.com/maps/search/?api=1&query=Roaders+Plus+Hotel+Taipei+Station'}
  ]
},
{
  day:3,
  label:'Sun 22 Aug',
  title:'Yehliu, Shifen, Golden Waterfall & Jiufen',
  transport:'Private driver strongly recommended',
  distance:'Long day · approx. 11–12 hours',
  stops:[
    {time:'07:30',name:'Roaders Plus pickup',lat:25.04618,lng:121.51476,duration:'Start',type:'Transport',notes:'Use a private car for this route. Confirm fuel, tolls, parking, driver language and overtime before booking.',official:'https://roadersplushotel.com/en/',maps:'https://www.google.com/maps/search/?api=1&query=Roaders+Plus+Hotel+Taipei+Station'},
    {time:'08:45',name:'Yehliu Geopark',lat:25.2054,lng:121.6907,duration:'90 min',type:'Nature',notes:'Walk the main geological formations early before the strongest heat and tour-bus crowds. Bring sun protection and water.',official:'https://www.ylgeopark.org.tw/',maps:'https://www.google.com/maps/search/?api=1&query=Yehliu+Geopark'},
    {time:'10:15',name:'Depart Yehliu for Shifen',lat:25.2054,lng:121.6907,duration:'Drive 75–90 min',type:'Transport',notes:'This is the longest transfer of the day. Keep snacks and water in the car.',maps:'https://www.google.com/maps/dir/?api=1&origin=Yehliu+Geopark&destination=Shifen+Waterfall'},
    {time:'11:45',name:'Shifen Waterfall',lat:25.0495,lng:121.7876,duration:'60 min',type:'Nature',notes:'Walk to the main viewpoints. Wear shoes with grip because paths can be damp.',official:'https://newtaipei.travel/en/attractions/detail/111592',maps:'https://www.google.com/maps/search/?api=1&query=Shifen+Waterfall'},
    {time:'13:00',name:'Shifen Old Street',lat:25.0412,lng:121.7752,duration:'75 min',type:'Sight',notes:'Railway-street walk, one shared sky lantern and a quick lunch or snack. Keep clear of the tracks when trains pass.',official:'https://newtaipei.travel/en/attractions/detail/111989',maps:'https://www.google.com/maps/search/?api=1&query=Shifen+Old+Street'},
    {time:'14:50',name:'Golden Waterfall',lat:25.1188,lng:121.8605,duration:'25 min',type:'Nature',notes:'A brief scenic and photography stop on the way toward Jiufen. Do not over-allocate time here.',official:'https://newtaipei.travel/en/tour/94',maps:'https://www.google.com/maps/search/?api=1&query=Golden+Waterfall+Ruifang'},
    {time:'15:20',name:'Yin Yang Sea viewpoint',lat:25.1216,lng:121.8674,duration:'15 min',type:'Viewpoint',notes:'Optional quick stop only if traffic and weather are favourable.',maps:'https://www.google.com/maps/search/?api=1&query=Yin+Yang+Sea+Taiwan'},
    {time:'15:50',name:'Jiufen Old Street',lat:25.1099,lng:121.8452,duration:'3 hours',type:'Food',notes:'Late lunch, old-street browsing, taro balls, fish-ball soup, souvenir shops and a tea-house pause before dusk.',official:'https://newtaipei.travel/en/Attractions/Detail/112939',maps:'https://www.google.com/maps/search/?api=1&query=Jiufen+Old+Street'},
    {time:'18:50',name:'Jiufen evening departure',lat:25.1099,lng:121.8452,duration:'Return',type:'Transport',notes:'Leave after the lanterns come on. The target is a comfortable return, not squeezing in another stop.',maps:'https://www.google.com/maps/search/?api=1&query=Jiufen+Old+Street'},
    {time:'20:15',name:'Roaders Plus Hotel',lat:25.04618,lng:121.51476,duration:'Rest',type:'Hotel',notes:'Expect a long day. Dinner can be a simple convenience-store or nearby supper option if needed.',official:'https://roadersplushotel.com/en/',maps:'https://www.google.com/maps/search/?api=1&query=Roaders+Plus+Hotel+Taipei+Station'}
  ]
},
{
  day:4,
  label:'Mon 23 Aug',
  title:'Songyan, Taipei 101, Raohe & airport',
  transport:'MRT + Airport MRT',
  distance:'Checkout + late departure',
  stops:[
    {time:'09:00',name:'Breakfast, packing & checkout',lat:25.04618,lng:121.51476,duration:'90 min',type:'Hotel',notes:'Store luggage at the hotel after checkout and confirm same-day collection time.',official:'https://roadersplushotel.com/en/',maps:'https://www.google.com/maps/search/?api=1&query=Roaders+Plus+Hotel+Taipei+Station'},
    {time:'11:00',name:'Songshan Cultural and Creative Park',lat:25.0436,lng:121.5607,duration:'90 min',type:'Design',notes:'Historic industrial buildings, courtyards, exhibitions and design stores.',official:'https://www.songshanculturalpark.org/en',maps:'https://www.google.com/maps/search/?api=1&query=Songshan+Cultural+and+Creative+Park'},
    {time:'12:30',name:'Eslite Spectrum Songyan',lat:25.0441,lng:121.5604,duration:'90 min',type:'Shopping',notes:'Taiwanese design, books, stationery, craft, lifestyle products and lunch.',official:'https://www.eslitecorp.com/eslite/index.jsp?site_id=eslite_en',maps:'https://www.google.com/maps/search/?api=1&query=Eslite+Spectrum+Songyan'},
    {time:'14:20',name:'Taipei 101 & Xinyi shopping',lat:25.0338,lng:121.5646,duration:'2.5 hours',type:'Shopping',notes:'Taipei 101 Mall, department stores, food halls and design gifts. Keep the observatory weather-dependent.',official:'https://www.taipei-101.com.tw/en/',maps:'https://www.google.com/maps/search/?api=1&query=Taipei+101'},
    {time:'15:15',name:'Taipei 101 Observatory',lat:25.0339,lng:121.5645,duration:'Optional 75 min',type:'Ticket',notes:'Buy only when visibility is worthwhile. Skip during low cloud or heavy rain.',official:'https://www.taipei-101.com.tw/en/observatory/ticket',tickets:'https://www.taipei-101.com.tw/en/observatory/ticket',maps:'https://www.google.com/maps/search/?api=1&query=Taipei+101+Observatory'},
    {time:'17:15',name:'Raohe Street Night Market',lat:25.0501,lng:121.5776,duration:'75 min',type:'Food',notes:'Have an early final meal. Keep portions controlled so the airport transfer remains comfortable.',official:'https://www.travel.taipei/en/attraction/details/1691',maps:'https://www.google.com/maps/search/?api=1&query=Raohe+Street+Night+Market'},
    {time:'18:50',name:'Collect luggage at Roaders Plus',lat:25.04618,lng:121.51476,duration:'45 min',type:'Hotel',notes:'Final bag check: passports, chargers, EasyCards, tax-refund paperwork and liquids.',official:'https://roadersplushotel.com/en/',maps:'https://www.google.com/maps/search/?api=1&query=Roaders+Plus+Hotel+Taipei+Station'},
    {time:'20:15',name:'Walk to A1 Taipei Main Station',lat:25.04915,lng:121.51415,duration:'30 min',type:'Transport',notes:'Target an Airport MRT around 20:45–21:00. Do not rely on the final train.',official:'https://www.tymetro.com.tw/tymetro-new/en/_pages/travel-guide/timetable.php',maps:'https://www.google.com/maps/search/?api=1&query=A1+Taipei+Main+Station'},
    {time:'21:45',name:'Taoyuan International Airport',lat:25.0777,lng:121.2328,duration:'Flight buffer',type:'Transport',notes:'Allow a generous buffer for the 01:35 flight on 24 August. Reconfirm terminal and airline check-in requirements.',official:'https://www.taoyuan-airport.com/',maps:'https://www.google.com/maps/search/?api=1&query=Taoyuan+International+Airport'}
  ]
}
];

const costs=[
  ['Airport MRT, metro, buses & EasyCards',1000,1400],
  ['Private Yehliu–Shifen–Jiufen driver',5500,8500],
  ['Food, coffee & night markets',6500,9000],
  ['Yehliu, Taipei 101, lantern & tea',2200,3800],
  ['Two SIMs / eSIMs',600,1000],
  ['Taxis, rain & fatigue buffer',1000,1800],
  ['Airport and onboard food',500,1000],
  ['Contingency',1500,2500]
];

const auditItems=[
  'Verify checked baggage kilograms for each traveller and direction.',
  'Check whether cabin baggage is separate from checked baggage.',
  'Confirm seat selection, onboard meals and flight terminals.',
  'Open the travel-insurance policy and confirm both travellers, dates, excess and exclusions.',
  'Confirm hotel cancellation terms and same-day luggage storage.',
  'For the private driver, confirm fuel, tolls, parking, language and overtime charges.',
  'Ask eligible shops for tax-refund paperwork on the purchase date.'
];

const apps=[
  {icon:'◉',name:'Google Maps',desc:'Saved lists, transit directions and offline area download.',url:'https://maps.google.com/'},
  {icon:'M',name:'Taipei Metro Go',desc:'Official Taipei Metro route and service information.',url:'https://english.metro.taipei/'},
  {icon:'☂',name:'Taiwan Weather / CWA',desc:'Official radar, warnings and forecast checks.',url:'https://www.cwa.gov.tw/V8/E/'},
  {icon:'U',name:'Uber',desc:'Visitor-friendly taxi booking with visible destination.',url:'https://www.uber.com/tw/en/ride/'},
  {icon:'B+',name:'Bus+',desc:'Live bus, railway, metro and YouBike information.',url:'https://apps.apple.com/tw/app/bus-bus-railway-ubike/id967861325'},
  {icon:'55688',name:'Taiwan Taxi 55688',desc:'Local taxi backup.',url:'https://www.taiwantaxi.com.tw/EN/'},
  {icon:'文',name:'Google Translate',desc:'Download Traditional Chinese for offline camera and text translation.',url:'https://translate.google.com/'},
  {icon:'T',name:'Trip.com',desc:'Keep booking vouchers, flight changes and hotel details available.',url:'https://sg.trip.com/'},
  {icon:'✓',name:'Taoyuan Airport MRT timetable',desc:'Reconfirm the 23 August late-night airport journey.',url:'https://www.tymetro.com.tw/tymetro-new/en/_pages/travel-guide/timetable.php'},
  {icon:'!',name:'Taipei travel notices',desc:'Official city attraction and transport updates.',url:'https://www.travel.taipei/en'}
];
