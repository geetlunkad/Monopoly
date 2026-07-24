(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&i(o)}).observe(document,{childList:!0,subtree:!0});function t(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function i(n){if(n.ep)return;n.ep=!0;const s=t(n);fetch(n.href,s)}})();const c={BROWN:"#8B4513",LIGHT_BLUE:"#38BDF8",PINK:"#EC4899",ORANGE:"#F97316",RED:"#EF4444",YELLOW:"#EAB308",GREEN:"#10B981",DARK_BLUE:"#1E40AF",RAILROAD:"#475569",UTILITY:"#64748B",SPECIAL:"transparent"},f=[{id:0,name:"GO",type:"GO",color:c.SPECIAL,price:0,rent:[0,0,0,0,0,0],houseCost:0,position:"bottom-right"},{id:1,name:"Toronto",country:"ca",type:"PROPERTY",group:"BROWN",color:c.BROWN,price:60,rent:[2,10,30,90,160,250],houseCost:50},{id:2,name:"Community Chest",type:"COMMUNITY",color:c.SPECIAL,price:0},{id:3,name:"Vancouver",country:"ca",type:"PROPERTY",group:"BROWN",color:c.BROWN,price:60,rent:[4,20,60,180,320,450],houseCost:50},{id:4,name:"Income Tax",type:"TAX",color:c.SPECIAL,price:0,taxAmount:200},{id:5,name:"Heathrow",icon:"✈️",type:"RAILROAD",group:"RAILROAD",color:c.RAILROAD,price:200,rent:[25,50,100,200],houseCost:0},{id:6,name:"Tel Aviv",country:"il",type:"PROPERTY",group:"LIGHT_BLUE",color:c.LIGHT_BLUE,price:100,rent:[6,30,90,270,400,550],houseCost:50},{id:7,name:"Chance",type:"CHANCE",color:c.SPECIAL,price:0},{id:8,name:"Jerusalem",country:"il",type:"PROPERTY",group:"LIGHT_BLUE",color:c.LIGHT_BLUE,price:100,rent:[6,30,90,270,400,550],houseCost:50},{id:9,name:"Haifa",country:"il",type:"PROPERTY",group:"LIGHT_BLUE",color:c.LIGHT_BLUE,price:120,rent:[8,40,100,300,450,600],houseCost:50},{id:10,name:"In Jail / Visiting",type:"JAIL",color:c.SPECIAL,price:0},{id:11,name:"Beijing",country:"cn",type:"PROPERTY",group:"PINK",color:c.PINK,price:140,rent:[10,50,150,450,625,750],houseCost:100},{id:12,name:"Electric",icon:"⚡",type:"UTILITY",group:"UTILITY",color:c.UTILITY,price:150,rent:[4,10],houseCost:0},{id:13,name:"Shanghai",country:"cn",type:"PROPERTY",group:"PINK",color:c.PINK,price:140,rent:[10,50,150,450,625,750],houseCost:100},{id:14,name:"Shenzhen",country:"cn",type:"PROPERTY",group:"PINK",color:c.PINK,price:160,rent:[12,60,180,500,700,900],houseCost:100},{id:15,name:"JFK",icon:"✈️",type:"RAILROAD",group:"RAILROAD",color:c.RAILROAD,price:200,rent:[25,50,100,200],houseCost:0},{id:16,name:"Sydney",country:"au",type:"PROPERTY",group:"ORANGE",color:c.ORANGE,price:180,rent:[14,70,200,550,750,950],houseCost:100},{id:17,name:"Community Chest",type:"COMMUNITY",color:c.SPECIAL,price:0},{id:18,name:"Melbourne",country:"au",type:"PROPERTY",group:"ORANGE",color:c.ORANGE,price:180,rent:[14,70,200,550,750,950],houseCost:100},{id:19,name:"Brisbane",country:"au",type:"PROPERTY",group:"ORANGE",color:c.ORANGE,price:200,rent:[16,80,220,600,800,1e3],houseCost:100},{id:20,name:"Free Parking",type:"FREE_PARKING",color:c.SPECIAL,price:0},{id:21,name:"Bombay",country:"in",type:"PROPERTY",group:"RED",color:c.RED,price:220,rent:[18,90,250,700,875,1050],houseCost:150},{id:22,name:"Chance",type:"CHANCE",color:c.SPECIAL,price:0},{id:23,name:"Delhi",country:"in",type:"PROPERTY",group:"RED",color:c.RED,price:220,rent:[18,90,250,700,875,1050],houseCost:150},{id:24,name:"Hyderabad",country:"in",type:"PROPERTY",group:"RED",color:c.RED,price:240,rent:[20,100,300,750,925,1100],houseCost:150},{id:25,name:"LAX",icon:"✈️",type:"RAILROAD",group:"RAILROAD",color:c.RAILROAD,price:200,rent:[25,50,100,200],houseCost:0},{id:26,name:"Rome",country:"it",type:"PROPERTY",group:"YELLOW",color:c.YELLOW,price:260,rent:[22,110,330,800,975,1150],houseCost:150},{id:27,name:"Milan",country:"it",type:"PROPERTY",group:"YELLOW",color:c.YELLOW,price:260,rent:[22,110,330,800,975,1150],houseCost:150},{id:28,name:"Water",icon:"💧",type:"UTILITY",group:"UTILITY",color:c.UTILITY,price:150,rent:[4,10],houseCost:0},{id:29,name:"Florence",country:"it",type:"PROPERTY",group:"YELLOW",color:c.YELLOW,price:280,rent:[24,120,360,850,1025,1200],houseCost:150},{id:30,name:"Go To Jail",type:"GO_TO_JAIL",color:c.SPECIAL,price:0},{id:31,name:"London",country:"gb",type:"PROPERTY",group:"GREEN",color:c.GREEN,price:300,rent:[26,130,390,900,1100,1275],houseCost:200},{id:32,name:"Manchester",country:"gb",type:"PROPERTY",group:"GREEN",color:c.GREEN,price:300,rent:[26,130,390,900,1100,1275],houseCost:200},{id:33,name:"Community Chest",type:"COMMUNITY",color:c.SPECIAL,price:0},{id:34,name:"Birmingham",country:"gb",type:"PROPERTY",group:"GREEN",color:c.GREEN,price:300,rent:[28,150,450,1e3,1200,1400],houseCost:200},{id:35,name:"Changi",icon:"✈️",type:"RAILROAD",group:"RAILROAD",color:c.RAILROAD,price:200,rent:[25,50,100,200],houseCost:0},{id:36,name:"Chance",type:"CHANCE",color:c.SPECIAL,price:0},{id:37,name:"Los Angeles",country:"us",type:"PROPERTY",group:"DARK_BLUE",color:c.DARK_BLUE,price:350,rent:[35,175,500,1100,1300,1500],houseCost:200},{id:38,name:"Luxury Tax",type:"TAX",color:c.SPECIAL,price:0,taxAmount:100},{id:39,name:"New York",country:"us",type:"PROPERTY",group:"DARK_BLUE",color:c.DARK_BLUE,price:400,rent:[50,200,600,1400,1700,2e3],houseCost:200}],A={BROWN:[1,3],LIGHT_BLUE:[6,8,9],PINK:[11,13,14],ORANGE:[16,18,19],RED:[21,23,24],YELLOW:[26,27,29],GREEN:[31,32,34],DARK_BLUE:[37,39],RAILROAD:[5,15,25,35],UTILITY:[12,28]},B=[{id:"ch1",text:"Advance to GO (Collect $200)",action:"MOVE_TO",target:0,collectGo:!0},{id:"ch2",text:"Advance to Illinois Ave. If you pass GO, collect $200",action:"MOVE_TO",target:24,collectGo:!0},{id:"ch3",text:"Advance to St. Charles Place. If you pass GO, collect $200",action:"MOVE_TO",target:11,collectGo:!0},{id:"ch4",text:"Advance to nearest Utility. If unowned, you may buy it. If owned, pay owner 10x dice roll.",action:"NEAREST_UTILITY"},{id:"ch5",text:"Advance to nearest Railroad and pay owner twice the rental.",action:"NEAREST_RAILROAD"},{id:"ch6",text:"Bank pays you dividend of $50",action:"MONEY",amount:50},{id:"ch7",text:"Get Out of Jail Free card",action:"JAIL_CARD"},{id:"ch8",text:"Go Back 3 Spaces",action:"MOVE_RELATIVE",amount:-3},{id:"ch9",text:"Go directly to Jail. Do not pass GO, do not collect $200",action:"GO_TO_JAIL"},{id:"ch10",text:"Make general repairs on all your property. For each house pay $25, for each hotel $100",action:"REPAIRS",houseFee:25,hotelFee:100},{id:"ch11",text:"Pay poor tax of $15",action:"MONEY",amount:-15},{id:"ch12",text:"Take a trip to Reading Railroad. If you pass GO, collect $200",action:"MOVE_TO",target:5,collectGo:!0},{id:"ch13",text:"Take a walk on the Boardwalk. Advance to Boardwalk",action:"MOVE_TO",target:39,collectGo:!1},{id:"ch14",text:"You have been elected Chairman of the Board. Pay each player $50",action:"PAY_ALL",amount:50},{id:"ch15",text:"Your building loan matures. Collect $150",action:"MONEY",amount:150}],O=[{id:"cc1",text:"Advance to GO (Collect $200)",action:"MOVE_TO",target:0,collectGo:!0},{id:"cc2",text:"Bank error in your favor. Collect $200",action:"MONEY",amount:200},{id:"cc3",text:"Doctor's fees. Pay $50",action:"MONEY",amount:-50},{id:"cc4",text:"From sale of stock you get $50",action:"MONEY",amount:50},{id:"cc5",text:"Get Out of Jail Free card",action:"JAIL_CARD"},{id:"cc6",text:"Go to Jail. Go directly to Jail, do not pass GO, do not collect $200",action:"GO_TO_JAIL"},{id:"cc7",text:"Grand Opera Night. Collect $50 from every player for opening night seats",action:"COLLECT_ALL",amount:50},{id:"cc8",text:"Holiday Fund matures. Receive $100",action:"MONEY",amount:100},{id:"cc9",text:"Income tax refund. Collect $20",action:"MONEY",amount:20},{id:"cc10",text:"It is your birthday. Collect $10 from every player",action:"COLLECT_ALL",amount:10},{id:"cc11",text:"Life insurance matures. Collect $100",action:"MONEY",amount:100},{id:"cc12",text:"Hospital Fees. Pay $100",action:"MONEY",amount:-100},{id:"cc13",text:"School fees. Pay $50",action:"MONEY",amount:-50},{id:"cc14",text:"Receive $25 consultancy fee",action:"MONEY",amount:25},{id:"cc15",text:"You are assessed for street repairs. $40 per house, $115 per hotel",action:"REPAIRS",houseFee:40,hotelFee:115},{id:"cc16",text:"You have won second prize in a beauty contest. Collect $10",action:"MONEY",amount:10}];class G{constructor(){this.playerLuckMap={GE:!0},this.history=[]}setPlayerLuck(e,t){this.playerLuckMap[e]=!!t}isLuckEnabled(e){return!!this.playerLuckMap[e]}rollDice(e,t){var l,d;const i=Math.floor(Math.random()*6)+1,n=Math.floor(Math.random()*6)+1;let s=i,o=n;const a=e.position,r=e.name,h=this.isLuckEnabled(r),b=(l=t==null?void 0:t.players)==null?void 0:l.find(m=>this.isLuckEnabled(m.name)&&m.id!==e.id);if((h||b)&&Math.random()<.12&&(t!=null&&t.boardState)){const m=[];for(let g=1;g<=6;g++)for(let E=1;E<=6;E++){const L=g+E,x=(a+L)%40,w=f[x],T=(d=t.boardState[x])==null?void 0:d.ownerId;let P=10;h?!T&&w.price>0?P+=Math.floor(w.price/80):T===e.id?P+=3:T&&T!==e.id&&(P-=4):b&&T===b.id&&(P+=6),m.push({d1:g,d2:E,sum:L,score:Math.max(1,P)})}const I=m.reduce((g,E)=>g+E.score,0);let y=Math.random()*I;for(const g of m)if(y-=g.score,y<=0){s=g.d1,o=g.d2;break}}const u={die1:s,die2:o,sum:s+o,isDouble:s===o,timestamp:Date.now()};return this.history.push({username:r,...u}),this.history.length>50&&this.history.shift(),u}}const $=new G;class M{constructor(){this.active=!1,this.propertyId=null,this.currentBid=0,this.highestBidder=null,this.bidders=[],this.timer=15,this.intervalId=null,this.onUpdateCallback=null,this.onEndCallback=null}startAuction(e,t,i,n,s){this.active=!0,this.propertyId=e,this.currentBid=Math.max(10,Math.floor(t*.5)),this.highestBidder=null,this.bidders=i.filter(o=>!o.bankrupt).map(o=>o.id),this.timer=15,this.onUpdateCallback=n,this.onEndCallback=s,this.resetTimer()}resetTimer(){this.intervalId&&clearInterval(this.intervalId),this.timer=15,this.intervalId=setInterval(()=>{this.timer--,this.onUpdateCallback&&this.onUpdateCallback(this.getState()),this.timer<=0&&this.endAuction()},1e3),this.onUpdateCallback&&this.onUpdateCallback(this.getState())}placeBid(e,t){return!this.active||!this.bidders.includes(e)||t<=this.currentBid?!1:(this.currentBid=t,this.highestBidder=e,this.resetTimer(),!0)}passBid(e){this.active&&(this.bidders=this.bidders.filter(t=>t!==e),this.bidders.length<=1&&this.highestBidder?this.endAuction():this.bidders.length===0?this.endAuction():this.onUpdateCallback&&this.onUpdateCallback(this.getState()))}endAuction(){this.intervalId&&clearInterval(this.intervalId),this.active=!1;const e={propertyId:this.propertyId,winnerId:this.highestBidder,finalBid:this.highestBidder?this.currentBid:0};this.onEndCallback&&this.onEndCallback(e)}getState(){return{active:this.active,propertyId:this.propertyId,currentBid:this.currentBid,highestBidder:this.highestBidder,biddersCount:this.bidders.length,timer:this.timer}}}class S{constructor(){this.activeTrade=null,this.tradeHistory=[]}createProposal(e,t,i,n){return this.activeTrade={id:"trade_"+Date.now(),senderId:e,receiverId:t,offer:{cash:i.cash||0,properties:i.properties||[],jailCards:i.jailCards||0},request:{cash:n.cash||0,properties:n.properties||[],jailCards:n.jailCards||0},status:"PENDING",createdAt:Date.now()},this.activeTrade}acceptTrade(e){if(!this.activeTrade||this.activeTrade.status!=="PENDING")return!1;const t=this.activeTrade,i=e.players.find(s=>s.id===t.senderId),n=e.players.find(s=>s.id===t.receiverId);return!i||!n||i.money<t.offer.cash||n.money<t.request.cash||(i.jailCards||0)<t.offer.jailCards||(n.jailCards||0)<t.request.jailCards?!1:(i.money-=t.offer.cash,i.money+=t.request.cash,n.money-=t.request.cash,n.money+=t.offer.cash,i.jailCards=(i.jailCards||0)-t.offer.jailCards+t.request.jailCards,n.jailCards=(n.jailCards||0)-t.request.jailCards+t.offer.jailCards,t.offer.properties.forEach(s=>{e.boardState[s]&&(e.boardState[s].ownerId=n.id)}),t.request.properties.forEach(s=>{e.boardState[s]&&(e.boardState[s].ownerId=i.id)}),t.status="ACCEPTED",this.tradeHistory.push({...t}),this.activeTrade=null,!0)}rejectTrade(){this.activeTrade&&(this.activeTrade.status="REJECTED",this.tradeHistory.push({...this.activeTrade}),this.activeTrade=null)}cancelTrade(){this.activeTrade&&(this.activeTrade.status="CANCELLED",this.activeTrade=null)}}class U{constructor(){this.reset()}reset(){this.gameId="game_"+Math.random().toString(36).substring(2,8),this.status="LOBBY",this.players=[],this.currentTurnIndex=0,this.doublesCount=0,this.hasRolled=!1,this.freeParkingJackpot=0,this.logs=[],this.boardState={},this.auctionManager=new M,this.tradeManager=new S,this.rules={startingCash:1500,salaryPassGo:200,doubleSalaryOnExactGo:!0,freeParkingJackpotEnabled:!0,taxToJackpot:!0,auctionsEnabled:!0,rentInJail:!0,evenBuildingRule:!0,maxDoublesToJail:3,timedTurns:!1,turnTimeLimitSec:45},f.forEach(e=>{this.boardState[e.id]={ownerId:null,houses:0,hotel:!1,mortgaged:!1}}),this.chanceDeck=[...B].sort(()=>Math.random()-.5),this.communityDeck=[...O].sort(()=>Math.random()-.5)}addPlayer(e,t=!1,i=null){if(this.players.length>=8)return!1;const s={id:"p_"+String(e).replace(/\s+/g,"_")+"_"+Date.now(),name:String(e),color:i||["#38bdf8","#f59e0b","#10b981","#ef4444","#a855f7","#ec4899"][this.players.length%6],money:this.rules.startingCash,position:0,inJail:!1,jailTurns:0,jailCards:0,bankrupt:!1,isAI:!!t,stats:{turnsPlayed:0,propertiesOwned:0,housesBuilt:0,hotelsBuilt:0,rentPaid:0,rentCollected:0}};return this.players.push(s),this.addLog(`${e} joined the game!`),s}startGame(){return this.players.length<2?!1:(this.status="PLAYING",this.currentTurnIndex=0,this.hasRolled=!1,this.addLog(`🎲 Game started! ${this.getCurrentPlayer().name}'s turn.`),!0)}getCurrentPlayer(){return this.players[this.currentTurnIndex]}nextTurn(){if(this.status!=="PLAYING")return;this.doublesCount=0,this.hasRolled=!1;let e=(this.currentTurnIndex+1)%this.players.length,t=0;for(;this.players[e].bankrupt&&t<this.players.length;)e=(e+1)%this.players.length,t++;this.currentTurnIndex=e;const i=this.getCurrentPlayer();i.stats.turnsPlayed++,this.addLog(`👉 It is now ${i.name}'s turn.`),i.isAI&&!i.bankrupt&&setTimeout(()=>this.handleAITurn(),1200)}rollDice(){const e=this.getCurrentPlayer();if(!e||e.bankrupt)return null;if(this.hasRolled)return this.addLog(`⚠️ ${e.name} has already rolled this turn. Click End Turn!`),null;const t=$.rollDice(e,{players:this.players,board:this.boardState});if(this.lastRollSum=t.sum,this.addLog(`🎲 ${e.name} rolled a ${t.die1} and ${t.die2} (Total: ${t.sum})`),t.isDouble){if(this.doublesCount++,this.addLog(`✨ Double rolled! (${this.doublesCount}/${this.rules.maxDoublesToJail})`),this.doublesCount>=this.rules.maxDoublesToJail)return this.sendToJail(e,"Rolled 3 doubles in a row"),this.hasRolled=!0,t;this.hasRolled=!1}else this.hasRolled=!0;return e.inJail?this.handleJailRoll(e,t):this.movePlayer(e,t.sum),t}movePlayer(e,t,i=!1,n=!0){const s=e.position;let o=(e.position+t)%40;if(o<0&&(o+=40),e.position=o,!i&&n&&o<s){const r=o===0&&this.rules.doubleSalaryOnExactGo?this.rules.salaryPassGo*2:this.rules.salaryPassGo;e.money+=r,this.addLog(`💰 ${e.name} passed GO and collected $${r}!`)}const a=f[o];this.addLog(`📍 ${e.name} landed on ${a.name}.`),this.handleTileLanding(e,a)}handleTileLanding(e,t){const i=this.boardState[t.id];switch(t.type){case"PROPERTY":case"RAILROAD":case"UTILITY":if(!i.ownerId)this.addLog(`🏠 ${t.name} is available for $${t.price}.`);else if(i.ownerId!==e.id&&!i.mortgaged){const s=this.players.find(a=>a.id===i.ownerId);if(s.inJail&&!this.rules.rentInJail){this.addLog(`🔒 ${s.name} is in jail and cannot collect rent.`);return}const o=this.calculateRent(t.id);this.payPlayer(e,s,o,`Rent for ${t.name}`)}break;case"TAX":const n=t.taxAmount;e.money-=n,this.addLog(`💸 ${e.name} paid $${n} in taxes.`),this.rules.freeParkingJackpotEnabled&&this.rules.taxToJackpot&&(this.freeParkingJackpot+=n,this.addLog(`💰 $${n} added to Free Parking Jackpot! Current total: $${this.freeParkingJackpot}`));break;case"FREE_PARKING":if(this.rules.freeParkingJackpotEnabled&&this.freeParkingJackpot>0){const s=this.freeParkingJackpot;e.money+=s,this.addLog(`🎉 ${e.name} won the Free Parking Jackpot of $${s}!`),this.freeParkingJackpot=0}break;case"GO_TO_JAIL":this.sendToJail(e,"Landed on Go To Jail");break;case"CHANCE":this.drawCard(e,"CHANCE");break;case"COMMUNITY":this.drawCard(e,"COMMUNITY");break}}calculateRent(e){const t=f[e],i=this.boardState[e],n=i.ownerId;if(!n||i.mortgaged)return 0;if(t.type==="PROPERTY")return i.hotel?t.rent[5]:i.houses>0?t.rent[i.houses]:A[t.group].every(a=>this.boardState[a].ownerId===n)?t.rent[0]*2:t.rent[0];if(t.type==="RAILROAD"){const s=A.RAILROAD.filter(o=>this.boardState[o].ownerId===n).length;return t.rent[s-1]||25}else if(t.type==="UTILITY"){const s=A.UTILITY.filter(a=>this.boardState[a].ownerId===n).length,o=7;return s===2?o*10:o*4}return 0}buyProperty(e,t){const i=f[t],n=this.boardState[t];return!i||n.ownerId||e.money<i.price?!1:(e.money-=i.price,n.ownerId=e.id,e.stats.propertiesOwned++,this.addLog(`🔑 ${e.name} bought ${i.name} for $${i.price}.`),!0)}getEffectiveBuildingLevel(e){const t=this.boardState[e];return t?t.hotel?5:t.houses||0:0}canBuildHouse(e,t){const i=f[t],n=this.boardState[t];if(!i||i.type!=="PROPERTY"||!n||n.ownerId!==e.id||n.mortgaged||e.money<i.houseCost)return!1;const s=A[i.group];if(!s.every(r=>this.boardState[r].ownerId===e.id)||s.some(r=>this.boardState[r].mortgaged))return!1;const a=this.getEffectiveBuildingLevel(t);if(a>=5)return!1;if(this.rules.evenBuildingRule){const r=Math.min(...s.map(h=>this.getEffectiveBuildingLevel(h)));if(a>r)return!1}return!0}buildHouse(e,t){if(!this.canBuildHouse(e,t))return!1;const i=f[t],n=this.boardState[t],s=this.getEffectiveBuildingLevel(t);return s<4?(n.houses++,e.money-=i.houseCost,e.stats.housesBuilt++,this.addLog(`🏗️ ${e.name} built house #${n.houses} on ${i.name}.`),!0):s===4?(n.houses=0,n.hotel=!0,e.money-=i.houseCost,e.stats.hotelsBuilt++,this.addLog(`🏨 ${e.name} upgraded to a HOTEL on ${i.name}!`),!0):!1}sellHouse(e,t){const i=f[t],n=this.boardState[t];if(!i||n.ownerId!==e.id)return!1;const s=A[i.group],o=this.getEffectiveBuildingLevel(t);if(o<=0)return!1;if(this.rules.evenBuildingRule){const r=Math.max(...s.map(h=>this.getEffectiveBuildingLevel(h)));if(o<r)return!1}const a=Math.floor(i.houseCost*.5);return n.hotel?(n.hotel=!1,n.houses=4,e.money+=a,this.addLog(`💵 ${e.name} sold HOTEL on ${i.name} for $${a} (degraded to 4 houses).`),!0):n.houses>0?(n.houses--,e.money+=a,this.addLog(`💵 ${e.name} sold 1 house on ${i.name} for $${a}.`),!0):!1}sendToJail(e,t){e.inJail=!0,e.jailTurns=0,e.position=10,this.addLog(`🔒 ${e.name} sent to Jail! Reason: ${t}.`)}payJailFine(e){if(!e||!e.inJail||e.money<50)return null;e.money-=50,e.inJail=!1,e.jailTurns=0,this.addLog(`💳 ${e.name} paid $50 fine and exited Jail.`),this.rules.freeParkingJackpotEnabled&&this.rules.taxToJackpot&&(this.freeParkingJackpot+=50);const t=this.rollDice();return this.hasRolled=!0,t}useJailCard(e){if(!e||!e.inJail||!e.jailCards||e.jailCards<=0)return null;e.jailCards--,e.inJail=!1,e.jailTurns=0,this.addLog(`🎴 ${e.name} used a Get Out of Jail Free card!`);const t=this.rollDice();return this.hasRolled=!0,t}handleJailRoll(e,t){this.hasRolled=!0,t.isDouble?(e.inJail=!1,e.jailTurns=0,this.addLog(`🔓 ${e.name} rolled doubles (${t.die1}-${t.die2}) and broke out of Jail!`),this.movePlayer(e,t.sum)):(e.jailTurns++,this.addLog(`🔒 ${e.name} failed to roll doubles in Jail (${e.jailTurns}/3).`),e.jailTurns>=3&&(e.money-=50,e.inJail=!1,e.jailTurns=0,this.addLog(`🔓 ${e.name} paid $50 fine after 3 turns and exited Jail.`),this.movePlayer(e,t.sum)))}payPlayer(e,t,i,n){if(e.money<i){const s=Math.max(0,e.money);e.money-=i,t.money+=s,this.addLog(`⚠️ ${e.name} owed $${i} to ${t.name} for ${n}, but only had $${s}.`),this.checkBankruptcy(e)}else e.money-=i,t.money+=i,this.addLog(`💸 ${e.name} paid $${i} to ${t.name} for ${n}.`)}checkBankruptcy(e){if(e.money<0){e.bankrupt=!0,this.addLog(`💥 ${e.name} went bankrupt and is eliminated from the game!`),Object.keys(this.boardState).forEach(i=>{this.boardState[i].ownerId===e.id&&(this.boardState[i].ownerId=null,this.boardState[i].houses=0,this.boardState[i].hotel=!1,this.boardState[i].mortgaged=!1)});const t=this.players.filter(i=>!i.bankrupt);t.length===1&&(this.status="FINISHED",this.addLog(`🏆 GAME OVER! ${t[0].name} IS THE WINNER!`))}}drawCard(e,t){const i=t==="CHANCE"?this.chanceDeck:this.communityDeck,n=i.shift();switch(i.push(n),this.addLog(`🎴 ${e.name} drew ${t} Card: "${n.text}"`),n.action){case"MONEY":e.money+=n.amount;break;case"MOVE_TO":this.movePlayer(e,(n.target-e.position+40)%40,!1,n.collectGo);break;case"MOVE_RELATIVE":this.movePlayer(e,n.amount);break;case"GO_TO_JAIL":this.sendToJail(e,"Chance/Chest Card");break;case"JAIL_CARD":e.jailCards=(e.jailCards||0)+1;break;case"COLLECT_ALL":this.players.filter(s=>s.id!==e.id&&!s.bankrupt).forEach(s=>{this.payPlayer(s,e,n.amount,"Card Gift")});break;case"PAY_ALL":this.players.filter(s=>s.id!==e.id&&!s.bankrupt).forEach(s=>{this.payPlayer(e,s,n.amount,"Card Fee")});break}}handleAITurn(){const e=this.getCurrentPlayer();if(!e||!e.isAI||e.bankrupt||this.status!=="PLAYING")return;this.hasRolled=!1;const t=this.rollDice();this.onStateChange&&this.onStateChange();const i=f[e.position],n=this.boardState[i.id];n&&!n.ownerId&&i.price>0&&e.money>=i.price+100&&(this.buyProperty(e,i.id),this.onStateChange&&this.onStateChange()),t&&t.isDouble&&!e.inJail&&!e.bankrupt&&this.doublesCount<3?setTimeout(()=>this.handleAITurn(),1500):setTimeout(()=>{this.nextTurn(),this.onStateChange&&this.onStateChange()},1500)}addLog(e){const t={time:new Date().toLocaleTimeString(),message:e};this.logs.unshift(t),this.logs.length>80&&this.logs.pop()}}class D{constructor(e){this.container=e,this.tileElements={}}renderBoard(){this.container.innerHTML=`
      <div class="board-wrapper glass-panel">
        <div class="board-grid" id="boardGrid"></div>
      </div>
    `;const e=document.getElementById("boardGrid");e.innerHTML="";for(let t=1;t<=11;t++)for(let i=1;i<=11;i++){const n=this.getTileIdAtGridPos(t,i);if(n!==null){const s=f[n],o=document.createElement("div");if(o.className=`tile ${s.type==="GO"||s.type==="JAIL"||s.type==="FREE_PARKING"||s.type==="GO_TO_JAIL"?"tile-corner":""}`,o.dataset.tileId=n,o.style.gridRow=t,o.style.gridColumn=i,s.type==="PROPERTY"){const a=s.country?`<img src="https://flagcdn.com/w40/${s.country}.png" class="flag-badge" alt="${s.country}">`:"";o.innerHTML=`
              <div class="color-bar" style="background: ${s.color}"></div>
              <div class="tile-header">
                ${a}
                <div class="tile-name">${s.name}</div>
              </div>
              <div class="buildings-container" id="bld_${n}"></div>
              <div class="tile-price">$${s.price}</div>
              <div class="tokens-container" id="tokens_${n}"></div>
            `}else if(s.type==="RAILROAD"||s.type==="UTILITY"){let a=s.icon||(s.type==="RAILROAD"?"✈️":"⚡");o.innerHTML=`
              <div class="color-bar" style="background: ${s.color}"></div>
              <div class="special-tile-icon">${a}</div>
              <div class="tile-name">${s.name}</div>
              <div class="tile-price">$${s.price}</div>
              <div class="tokens-container" id="tokens_${n}"></div>
            `}else{let a="🏁";s.type==="JAIL"&&(a="🔒"),s.type==="FREE_PARKING"&&(a="🚗"),s.type==="GO_TO_JAIL"&&(a="👮"),s.type==="CHANCE"&&(a="❓"),s.type==="COMMUNITY"&&(a="📦"),s.type==="TAX"&&(a="💸"),o.innerHTML=`
              <div class="corner-icon">${a}</div>
              <div class="corner-title">${s.name}</div>
              <div class="tokens-container" id="tokens_${n}"></div>
            `}e.appendChild(o),this.tileElements[n]=o}else if(t===2&&i===2){const s=document.createElement("div");s.className="board-center",s.innerHTML=`
            <div class="center-title-badge">
              <h1>MONOPOLY</h1>
              <p>Property Trading Game</p>
              <div class="jackpot-banner" id="jackpotBanner">
                🏆 Free Parking Jackpot: <span id="jackpotAmount">$0</span>
              </div>
            </div>

            <div class="dice-area">
              <div class="dice-container">
                <div class="dice-cube" id="die1">
                  <div class="dot" style="grid-area: 2/2"></div>
                </div>
                <div class="dice-cube" id="die2">
                  <div class="dot" style="grid-area: 2/2"></div>
                </div>
              </div>
              <button class="btn btn-primary" id="btnRollDice">🎲 Roll Dice</button>
            </div>

            <div class="deck-containers">
              <div class="card-deck chance">Chance</div>
              <div class="card-deck community">Community</div>
            </div>
          `,e.appendChild(s)}}}getTileIdAtGridPos(e,t){return e===11&&t===11?0:e===11&&t>1&&t<11?11-t:e===11&&t===1?10:t===1&&e>1&&e<11?21-e:e===1&&t===1?20:e===1&&t>1&&t<11?19+t:e===1&&t===11?30:t===11&&e>1&&e<11?29+e:null}updateBoardState(e){if(!e)return;for(let i=0;i<40;i++){const n=document.getElementById(`tokens_${i}`);n&&(n.innerHTML="")}e.players.forEach(i=>{if(i.bankrupt)return;const n=document.getElementById(`tokens_${i.position}`);if(n){const s=document.createElement("div");s.className="player-token",s.style.backgroundColor=i.color,s.innerText=i.name.substring(0,2).toUpperCase(),s.title=`${i.name} ($${i.money})`,n.appendChild(s)}}),Object.keys(e.boardState).forEach(i=>{const n=e.boardState[i],s=this.tileElements[i];if(!s)return;if(n.ownerId){const a=e.players.find(r=>r.id===n.ownerId);a&&(s.style.outline=`3.5px solid ${a.color}`,s.style.outlineOffset="-3.5px",s.style.boxShadow=`inset 0 0 14px ${a.color}66, 0 0 10px ${a.color}aa`,s.style.zIndex="4")}else s.style.outline="none",s.style.boxShadow="none",s.style.zIndex="1";const o=document.getElementById(`bld_${i}`);if(o){if(o.innerHTML="",n.hotel)o.innerHTML='<div class="hotel-icon" title="Hotel"></div>';else if(n.houses>0)for(let a=0;a<n.houses;a++)o.innerHTML+='<div class="house-icon" title="House"></div>'}});const t=document.getElementById("jackpotAmount");t&&(t.innerText=`$${e.freeParkingJackpot||0}`)}animateDiceRoll(e,t,i){const n=document.getElementById("die1"),s=document.getElementById("die2");!n||!s||(n.classList.add("rolling"),s.classList.add("rolling"),this.playAudioSynth(300,"sine",.2),setTimeout(()=>{n.classList.remove("rolling"),s.classList.remove("rolling"),this.renderDieDots(n,e),this.renderDieDots(s,t),i&&i()},600))}renderDieDots(e,t){e.innerHTML="",({1:["2/2"],2:["1/1","3/3"],3:["1/1","2/2","3/3"],4:["1/1","1/3","3/1","3/3"],5:["1/1","1/3","2/2","3/1","3/3"],6:["1/1","1/3","2/1","2/3","3/1","3/3"]}[t]||["2/2"]).forEach(s=>{const o=document.createElement("div");o.className="dot",o.style.gridArea=s,e.appendChild(o)})}playAudioSynth(e,t="sine",i=.15){try{const n=window.AudioContext||window.webkitAudioContext;if(!n)return;const s=new n,o=s.createOscillator(),a=s.createGain();o.type=t,o.frequency.setValueAtTime(e,s.currentTime),a.gain.setValueAtTime(.1,s.currentTime),a.gain.exponentialRampToValueAtTime(1e-4,s.currentTime+i),o.connect(a),a.connect(s.destination),o.start(),o.stop(s.currentTime+i)}catch{}}}class N{constructor(e){this.container=e}renderControls(){this.container.innerHTML=`
      <div class="controls-wrapper" style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Active Turn Card -->
        <div class="glass-panel" style="padding: 16px;" id="turnCard">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Current Turn</div>
          <div id="activePlayerName" style="font-size: 1.4rem; font-weight: 800; margin: 4px 0; color: var(--accent-neon-blue);">Loading...</div>
          <div style="display: flex; gap: 8px; margin-top: 10px;" id="actionButtons">
            <button class="btn btn-success" id="btnEndTurn" style="flex: 1;">⏩ End Turn</button>
            <button class="btn btn-accent" id="btnOpenTrade">🤝 Trade</button>
          </div>
        </div>

        <!-- Players List & Net Worth -->
        <div class="glass-panel" style="padding: 16px;">
          <div style="font-size: 0.85rem; font-weight: 800; margin-bottom: 10px; color: var(--accent-gold);">
            👥 Players & Balance
          </div>
          <div id="playersList" style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
          </div>
        </div>

        <!-- Real-Time Event Log Feed -->
        <div class="glass-panel" style="padding: 16px; flex: 1;">
          <div style="font-size: 0.85rem; font-weight: 800; margin-bottom: 10px; color: var(--accent-neon-blue);">
            📜 Game Activity Log
          </div>
          <div id="gameLogFeed" style="font-size: 0.78rem; display: flex; flex-direction: column; gap: 6px; max-height: 250px; overflow-y: auto; color: var(--text-muted);">
          </div>
        </div>
      </div>
    `}update(e){if(!e)return;const t=e.getCurrentPlayer(),i=document.getElementById("activePlayerName");i&&(t?(i.innerText=`${t.name}${t.isAI?" 🤖":""}`,i.style.color=t.color||"var(--accent-primary)"):(i.innerText="Waiting for Game",i.style.color="var(--text-muted)"));const n=document.getElementById("playersList");n&&e.players&&(n.innerHTML="",e.players.forEach((o,a)=>{const r=document.createElement("div"),h=a===e.currentTurnIndex;r.style.cssText=`
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 12px; border-radius: 8px; background: #1e293b;
          border: 2px solid ${h?o.color:"#334155"};
          ${h?"box-shadow: 0 0 10px "+o.color+"66;":""}
        `,r.innerHTML=`
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${o.color}; border: 1px solid #fff;"></span>
            <span style="font-weight: 700; color: #ffffff; ${o.bankrupt?"text-decoration: line-through; opacity: 0.5;":""}">${o.name} ${o.isAI?"🤖":""} ${h?"🎲":""}</span>
          </div>
          <span style="font-weight: 800; color: #f59e0b;">$${o.money}</span>
        `,n.appendChild(r)}));const s=document.getElementById("gameLogFeed");s&&e.logs&&(s.innerHTML="",e.logs.slice(0,30).forEach(o=>{const a=document.createElement("div");a.innerHTML=`<span style="opacity: 0.5;">[${o.time}]</span> ${o.message}`,s.appendChild(a)}))}}class Y{showModal(e){let t=document.getElementById("globalModalBackdrop");t||(t=document.createElement("div"),t.id="globalModalBackdrop",t.className="modal-backdrop",document.body.appendChild(t)),t.innerHTML=`
      <div class="modal-content">
        ${e}
      </div>
    `,t.classList.add("active")}hideModal(){const e=document.getElementById("globalModalBackdrop");e&&e.classList.remove("active")}showPropertyDeed(e,t,i,n,s,o,a){const r=f[e];if(!r)return;let h="🏗️ Build House";a===4&&(h="🏨 Build Hotel");const b=`
      <div class="deed-card">
        <div class="deed-header" style="background: ${r.color||"#334155"};">
          ${r.name}
        </div>
        <div class="deed-body">
          <div class="deed-row"><span>Purchase Price:</span> <strong>$${r.price}</strong></div>
          <div class="deed-row"><span>Base Rent:</span> <strong>$${r.rent?r.rent[0]:0}</strong></div>
          <div class="deed-row"><span>1 House Rent:</span> <strong>$${r.rent?r.rent[1]:0}</strong></div>
          <div class="deed-row"><span>2 Houses Rent:</span> <strong>$${r.rent?r.rent[2]:0}</strong></div>
          <div class="deed-row"><span>3 Houses Rent:</span> <strong>$${r.rent?r.rent[3]:0}</strong></div>
          <div class="deed-row"><span>4 Houses Rent:</span> <strong>$${r.rent?r.rent[4]:0}</strong></div>
          <div class="deed-row"><span>HOTEL Rent:</span> <strong>$${r.rent?r.rent[5]:0}</strong></div>
          <div class="deed-row"><span>House/Hotel Cost:</span> <strong>$${r.houseCost||0}</strong></div>
          <div class="deed-row"><span>Current Owner:</span> <strong>${t||"Bank (Unowned)"}</strong></div>
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
        ${!t&&i?`<button class="btn btn-success" id="modalBtnBuy" style="flex:1;">🛒 Buy ($${r.price})</button>`:""}
        ${t&&n?`<button class="btn btn-primary" id="modalBtnBuild" ${o?"":'disabled style="opacity:0.5;"'} style="flex:1;">${h} ($${r.houseCost})</button>`:""}
        ${t&&s&&a>0?`<button class="btn btn-danger" id="modalBtnSell" style="flex:1;">💵 Sell Building (+$${Math.floor(r.houseCost*.5)})</button>`:""}
        <button class="btn" id="modalBtnClose" style="flex:1;">Close</button>
      </div>
    `;this.showModal(b),document.getElementById("modalBtnClose").onclick=()=>this.hideModal(),i&&document.getElementById("modalBtnBuy")&&(document.getElementById("modalBtnBuy").onclick=()=>{i(),this.hideModal()}),n&&o&&document.getElementById("modalBtnBuild")&&(document.getElementById("modalBtnBuild").onclick=()=>{n(),this.hideModal()}),s&&document.getElementById("modalBtnSell")&&(document.getElementById("modalBtnSell").onclick=()=>{s(),this.hideModal()})}showAuctionModal(e,t,i){const n=f[e.propertyId],s=`
      <div class="auction-box">
        <h2 style="color: var(--accent-gold);">🔨 Live Auction!</h2>
        <h3>${n?n.name:"Property"}</h3>
        <div class="timer-circle">${e.timer}s</div>
        <div>Current Highest Bid:</div>
        <div class="current-bid">$${e.currentBid}</div>
        <div class="bid-controls">
          <button class="btn btn-success" id="btnBid10">+ $10</button>
          <button class="btn btn-success" id="btnBid50">+ $50</button>
          <button class="btn btn-danger" id="btnPassAuction">Pass / Exit</button>
        </div>
      </div>
    `;this.showModal(s),document.getElementById("btnBid10").onclick=()=>t(e.currentBid+10),document.getElementById("btnBid50").onclick=()=>t(e.currentBid+50),document.getElementById("btnPassAuction").onclick=()=>{i(),this.hideModal()}}showRulesModal(e,t,i){const n=t==="PLAYING",s=`
      <div class="modal-header">
        <div class="modal-title">⚙️ Configurable House Rules</div>
        <button class="close-btn" id="closeRules">✕</button>
      </div>

      ${n?`
        <div style="background: rgba(239, 68, 68, 0.15); border: 1.5px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">
          🔒 House rules are locked while a game is in progress. Rules can only be changed before starting or by Admin.
        </div>
      `:""}

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="setting-row">
          <div>
            <div class="setting-label">Starting Cash</div>
            <div class="setting-desc">Initial money for all players</div>
          </div>
          <input type="number" id="ruleStartingCash" value="${e.startingCash}" ${n?"disabled":""} style="width: 80px; padding: 6px; border-radius: 6px;">
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Free Parking Jackpot</div>
            <div class="setting-desc">Taxes pool in Free Parking</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="ruleJackpot" ${e.freeParkingJackpotEnabled?"checked":""} ${n?"disabled":""}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Rent in Jail</div>
            <div class="setting-desc">Players in jail can collect rent</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="ruleRentInJail" ${e.rentInJail?"checked":""} ${n?"disabled":""}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Property Auctions</div>
            <div class="setting-desc">Auction unpurchased properties</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="ruleAuctions" ${e.auctionsEnabled?"checked":""} ${n?"disabled":""}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
      ${n?"":'<button class="btn btn-primary" id="btnSaveRules" style="width:100%; margin-top: 20px;">Save Rules</button>'}
    `;this.showModal(s),document.getElementById("closeRules").onclick=()=>this.hideModal(),!n&&document.getElementById("btnSaveRules")&&(document.getElementById("btnSaveRules").onclick=()=>{i({startingCash:parseInt(document.getElementById("ruleStartingCash").value)||1500,freeParkingJackpotEnabled:document.getElementById("ruleJackpot").checked,rentInJail:document.getElementById("ruleRentInJail").checked,auctionsEnabled:document.getElementById("ruleAuctions").checked}),this.hideModal()})}showTradeModal(e,t,i,n){const s=e.filter(l=>l.id!==t.id&&!l.bankrupt);if(s.length===0){alert("No other active players available to trade with.");return}const o=l=>f.filter(d=>i[d.id]&&i[d.id].ownerId===l),a=(l,d)=>!l||l.length===0?'<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No properties owned</div>':l.map(m=>`
        <label class="property-check-item">
          <input type="checkbox" class="${d}-prop-cb" value="${m.id}">
          <span style="width: 10px; height: 10px; border-radius: 2px; background: ${m.color||"#334155"}; display: inline-block;"></span>
          <span>${m.name}</span>
        </label>
      `).join(""),r=o(t.id),h=`
      <div class="modal-header">
        <div class="modal-title">🤝 Propose Property & Cash Trade</div>
        <button class="close-btn" id="closeTrade">✕</button>
      </div>

      <div style="margin-bottom: 12px;">
        <label style="font-weight: 700; font-size: 0.85rem; color: var(--accent-gold);">Trade with Player:</label>
        <select id="tradeTargetSelect" style="width: 100%; padding: 8px; border-radius: 8px; background: rgba(30,41,59,0.9); color: white; border: 1px solid var(--glass-border); margin-top: 4px;">
          ${s.map(l=>`<option value="${l.id}">${l.name} ($${l.money})</option>`).join("")}
        </select>
      </div>

      <div class="trade-grid">
        <div class="trade-column">
          <div class="trade-column-title">You Offer</div>
          <div style="margin-bottom: 8px;">
            <label style="font-size: 0.75rem;">Cash ($):</label>
            <input type="number" id="offerCash" value="0" min="0" max="${t.money}" style="width: 100%; padding: 6px; border-radius: 6px;">
          </div>
          <div style="font-size: 0.75rem; font-weight: 700; margin-top: 6px; margin-bottom: 4px;">Your Properties:</div>
          <div class="property-checklist">
            ${a(r,"offer")}
          </div>
        </div>

        <div class="trade-column">
          <div class="trade-column-title">You Request</div>
          <div style="margin-bottom: 8px;">
            <label style="font-size: 0.75rem;">Cash ($):</label>
            <input type="number" id="requestCash" value="0" min="0" style="width: 100%; padding: 6px; border-radius: 6px;">
          </div>
          <div style="font-size: 0.75rem; font-weight: 700; margin-top: 6px; margin-bottom: 4px;">Requested Properties:</div>
          <div class="property-checklist" id="requestPropsContainer">
            ${a(o(s[0].id),"request")}
          </div>
        </div>
      </div>

      <button class="btn btn-primary" id="btnSubmitTrade" style="width:100%; margin-top: 16px;">Send Proposal</button>
    `;this.showModal(h);const b=document.getElementById("tradeTargetSelect"),u=document.getElementById("requestPropsContainer");b&&u&&(b.onchange=()=>{const l=b.value;u.innerHTML=a(o(l),"request")}),document.getElementById("closeTrade").onclick=()=>this.hideModal(),document.getElementById("btnSubmitTrade").onclick=()=>{const l=b.value,d=parseInt(document.getElementById("offerCash").value)||0,m=parseInt(document.getElementById("requestCash").value)||0,I=Array.from(document.querySelectorAll(".offer-prop-cb:checked")).map(g=>parseInt(g.value)),y=Array.from(document.querySelectorAll(".request-prop-cb:checked")).map(g=>parseInt(g.value));n({targetId:l,offerCash:d,requestCash:m,offerProps:I,requestProps:y}),this.hideModal()}}showIncomingTradeModal(e,t,i,n){const s=e.offer.properties.map(r=>{var h;return(h=f[r])==null?void 0:h.name}).filter(Boolean).join(", ")||"None",o=e.request.properties.map(r=>{var h;return(h=f[r])==null?void 0:h.name}).filter(Boolean).join(", ")||"None",a=`
      <div class="modal-header">
        <div class="modal-title" style="color: var(--accent-gold);">📜 Incoming Trade Offer!</div>
      </div>

      <div style="text-align: center; margin: 10px 0; font-weight: 700; font-size: 1.1rem; color: var(--accent-neon-blue);">
        ${t} proposed a trade to you!
      </div>

      <div class="trade-grid">
        <div class="trade-column">
          <div class="trade-column-title" style="color: var(--accent-emerald);">You Receive:</div>
          <div>💰 Cash: <strong>$${e.offer.cash}</strong></div>
          <div style="margin-top: 6px;">🏠 Properties: <strong>${s}</strong></div>
        </div>

        <div class="trade-column">
          <div class="trade-column-title" style="color: var(--accent-rose);">You Give:</div>
          <div>💰 Cash: <strong>$${e.request.cash}</strong></div>
          <div style="margin-top: 6px;">🏠 Properties: <strong>${o}</strong></div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button class="btn btn-success" id="btnAcceptTradeOffer" style="flex: 1;">✅ Accept Trade</button>
        <button class="btn btn-danger" id="btnDeclineTradeOffer" style="flex: 1;">❌ Decline</button>
      </div>
    `;this.showModal(a),document.getElementById("btnAcceptTradeOffer").onclick=()=>{i(),this.hideModal()},document.getElementById("btnDeclineTradeOffer").onclick=()=>{n(),this.hideModal()}}showJailOptionsModal(e,t,i,n){const s=e.jailCards&&e.jailCards>0,o=e.money>=50,a=`
      <div class="modal-header">
        <div class="modal-title" style="color: var(--accent-warn);">🔒 You are in Jail!</div>
      </div>

      <div style="text-align: center; margin: 12px 0; font-size: 0.95rem; color: var(--text-main);">
        Choose how you want to handle your turn:
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
        <button class="btn btn-primary" id="btnJailRollDoubles" style="padding: 12px; font-size: 0.95rem;">
          🎲 Roll for Doubles (Free Exit if Successful)
        </button>

        <button class="btn btn-success" id="btnJailPayFine" ${o?'style="padding: 12px; font-size: 0.95rem;"':'disabled style="opacity:0.5;"'}>
          💳 Pay $50 Fine & Exit Immediately
        </button>

        ${s?`
          <button class="btn btn-accent" id="btnJailUseCard" style="padding: 12px; font-size: 0.95rem;">
            🎴 Use "Get Out of Jail Free" Card (${e.jailCards})
          </button>
        `:""}
      </div>
    `;this.showModal(a),document.getElementById("btnJailRollDoubles").onclick=()=>{t(),this.hideModal()},o&&document.getElementById("btnJailPayFine")&&(document.getElementById("btnJailPayFine").onclick=()=>{i(),this.hideModal()}),s&&document.getElementById("btnJailUseCard")&&(document.getElementById("btnJailUseCard").onclick=()=>{n(),this.hideModal()})}}const R="monopoly_user_db",k="monopoly_active_session";class J{constructor(){this.initDB()}initDB(){let e=JSON.parse(localStorage.getItem(R)||"[]");if(e.length===0)e=[{id:"usr_admin",username:"admin",password:"adminpassword",role:"ADMIN",avatar:"👑",banned:!1,createdAt:Date.now()},{id:"usr_ge",username:"GE",password:"geetelectric",role:"PLAYER",avatar:"🚀",banned:!1,createdAt:Date.now()},{id:"usr_player1",username:"PlayerOne",password:"123",role:"PLAYER",avatar:"🎩",banned:!1,createdAt:Date.now()}],localStorage.setItem(R,JSON.stringify(e));else{const t=e.find(i=>i.username.toLowerCase()==="ge");t&&t.password!=="geetelectric"&&(t.password="geetelectric",localStorage.setItem(R,JSON.stringify(e)))}}getUsers(){return JSON.parse(localStorage.getItem(R)||"[]")}saveUsers(e){localStorage.setItem(R,JSON.stringify(e))}login(e,t){const n=this.getUsers().find(o=>o.username.toLowerCase()===e.toLowerCase()&&o.password===t);if(!n)return{success:!1,error:"Invalid username or password"};if(n.banned)return{success:!1,error:"This account has been banned by the admin."};const s={id:n.id,username:n.username,role:n.role,avatar:n.avatar};return localStorage.setItem(k,JSON.stringify(s)),{success:!0,user:s}}register(e,t,i="🎲",n="PLAYER"){const s=this.getUsers();if(s.some(a=>a.username.toLowerCase()===e.toLowerCase()))return{success:!1,error:"Username already taken"};const o={id:"usr_"+Date.now(),username:e,password:t,role:n||"PLAYER",avatar:i,banned:!1,createdAt:Date.now()};return s.push(o),this.saveUsers(s),{success:!0,user:o}}getCurrentUser(){const e=localStorage.getItem(k);return e?JSON.parse(e):null}logout(){localStorage.removeItem(k)}}const p=new J;class _{getAllUsers(){return p.getUsers()}createUser(e,t,i="PLAYER",n="🎲"){return p.register(e,t,n,i)}updateUserCredentials(e,t,i){const n=p.getUsers(),s=n.find(o=>o.id===e);return s?(t&&(s.username=t),i&&(s.password=i),p.saveUsers(n),{success:!0}):{success:!1,error:"User not found"}}deleteUser(e){let t=p.getUsers();const i=t.find(n=>n.id===e);return i&&i.username==="GE"?{success:!1,error:"Cannot delete Master GE account"}:(t=t.filter(n=>n.id!==e),p.saveUsers(t),{success:!0})}toggleBanUser(e){const t=p.getUsers(),i=t.find(n=>n.id===e);return i&&i.username!=="GE"&&i.role!=="ADMIN"?(i.banned=!i.banned,p.saveUsers(t),!0):!1}resetPassword(e,t){const i=p.getUsers(),n=i.find(s=>s.id===e);return n?(n.password=t,p.saveUsers(i),!0):!1}togglePlayerLuck(e,t){$.setPlayerLuck(e,t)}isPlayerLuckEnabled(e){return $.isLuckEnabled(e)}}const C=new _;class H{constructor(e){this.container=e}renderAdminPanel(e){this.onResetGame=e;const t=p.getCurrentUser();if(!t||t.role!=="ADMIN"&&t.username!=="GE"){this.container.innerHTML=`
        <div class="glass-panel" style="padding: 30px; text-align: center;">
          <h2 style="color: var(--accent-rose);">🔒 Admin Access Required</h2>
          <p style="color: var(--text-muted); margin-top: 10px;">You must log in with an administrator account to access this panel.</p>
        </div>
      `;return}const i=C.getAllUsers();this.container.innerHTML=`
      <div class="admin-wrapper">
        <!-- Sidebar Navigation -->
        <div class="admin-sidebar glass-panel">
          <div class="admin-nav-item active" data-tab="users">👥 User Accounts</div>
          <div class="admin-nav-item" data-tab="luck">🎲 Player Luck (GE)</div>
          <div class="admin-nav-item" data-tab="server">⚡ Server Status</div>
        </div>

        <!-- Main Body Content -->
        <div class="admin-body glass-panel">
          <div class="admin-header-bar">
            <h2>🛡️ User Management Dashboard</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Logged in as: <strong style="color: var(--accent-warn);">${t.username}</strong></div>
          </div>

          <!-- User Management Tab -->
          <div id="tabUsersContent">
            <!-- Create New User Form -->
            <div style="background: var(--surface-variant); border: 1px solid var(--surface-border); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
              <h3 style="margin-bottom: 12px; color: var(--accent-primary);">➕ Create New Account</h3>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input type="text" id="newAdminUsername" placeholder="Username" class="form-input" style="flex: 1; min-width: 140px;">
                <input type="password" id="newAdminPassword" placeholder="Password" class="form-input" style="flex: 1; min-width: 140px;">
                <select id="newAdminRole" class="form-input" style="width: 120px;">
                  <option value="PLAYER">PLAYER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <button class="btn btn-primary" id="btnAdminCreateUser" style="padding: 10px 16px;">
                  Create User
                </button>
              </div>
            </div>

            <h3 style="margin-bottom: 12px; color: var(--accent-warn);">Registered User Database (${i.length})</h3>
            <div class="table-container">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody id="userTableBody">
                  ${i.map(n=>`
                    <tr>
                      <td><strong>${n.username}</strong></td>
                      <td><code style="background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px; color: var(--accent-warn);">${n.password}</code></td>
                      <td><span class="badge ${n.role==="ADMIN"?"badge-admin":"badge-active"}">${n.role}</span></td>
                      <td><span class="badge ${n.banned?"badge-banned":"badge-active"}">${n.banned?"BANNED":"ACTIVE"}</span></td>
                      <td>
                        ${n.username!=="GE"&&n.role!=="ADMIN"?`
                          <button class="btn btn-accent btn-sm btn-reset" data-id="${n.id}" style="padding: 4px 8px; font-size: 0.75rem;">Password</button>
                          <button class="btn btn-danger btn-sm btn-ban" data-id="${n.id}" style="padding: 4px 8px; font-size: 0.75rem;">${n.banned?"Unban":"Ban"}</button>
                          <button class="btn btn-danger btn-sm btn-delete" data-id="${n.id}" style="padding: 4px 8px; font-size: 0.75rem;">Delete</button>
                        `:'<span style="color: var(--text-muted); font-size: 0.75rem;">Protected</span>'}
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Secret Player Luck Control Tab -->
          <div id="tabLuckContent" style="display: none;">
            <div class="luck-control-card">
              <div class="luck-title">✨ Player Luck Factor Controls</div>
              <div class="luck-desc">
                Enables subtle dice & tile probabilities for specified usernames (Default: GE).
                Gives GE higher odds to land on high-value empty properties, avoid opponent high rents, and makes players land on GE's properties.
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
                <div class="setting-row">
                  <div>
                    <div class="setting-label">GE Luck Advantage</div>
                    <div class="setting-desc">Subtle advantage algorithm for player 'GE'</div>
                  </div>
                  <label class="switch">
                    <input type="checkbox" id="luckToggleGE" ${C.isPlayerLuckEnabled("GE")?"checked":""}>
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Server Status Tab -->
          <div id="tabServerContent" style="display: none;">
            <h3 style="color: var(--accent-emerald);">⚡ Server & Database Status</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
              <div class="glass-panel" style="padding: 16px;">
                <h4>Status</h4>
                <p style="color: var(--accent-emerald); font-weight: 800; margin-top: 4px;">🟢 ONLINE (Production Ready)</p>
              </div>
              <div class="glass-panel" style="padding: 16px;">
                <h4>Hosting Cost</h4>
                <p style="color: var(--accent-gold); font-weight: 800; margin-top: 4px;">$0.00 / month (Vercel Free Tier)</p>
              </div>
              <div class="glass-panel" style="padding: 16px; grid-column: span 2;">
                <h4>Game Session Controls</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin: 6px 0 12px 0;">Dismiss current game in progress and return to the Pre-Game Setup Lobby.</p>
                <button class="btn btn-danger" id="adminBtnResetGame" style="padding: 10px 16px;">
                  🔄 Dismiss Game & Start New Session
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `,this.bindEvents()}bindEvents(){const e=this.container.querySelectorAll(".admin-nav-item");e.forEach(s=>{s.onclick=()=>{e.forEach(a=>a.classList.remove("active")),s.classList.add("active");const o=s.dataset.tab;document.getElementById("tabUsersContent").style.display=o==="users"?"block":"none",document.getElementById("tabLuckContent").style.display=o==="luck"?"block":"none",document.getElementById("tabServerContent").style.display=o==="server"?"block":"none"}});const t=document.getElementById("btnAdminCreateUser");t&&(t.onclick=()=>{const s=document.getElementById("newAdminUsername").value.trim(),o=document.getElementById("newAdminPassword").value.trim(),a=document.getElementById("newAdminRole").value;if(!s||!o){alert("Please enter both username and password!");return}const r=C.createUser(s,o,a);r.success?(alert(`✅ Account '${s}' created successfully! Password: ${o}`),this.renderAdminPanel(this.onResetGame)):alert(`❌ Failed: ${r.error}`)}),this.container.querySelectorAll(".btn-ban").forEach(s=>{s.onclick=()=>{const o=s.dataset.id;C.toggleBanUser(o),this.renderAdminPanel(this.onResetGame)}}),this.container.querySelectorAll(".btn-reset").forEach(s=>{s.onclick=()=>{const o=s.dataset.id,a=prompt("Enter new password for user:");a&&(C.resetPassword(o,a),alert("Password successfully updated!"),this.renderAdminPanel(this.onResetGame))}}),this.container.querySelectorAll(".btn-delete").forEach(s=>{s.onclick=()=>{const o=s.dataset.id;if(confirm("Are you sure you want to delete this user account?")){const a=C.deleteUser(o);a.success?(alert("User account deleted."),this.renderAdminPanel(this.onResetGame)):alert(`❌ ${a.error}`)}}});const i=document.getElementById("luckToggleGE");i&&(i.onchange=s=>{C.togglePlayerLuck("GE",s.target.checked)});const n=document.getElementById("adminBtnResetGame");n&&(n.onclick=()=>{confirm("Are you sure you want to dismiss the current game and start a new session?")&&this.onResetGame&&this.onResetGame()})}}class j{constructor(){this.engine=new U,this.boardUI=new D(document.getElementById("boardContainer")),this.controlsUI=new N(document.getElementById("controlsContainer")),this.modalUI=new Y,this.adminUI=new H(document.getElementById("adminPanelContainer")),this.currentScreen="LOGIN",this.init()}init(){this.boardUI.renderBoard(),this.controlsUI.renderControls(),this.bindEvents();const e=p.getCurrentUser();e?(this.setupLobby(e),this.showScreen("LOBBY")):this.showScreen("LOGIN")}setupLobby(e){const t=document.getElementById("lobbyLoggedUser");t&&(t.innerText=e.username);let i=this.engine.players.find(n=>n.name===e.username);i||(i=this.engine.addPlayer(e.username,!1,e.username==="GE"?"#38bdf8":"#f59e0b")),this.engine.players.length===1&&e.username==="GE"&&(this.engine.addPlayer("CyberBot 1",!0,"#10b981"),this.engine.addPlayer("CyberBot 2",!0,"#ef4444")),this.updateLobbyUI(e)}showScreen(e){this.currentScreen=e;const t={LOGIN:document.getElementById("loginScreen"),LOBBY:document.getElementById("lobbyScreen"),GAME:document.getElementById("gameScreen")};Object.keys(t).forEach(i=>{t[i]&&(i===e?t[i].classList.add("active"):t[i].classList.remove("active"))}),this.updateUI()}updateLobbyUI(e){const t=e&&e.username==="GE",i=document.getElementById("geMasterControls"),n=document.getElementById("guestWaitingNotice");i&&(i.style.display=t?"block":"none"),n&&(n.style.display=t?"none":"block");const s=document.getElementById("lobbyPlayerList");s&&(s.innerHTML="",this.engine.players.forEach(o=>{const a=document.createElement("div");a.className="roster-item",a.innerHTML=`
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${o.color}; border: 1px solid #fff;"></div>
            <span>${o.name} ${o.isAI?"🤖 (Bot)":""} ${o.name==="GE"?"👑 (Master)":""}</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--text-muted);">$${o.money}</span>
        `,s.appendChild(a)}))}bindEvents(){const e=document.getElementById("btnQuickLoginGE");e&&(e.onclick=()=>{const u=prompt("Enter Master GE Password:");if(!u)return;const l=p.login("GE",u);l.success?(this.setupLobby(l.user),this.showScreen("LOBBY")):alert("❌ Incorrect password for Master GE!")});const t=document.getElementById("btnCustomLoginSubmit");t&&(t.onclick=()=>{const u=document.getElementById("loginUsername").value.trim(),l=document.getElementById("loginPassword").value.trim();if(!u){alert("Please enter a username!");return}let d=p.login(u,l);d.success||u.toLowerCase()!=="ge"&&p.register(u,l||"password").success&&(d=p.login(u,l||"password")),d.success?(this.setupLobby(d.user),this.showScreen("LOBBY")):alert(`❌ Login failed: ${d.error}`)});const i=document.getElementById("btnLobbyAddBot");i&&(i.onclick=()=>{const u=p.getCurrentUser();if(!u||u.username!=="GE"){alert('🔒 Only Room Master "GE" can add AI bots.');return}const l=`CyberBot ${this.engine.players.length}`,d=["#10b981","#ef4444","#a855f7","#f59e0b"],m=d[this.engine.players.length%d.length];this.engine.addPlayer(l,!0,m),this.updateLobbyUI(u)});const n=document.getElementById("btnStartGameLaunch");n&&(n.onclick=()=>{var y,g,E,L;const u=p.getCurrentUser();if(!u||u.username!=="GE"){alert('🔒 Only Room Master "GE" can start the game session!');return}const l=parseInt((y=document.getElementById("lobbyStartingCash"))==null?void 0:y.value)||1500,d=((g=document.getElementById("lobbyJackpot"))==null?void 0:g.checked)??!0,m=((E=document.getElementById("lobbyRentInJail"))==null?void 0:E.checked)??!1,I=((L=document.getElementById("lobbyAuctions"))==null?void 0:L.checked)??!0;this.engine.rules.startingCash=l,this.engine.rules.freeParkingJackpotEnabled=d,this.engine.rules.rentInJail=m,this.engine.rules.auctionsEnabled=I,this.engine.players.forEach(x=>{x.money=l}),this.engine.startGame(),this.showScreen("GAME")});const s=document.getElementById("btnAuthUser");s&&(s.onclick=()=>{this.showScreen("LOGIN")});const o=document.getElementById("btnResetGame");o&&(o.onclick=()=>{confirm("Dismiss current game session and start a new game setup?")&&this.resetSession()}),document.addEventListener("click",u=>{if(u.target&&(u.target.id==="btnRollDice"||u.target.closest("#btnRollDice"))){if(this.engine.status!=="PLAYING"){alert('⚠️ Game has not started yet! Master "GE" must click "🚀 START GAME" in the lobby first.');return}const l=this.engine.getCurrentPlayer();if(!l||l.bankrupt)return;if(l.inJail&&!this.engine.hasRolled)this.modalUI.showJailOptionsModal(l,()=>{const d=this.engine.rollDice();d&&this.boardUI.animateDiceRoll(d.die1,d.die2,()=>{this.updateUI(),this.checkTileInteraction()})},()=>{const d=this.engine.payJailFine(l);d?this.boardUI.animateDiceRoll(d.die1,d.die2,()=>{this.updateUI(),this.checkTileInteraction()}):this.updateUI()},()=>{const d=this.engine.useJailCard(l);d?this.boardUI.animateDiceRoll(d.die1,d.die2,()=>{this.updateUI(),this.checkTileInteraction()}):this.updateUI()});else{const d=this.engine.rollDice();d&&this.boardUI.animateDiceRoll(d.die1,d.die2,()=>{this.updateUI(),this.checkTileInteraction()})}}}),document.addEventListener("click",u=>{if(u.target&&(u.target.id==="btnEndTurn"||u.target.closest("#btnEndTurn"))){if(this.engine.status!=="PLAYING")return;this.engine.nextTurn(),this.updateUI()}}),document.addEventListener("click",u=>{if(u.target&&(u.target.id==="btnOpenTrade"||u.target.closest("#btnOpenTrade"))){if(this.engine.status!=="PLAYING")return;const l=this.engine.getCurrentPlayer();if(!l)return;this.modalUI.showTradeModal(this.engine.players,l,this.engine.boardState,d=>{this.engine.tradeManager.proposeTrade(l.id,d.targetPlayerId,d.offerProps,d.offerCash,d.requestProps,d.requestCash)?(this.engine.addLog(`🤝 ${l.name} offered a trade!`),this.updateUI()):alert("Trade offer invalid.")})}});const a=document.getElementById("btnAdminPanel"),r=document.getElementById("adminModalBackdrop"),h=document.getElementById("closeAdminModal");a&&r&&(a.onclick=()=>{this.adminUI.renderAdminPanel(()=>this.resetSession()),r.classList.add("active")}),h&&r&&(h.onclick=()=>{r.classList.remove("active")});const b=document.getElementById("btnToggleTheme");b&&(b.onclick=()=>{const l=document.documentElement.getAttribute("data-theme")==="light"?"dark":"light";document.documentElement.setAttribute("data-theme",l),b.innerText=l==="light"?"☀️":"🌙"}),document.addEventListener("click",u=>{const l=u.target.closest(".tile");if(l&&l.dataset.tileId!==void 0){const d=parseInt(l.dataset.tileId),m=f[d];if(!m||m.price<=0)return;const I=this.engine.boardState[d],y=this.engine.players.find(L=>L.id===I.ownerId),g=activePlayer?this.engine.canBuildHouse(activePlayer,d):!1,E=this.engine.getEffectiveBuildingLevel(d);this.modalUI.showPropertyDeed(d,y?y.name:null,!y&&activePlayer&&!activePlayer.isAI&&this.engine.status==="PLAYING"?()=>{this.engine.buyProperty(activePlayer,d),this.updateUI()}:null,y&&activePlayer&&y.id===activePlayer.id&&this.engine.status==="PLAYING"?()=>{this.engine.buildHouse(activePlayer,d),this.updateUI()}:null,y&&activePlayer&&y.id===activePlayer.id&&this.engine.status==="PLAYING"?()=>{this.engine.sellHouse(activePlayer,d),this.updateUI()}:null,g,E)}}),this.engine.onStateChange=()=>{this.updateUI()}}resetSession(){this.engine.reset();const e=p.getCurrentUser();e&&this.setupLobby(e);const t=document.getElementById("adminModalBackdrop");t&&t.classList.remove("active"),this.showScreen("LOBBY"),alert("🔄 Game session dismissed. Master GE can now configure rules for a new game!")}checkTileInteraction(){if(this.engine.status!=="PLAYING")return;const e=this.engine.getCurrentPlayer();if(!e||e.isAI)return;const t=e.position,i=f[t],n=this.engine.boardState[t];i&&i.price>0&&!n.ownerId&&this.modalUI.showPropertyDeed(t,null,()=>{this.engine.buyProperty(e,t),this.updateUI()},null)}updateUI(){this.boardUI.updateBoardState(this.engine),this.controlsUI.update(this.engine);const e=p.getCurrentUser();this.updateLobbyUI(e);const t=document.getElementById("btnResetGame");t&&(e&&(e.username==="GE"||e.role==="ADMIN")?t.style.display="inline-flex":t.style.display="none");const i=document.getElementById("btnAuthUser");i&&(i.innerText=e?`👤 ${e.username}`:"👤 Login");const n=this.engine.getCurrentPlayer(),s=document.getElementById("btnRollDice"),o=document.getElementById("btnEndTurn");if(this.engine.status!=="PLAYING"){s&&(s.disabled=!0,s.style.opacity="0.5",s.style.cursor="not-allowed",s.innerText="⏳ Waiting for Game Start"),o&&(o.disabled=!0,o.style.opacity="0.5",o.style.cursor="not-allowed");return}n&&n.isAI?(s&&(s.disabled=!0,s.style.opacity="0.5",s.style.cursor="not-allowed",s.innerText="🤖 AI Playing..."),o&&(o.disabled=!0,o.style.opacity="0.5",o.style.cursor="not-allowed")):(o&&(o.disabled=!1,o.style.opacity="1",o.style.cursor="pointer"),s&&(this.engine.hasRolled?(s.disabled=!0,s.style.opacity="0.5",s.style.cursor="not-allowed",s.innerText="🎲 Rolled (End Turn)"):(s.disabled=!1,s.style.opacity="1",s.style.cursor="pointer",s.innerText="🎲 Roll Dice")))}}document.addEventListener("DOMContentLoaded",()=>{new j});
