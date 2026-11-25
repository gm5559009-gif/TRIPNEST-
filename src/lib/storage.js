const USERS_KEY = 'tripnest_users_v1';
const SESSION_KEY = 'tripnest_session_v1';
const TOURS_KEY = 'tripnest_tours_v3';
const BOOKINGS_KEY = 'tripnest_bookings_v2';
const WISHLIST_KEY = 'tripnest_wishlist_v1';
const REVIEWS_KEY = 'tripnest_reviews_v1';
const INQUIRIES_KEY = 'tripnest_inquiries_v1';
const PRESET_KEY = 'tripnest_preset_v1';
const POINTS_KEY = 'tripnest_points_v1';

const memoryStore = new Map();

export const PROMO_CODES = {
  NEST10: { code: 'NEST10', type: 'percent', value: 10, label: '10% off your booking' },
  HACK20: { code: 'HACK20', type: 'percent', value: 20, label: '20% Hackathon Special' },
  FIRST500: { code: 'FIRST500', type: 'flat', value: 500, label: '₹500 instant discount' },
};

export const BOOKING_ADDONS = [
  { id: 'transfer', label: 'Private Airport / Station VIP Transfer', price: 999 },
  { id: 'photo', label: 'Golden-Hour Local Photographer (2 hrs)', price: 1499 },
  { id: 'shield', label: 'TripNest Flexi-Cancel & Travel Shield', price: 499 },
];

export function getPackingChecklistForCategory(category) {
  const shared = ['Government Photo ID', 'TripNest E-Ticket (Digital/Print)', 'Power bank & universal adapter'];
  const byCategory = {
    Adventure: ['Layered fleece / windcheater', 'Broken-in trekking shoes', 'Reusable insulated water bottle', 'SPF 50 sunscreen & lip balm'],
    Beach: ['Reef-safe sunscreen', 'Polarized sunglasses & hat', 'Quick-dry beachwear & flip-flops', 'Waterproof phone pouch'],
    Nature: ['Light rain shell / umbrella', 'Comfortable walking sneakers', 'Insect repellent', 'Binoculars or camera'],
    Culture: ['Breathable cottons & scarf', 'Slip-on walking shoes for forts', 'Small daypack for markets', 'Cash for artisan bazaars'],
    City: ['Smart-casual evening outfit', 'Comfortable walking loafers', 'Portable umbrella', 'Sunglasses'],
  };
  return [...shared, ...(byCategory[category] || byCategory.Nature)];
}

