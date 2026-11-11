// frame.js resolves __ready at once; a plate film waits for its images, then redraws the frame the preview opened on.
'use strict';
window.__ready = Promise.all(Object.values(IMG).map((im) => im.decode())).then(() => { lastFD = -1; drawFrame(Number(PARAMS.get('t') || 43.4)); return true; });
