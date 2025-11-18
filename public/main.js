const min_bet = 10;
const max_bet = 30;
const start_bal = 100;
const spin_speed = 80; // how fast reels should spin

const symbols = ['ten1','ten2','ten3','ten4','ten5','ten6','ten7'];

// Elements 
const first = document.querySelector('#first');
const middle = document.querySelector('#middle');
const last = document.querySelector('#last');
const messageEl = document.querySelector('#message');
const balanceEl = document.querySelector('#balance');
const betEl = document.querySelector('#bet');
const placeToSee = document.querySelector('#placeToSee');
const spinBtn = document.querySelector('#spinBtn');
const stopBtn = document.querySelector('#stopBtn');

//used Google AI overview for and used the source below to come up with  the structure after getting my html and css working;
//source: https://webdesign.tutsplus.com/how-to-create-a-slot-machine-game-in-vanilla-javascript--cms-108974t
let balance = start_bal;
let currentBet = min_bet;
let isSpinning = false;
let spin1 = null, spin2 = null, spin3 = null;

//Init
randomizeSymbol(first);
randomizeSymbol(middle);
randomizeSymbol(last);
render();

stopBtn.addEventListener('click', clickToStop);//referenced from Javascript DOM crash course
function randomSymbolClass(){
    const i = Math.floor(Math.random() * symbols.length);//applied the Math.floor Method from stackoverflow to round to the nearest whole number
    return symbols[i];
}
function setSymbol(e, cls){
  // Use the new base class name 'pane'
    e.className = 'pane ' + cls;
}
function randomizeSymbol(e){ //regarding e parameter inspo from the JavaScript DOM crash course (part 3, part 4) on Traversy Media.
    setSymbol(e, randomSymbolClass());
}
function render(msg){
    balanceEl.textContent = balance;
    betEl.textContent = currentBet;//referenced from https://stackoverflow.com/questions/53357641/textcontent-returns-undefined
    placeToSee.textContent = balance;
    if (msg !== undefined) messageEl.textContent = msg;
}
    placeToSee.textContent = balance;
function disableSpin(disabled){
    spinBtn.disabled = disabled;
}
//betting
function betMin(){
    currentBet = min_bet;
    render(`Bet set to $${currentBet}.`);
}
function betMax(){
    currentBet = max_bet;
    render(`Bet set to $${currentBet}.`);
}

// Spin / Stop: this whole part referenced from mdn, the how to create a slot machine in vanilla JavaScript and Google AI overview
function clickToSpin(){
  if (isSpinning) return;
  if (balance < currentBet){
    render(`Not enough balance for a $${currentBet} bet. Choose Bet Min or Clean.`);
    return;
  }
  balance -= currentBet;
  render(`Spinning... Bet -$${currentBet}. Press Stop to lock in!`);
  isSpinning = true;
  disableSpin(true);

  spin1 = setInterval(() => randomizeSymbol(first), spin_speed); //figure out the source; maybe on stackoverflow: include innocent's
  spin2 = setInterval(() => randomizeSymbol(middle), spin_speed);
  spin3 = setInterval(() => randomizeSymbol(last), spin_speed);
}

function clickToStop(){
  if (!isSpinning){
    render('Press Spin first ');
    return;
  }
  clearInterval(spin1); 
  clearInterval(spin2); 
  clearInterval(spin3);
  spin1 = spin2 = spin3 = null;

  const a = first.className.replace('pane ','');
  const b = middle.className.replace('pane ','');
  const c = last.className.replace('pane ','');

  let win = 0;
  let msg = '';

  if (a === b && b === c){//
    win = currentBet * 5;
    msg = `JACKPOT! (+$${win})`;
  } else if (a === b || a === c || b === c){
    win = currentBet * 2;
    msg = `Nice! 2 of a kind (+$${win})`;
  } else {
    msg = `No match. Try again!`;
  }

  balance += win;
  isSpinning = false;
  disableSpin(false);
  render(`${msg} • New balance: $${balance}`);
}

//Reset when clicked: referenced from stackoverflow, mdn
function clearScore(){
  balance = start_bal;
  currentBet = min_bet;
  isSpinning = false;
  if (spin1) clearInterval(spin1);
  if (spin2) clearInterval(spin2);
  if (spin3) clearInterval(spin3);
  spin1 = spin2 = spin3 = null; //referenced from google AI overview

  randomizeSymbol(first);
  randomizeSymbol(middle);
  randomizeSymbol(last);

  disableSpin(false);
  render('Game reset. Good luck!');
}

// Expose to inline onclick: from mdn
window.clickToSpin = clickToSpin;
window.clearScore = clearScore;

//AI Betting Recommendation
// AI Betting Recommendation
const aiBetBtn = document.querySelector("#aiBetBtn");
const aiBetOutput = document.querySelector("#aiBetOutput");

aiBetBtn.addEventListener("click", async () => {
  aiBetOutput.textContent = "Thinking...";

  const response = await fetch("http://localhost:5000/ai/bet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      balance: balance,
      bet: currentBet,
      lastMessage: messageEl.textContent
    })
  });

  const data = await response.json();

  if (data.error) {
    aiBetOutput.textContent = "Error: " + data.error;
  } else {
    aiBetOutput.textContent = data.advice;
  }
});


