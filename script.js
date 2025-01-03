"use strict";

var buttonsVnode = document.createElement("div");
document.body.appendChild(buttonsVnode);
buttonsVnode = toVNode(buttonsVnode);

function max(a, b) { return a < b ? a : b}

function mouseOverRaise(e) {
  e.currentTarget.style.transform = "translate(0, -5px)";
}

function mouseOutRaise(e) {
  e.currentTarget.style.transform = "";
}

// Buttons.
function startOnClick() {
  data.displayStart = false;
  for (var i = 0; i < data.playerNames.length; i++) {
    if (data.playerNames[i] == "Player Name") { continue;}
    let player = { id: i, cards: [], actual_hand: [], name: data.playerNames[i] };
    for (var c = 0; c < 5; c++) {
      player.cards.push({selected: false});
      player.actual_hand.push(data.deck.pop());
    }
    data.players.push(player);
  }
  updateData();
}

function addPlayer() {
  var name = document.getElementsByClassName("player-name")[0].value;
  data.playerNames.push(name);
  if (local.playerNames.length == 0) {
    local.currentPlayer = data.playerNames.length - 1;
  }
  local.playerNames.push(name);
  updateData();
}

function colorOnClick(color) {
  console.log("Clicked", color);
  if (data.madeMove) return;
  for (var p of data.players) {
    for (var c of p.cards) {
      if (!c.selected) continue;
      c.color = color;
      c.selected = false;
      data.madeMove = true;
    }
  }
  if (!data.madeMove) {
    return;
  }
  data.hints -= 1;
  updateData();
}

function numberOnClick(number) {
  console.log("Clicked", number);
  if (data.madeMove) return;
  for (var p of data.players) {
    for (let c of p.cards) {
      if (!c.selected) continue;
      c.number = number;
      c.selected = false;
      data.madeMove = true;
    }
  }
  if (!data.madeMove) {
    return;
  }
  data.hints -= 1;
  updateData();
}

function playButtonOnclick() {
  if (data.madeMove) return;
  for (var p of data.players) {
    for (let [i, c] of p.cards.entries()) {
      if (!c.selected) continue;
      let actual = p.actual_hand[i];
      if (data.completed[actual.color] + 1 == actual.number) {
        data.completed[actual.color]++;
      } else {
        data.mistakes -= 1;
      }
      var new_card = data.deck.pop();
      actual.color = new_card.color;
      actual.number = new_card.number;

      c.number = null;
      c.color = null;
      c.selected = false;
      data.madeMove = true;
      updateData();

      return;
    }
  }
}

function discardButtonOnclick() {
  if (data.madeMove) return;
  for (var p of data.players) {
    for (let [i, c] of p.cards.entries()) {
      if (!c.selected) continue;

      let actual = p.actual_hand[i];
      var new_card = data.deck.pop();
      actual.color = new_card.color;
      actual.number = new_card.number;

      c.number = null;
      c.color = null;
      c.selected = false;

      data.hints += 1;
      data.hints = max(data.hints, 10);
      data.madeMove = true;
      updateData();
      return;
    }
  }
};

function endButtonOnclick() {
  console.log("End on click");
  if (!data.madeMove) return;
  data.currentPlayer += 1;
  if (data.currentPlayer >= data.players.length) { data.currentPlayer = 0;}

  let lcp = localCurrentPlayer();
  if (lcp != local.currentPlayer) {
    local.currentPlayer = lcp;
    local.displayPrivacy = true;
  }

  data.madeMove = false;
  updateData();
};

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
function BUTTONS_STYLE(background_color) { return {
  "background-color": background_color,
  width: CARD_WIDTH,
  height: CARD_WIDTH,
  border: "solid 3px black",
  "border-radius": "5px",
  "box-shadow": "5px 5px 3px lightgray",
  transition: "transform .1s ease-out",
}
};

// Start of actual game.
var CARD_AMOUNT = [3, 2, 2, 2, 1];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createData() {
  var data = {
    hints: 10,
    mistakes: 3,
    deck: [],
    players: [],
    playerNames: [],
    currentPlayer: 0,
    madeMove: false,
    displayPrivacy: true,
    displayStart: true,
    completed: {},
  };
  for (var c of COLORS) {
    for (var i = 0; i < 5; i++) {
      for (var a = 0; a < CARD_AMOUNT[i]; a++) {
        data.deck.push({ color: c, number: i + 1});
      }
    }
  }
  for (let i = 0; i < 5; i++) {
    let card = {color: COLORS[i], number: 0};
    data.completed[card.color] = 0;
  }
  data.deck = shuffle(data.deck);
  return data;
}

