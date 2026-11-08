# cleanline run 1 vs cleanline run 2: 4 frames, 2 identical, 2 differ

- cleanline run 1: `film.html`
- cleanline run 2: `film.html`
- mean = mean absolute difference per channel (0-255), max = largest channel difference (0-255), px = pixels that differ (of W x H), at = where (x,y)

| frame | time (s) | event | result |
|---:|---:|---|---|
| 3844 | 160.167 |  | identical |
| 5023 | 209.292 |  | identical |
| 5293 | 220.542 |  | mean 0.0000, max 1, 6 px at 1094,267 1071,278 991,413 931,435 1370,515 915,654 |
| 7911 | 329.625 |  | mean 0.0000, max 1, 1 px at 1289,670 |
