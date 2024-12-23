function max(a, b) { return a < b ? a : b}

function setStyle(div, styles) {
  for (var key in styles) {
    div.style.setProperty(key, styles[key]);
  }
}

function setRaise(div) {
  div.style.transition = "transform .1s ease-out";
  div.onmouseover = function() {
    div.style.transform = "translate(0, -5px)";
  }
  div.onmouseout = function() {
    div.style.transform = "";
  }
}

function createKey() {
  var key = document.createElement("div");
  setStyle(key, {
    width: 75,
    height: 75,
    border: "solid 3px black",
  });
  return key;
}

// Buttons.
function colorOnClick(color) {
  console.log("Clicked", color);
  for (var p of players) {
    for (var c of p.cards) {
      if (!c.selected) continue;
      c.color = color;
      c.selected = false;
      displayCard(c);

      data.hints -= 1;
      displayMistakesAndHints();
    }
  }
}

function numberOnClick(number) {
  console.log("Clicked", number);
  for (var p of players) {
    for (let c of p.cards) {
      if (!c.selected) continue;
      c.number = number;
      c.selected = false;
      displayCard(c);

      data.hints -= 1;
      displayMistakesAndHints();
    }
  }
}

var screen = document.createElement("div");
screen.style.display = "flex";

var hints = document.createElement("div");

var buttons = document.createElement("div");
setStyle(buttons, {display: "flex"});
hints.appendChild(buttons);

var play = document.createElement("div");
play.innerHTML = `<h1 style="text-align: center"> Play </h1>`;
setStyle(play, {
  display: "inline-block",
  border: "solid 3px black",
  width: 150,
  height: 75,
  margin: 10,
  "border-radius": "5px",
  "box-shadow": "5px 5px 3px lightgray",
});
play.onclick = function() {
  for (var p of players) {
    for (let [i, c] of p.cards.entries()) {
      if (!c.selected) continue;
      let actual = p.actual_hand[i];
      if (completed[actual.color].number + 1 == actual.number) {
        completed[actual.color].number++;
        displayCard(completed[actual.color]);
      } else {
        data.mistakes -= 1;
        displayMistakesAndHints();
      }
      var new_card = deck.pop();
      actual.color = new_card.color;
      actual.number = new_card.number;
      displayCardNotCurrentPlayer(actual, p.id);

      c.number = null;
      c.color = null;
      c.selected = false;
      displayCard(c);

      return;
    }
  }
};
setRaise(play);
buttons.appendChild(play);


var discard = document.createElement("div");
discard.innerHTML = `<h1 style="text-align: center"> Discard </h1>`;
setStyle(discard, {
  display: "inline-block",
  border: "solid 3px black",
  width: 150,
  height: 75,
  margin: 10,
  "border-radius": "5px",
  "box-shadow": "5px 5px 3px lightgray",
});
discard.onclick = function() {
  for (var p of players) {
    for (let [i, c] of p.cards.entries()) {
      if (!c.selected) continue;

      let actual = p.actual_hand[i];
      var new_card = deck.pop();
      actual.color = new_card.color;
      actual.number = new_card.number;
      displayCardNotCurrentPlayer(actual, p.id);

      c.number = null;
      c.color = null;
      c.selected = false;
      displayCard(c);

      hints += 1;
      hints = max(hints, 10);
      displayMistakesAndHints();
      return;
    }
  }
};
setRaise(discard);
buttons.appendChild(discard);

var endDiv = document.createElement("div");
endDiv.innerHTML = `<h1 style="text-align: center"> End Turn </h1>`;
setStyle(endDiv, {
  display: "inline-block",
  border: "solid 3px black",
  width: 150,
  height: 75,
  margin: 10,
  "border-radius": "5px",
  "box-shadow": "5px 5px 3px lightgray",
});
endDiv.onclick = function() {
  currentPlayer += 1;
  if (currentPlayer >= players.length) { currentPlayer = 0;}
  for (var p of players) {
    for (var c of p.actual_hand) {
      displayCardNotCurrentPlayer(c, p.id);
    }
  }
  privacyPlayer.innerText = `Start ${players[currentPlayer].name}'s Turn`;
  privacyDiv.style.display = "";
};
setRaise(endDiv);
buttons.appendChild(endDiv);

