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
    }
  }
}

var discard = document.createElement("div");
discard.innerHTML = `<h1 style="text-align: center"> Discard </h1>`;
setStyle(discard, {
  border: "solid 3px black",
  width: 150,
  height: 75,
  margin: 10,
  "border-radius": "5px",
  "box-shadow": "5px 5px 3px lightgray",
});
discard.onclick = function() {
  for (var p of players) {
    for (let c of p.cards) {
      if (!c.selected) continue;
      c.number = null;
      c.color = null;
      c.selected = false;
      displayCard(c);
    }
  }
};
setRaise(discard);
document.body.appendChild(discard);

var COLORS = ["blue", "white", "green", "yellow", "red"];
var COLOR_HEX = {
  blue: "#7ecfed",
  white: "#fff4ff",
  green: "#71c544",
  yellow: "#f9d936",
  red: "#f5132d",
};
var BUTTONS_STYLE = {
  width: 75,
  height: 75,
  border: "solid 3px black",
  "border-radius": "5px",
  "box-shadow": "5px 5px 3px lightgray",
};

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
document.body.appendChild(buttons);
console.log("added buttons")

// Numbers.
var numbers = document.createElement("div");
numbers.style.display = "flex";
numbers.style.gap = "10px";
numbers.style.margin = "10px";
for (let i = 1; i <= 5; i++) {
  var div = document.createElement("div");
  div.innerHTML = `<h1 style="text-align: center"> ${i} </h1>`;
  setStyle(div, BUTTONS_STYLE);
  div.onclick = () => numberOnClick(i);
  setRaise(div);
  numbers.appendChild(div);
}
document.body.appendChild(numbers);


// Cards.
var CARD_WIDTH=75;
var CARD_HEIGHT=CARD_WIDTH * 1.25;

function displayCard(card) {
  if (card.selected) {
    card.div.style.backgroundColor = "gray";
  } else {
    card.div.style.backgroundColor = COLOR_HEX[card.color] ?? "lightgray";
  }
  if (card.number) {
    card.div.innerHTML = `<h1 style="text-align: center"> ${card.number} </h1>`;
  } else {
    card.div.innerHTML = "";
  }
}

var players = []
for (var i = 0; i < 4; i++) {
  var container = document.createElement("div");
  container.style.display = "flex";
  container.style.margin = "10px";
  container.style.gap = "10px";
  var player = { id: i, cards: []};

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
      console.log("hi", div);
      card.selected = !card.selected;
      displayCard(card);
    };
    setRaise(div);
    container.appendChild(div);
    player.cards.push(card)
  }
  players.push(player);
  var player = document.createElement("input");
  setStyle(player, {"font-size": "22px", "margin-left": "10px", border: "none", });
  player.value = `Player ${i}`;
  document.body.appendChild(player);
  document.body.appendChild(container);
}

