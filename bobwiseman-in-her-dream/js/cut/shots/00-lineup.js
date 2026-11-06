// Rig check (not in the film): the cast as silhouette puppets. Load with lineup.html.
SHOT(0, 1000, 'lineup', (t) => {
  sheet(C.rose);
  cut(rect(0, 860, W, 220), C.roseDeep, { sh: .6 });
  const ph = t * 5;
  // her standing, walking, waving, laughing
  puppet(200, 860, .62, 1, CAST.her, {});
  puppet(470, 860, .62, 1, CAST.her, POSE.walk(ph));
  puppet(740, 860, .62, 1, CAST.her, { ...POSE.wave(t), ...POSE.laugh(t, 1) });
  // kids
  puppet(960, 860, .62, 1, CAST.girl11, POSE.walk(ph + 1));
  puppet(1120, 860, .62, 1, CAST.boy8, POSE.walk(ph + 2));
  puppet(1250, 860, .62, 1, CAST.girl3, {});
  // friends, doctor
  puppet(1450, 860, .62, -1, CAST.friendA, POSE.wave(t));
  puppet(1640, 860, .62, -1, CAST.friendB, {});
  puppet(1820, 860, .62, -1, CAST.doctor, {});
});