var privacyDiv = document.createElement("div");
setStyle(privacyDiv, {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  "background-color": "lightgray",
  "text-align": "center",
});
var privacyPlayer = document.createElement("h1");
privacyPlayer.innerText = `Start Player 1 Turn`;
var privacyButton = document.createElement("button");
privacyButton.appendChild(privacyPlayer);
privacyButton.onclick = function() {
  privacyDiv.style.display = "none";
}
privacyDiv.appendChild(privacyButton);

buttons.appendChild(privacyDiv);

var startDiv = document.createElement("div");
setStyle(startDiv, {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
  "background-color": "lightgray",
  "text-align": "center",
});
var playerNames = [];
{
  for (var i = 0; i < 4; i++) {
    var n = document.createElement("input");
    n.value = "Player Name";
    n.classList.add("player-name");
    startDiv.appendChild(n);
  }
  var privacyButton = document.createElement("button");
  privacyButton.innerHTML += "<h1> Start </h1>";
  privacyButton.onclick = function() {
    startDiv.style.display = "none";
    for (var c of document.getElementsByClassName("player-name")) {
      if (c.value != "Player Name") {
        playerNames.push(c.value);
      }
    }
    privacyPlayer.innerText = `Start ${playerNames[0]}'s turn`;
    createPlayersDiv();
    createActualDivs();
  }
  startDiv.appendChild(privacyButton);
}
buttons.appendChild(startDiv);



var tokensDiv = document.createElement("div");
tokensDiv.style.display = "inline-block";
buttons.appendChild(tokensDiv);

var COLORS = ["blue", "white", "green", "yellow", "red"];
var COLOR_HEX = {
  blue: "#7ecfed",
  white: "#fff4ff",
  green: "#71c544",
  yellow: "#f9d936",
  red: "#f5132d",
};
var CARD_WIDTH=60;
var CARD_HEIGHT=CARD_WIDTH * 1.25;
var BUTTONS_STYLE = {
  width: CARD_WIDTH,
  height: CARD_WIDTH,
  border: "solid 3px black",
  "border-radius": "5px",
  "box-shadow": "5px 5px 3px lightgray",
};

var dataDiv = document.createElement("div");
setStyle(dataDiv, { "display": "flex", });

var buttonsDiv = document.createElement("div");
// Color buttons.
var buttons = document.createElement("div");
buttons.style.display = "flex";
buttons.style.gap = "10px";
buttons.style.margin = "10px";
for (let color of COLORS) {
  let div = document.createElement("div");
  setStyle(div, BUTTONS_STYLE);
  div.style.backgroundColor = COLOR_HEX[color];
  div.onclick = function () {colorOnClick(color); };
  setRaise(div);
  buttons.appendChild(div);
}
buttonsDiv.appendChild(buttons);
console.log("added buttons")

// Numbers.
var numbers = document.createElement("div");
numbers.style.display = "flex";
numbers.style.gap = "10px";
numbers.style.margin = "10px";
for (let i = 1; i <= 5; i++) {
  var div = document.createElement("div");
  div.innerHTML = `<h1 style="text-align: center; margin-top: 10"> ${i} </h1>`;
  setStyle(div, BUTTONS_STYLE);
  div.onclick = () => numberOnClick(i);
  setRaise(div);
  numbers.appendChild(div);
}
buttonsDiv.appendChild(numbers);
dataDiv.appendChild(buttonsDiv);
hints.appendChild(dataDiv);


// Cards.

function displayCard(card) {
  if (card.selected) {
    card.div.style.filter = "saturate(200%) brightness(80%)";
  } else {
    card.div.style.filter = "";
  }
  card.div.style.backgroundColor = COLOR_HEX[card.color] ?? "lightgray";
  if (card.number) {
    card.div.innerHTML = `<h1 style="text-align: center"> ${card.number} </h1>`;
  } else {
    card.div.innerHTML = "";
  }
}

function displayCardNotCurrentPlayer(card, player) {
  if (player == currentPlayer) {
    card.div.innerHTML = "";
    card.div.style.backgroundColor = "black";
  } else {
    displayCard(card);
  }
}

