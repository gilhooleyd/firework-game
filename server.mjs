import * as http from "http";
import * as url from "url";
import * as fs from "fs";
import * as path from "path";

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createData() {
  var CARD_AMOUNT = [3, 2, 2, 2, 1];
  var COLORS = ["blue", "white", "green", "yellow", "red"];
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
var game = createData();

var poll_res = []

const address   = process.argv[2] || "localhost";
const port      = process.argv[3] || 9000;

function loadFile(pathname, res) {
    // based on the URL path, extract the file extension. e.g. .js, .doc, ...
    const ext = path.parse(pathname).ext;
    // maps file extension to MIME typere
    const map = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword'
    };

    fs.exists(pathname, function (exist) {
        if (!exist) {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
        }

        // if is a directory search for index file matching the extension
        if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;

        // read file from file system
        fs.readFile(pathname, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                // if the file is found, set Content-type and send data
                res.setHeader('Content-type', map[ext] || 'text/plain');
                res.end(data);
            }
        });
    });
}

http.createServer(function (req, res) {
  console.log(`${req.method} ${req.url}`);

  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  if (pathname == "./") pathname = "./index.html";

  if (pathname == "./get") {
    let data = "";
    req.on('data', function (chunk) { data += chunk }).on('end', function () {
      data = JSON.parse(data);
      console.log("get data", data);
      if (data.first) {
        res.end(JSON.stringify(game));
      } else {
        poll_res.push(res);
      }
    });
    return;
  }
  if (pathname == "./push") {
    let data = "";
    req.on('data', function (chunk) { data += chunk }).on('end', function () {
      game = JSON.parse(data);
      res.end("");
      while (poll_res.length != 0) {
        res = poll_res.pop();
        res.end(JSON.stringify(game));
      }
    });
    return;
  }
  loadFile(pathname, res);
}).listen(parseInt(port), address);

console.log(`Server listening on http://${address}:${port}`);