var data = createData();

var local = {
  playerNames: [],
  currentPlayer: 0,
  displayPrivacy: false,
};

function localCurrentPlayer() {
  let currentPlayer = data.currentPlayer;
  if (!local.playerNames.includes(data.playerNames[currentPlayer])) {
    currentPlayer = data.playerNames.indexOf(data.playerNames[local.currentPlayer]);
  }
  return currentPlayer;
}

function updateDOM() {
  var turn = h("h1", `${data.playerNames[data.currentPlayer]}'s Turn`);
  buttonsVnode = patch(buttonsVnode, h("div.app", [
      turn,
      makeButtonDiv(),
      createButtonsDiv(),
      createCompletedDiv(),
      createPlayersDiv()
    ]));
}

function makeButtonDiv() {
  var play = h("div.play", {
    on: {
      click: playButtonOnclick,
      mouseover: mouseOverRaise,
      mouseout: mouseOutRaise,
    },
    style: {
      display: "inline-block",
      border: "solid 3px black",
      width: 150,
      height: 75,
      margin: 10,
      "border-radius": "5px",
      "box-shadow": "5px 5px 3px lightgray",
      transition: "transform .1s ease-out",
    },
  }, [h("h1", { style: { "text-align": "center"},}, "Play")]);

  var discard = h("div", {
    on: {
      click: discardButtonOnclick,
      mouseover: mouseOverRaise,
      mouseout: mouseOutRaise,
    },
    style: {
      display: "inline-block",
      border: "solid 3px black",
      width: 150,
      height: 75,
      margin: 10,
      "border-radius": "5px",
      "box-shadow": "5px 5px 3px lightgray",
      transition: "transform .1s ease-out",
    },
  }, [h("h1", { style: { "text-align": "center"},}, "Discard")]);

  var end = h("div.end", {
    on: {
      click: endButtonOnclick,
      mouseover: mouseOverRaise,
      mouseout: mouseOutRaise,
    },
    style: {
      display: "inline-block",
      border: "solid 3px black",
      width: 150,
      height: 75,
      margin: 10,
      "border-radius": "5px",
      "box-shadow": "5px 5px 3px lightgray",
      transition: "transform .1s ease-out",
    },
  }, [h("h1", { style: { "text-align": "center"},}, "End Turn")]);

  var currentPlayer = data.playerNames[data.currentPlayer];
  var privacy = h("div.privacy", {
    style: {
      display: local.displayPrivacy ? "" : "none",
      position: "absolute",
      width: "100%",
      height: "100%",
      top: "0px",
      left: "0px",
      "background-color": "lightgray",
      "text-align": "center",
    },
  }, [
    h("button", {
    on: {
      click: function() {
        local.displayPrivacy = false;
        updateDOM();
      }
    },
    }, [h("h1", `Start ${currentPlayer ?? "Test"}'s Turn`)])
  ]);

  return h("div#buttons", { style: { display: "flex"}}, 
    [play, discard, end, privacy, makeStart(), makeMistakesAndHints()]);
}

function makeStart() {
  var startChildren = []

  startChildren.push(h("button", { 
    on: {click: startOnClick},
  }, [h("h1", "Start")]));

  var playersText = "Players: ";
  if (data.playerNames.length > 0) {
    for (var i = 0; i < data.playerNames.length - 1; i++) {
      playersText += `${data.playerNames[i]}, `;
    }
    playersText += data.playerNames[data.playerNames.length -1];
  }
  startChildren.push(h("h2", playersText));

  startChildren.push(h("input.player-name",
      { attrs: { value: data.playerNames[i]}}));
  startChildren.push(h("button", { 
    on: {click: addPlayer},
  }, [h("h2", "Add Player")]));

  var start = h("div.start", {
    key: 1,
    style: {
      display: data.displayStart ? "" : "none",
      position: "absolute",
      width: "100%",
      height: "100%",
      top: 0,
      left: 0,
      "background-color": data.displayStart ? "lightgray" : "blue",
      "text-align": "center",
    },
  }, startChildren);
  return start;
}

function makeMistakesAndHints() {
  var mistakesChildren = []
  for (var i = 0; i < data.mistakes; i++) {
    mistakesChildren.push(h("div", {
      style: {
        width: 30,
        height: 30,
        "border-radius": "30px",
        "background-color": COLOR_HEX["red"],
      }
    }));
  }
  var mistakes = h("div", {
    style: {
      display: "flex",
    },
  }, mistakesChildren);

  var hintsChildren = []
  for (var i = 0; i < data.hints; i++) {
    hintsChildren.push(h("div", {
      style: {
        width: 30,
        height: 30,
        "border-radius": "30px",
        "background-color": COLOR_HEX["blue"],
      }
    }));
  }
  var hints = h("div", {
    style: {
        display: "flex",
    },
  }, hintsChildren);
  var mistakesAndHints = h("div#tokens", {
    style: {
      gap: "10px",
      margin: 10,
    },
  }, [mistakes, hints]);
  return mistakesAndHints;
}

