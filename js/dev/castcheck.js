// cast sheet for checking the delegates and lettering at a glance (castcheck.html)
chapter('cast', 0, DUR, [[0, function cast(t) {
  night(t);
  hills(t, [{ y: 820, r: 200, gap: 300, band: 26, cols: [K.VIO, K.LAV], speed: 0 }]);
  const xs = [170, 470, 760, 1010, 1300, 1530, 1780];
  ['CUMULUS', 'NIMBUS', 'CIRRUS', 'STRATUS', 'ALTUS', 'PUFF', 'CHAIR'].forEach((n, i) => fig(n, xs[i], 1000, n === 'STRATUS' ? .6 : .75, { t, arm: i === 0 ? 1 : undefined }));
  sign(960, 120, 1100, 170, 'CONVENTION OF CLOUDS', { bg: K.PRU, cols: [K.MUS, K.HPK, K.ORA, K.TUR, K.LIME] });
  balloon('ABCDEFGHIKLMNOPRSTUVWY', 960, 300, 1700, 90, {});
  sun(1700, 300, 80, t); morph(200, 300, 70, RS_.rect(1.3, .8), RS_.bird, .999, K.CRM);
}]]);