export const TRANSIT_GUIDES = {
  'tour-kerala': {
    bestEconomyMode: 'KSRTC Volvo / Sleeper Bus from Kochi',
    economyCost: '₹350 – ₹750',
    airport: { name: 'Cochin Intl Airport (COK)', distance: '110 km', time: '3h 15m', fastRoute: 'Prepaid Airport Taxi via NH85', economyRoute: 'Aluva Metro/Bus → KSRTC Munnar Express' },
    railway: { name: 'Aluva / Ernakulam Jn (ERS)', distance: '115 km', time: '3h 30m', fastRoute: 'Direct Cab via Neriamangalam', economyRoute: 'KSRTC Swift Bus from Ernakulam Stand' },
    busStation: { name: 'Munnar KSRTC Depot', distance: '1.5 km', time: '5 mins', fastRoute: 'Local Auto-rickshaw to stay', economyRoute: 'Walkable / ₹40 shared auto' },
  },
  'tour-goa': {
    bestEconomyMode: 'Konkan Railway Express + Kadamba Shuttle',
    economyCost: '₹200 – ₹600',
    airport: { name: 'Manohar Intl (GOX) / Dabolim', distance: '28 km', time: '45 mins', fastRoute: 'GoaMiles App Cab via NH66', economyRoute: 'Kadamba AC EV Airport Shuttle' },
    railway: { name: 'Thivim Railway Station (THVM)', distance: '18 km', time: '30 mins', fastRoute: 'Pre-booked Scooter / Cab', economyRoute: 'Kadamba Bus to Mapusa → Assagao' },
    busStation: { name: 'Mapusa Bus Terminus', distance: '9 km', time: '18 mins', fastRoute: 'Direct Cab / Bike Rental', economyRoute: 'Local Shuttle Bus (₹30)' },
  },
  'tour-jaipur': {
    bestEconomyMode: 'Vande Bharat / Shatabdi + Jaipur Metro',
    economyCost: '₹150 – ₹550',
    airport: { name: 'Jaipur Intl Airport (JAI)', distance: '12 km', time: '25 mins', fastRoute: 'App Cab via Tonk Road', economyRoute: 'JCTSL AC Bus Route 2 → Badi Chaupar' },
    railway: { name: 'Jaipur Junction (JP)', distance: '3.5 km', time: '12 mins', fastRoute: 'Jaipur Metro Pink Line (2 stops)', economyRoute: 'E-Rickshaw / Metro (₹20)' },
    busStation: { name: 'Sindhi Camp Bus Stand', distance: '2.5 km', time: '10 mins', fastRoute: 'Metro from Sindhi Camp Station', economyRoute: 'Direct E-Rickshaw (₹30)' },
  },
  'tour-himachal': {
    bestEconomyMode: 'HRTC Overnight Volvo from Delhi / Chandigarh',
    economyCost: '₹950 – ₹1,600',
    airport: { name: 'Bhuntar Airport (KUU)', distance: '50 km', time: '1h 30m', fastRoute: 'Private Mountain Cab via NH3', economyRoute: 'HRTC Bus from Bhuntar Chowk' },
    railway: { name: 'Joginder Nagar / Chandigarh', distance: '165 km', time: '5h 30m', fastRoute: 'Highway Cab via Kiratpur–Manali 4-Lane', economyRoute: 'HRTC Semi-Deluxe Bus' },
    busStation: { name: 'Manali Private / HRTC Stand', distance: '2 km', time: '8 mins', fastRoute: 'Local Cab to Old Manali', economyRoute: 'Shared Local Auto (₹50)' },
  },
  'tour-ladakh': {
    bestEconomyMode: 'Early-Booked Morning Flight + Shared Leh Taxi',
    economyCost: '₹1,200 – ₹2,500',
    airport: { name: 'Kushok Bakula Rimpochee (IXL)', distance: '5 km', time: '12 mins', fastRoute: 'Hotel Pickup SUV', economyRoute: 'Prepaid Leh Airport Taxi Union' },
    railway: { name: 'Jammu Tawi (JAT) / Srinagar', distance: '420 km', time: '12h+', fastRoute: 'Fly Srinagar → Leh (1 hr)', economyRoute: 'JKSRTC Deluxe Bus via Zoji La' },
    busStation: { name: 'Leh Main Bus Stand', distance: '1.5 km', time: '6 mins', fastRoute: 'Local Taxi to Leh Market', economyRoute: 'Shared Eco Van (₹30)' },
  },
  'tour-udaipur': {
    bestEconomyMode: 'Mewar / Chetak Express + Old City Auto',
    economyCost: '₹250 – ₹700',
    airport: { name: 'Maharana Pratap Airport (UDR)', distance: '22 km', time: '35 mins', fastRoute: 'Private Sedan via NH27', economyRoute: 'RSRTC Airport Shuttle to Surajpole' },
    railway: { name: 'Udaipur City Station (UDZ)', distance: '3 km', time: '10 mins', fastRoute: 'Auto-rickshaw to Lake Pichola', economyRoute: 'Shared Auto (₹30)' },
    busStation: { name: 'Udaipole Central Bus Stand', distance: '2.8 km', time: '10 mins', fastRoute: 'Direct Auto to Old City', economyRoute: 'City Bus / E-Rickshaw (₹25)' },
  },
  'tour-rishikesh': {
    bestEconomyMode: 'Shatabdi to Haridwar + Vikram Shared Auto',
    economyCost: '₹120 – ₹450',
    airport: { name: 'Jolly Grant Airport (DED)', distance: '20 km', time: '35 mins', fastRoute: 'Prepaid Taxi via Bhaniawala', economyRoute: 'Airport Bus to Natraj Chowk' },
    railway: { name: 'Yog Nagari Rishikesh (YNRK)', distance: '4 km', time: '12 mins', fastRoute: 'Direct Auto to Tapovan', economyRoute: 'Shared Vikram Auto (₹25)' },
    busStation: { name: 'Rishikesh ISBT', distance: '5 km', time: '15 mins', fastRoute: 'E-Rickshaw to Laxman Jhula', economyRoute: 'Shared Vikram via Badrinath Rd (₹30)' },
  },
  'tour-andaman': {
    bestEconomyMode: 'Govt Makruzz / Nautika Ferry from Port Blair',
    economyCost: '₹1,100 – ₹1,800',
    airport: { name: 'Veer Savarkar Airport (IXZ)', distance: '4 km to Jetty', time: '15 mins', fastRoute: 'Cab to Haddo Jetty → Fast Ferry', economyRoute: 'Local Auto to Phoenix Bay Jetty' },
    railway: { name: 'No Rail (Island Territory)', distance: '—', time: '—', fastRoute: 'Fly into IXZ + High-Speed Catamaran', economyRoute: 'DSS Govt Ferry from Phoenix Bay' },
    busStation: { name: 'Havelock Jetty / Govind Nagar', distance: '3 km', time: '8 mins', fastRoute: 'Resort Pickup / Scooter Rental', economyRoute: 'STS Island Bus (₹20)' },
  },
  'tour-coorg': {
    bestEconomyMode: 'KSRTC Airavat Bus from Bengaluru / Mysuru',
    economyCost: '₹400 – ₹850',
    airport: { name: 'Kannur Intl Airport (CNN)', distance: '90 km', time: '2h 30m', fastRoute: 'Prepaid Taxi via Virajpet', economyRoute: 'KSRTC Bus via Iritty' },
    railway: { name: 'Mysuru Junction (MYS)', distance: '115 km', time: '2h 45m', fastRoute: 'Highway Cab via Kushalnagar', economyRoute: 'KSRTC Express Bus from Mysuru' },
    busStation: { name: 'Madikeri KSRTC Stand', distance: '2 km', time: '7 mins', fastRoute: 'Local Auto to Estate', economyRoute: 'Shared Auto (₹40)' },
  },
  'tour-varanasi': {
    bestEconomyMode: 'Vande Bharat / Shiv Ganga Express + E-Rickshaw',
    economyCost: '₹150 – ₹500',
    airport: { name: 'Lal Bahadur Shastri (VNS)', distance: '24 km', time: '45 mins', fastRoute: 'Prepaid Cab to Godowlia', economyRoute: 'UPSRTC Airport AC Bus' },
    railway: { name: 'Varanasi Junction (BSB)', distance: '4 km', time: '15 mins', fastRoute: 'Direct Auto to Dashashwamedh', economyRoute: 'Shared E-Rickshaw (₹20)' },
    busStation: { name: 'Chaudhary Charan Singh ISBT', distance: '4.5 km', time: '16 mins', fastRoute: 'E-Rickshaw to Ghats', economyRoute: 'City Auto (₹30)' },
  },
  'tour-darjeeling': {
    bestEconomyMode: 'NJP Express Train + Shared Sumo Jeep',
    economyCost: '₹250 – ₹600',
    airport: { name: 'Bagdogra Airport (IXB)', distance: '68 km', time: '2h 45m', fastRoute: 'Private Hill Cab via Rohini Rd', economyRoute: 'Shared Sumo from Siliguri Junction' },
    railway: { name: 'New Jalpaiguri (NJP)', distance: '72 km', time: '3h', fastRoute: 'Toy Train / Private Cab', economyRoute: 'Shared Jeep from NJP Stand (₹250)' },
    busStation: { name: 'Darjeeling Chowk Bazar Stand', distance: '1 km', time: '5 mins', fastRoute: 'Walkable to Mall Road', economyRoute: 'Local Shared Cab (₹20)' },
  },
  'tour-pondicherry': {
    bestEconomyMode: 'PRTC / SETC ECR Express Bus from Chennai',
    economyCost: '₹180 – ₹450',
    airport: { name: 'Pondicherry (PNY) / Chennai', distance: '6 km / 145 km', time: '15m / 3h', fastRoute: 'ECR Highway Cab from Chennai', economyRoute: 'PRTC AC Volvo along ECR' },
    railway: { name: 'Puducherry Station (PDY)', distance: '1.5 km', time: '6 mins', fastRoute: 'Auto to White Town', economyRoute: 'Walkable / ₹30 Auto' },
    busStation: { name: 'Puducherry New Bus Stand', distance: '3 km', time: '10 mins', fastRoute: 'Auto to Promenade', economyRoute: 'Town Bus (₹15)' },
  },
};

