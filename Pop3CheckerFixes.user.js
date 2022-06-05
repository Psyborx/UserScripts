// ==UserScript==
// @name         Pop3 Checker Fixes
// @namespace    http://psyborx.com/
// @version      1.0
// @description  Styling fixes for Pop3 Checker
// @author       Psyborx
// @match        *://mail.google.com/*
// @icon         https://www.google.com/s2/favicons?domain=google.com
// @updateURL    https://raw.githubusercontent.com/Psyborx/UserScripts/main/Pop3CheckerFixes.user.js
// @downloadURL  https://raw.githubusercontent.com/Psyborx/UserScripts/main/Pop3CheckerFixes.user.js
// ==/UserScript==

(function() {
  //const  = document.querySelector('a[title="POP3 Accounts Now"]').parentNode.parentNode

  const p3cf = {
    intWait: 250,
    maxWait: 15000,
    totalWait: 0,
    init: () => {
      p3cf.totalWait += p3cf.intWait;
      const pop3ChckA = document.querySelector('a[title="POP3 Accounts Now"]');
      if (pop3ChckA) {
        const pop3ChckSpan = pop3ChckA.parentNode;
        const pop3ChckDiv = pop3ChckSpan.parentNode;

        pop3ChckSpan.style.background = null;
        pop3ChckSpan.style.color = null;
        pop3ChckSpan.style.border = null;

        pop3ChckDiv.style.position = 'absolute';
        pop3ChckDiv.style.bottom = '0';
      } else if (p3cf.totalWait < p3cf.maxWait) {
        //console.warn('*************** Pop3 checker not found yet');
        window.setTimeout(p3cf.init, p3cf.intWait);
      } else {
        console.error('*************** Pop3 checker was never found');
      }
      return this;
    }
  };
  p3cf.init();
})();