function createButtonsDiv() {
  var buttonsChildren = []
  for (let color of COLORS) {
    buttonsChildren.push(h("div", { 
      on: { 
        click: function() {colorOnClick(color)},
        mouseover: mouseOverRaise,
        mouseout: mouseOutRaise,
      },
      style: BUTTONS_STYLE(COLOR_HEX[color]),
    }));
  }
  var buttons = h("div",
    { style: {
      display: "flex",
      gap: "10px",
      margin: "10px",
    }}, buttonsChildren);

  var numbersChildren = []
  for (let i = 1; i <=5; i++) {
    numbersChildren.push(h("div",
      { 
        on: {
          click: function() {numberOnClick(i)},
          mouseover: mouseOverRaise,
          mouseout: mouseOutRaise,
        },
        style: BUTTONS_STYLE(""),
      }, [h("h1", `${i}`)]));
  }
  var numbers = h("div",
    { style: {
      display: "flex",
      gap: "10px",
      margin: "10px",
    }}, numbersChildren);
  return h("div", {style: { display: "inline-block",}}, [numbers, buttons]);
}

function createCompletedDiv() {
  var cards = [];
  for (var [color, num] of Object.entries(data.completed)) {
    cards.push(h("div", {
      style: {
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
        border: "solid 3px black",
        "background-color": num == 0 ? "lightgray": COLOR_HEX[color],
        "border-radius": "5px",
        "box-shadow": "5px 5px 3px lightgray",
      },
    }, [h("h1", `${num == 0 ? "" : num}`)]));
  }
  return h("div", { style: {
      display: "inline-flex",
      margin: "10px",
      gap: "10px",
    }}, cards);
}

function createPlayersDiv() {
  let currentPlayer = localCurrentPlayer();

  var playerChildren = [];
  for (var i = 0; i < data.players.length; i++) {
    var cards = [];
    for (var c = 0; c < 5; c++) {
      let card = data.players[i].cards[c];
      let cardText = [];
      if (card.number) {
        cardText.push(h("h1",
          { style: { "text-align": "center"}}, `${card.number}`));
      }
      cards.push(h("div", {
        on: {
          click: function() {
            console.log("Pushed!");
            card.selected = !card.selected;
            console.log(card);
            updateData();
          },
          mouseover: mouseOverRaise,
          mouseout: mouseOutRaise,
        },
        style: {
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          border: "solid 3px black",
          "background-color": COLOR_HEX[card.color] ?? "lightgray",
          "border-radius": "5px",
          "box-shadow": "5px 5px 3px lightgray",
          transition: "transform .1s ease-out",
          filter: card.selected ? "saturate(200%) brightness(80%)" : "",
        },
      }, cardText));
    }
    var hand = h("div", {
      style: {
        display : "flex",
        margin : "10px",
        gap : "10px",
      }}, cards);

    var actual_cards = [];
    for (var c = 0; c < 5; c++) {
      var card = data.players[i].actual_hand[c];
      var background = COLOR_HEX[card.color] ?? "lightgray";
      var innerCard = h("h1", { style: { "text-align": "center"}}, card.number);
      if (i == currentPlayer) {
        background = "black";
        innerCard = h("!");
      } 
      actual_cards.push(h("div", {
        style: {
          width: `${CARD_WIDTH}px`,
          height: `${CARD_HEIGHT}px`,
          border: "solid 3px black",
          "background-color": background,
          "border-radius": "5px",
          "box-shadow": "5px 5px 3px lightgray",
          filter: card.selected ? "saturate(200%) brightness(80%)" : "",
        },
      }, [innerCard]));
    }
    var actual_hand = h("div", {
      style: {
        display : "flex",
        margin : "10px",
        gap : "10px",
      }}, actual_cards);

    var playerName = h("div",
      { style: {"font-size": "22px", "margin-left": "10px", border: "none", }},
      data.players[i].name
    );
    playerChildren.push(h("div", [playerName, hand, actual_hand]));
  }
  var players = h("div", 
    { style: { 
      display: "flex",
      "flex-direction": "row",
      width : "100%",
      flexWrap : "wrap",
      maxWidth : "960px",
    }},
    playerChildren
  );
  return players;
}

startUpdates();