export function getTransitForTour(tour) {
  if (tour?.transit) return tour.transit;
  if (tour?.id && TRANSIT_GUIDES[tour.id]) return TRANSIT_GUIDES[tour.id];
  return {
    bestEconomyMode: 'Express Rail + Local Shuttle',
    economyCost: '₹300 – ₹800',
    airport: { name: 'Nearest Regional Airport', distance: '25 km', time: '40 mins', fastRoute: 'App Cab / Prepaid Taxi', economyRoute: 'Airport Express Shuttle Bus' },
    railway: { name: 'Central Railway Junction', distance: '5 km', time: '15 mins', fastRoute: 'Direct Cab / Metro', economyRoute: 'Local Auto / City Bus' },
    busStation: { name: 'Main State Bus Terminus', distance: '4 km', time: '12 mins', fastRoute: 'Local Auto-rickshaw', economyRoute: 'City Shuttle Bus' },
  };
}

export function getUserPreset(userId) {
  initializeStore();
  const key = userId || 'guest';
  const all = readJson(PRESET_KEY, {});
  return all[key] || null;
}

export function saveUserPreset(userId, preset) {
  initializeStore();
  const key = userId || 'guest';
  const all = readJson(PRESET_KEY, {});
  const next = {
    ...all,
    [key]: {
      ...preset,
      updatedAt: new Date().toISOString(),
    },
  };
  storageSet(PRESET_KEY, next);
  notifyStoreChanged();
  return next[key];
}

export const TOUR_GALLERIES = {
  'tour-kerala': [
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1580818135730-ebd11086660b?auto=format&fit=crop&w=1200&q=85',
  ],
  'tour-goa': [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1587922546307-776227941871?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=85',
  ],
  'tour-jaipur': [
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=85',
  ],
  'tour-himachal': [
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
  ],
  'tour-ladakh': [
    'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=85',
  ],
  'tour-udaipur': [
    'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=1200&q=85',
  ],
  'tour-rishikesh': [
    'https://images.unsplash.com/photo-1591018653367-766e3353e482?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=85',
  ],
  'tour-andaman': [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=85',
  ],
};

export function getGalleryForTour(tour) {
  if (Array.isArray(tour?.gallery) && tour.gallery.length > 0) return tour.gallery;
  if (tour?.id && TOUR_GALLERIES[tour.id]) return TOUR_GALLERIES[tour.id];
  return [
    tour?.image || 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=85',
  ];
}

export function getUserPoints(userId) {
  initializeStore();
  if (!userId) return 0;
  const all = readJson(POINTS_KEY, {});
  return typeof all[userId] === 'number' ? all[userId] : 500;
}

export function updateUserPoints(userId, nextBalance) {
  if (!userId) return 0;
  const all = readJson(POINTS_KEY, {});
  const safe = Math.max(0, Math.round(nextBalance));
  storageSet(POINTS_KEY, { ...all, [userId]: safe });
  notifyStoreChanged();
  return safe;
}

export function clearUserPreset(userId) {
  const key = userId || 'guest';
  const all = readJson(PRESET_KEY, {});
  delete all[key];
  storageSet(PRESET_KEY, all);
  notifyStoreChanged();
}

