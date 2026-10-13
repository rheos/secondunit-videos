// Round 3, leaf-B: loaded just before main.js. main.js ends by starting its own page (stanzas 8-10); on this page
// that call is swallowed, and r3b-main.js starts the page with the stanza 6-7 renderer instead. Nothing is edited.
const r3bLeafStartPage = startPage;
startPage = function () {};
