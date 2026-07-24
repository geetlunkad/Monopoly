// Complete 40 Board Space Definitions with ISO Country Codes & Clean Names
export const COLOR_GROUPS = {
  BROWN: '#8B4513',
  LIGHT_BLUE: '#38BDF8',
  PINK: '#EC4899',
  ORANGE: '#F97316',
  RED: '#EF4444',
  YELLOW: '#EAB308',
  GREEN: '#10B981',
  DARK_BLUE: '#1E40AF',
  RAILROAD: '#475569', // Gray for Airports
  UTILITY: '#64748B',  // Gray for Utilities
  SPECIAL: 'transparent'
};

export const BOARD_TILES = [
  { id: 0, name: 'GO', type: 'GO', color: COLOR_GROUPS.SPECIAL, price: 0, rent: [0, 0, 0, 0, 0, 0], houseCost: 0, position: 'bottom-right' },
  { id: 1, name: 'Toronto', country: 'ca', type: 'PROPERTY', group: 'BROWN', color: COLOR_GROUPS.BROWN, price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50 },
  { id: 2, name: 'Community Chest', type: 'COMMUNITY', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 3, name: 'Vancouver', country: 'ca', type: 'PROPERTY', group: 'BROWN', color: COLOR_GROUPS.BROWN, price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50 },
  { id: 4, name: 'Income Tax', type: 'TAX', color: COLOR_GROUPS.SPECIAL, price: 0, taxAmount: 200 },
  { id: 5, name: 'Heathrow', icon: '✈️', type: 'RAILROAD', group: 'RAILROAD', color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0 },
  { id: 6, name: 'Tel Aviv', country: 'il', type: 'PROPERTY', group: 'LIGHT_BLUE', color: COLOR_GROUPS.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
  { id: 7, name: 'Chance', type: 'CHANCE', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 8, name: 'Jerusalem', country: 'il', type: 'PROPERTY', group: 'LIGHT_BLUE', color: COLOR_GROUPS.LIGHT_BLUE, price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
  { id: 9, name: 'Haifa', country: 'il', type: 'PROPERTY', group: 'LIGHT_BLUE', color: COLOR_GROUPS.LIGHT_BLUE, price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50 },
  { id: 10, name: 'In Jail / Visiting', type: 'JAIL', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 11, name: 'Beijing', country: 'cn', type: 'PROPERTY', group: 'PINK', color: COLOR_GROUPS.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
  { id: 12, name: 'Electric', icon: '⚡', type: 'UTILITY', group: 'UTILITY', color: COLOR_GROUPS.UTILITY, price: 150, rent: [4, 10], houseCost: 0 },
  { id: 13, name: 'Shanghai', country: 'cn', type: 'PROPERTY', group: 'PINK', color: COLOR_GROUPS.PINK, price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
  { id: 14, name: 'Shenzhen', country: 'cn', type: 'PROPERTY', group: 'PINK', color: COLOR_GROUPS.PINK, price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100 },
  { id: 15, name: 'JFK', icon: '✈️', type: 'RAILROAD', group: 'RAILROAD', color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0 },
  { id: 16, name: 'Sydney', country: 'au', type: 'PROPERTY', group: 'ORANGE', color: COLOR_GROUPS.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
  { id: 17, name: 'Community Chest', type: 'COMMUNITY', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 18, name: 'Melbourne', country: 'au', type: 'PROPERTY', group: 'ORANGE', color: COLOR_GROUPS.ORANGE, price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
  { id: 19, name: 'Brisbane', country: 'au', type: 'PROPERTY', group: 'ORANGE', color: COLOR_GROUPS.ORANGE, price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100 },
  { id: 20, name: 'Free Parking', type: 'FREE_PARKING', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 21, name: 'Bombay', country: 'in', type: 'PROPERTY', group: 'RED', color: COLOR_GROUPS.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
  { id: 22, name: 'Chance', type: 'CHANCE', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 23, name: 'Delhi', country: 'in', type: 'PROPERTY', group: 'RED', color: COLOR_GROUPS.RED, price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
  { id: 24, name: 'Hyderabad', country: 'in', type: 'PROPERTY', group: 'RED', color: COLOR_GROUPS.RED, price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150 },
  { id: 25, name: 'LAX', icon: '✈️', type: 'RAILROAD', group: 'RAILROAD', color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0 },
  { id: 26, name: 'Rome', country: 'it', type: 'PROPERTY', group: 'YELLOW', color: COLOR_GROUPS.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
  { id: 27, name: 'Milan', country: 'it', type: 'PROPERTY', group: 'YELLOW', color: COLOR_GROUPS.YELLOW, price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
  { id: 28, name: 'Water', icon: '💧', type: 'UTILITY', group: 'UTILITY', color: COLOR_GROUPS.UTILITY, price: 150, rent: [4, 10], houseCost: 0 },
  { id: 29, name: 'Florence', country: 'it', type: 'PROPERTY', group: 'YELLOW', color: COLOR_GROUPS.YELLOW, price: 280, rent: [24, 120, 360, 850, 1025, 1200], houseCost: 150 },
  { id: 30, name: 'Go To Jail', type: 'GO_TO_JAIL', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 31, name: 'London', country: 'gb', type: 'PROPERTY', group: 'GREEN', color: COLOR_GROUPS.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
  { id: 32, name: 'Manchester', country: 'gb', type: 'PROPERTY', group: 'GREEN', color: COLOR_GROUPS.GREEN, price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
  { id: 33, name: 'Community Chest', type: 'COMMUNITY', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 34, name: 'Birmingham', country: 'gb', type: 'PROPERTY', group: 'GREEN', color: COLOR_GROUPS.GREEN, price: 300, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200 },
  { id: 35, name: 'Changi', icon: '✈️', type: 'RAILROAD', group: 'RAILROAD', color: COLOR_GROUPS.RAILROAD, price: 200, rent: [25, 50, 100, 200], houseCost: 0 },
  { id: 36, name: 'Chance', type: 'CHANCE', color: COLOR_GROUPS.SPECIAL, price: 0 },
  { id: 37, name: 'Los Angeles', country: 'us', type: 'PROPERTY', group: 'DARK_BLUE', color: COLOR_GROUPS.DARK_BLUE, price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200 },
  { id: 38, name: 'Luxury Tax', type: 'TAX', color: COLOR_GROUPS.SPECIAL, price: 0, taxAmount: 100 },
  { id: 39, name: 'New York', country: 'us', type: 'PROPERTY', group: 'DARK_BLUE', color: COLOR_GROUPS.DARK_BLUE, price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200 }
];

export const PROPERTY_GROUPS = {
  BROWN: [1, 3],
  LIGHT_BLUE: [6, 8, 9],
  PINK: [11, 13, 14],
  ORANGE: [16, 18, 19],
  RED: [21, 23, 24],
  YELLOW: [26, 27, 29],
  GREEN: [31, 32, 34],
  DARK_BLUE: [37, 39],
  RAILROAD: [5, 15, 25, 35],
  UTILITY: [12, 28]
};