const starterTours = [
  {
    id: 'tour-kerala',
    title: 'Kerala Green Escape',
    location: 'Munnar, Kerala',
    duration: '3 days / 2 nights',
    price: 6499,
    category: 'Nature',
    rating: 4.9,
    reviewCount: 42,
    groupSize: 'Up to 8',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85',
    description: 'Tea gardens, misty hills and slow mornings in the Western Ghats.',
    highlights: ['Private tea estate walk at sunrise', 'Eravikulam National Park visit', 'Traditional Sadhya lunch with a local host'],
    inclusions: ['Boutique hillside stay', 'Daily breakfast & 1 local lunch', 'AC private transfers', 'Local naturalist guide'],
    itinerary: [
      { day: 'Day 01', title: 'Arrival & Tea Valley Check-in', detail: 'Scenic drive from Kochi through winding spice hills, evening tea tasting overlooking the valley.' },
      { day: 'Day 02', title: 'Misty Peaks & Tea Trails', detail: 'Guided sunrise walk across Kolukkumalai ridges, followed by a waterfall picnic and spice market visit.' },
      { day: 'Day 03', title: 'Slow Morning & Departure', detail: 'Leisurely breakfast on the veranda before your private transfer back to Kochi.' },
    ],
  },
  {
    id: 'tour-goa',
    title: 'Goa Coastal Break',
    location: 'North Goa, Goa',
    duration: '3 days / 2 nights',
    price: 7999,
    category: 'Beach',
    rating: 4.8,
    reviewCount: 58,
    groupSize: 'Up to 10',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85',
    description: 'Discover golden beaches, local cafés and colourful coastal streets.',
    highlights: ['Fontainhas heritage Latin Quarter walk', 'Golden-hour catamaran cruise', 'Curated beachside café hopping'],
    inclusions: ['Boutique coastal villa stay', 'Daily artisanal breakfast', 'Sunset cruise pass', 'Airport pickup & drop'],
    itinerary: [
      { day: 'Day 01', title: 'Coastal Welcome & Sunset', detail: 'Check into your Portuguese-inspired stay in Assagao, followed by sunset drinks at Chapora.' },
      { day: 'Day 02', title: 'Heritage & Arabian Sea', detail: 'Morning walk through Fontainhas, afternoon leisure, and an evening catamaran sail.' },
      { day: 'Day 03', title: 'Café Morning & Departure', detail: 'Slow brunch in Anjuna and boutique shopping before heading home.' },
    ],
  },
  {
    id: 'tour-jaipur',
    title: 'Royal Jaipur Trail',
    location: 'Jaipur, Rajasthan',
    duration: '2 days / 1 night',
    price: 5299,
    category: 'Culture',
    rating: 4.9,
    reviewCount: 37,
    groupSize: 'Up to 8',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85',
    description: 'Explore historic forts, grand architecture and traditional markets.',
    highlights: ['Amber Fort private sunrise tour', 'Block-printing workshop with artisans', 'Rooftop dinner overlooking Nahargarh'],
    inclusions: ['Heritage haveli stay', 'Breakfast & royal thali dinner', 'Monument entry tickets', 'Chauffeur-driven car'],
    itinerary: [
      { day: 'Day 01', title: 'Pink City Palaces & Bazaars', detail: 'Visit Hawa Mahal, City Palace, and Johari Bazaar with a storytelling historian, ending with rooftop dining.' },
      { day: 'Day 02', title: 'Amber Fort & Craft Studios', detail: 'Early morning fort exploration and a hands-on block-printing session before departure.' },
    ],
  },
  {
    id: 'tour-himachal',
    title: 'Himalayan Quiet Days',
    location: 'Manali, Himachal Pradesh',
    duration: '4 days / 3 nights',
    price: 9999,
    category: 'Adventure',
    rating: 4.9,
    reviewCount: 64,
    groupSize: 'Up to 6',
    difficulty: 'Moderate',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
    description: 'Mountain views, pine forests and refreshing high-altitude air.',
    highlights: ['Guided pine forest ridge hike', 'Riverside bonfire & stargazing', 'Atal Tunnel & Sissu valley excursion'],
    inclusions: ['Wooden mountain cabin stay', 'All breakfasts & 2 dinners', 'Trekking guide & gear', 'Local mountain SUV'],
    itinerary: [
      { day: 'Day 01', title: 'Arrival in Old Manali', detail: 'Settle into a cedar cabin overlooking the Beas river and explore cozy mountain cafés.' },
      { day: 'Day 02', title: 'Sissu Valley & Alpine Passes', detail: 'Cross the Atal Tunnel into Lahaul for dramatic snow-capped vistas and riverside walks.' },
      { day: 'Day 03', title: 'Pine Ridge Hike & Bonfire', detail: 'Half-day forest trail to Jogini ridges followed by acoustic music and stargazing.' },
      { day: 'Day 04', title: 'Orchard Breakfast & Departure', detail: 'Fresh Himachali breakfast amidst apple orchards before your journey back.' },
    ],
  },
  {
    id: 'tour-ladakh',
    title: 'Ladakh High Passes',
    location: 'Leh & Pangong, Ladakh',
    duration: '5 days / 4 nights',
    price: 16499,
    category: 'Adventure',
    rating: 5.0,
    reviewCount: 29,
    groupSize: 'Up to 6',
    difficulty: 'Challenging',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=85',
    description: 'High-altitude monasteries, turquoise lakes and starlit desert skies.',
    highlights: ['Khardung La pass crossing', 'Overnight glamping by Pangong Tso', 'Sunrise prayers at Thiksey Monastery'],
    inclusions: ['Boutique Leh hotel & Pangong camp', 'Breakfast & dinner daily', 'Inner-line permits', 'Oxygen-equipped SUV'],
    itinerary: [
      { day: 'Day 01', title: 'Acclimatisation in Leh', detail: 'Gentle rest, Leh Market walk, and sunset views from Shanti Stupa.' },
      { day: 'Day 02', title: 'Monasteries & Sangam', detail: 'Visit Hall of Fame, Magnetic Hill, and the confluence of Indus & Zanskar.' },
      { day: 'Day 03', title: 'Nubra Valley via Khardung La', detail: 'Cross one of the world’s highest motorable passes into Hunder sand dunes.' },
      { day: 'Day 04', title: 'Pangong Tso Lakeside', detail: 'Scenic Shyok river drive to the shifting blues of Pangong Lake.' },
      { day: 'Day 05', title: 'Return to Leh & Departure', detail: 'Morning lake views and transfer back to Leh.' },
    ],
  },
  {
    id: 'tour-udaipur',
    title: 'Udaipur Lake Serenity',
    location: 'Udaipur, Rajasthan',
    duration: '3 days / 2 nights',
    price: 8499,
    category: 'City',
    rating: 4.8,
    reviewCount: 31,
    groupSize: 'Up to 8',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=85',
    description: 'Marble palaces, tranquil boat rides and lantern-lit lakeside evenings.',
    highlights: ['Private sunset boat on Lake Pichola', 'City Palace & Crystal Gallery tour', 'Lakeside culinary tasting'],
    inclusions: ['Lake-facing boutique suite', 'Daily breakfast', 'Private boat charter', 'Guided heritage walk'],
    itinerary: [
      { day: 'Day 01', title: 'Lake Pichola Arrival', detail: 'Check into your lakeside suite and enjoy a twilight boat ride past Jag Mandir.' },
      { day: 'Day 02', title: 'Palaces & Old City Art', detail: 'Explore City Palace, miniature painting studios, and Monsoon Palace sunset.' },
      { day: 'Day 03', title: 'Morning Chai & Departure', detail: 'Rooftop breakfast overlooking the Aravalli hills before checkout.' },
    ],
  },
  {
    id: 'tour-rishikesh',
    title: 'Rishikesh River Retreat',
    location: 'Rishikesh, Uttarakhand',
    duration: '3 days / 2 nights',
    price: 5999,
    category: 'Nature',
    rating: 4.7,
    reviewCount: 44,
    groupSize: 'Up to 10',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1591018653367-766e3353e482?auto=format&fit=crop&w=1200&q=85',
    description: 'Himalayan foothills, emerald river rapids and restorative dawn yoga.',
    highlights: ['Sunrise yoga overlooking the Ganga', '16 km guided white-water rafting', 'Evening Ganga Aarti at Parmarth Niketan'],
    inclusions: ['Eco-luxury riverfront cottage', 'Sattvic & continental meals', 'Certified rafting gear', 'Yoga sessions'],
    itinerary: [
      { day: 'Day 01', title: 'Riverfront Check-in & Aarti', detail: 'Arrive at the foothills retreat and attend the serene evening river Aarti.' },
      { day: 'Day 02', title: 'Dawn Yoga & Rapids', detail: 'Morning breathwork followed by an exhilarating rafting run from Shivpuri.' },
      { day: 'Day 03', title: 'Café Trail & Departure', detail: 'Visit Beatles Ashram and riverside cafés before heading out.' },
    ],
  },
  {
    id: 'tour-andaman',
    title: 'Andaman Coral Drift',
    location: 'Havelock Island, Andaman',
    duration: '4 days / 3 nights',
    price: 14999,
    category: 'Beach',
    rating: 4.9,
    reviewCount: 35,
    groupSize: 'Up to 6',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85',
    description: 'Powder-white sands, bioluminescent coves and guided reef snorkelling.',
    highlights: ['Radhanagar Beach sunset', 'Guided coral reef snorkelling at Elephant Beach', 'Night kayaking in mangroves'],
    inclusions: ['Beachfront eco-resort', 'Daily breakfast', 'Inter-island catamaran tickets', 'Snorkel gear & guide'],
    itinerary: [
      { day: 'Day 01', title: 'Ferry to Havelock', detail: 'High-speed catamaran to Swaraj Dweep and sunset at Radhanagar Beach.' },
      { day: 'Day 02', title: 'Coral Reefs & Kayaking', detail: 'Morning snorkelling amidst vibrant reefs and optional twilight mangrove kayak.' },
      { day: 'Day 03', title: 'Kalapathar Slow Day', detail: 'Sunrise at Kalapathar Beach and free afternoon by the turquoise bay.' },
      { day: 'Day 04', title: 'Return to Port Blair', detail: 'Morning ferry back for your onward flight.' },
    ],
  },
  {
    id: 'tour-coorg',
    title: 'Coorg Coffee Trails',
    location: 'Madikeri, Karnataka',
    duration: '3 days / 2 nights',
    price: 6899,
    category: 'Nature',
    rating: 4.8,
    reviewCount: 41,
    groupSize: 'Up to 8',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1580818135730-ebd11086660b?auto=format&fit=crop&w=1200&q=85',
    description: 'Aromatic coffee estates, misty Abbey Falls and Kodava home-cooked feasts.',
    highlights: ['Bean-to-cup estate walk', 'Mandalpatti jeep sunrise', 'Authentic Kodava dinner'],
    inclusions: ['Plantation cottage stay', 'Daily breakfast', 'Estate tour & tasting', 'Local transfers'],
    itinerary: [
      { day: 'Day 01', title: 'Plantation Check-in', detail: 'Arrive in Madikeri and walk through shaded Arabica coffee rows.' },
      { day: 'Day 02', title: 'Mandalpatti & Falls', detail: 'Sunrise ridge drive followed by Abbey Falls and spice tasting.' },
      { day: 'Day 03', title: 'Golden Temple & Departure', detail: 'Visit Bylakuppe monastery before heading back.' },
    ],
  },
  {
    id: 'tour-varanasi',
    title: 'Varanasi Sacred Dawns',
    location: 'Varanasi, Uttar Pradesh',
    duration: '2 days / 1 night',
    price: 5499,
    category: 'Culture',
    rating: 4.9,
    reviewCount: 52,
    groupSize: 'Up to 8',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=85',
    description: 'Lantern-lit evening Aarti, timeless ghats and sunrise wooden boat rides.',
    highlights: ['Private dawn boat on the Ganga', 'Dashashwamedh evening Aarti', 'Sarnath heritage excursion'],
    inclusions: ['Heritage ghat-side stay', 'Breakfast & street-food walk', 'Private boat ride', 'Storyteller guide'],
    itinerary: [
      { day: 'Day 01', title: 'Old Kashi & Ganga Aarti', detail: 'Walk ancient alleyways, taste Banarasi chaat, and watch the evening Aarti from a boat.' },
      { day: 'Day 02', title: 'Subah-e-Banaras & Sarnath', detail: 'Sunrise river cruise followed by Sarnath stupa visit.' },
    ],
  },
  {
    id: 'tour-darjeeling',
    title: 'Darjeeling Tea & Peaks',
    location: 'Darjeeling, West Bengal',
    duration: '3 days / 2 nights',
    price: 7499,
    category: 'Nature',
    rating: 4.8,
    reviewCount: 38,
    groupSize: 'Up to 8',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1544634076-a90160ddf44c?auto=format&fit=crop&w=1200&q=85',
    description: 'Kanchenjunga sunrises, heritage toy-train rides and first-flush tea gardens.',
    highlights: ['Tiger Hill sunrise', 'UNESCO Himalayan Toy Train ride', 'Happy Valley tea tasting'],
    inclusions: ['Hilltop colonial stay', 'Daily breakfast', 'Toy train joyride ticket', 'Private SUV transfers'],
    itinerary: [
      { day: 'Day 01', title: 'Mall Road & Tea Gardens', detail: 'Check into your hillside stay and stroll Chowrasta.' },
      { day: 'Day 02', title: 'Tiger Hill & Toy Train', detail: 'Pre-dawn Kanchenjunga view and heritage steam train ride.' },
      { day: 'Day 03', title: 'Monastery Morning', detail: 'Visit Ghoom Monastery before descending to Bagdogra/NJP.' },
    ],
  },
  {
    id: 'tour-pondicherry',
    title: 'Pondicherry French Quarter',
    location: 'White Town, Puducherry',
    duration: '2 days / 1 night',
    price: 5799,
    category: 'Beach',
    rating: 4.7,
    reviewCount: 34,
    groupSize: 'Up to 8',
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
    description: 'Mustard-yellow boulevards, seaside promenades and artisanal bakeries.',
    highlights: ['White Town cycling tour', 'Rock Beach sunrise stroll', 'Auroville Matrimandir visit'],
    inclusions: ['Boutique Franco-Tamil villa', 'French bakery breakfast', 'Cycle rental', 'Guided heritage walk'],
    itinerary: [
      { day: 'Day 01', title: 'Boulevards & Promenade', detail: 'Cycle past colonial villas and enjoy sea-breeze cafés at twilight.' },
      { day: 'Day 02', title: 'Auroville & Departure', detail: 'Morning visit to Auroville and pottery studios before checkout.' },
    ],
  },
];

