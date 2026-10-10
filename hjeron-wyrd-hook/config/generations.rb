# Evaluated inside Pipeline; see the skill task reference. Dream of fire 58.042-97.583 s = frames [1393,2342).
S = [Steps::RefBase, Steps::Music, Steps::Keyframes, Steps::Clips, Steps::Overlay]
{
  "char-wolf-v1" => { steps: [Steps::RefBase] },
  "char-wyrd-v1" => { steps: [Steps::RefBase] },
  "style-s1" => { steps: [Steps::RefBase] },
  "ref-s2" => { steps: [Steps::RefBase] },
  "ref-s5" => { steps: [Steps::RefBase] },
  # pre-hook
  "p01" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1393, 93), plate: "sunrise", upload_music: false },
  "p02" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1486, 68), plate: "s01/camp", upload_music: false },
  # hook
  "s01" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1554, 80), plate: "camp", upload_music: false },
  "s02" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1634, 66), plate: "s01/camp", upload_music: false },
  "s03" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1700, 85), plate: "sky", upload_music: false },
  "s04" => { steps: S, import: { ref_base: "char-wolf-v1" }, **section(1785, 39), plate: "fire_ground", upload_music: false },
  "s05" => { steps: S, import: { ref_base: "char-wolf-v1" }, **section(1824, 78), plate: "s01/camp", upload_music: false },
  # closing
  "e01" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1902, 74), plate: "plain", upload_music: false },
  "e02" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(1976, 88), plate: "e01/plain", upload_music: false },
  "e03" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(2064, 113), plate: "s03/sky", upload_music: false },
  "e04" => { steps: S, import: { ref_base: "char-wolf-v1" }, **section(2177, 76), plate: "e01/plain", upload_music: false },
  "e05" => { steps: S, import: { ref_base: "char-wyrd-v1" }, **section(2253, 89), plate: "e01/plain", upload_music: false }
}
