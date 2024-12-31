"use strict";

function postRequest(url, data, callback) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(JSON.parse(this.responseText));
    }
  };
  xhr.send(JSON.stringify(data));
}

var first = true;
function startUpdates() {
  postRequest("get", { first: first, }, function(d) {
    data = d;
    updateDOM();
    startUpdates();
  });
  first = false;
}

function updateData() {
  postRequest("push", data);
}