const starterReviews = [
  {
    id: 'rev-1',
    tourId: 'tour-kerala',
    userName: 'Ananya Sharma',
    rating: 5,
    comment: 'Waking up above the Munnar tea clouds felt unreal. Every transfer and local meal was seamless.',
    createdAt: '2026-10-12T09:30:00.000Z',
  },
  {
    id: 'rev-2',
    tourId: 'tour-himachal',
    userName: 'Rohan Mehta',
    rating: 5,
    comment: 'Best mountain escape we have booked. The pine ridge hike and bonfire night were unforgettable.',
    createdAt: '2026-10-28T14:15:00.000Z',
  },
  {
    id: 'rev-3',
    tourId: 'tour-jaipur',
    userName: 'Meera Nair',
    rating: 5,
    comment: 'The sunrise Amber Fort tour beat every crowd, and the artisan workshop was a highlight.',
    createdAt: '2026-11-04T11:20:00.000Z',
  },
  {
    id: 'rev-4',
    tourId: 'tour-ladakh',
    userName: 'Kabir Verma',
    rating: 5,
    comment: 'Pangong Lake at dawn with hot kahwa in hand—TripNest handled permits and acclimatisation perfectly.',
    createdAt: '2026-11-11T16:40:00.000Z',
  },
];

const starterBookings = [
  {
    id: 'TN-8492014-KRL',
    tourId: 'tour-kerala',
    tourTitle: 'Kerala Green Escape',
    location: 'Munnar, Kerala',
    price: 6499,
    customerId: 'user-demo',
    customerName: 'Demo User',
    customerEmail: 'user@tripnest.demo',
    contactPhone: '+91 98765 43210',
    specialRequests: 'Window-facing room preferred',
    travelDate: '2026-12-18',
    guests: 2,
    subtotal: 12998,
    promoCode: 'NEST10',
    discountAmount: 1300,
    total: 11698,
    paymentMethod: 'Instant UPI (Demo)',
    status: 'Confirmed',
    createdAt: '2026-11-18T10:15:00.000Z',
  },
  {
    id: 'TN-9104421-JPR',
    tourId: 'tour-jaipur',
    tourTitle: 'Royal Jaipur Trail',
    location: 'Jaipur, Rajasthan',
    price: 5299,
    customerId: 'user-demo',
    customerName: 'Demo User',
    customerEmail: 'user@tripnest.demo',
    contactPhone: '+91 98765 43210',
    specialRequests: 'Vegetarian meals only',
    travelDate: '2027-01-10',
    guests: 2,
    subtotal: 10598,
    promoCode: '',
    discountAmount: 0,
    total: 10598,
    paymentMethod: 'Reserve Now, Pay Later',
    status: 'Pending',
    createdAt: '2026-11-22T15:30:00.000Z',
  },
];