var players = []
var currentPlayer = 0;
var playersDiv = document.createElement("div");
playersDiv.id = "playersDiv";
playersDiv.style.display = "flex";
playersDiv.style.width = "100%";
playersDiv.style.flexWrap = "wrap";
playersDiv.style.maxWidth = "960px";
function createPlayersDiv() {
  for (var i = 0; i < playerNames.length; i++) {
    var playerDiv = document.createElement("div");
    var handDiv = document.createElement("div");
    handDiv.style.display = "flex";
    handDiv.style.flexDirection = "column";

    var container = document.createElement("div");
    container.style.display = "flex";
    container.style.margin = "10px";
    container.style.gap = "10px";
    var player = { id: i, cards: [], name: playerNames[i]};

    for (var c = 0; c < 5; c++) {
      let div = document.createElement("div");
      let card = {selected: false, div: div};

      setStyle(div, {
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        border: "solid 3px black",
        "background-color": "lightgray",
        "border-radius": "5px",
        "box-shadow": "5px 5px 3px lightgray",
      });

      div.onclick = function() {
        card.selected = !card.selected;
        displayCard(card);
      };
      setRaise(div);
      container.appendChild(div);
      player.cards.push(card)
    }
    handDiv.appendChild(container);

    player.handDiv = handDiv
    players.push(player);
    var playerName = document.createElement("input");
    setStyle(playerName, {"font-size": "22px", "margin-left": "10px", border: "none", });
    playerName.value = player.name;
    playerDiv.appendChild(playerName);
    playerDiv.appendChild(handDiv);
    playersDiv.appendChild(playerDiv);
  }
}
hints.appendChild(playersDiv);
screen.appendChild(hints);


// Start of actual game.
var CARD_AMOUNT = [3, 2, 2, 2, 1];
var deck = [];
var data = {
  hints: 10,
  mistakes: 3,
};
for (var c of COLORS) {
  for (var i = 0; i < 5; i++) {
    for (var a = 0; a < CARD_AMOUNT[i]; a++) {
      deck.push({ color: c, number: i + 1});
    }
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
deck = shuffle(deck);
var game = document.createElement("div");

function createActualDivs() {
  for (var p of players) {
    p.actual_hand = [];
    for (var i = 0; i < 5; i++) {
      p.actual_hand.push(deck.pop());
    }
  }

  for (let player of players) {
    var container = document.createElement("div");
    container.style.display = "flex";
    container.style.margin = "10px";
    container.style.gap = "10px";

    for (var card of player.actual_hand) {
      let div = document.createElement("div");
      card.div = div;

      setStyle(div, {
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        border: "solid 3px black",
        "background-color": "lightgray",
        "border-radius": "5px",
        "box-shadow": "5px 5px 3px lightgray",
      });
      displayCardNotCurrentPlayer(card, player.id);

      container.appendChild(div);
    }

    player.handDiv.appendChild(container);
  }
}
screen.appendChild(game);

var completedDiv = document.createElement("div");
setStyle(completedDiv, {
  display: "flex",
  margin: "10px",
  gap: "10px",
});

var completed = {}
for (let i = 0; i < 5; i++) {
  var div = document.createElement("div");
  let card = {div: div, color: COLORS[i], number: 0};
  setStyle(div, {
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
    border: "solid 3px black",
    "background-color": "lightgray",
    "border-radius": "5px",
    "box-shadow": "5px 5px 3px lightgray",
  });
  completed[card.color] = card;
  displayCard(card);
  completedDiv.appendChild(div);
}
dataDiv.appendChild(completedDiv);

function displayMistakesAndHints() {
  tokensDiv.textContent = ""
  var mistakesDiv = document.createElement("div");
  setStyle(mistakesDiv, { display: "flex", gap: "10px", margin: 10});
  for (var i = 0; i < data.mistakes; i++) {
    var d = document.createElement("div");
    setStyle(d, { width: 30, height: 30, "border-radius": "30px", "background-color": COLOR_HEX["red"]});
    mistakesDiv.append(d);
  }
  var hintsDiv = document.createElement("div");
  setStyle(hintsDiv, { display: "flex", gap: "10px", margin: 10});
  for (var i = 0; i < data.hints; i++) {
    var d = document.createElement("div");
    setStyle(d, { width: 30, height: 30, "border-radius": "30px", "background-color": COLOR_HEX["blue"]});
    hintsDiv.append(d);
  }
  tokensDiv.appendChild(mistakesDiv);
  tokensDiv.appendChild(hintsDiv);
}
displayMistakesAndHints();

document.body.appendChild(screen);
