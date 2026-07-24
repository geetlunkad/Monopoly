// Data-Driven Card Decks for Chance and Community Chest

export const CHANCE_CARDS = [
  { id: 'ch1', text: 'Advance to GO (Collect $200)', action: 'MOVE_TO', target: 0, collectGo: true },
  { id: 'ch2', text: 'Advance to Illinois Ave. If you pass GO, collect $200', action: 'MOVE_TO', target: 24, collectGo: true },
  { id: 'ch3', text: 'Advance to St. Charles Place. If you pass GO, collect $200', action: 'MOVE_TO', target: 11, collectGo: true },
  { id: 'ch4', text: 'Advance to nearest Utility. If unowned, you may buy it. If owned, pay owner 10x dice roll.', action: 'NEAREST_UTILITY' },
  { id: 'ch5', text: 'Advance to nearest Railroad and pay owner twice the rental.', action: 'NEAREST_RAILROAD' },
  { id: 'ch6', text: 'Bank pays you dividend of $50', action: 'MONEY', amount: 50 },
  { id: 'ch7', text: 'Get Out of Jail Free card', action: 'JAIL_CARD' },
  { id: 'ch8', text: 'Go Back 3 Spaces', action: 'MOVE_RELATIVE', amount: -3 },
  { id: 'ch9', text: 'Go directly to Jail. Do not pass GO, do not collect $200', action: 'GO_TO_JAIL' },
  { id: 'ch10', text: 'Make general repairs on all your property. For each house pay $25, for each hotel $100', action: 'REPAIRS', houseFee: 25, hotelFee: 100 },
  { id: 'ch11', text: 'Pay poor tax of $15', action: 'MONEY', amount: -15 },
  { id: 'ch12', text: 'Take a trip to Reading Railroad. If you pass GO, collect $200', action: 'MOVE_TO', target: 5, collectGo: true },
  { id: 'ch13', text: 'Take a walk on the Boardwalk. Advance to Boardwalk', action: 'MOVE_TO', target: 39, collectGo: false },
  { id: 'ch14', text: 'You have been elected Chairman of the Board. Pay each player $50', action: 'PAY_ALL', amount: 50 },
  { id: 'ch15', text: 'Your building loan matures. Collect $150', action: 'MONEY', amount: 150 }
];

export const COMMUNITY_CHEST_CARDS = [
  { id: 'cc1', text: 'Advance to GO (Collect $200)', action: 'MOVE_TO', target: 0, collectGo: true },
  { id: 'cc2', text: 'Bank error in your favor. Collect $200', action: 'MONEY', amount: 200 },
  { id: 'cc3', text: "Doctor's fees. Pay $50", action: 'MONEY', amount: -50 },
  { id: 'cc4', text: 'From sale of stock you get $50', action: 'MONEY', amount: 50 },
  { id: 'cc5', text: 'Get Out of Jail Free card', action: 'JAIL_CARD' },
  { id: 'cc6', text: 'Go to Jail. Go directly to Jail, do not pass GO, do not collect $200', action: 'GO_TO_JAIL' },
  { id: 'cc7', text: 'Grand Opera Night. Collect $50 from every player for opening night seats', action: 'COLLECT_ALL', amount: 50 },
  { id: 'cc8', text: 'Holiday Fund matures. Receive $100', action: 'MONEY', amount: 100 },
  { id: 'cc9', text: 'Income tax refund. Collect $20', action: 'MONEY', amount: 20 },
  { id: 'cc10', text: 'It is your birthday. Collect $10 from every player', action: 'COLLECT_ALL', amount: 10 },
  { id: 'cc11', text: 'Life insurance matures. Collect $100', action: 'MONEY', amount: 100 },
  { id: 'cc12', text: 'Hospital Fees. Pay $100', action: 'MONEY', amount: -100 },
  { id: 'cc13', text: 'School fees. Pay $50', action: 'MONEY', amount: -50 },
  { id: 'cc14', text: 'Receive $25 consultancy fee', action: 'MONEY', amount: 25 },
  { id: 'cc15', text: 'You are assessed for street repairs. $40 per house, $115 per hotel', action: 'REPAIRS', houseFee: 40, hotelFee: 115 },
  { id: 'cc16', text: 'You have won second prize in a beauty contest. Collect $10', action: 'MONEY', amount: 10 }
];