const starterInquiries = [
  {
    id: 'INQ-4021',
    name: 'Demo User',
    email: 'user@tripnest.demo',
    destination: 'Spiti Valley',
    travelers: 4,
    budget: '₹15,000 – ₹25,000 / person',
    preferredMonth: 'May 2027',
    notes: 'Looking for a slow 6-day photography road trip with homestays.',
    status: 'New',
    createdAt: '2026-11-20T12:00:00.000Z',
  },
];

function storageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryStore.has(key) ? memoryStore.get(key) : null;
  }
}

function storageSet(key, value) {
  const serialized = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, serialized);
  } catch {
    memoryStore.set(key, serialized);
  }
}

function storageRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    memoryStore.delete(key);
  }
}

function readJson(key, fallback) {
  const raw = storageGet(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    storageSet(key, fallback);
    return fallback;
  }
}

function readArray(key, fallback) {
  const value = readJson(key, fallback);
  if (Array.isArray(value)) return value;
  storageSet(key, fallback);
  return fallback;
}

function notifyStoreChanged() {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new Event('tripnest:data-updated'));
  }
}

export function subscribeToStore(callback) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('tripnest:data-updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('tripnest:data-updated', callback);
    window.removeEventListener('storage', callback);
  };
}

export function initializeStore() {
  const users = readJson(USERS_KEY, null);
  if (!Array.isArray(users) || users.length === 0) {
    storageSet(USERS_KEY, [
      { id: 'admin-demo', name: 'Demo Admin', email: 'admin@tripnest.demo', password: 'admin123', role: 'admin' },
      { id: 'user-demo', name: 'Demo User', email: 'user@tripnest.demo', password: 'user123', role: 'user' },
    ]);
  }

  const tours = readJson(TOURS_KEY, null);
  if (!Array.isArray(tours)) storageSet(TOURS_KEY, starterTours);

  const bookings = readJson(BOOKINGS_KEY, null);
  if (!Array.isArray(bookings)) storageSet(BOOKINGS_KEY, starterBookings);

  const reviews = readJson(REVIEWS_KEY, null);
  if (!Array.isArray(reviews)) storageSet(REVIEWS_KEY, starterReviews);

  const inquiries = readJson(INQUIRIES_KEY, null);
  if (!Array.isArray(inquiries)) storageSet(INQUIRIES_KEY, starterInquiries);

  const wishlist = readJson(WISHLIST_KEY, null);
  if (!wishlist || typeof wishlist !== 'object') storageSet(WISHLIST_KEY, {});
}

