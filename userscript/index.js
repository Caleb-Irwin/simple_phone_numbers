// ==UserScript==
// @name         Simple Phone Numbers
// @namespace    http://tampermonkey.net/
// @version      1
// @description  Get phone numbers from site and post it to localhost:8080/api/street
// @author       Caleb Irwin
// @match        https://www.canada411.ca/search/*
// @icon         https://www.google.com/s2/favicons?domain=canada411.ca
// @grant        none
// ==/UserScript==

// jshint esversion: 8

(function () {
  "use strict";
  // Your code here...
  // fetch({})
  if (location.hash === "#auto") {
    let output = [];
    let i = 0;
    while (true) {
      let obj = {};
      obj.i = i;
      i++;
      if (document.querySelector("#ContactName" + i) == null) {
        break;
      }
      obj.name = document.querySelector(`#ContactName${i} > a`).innerHTML;

      obj.phone = document.querySelector(`#ContactPhone${i}`).innerHTML;

      obj.address = document.querySelector(`#ContactAddress${i}`).innerHTML;

      output.push(obj);
    }
    console.log(output);
    console.log("trying to fetch!");
    fetch("http://localhost:8080/api/street", {
      method: "POST",
      body: JSON.stringify(output),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(() => {
        console.log("Success");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
})();