export function resetDemoData() {
  storageSet(TOURS_KEY, starterTours);
  storageSet(BOOKINGS_KEY, starterBookings);
  storageSet(REVIEWS_KEY, starterReviews);
  storageSet(INQUIRIES_KEY, starterInquiries);
  storageSet(WISHLIST_KEY, {});
  notifyStoreChanged();
}

function toSessionUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function getUsers() {
  initializeStore();
  return readArray(USERS_KEY, []);
}

export function registerUser({ name, email, password }) {
  initializeStore();
  const cleanName = String(name ?? '').trim();
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const cleanPassword = String(password ?? '');

  if (cleanName.length < 2) throw new Error('Please enter your full name.');
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error('Please enter a valid email address.');
  if (cleanPassword.length < 6) throw new Error('Use a password with at least 6 characters.');

  const users = getUsers();
  if (users.some((user) => user.email?.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const newUser = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: cleanName,
    email: normalizedEmail,
    password: cleanPassword,
    role: 'user',
  };
  storageSet(USERS_KEY, [...users, newUser]);
  notifyStoreChanged();
  return toSessionUser(newUser);
}

export function authenticate(email, password) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase();
  const cleanPassword = String(password ?? '');
  const user = getUsers().find(
    (item) => item.email?.toLowerCase() === normalizedEmail && item.password === cleanPassword,
  );
  if (!user) throw new Error('Email or password is incorrect.');
  return toSessionUser(user);
}

export function getSession() {
  initializeStore();
  const session = readJson(SESSION_KEY, null);
  if (!session || typeof session !== 'object' || !session.id) return null;
  const user = getUsers().find((item) => item.id === session.id);
  return user ? toSessionUser(user) : null;
}

export function saveSession(user) {
  storageSet(SESSION_KEY, toSessionUser(user));
}

export function clearSession() {
  storageRemove(SESSION_KEY);
}

export function getTours() {
  initializeStore();
  return readArray(TOURS_KEY, starterTours);
}

export function saveTour(tour) {
  initializeStore();
  const highlights = Array.isArray(tour.highlights)
    ? tour.highlights.filter(Boolean)
    : String(tour.highlights ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

  const inclusions = Array.isArray(tour.inclusions)
    ? tour.inclusions.filter(Boolean)
    : String(tour.inclusions ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

  const cleanTour = {
    ...tour,
    title: String(tour.title ?? '').trim(),
    location: String(tour.location ?? '').trim(),
    duration: String(tour.duration ?? '').trim(),
    description: String(tour.description ?? '').trim(),
    category: String(tour.category ?? 'Nature'),
    price: Number(tour.price),
    rating: Number(tour.rating) || 4.8,
    reviewCount: Number(tour.reviewCount) || 12,
    groupSize: String(tour.groupSize ?? 'Up to 8').trim() || 'Up to 8',
    difficulty: String(tour.difficulty ?? 'Easy').trim() || 'Easy',
    highlights: highlights.length > 0 ? highlights : ['Curated local experiences', 'Boutique handpicked stay', 'Seamless private transfers'],
    inclusions: inclusions.length > 0 ? inclusions : ['Accommodation', 'Daily breakfast', 'Local transfers'],
    itinerary: Array.isArray(tour.itinerary) && tour.itinerary.length > 0
      ? tour.itinerary
      : [
          { day: 'Day 01', title: 'Arrival & Welcome', detail: 'Private transfer to your boutique stay and evening orientation.' },
          { day: 'Day 02', title: 'Signature Exploration', detail: 'Full-day guided discovery of key landscapes and local cuisine.' },
        ],
  };

  if (!cleanTour.title || !cleanTour.location || !cleanTour.duration || !cleanTour.description) {
    throw new Error('Complete all required package details.');
  }
  if (!Number.isFinite(cleanTour.price) || cleanTour.price <= 0) {
    throw new Error('Enter a valid package price greater than zero.');
  }
  if (!cleanTour.image) {
    cleanTour.image = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85';
  }

  const tours = getTours();
  const exists = tours.some((item) => item.id === cleanTour.id);
  const next = exists
    ? tours.map((item) => (item.id === cleanTour.id ? cleanTour : item))
    : [cleanTour, ...tours];
  storageSet(TOURS_KEY, next);
  notifyStoreChanged();
  return next;
}

export function deleteTour(tourId) {
  const next = getTours().filter((tour) => tour.id !== tourId);
  storageSet(TOURS_KEY, next);
  notifyStoreChanged();
  return next;
}

export function validatePromoCode(rawCode, subtotal) {
  const code = String(rawCode ?? '').trim().toUpperCase();
  if (!code) return { valid: false, discountAmount: 0, promo: null, message: '' };
  const promo = PROMO_CODES[code];
  if (!promo) {
    return { valid: false, discountAmount: 0, promo: null, message: 'Promo code not recognized. Try NEST10, HACK20, or FIRST500.' };
  }
  const discountAmount = promo.type === 'percent'
    ? Math.round((subtotal * promo.value) / 100)
    : Math.min(subtotal, promo.value);
  return { valid: true, discountAmount, promo, message: `Applied ${promo.code}: ${promo.label}` };
}

export function getBookings() {
  initializeStore();
  return readArray(BOOKINGS_KEY, []);
}

export function createBooking({
  tour,
  user,
  travelDate,
  guests,
  contactPhone = '',
  specialRequests = '',
  promoCode = '',
  paymentMethod = 'UPI (GPay / PhonePe)',
  addons = [],
  redeemPoints = 0,
}) {
  if (!tour?.id || !user?.id) throw new Error('Please sign in and select a valid journey.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(travelDate))) {
    throw new Error('Choose a valid travel date.');
  }
  const [year, month, day] = String(travelDate).split('-').map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw new Error('Choose a valid travel date.');
  }
  const now = new Date();
  const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  if (travelDate < today) throw new Error('Travel date cannot be in the past.');

  const guestCount = Number(guests);
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10) {
    throw new Error('Choose between 1 and 10 travellers.');
  }

  const selectedAddons = BOOKING_ADDONS.filter((item) => addons.includes(item.id));
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + item.price, 0);
  const baseSubtotal = Number(tour.price) * guestCount;
  const subtotal = baseSubtotal + addonsTotal;
  const promoResult = validatePromoCode(promoCode, subtotal);
  if (promoCode && !promoResult.valid) {
    throw new Error(promoResult.message);
  }

  const availablePoints = getUserPoints(user.id);
  const afterPromo = Math.max(0, subtotal - promoResult.discountAmount);
  const pointsRedeemed = Math.min(availablePoints, Math.max(0, Math.round(Number(redeemPoints) || 0)), afterPromo);
  const total = Math.max(0, afterPromo - pointsRedeemed);
  const pointsEarned = Math.max(50, Math.round(total * 0.05));

  const bookings = getBookings();
  const booking = {
    id: `TN-${Date.now().toString().slice(-7)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    tourId: tour.id,
    tourTitle: tour.title,
    tourCategory: tour.category || 'Nature',
    location: tour.location,
    price: Number(tour.price),
    customerId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    contactPhone: String(contactPhone ?? '').trim(),
    specialRequests: String(specialRequests ?? '').trim(),
    travelDate,
    guests: guestCount,
    addons: selectedAddons,
    addonsTotal,
    subtotal,
    promoCode: promoResult.valid ? promoResult.promo.code : '',
    discountAmount: promoResult.discountAmount,
    pointsRedeemed,
    pointsEarned,
    total,
    perPersonSplit: Math.round(total / guestCount),
    paymentMethod,
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  storageSet(BOOKINGS_KEY, [booking, ...bookings]);
  updateUserPoints(user.id, availablePoints - pointsRedeemed + pointsEarned);
  notifyStoreChanged();
  return booking;
}

export function updateBookingStatus(bookingId, status) {
  const allowedStatuses = ['Pending', 'Confirmed', 'Cancelled'];
  if (!allowedStatuses.includes(status)) throw new Error('Invalid booking status.');
  const next = getBookings().map((booking) =>
    booking.id === bookingId ? { ...booking, status } : booking,
  );
  storageSet(BOOKINGS_KEY, next);
  notifyStoreChanged();
  return next;
}

export function cancelUserBooking(bookingId, userId) {
  const bookings = getBookings();
  const target = bookings.find((b) => b.id === bookingId && b.customerId === userId);
  if (!target) throw new Error('Booking not found.');
  if (target.status !== 'Pending') throw new Error('Only pending bookings can be cancelled online.');
  return updateBookingStatus(bookingId, 'Cancelled');
}

export function getWishlist(userId) {
  initializeStore();
  if (!userId) return [];
  const map = readJson(WISHLIST_KEY, {});
  return Array.isArray(map[userId]) ? map[userId] : [];
}

export function toggleWishlist(userId, tourId) {
  if (!userId) return [];
  const map = readJson(WISHLIST_KEY, {});
  const current = Array.isArray(map[userId]) ? map[userId] : [];
  const exists = current.includes(tourId);
  const nextList = exists ? current.filter((id) => id !== tourId) : [...current, tourId];
  storageSet(WISHLIST_KEY, { ...map, [userId]: nextList });
  notifyStoreChanged();
  return nextList;
}

export function getReviews(tourId = null) {
  initializeStore();
  const all = readArray(REVIEWS_KEY, starterReviews);
  return tourId ? all.filter((rev) => rev.tourId === tourId) : all;
}

export function addReview({ tourId, userName, rating, comment }) {
  initializeStore();
  const cleanComment = String(comment ?? '').trim();
  const numericRating = Number(rating);
  if (!cleanComment || cleanComment.length < 5) throw new Error('Please write a short review (at least 5 characters).');
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new Error('Choose a rating between 1 and 5.');
  }

  const review = {
    id: `rev-${Date.now()}`,
    tourId,
    userName: String(userName ?? 'Traveller').trim(),
    rating: numericRating,
    comment: cleanComment,
    createdAt: new Date().toISOString(),
  };

  const reviews = getReviews();
  const nextReviews = [review, ...reviews];
  storageSet(REVIEWS_KEY, nextReviews);

  // Update tour rating & count
  const tourReviews = nextReviews.filter((r) => r.tourId === tourId);
  const avg = Number((tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length).toFixed(1));
  const tours = getTours().map((t) =>
    t.id === tourId ? { ...t, rating: avg, reviewCount: (t.reviewCount || 0) + 1 } : t,
  );
  storageSet(TOURS_KEY, tours);

  notifyStoreChanged();
  return review;
}

export function getInquiries() {
  initializeStore();
  return readArray(INQUIRIES_KEY, starterInquiries);
}

export function createInquiry({ name, email, destination, travelers, budget, preferredMonth, notes }) {
  initializeStore();
  if (!String(name ?? '').trim() || !String(email ?? '').trim() || !String(destination ?? '').trim()) {
    throw new Error('Please enter your name, email, and desired destination.');
  }
  const inquiry = {
    id: `INQ-${Math.floor(1000 + Math.random() * 9000)}`,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    destination: String(destination).trim(),
    travelers: Number(travelers) || 2,
    budget: String(budget || 'Flexible').trim(),
    preferredMonth: String(preferredMonth || 'Flexible').trim(),
    notes: String(notes || '').trim(),
    status: 'New',
    createdAt: new Date().toISOString(),
  };
  const next = [inquiry, ...getInquiries()];
  storageSet(INQUIRIES_KEY, next);
  notifyStoreChanged();
  return inquiry;
}

export function updateInquiryStatus(inquiryId, status) {
  const allowed = ['New', 'In Progress', 'Quoted'];
  if (!allowed.includes(status)) throw new Error('Invalid inquiry status.');
  const next = getInquiries().map((item) => (item.id === inquiryId ? { ...item, status } : item));
  storageSet(INQUIRIES_KEY, next);
  notifyStoreChanged();
  return next;
}
