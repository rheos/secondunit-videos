# How Many Servers Does a Studio Need?: build state

Music-only blueprint explainer on Novadiem Studio's self-hosting setup (slug `self-hosting`, slate
item 13). Audience: developers (devweb.org readers) and Upwork clients hiring for small-team
infrastructure. Draft 1 went straight from the slate brief (Robin, 2026-10-17: volume first).

## Facts used, and where they come from

Every claim on screen, checked on 2026-10-17:

- **One rented box runs most services, 8 cores / 24 GB.** `assistant/hosting-map.md` ("Contabo VPS",
  Cloud VPS 8, 8 vCPU / 24 GB) and `~/.claude/skills/contabo/SKILL.md` ("The box").
- **Traefik is the edge and owns 80/443, with Let's Encrypt TLS.** hosting-map "Edge + routing" and the
  contabo skill ("Host edge = Traefik v3.6 ... owns 80/443 ... Let's Encrypt"); `rheos/rheo-infra`
  `traefik-dynamic/*.yaml` (every router uses `certResolver: letsencrypt` on the `https` entry point).
- **App ports never face the internet.** contabo skill: "A new public service reaches the world through
  Traefik on 80/443, never a raw port", and Docker-published ports are blocked by
  `coolify-docker-firewall.service` (`rheo-infra/systemd/`). The film says only this; no port numbers.
- **Routing by host name to a container.** `rheo-infra/traefik-dynamic/*.yaml` (`rule: Host(...)`) and the
  contabo skill ("Docker labels on each Coolify app container ... Host(...)").
- **Each route is a label on its container; Coolify writes it.** contabo skill: "Coolify generates these",
  "add the FQDN in Coolify, it provisions the Let's Encrypt cert".
- **The three example apps and their public names** are all routed on the box: `recall.rheo.stream`
  (rheoStream, hosting-map "rheo.stream" entry), `api.retainscore.com` (hosting-map Domains: FastAPI API on
  Contabo/Coolify), `api.growoperative.app` (hosting-map GrowOperative: flipped to the box 2026-08-22).
- **Push to main, checks go green, Coolify pulls main, builds, swaps the container.** contabo skill
  "Deploying to this box" ("Coolify pulls `main`, builds the Dockerfile ... swaps the container") and
  hosting-map rheo.stream ("A green push to main redeploys (`deploy-flagship`)"). The swapped container in
  plate IV is rheoStream, whose deploy is the CI-gated one.
- **Each app keeps its own database.** rheoStream: Postgres with nightly `pg_dumpall` (hosting-map
  rheo.stream). RetainScore: "dedicated Postgres on-box" (hosting-map Domains). GrowOperative: its API
  database is on managed Postgres (Neon) off the box (hosting-map GrowOperative). Vendor not named.
- **What stays off the box.** Static sites at a CDN edge: novadiem.com (Cloudflare Worker) and the
  rheo.stream marketing site (Cloudflare Pages), hosting-map Cloudflare section. One box abroad: the
  cryptowatchtools production box must egress outside the US because exchanges geoblock US IPs
  (hosting-map Singapore section; the app is not named on screen). Nutrifax still runs on its own server;
  the Contabo box is its planned target (hosting-map "Role: ... target for GrowOp and Nutrifax"), so the
  move is drawn dashed (`.planned`).

`rheos/rheo-infra`'s README and DEPLOY.md still describe the retired Apache/Lightsail box; the film
uses them only for the Traefik route files and the firewall unit, which match the live box per the
contabo skill.

## Left off screen for security

No IP addresses, SSH details, internal or Docker port numbers (only 80 and 443), admin or dashboard
hostnames (the Coolify dashboard, analytics, hub, auth and the private rheo.ca service names), auth
details (GitHub sign-in gate, oauth2-proxy, basicAuth), secrets, or account and billing figures. The
hosting vendor and the box location are not named. Coolify and Traefik appear only as tool names.

## Now: draft 1 (2026-10-17)

- Score: score-library `drafting-table-self-hosting/take-01`, sha256 9c5c41c8...b719, 87.95 s,
  ~95.7 BPM. The colophon decayed early (silent 84.9-86.5 s, then a stray re-entry), so the film cuts the
  score at 85.5 s with a 1 s fade; `_in/score.mp3` is that cut. `beats.json`: librosa beats, extended to
  both ends at 0.63 s.
- Getting the score on a fresh checkout (audio stays out of git): copy take-01 from the score library in
  rheos/indieagent-workspace, check `shasum -a 256` prints `9c5c41c8e647113476090f1146a4a6eb8538b3044d97b8c7425ba95ca37ab719`,
  then `ffmpeg -i take-01.mp3 -t 85.5 -af "afade=t=out:st=84.5:d=1" -c:a libmp3lame -b:a 192k _in/score.mp3`.
- Plate starts: 0, 9.5, 24, 38, 54, 68, 79.5; end 85.5.
- Theme `cyanotype`, new in the kit with this film (pale line on Prussian blue, amber accent). Space
  Grotesk and JetBrains Mono come from Google Fonts; `hyperframes check` did not flag either.
- Bar stations are one request's real path: REQUEST 0, EDGE 9.5, ROUTE 24, APP 38, DATA 54.
- One visual device: the rented box. `window.SH` on the root draws its parts (box, edge, routes,
  containers, Coolify, databases); each plate draws what it inherits as-is and animates what it adds.

## Plates

- **I · The Question (0-9.55).** Six single-job servers draw one per beat 1.3-4.4 while "How many
  servers / does a studio need?" reads. They fold into one box 5.69-7.5; caption "ONE RENTED BOX · 8 CORES ·
  24 GB" 7.57. Right label: "Novadiem Studio · self-hosting".
- **II · One Way In (9.5-24.05).** Browser 10.08, Traefik inside the door 11.34, a request crosses 12.6,
  "80 · 443" 13.82, TLS lock and Let's Encrypt 15.05, the rest of the wall brightens shut 16.93 ("APP PORTS
  NEVER FACE THE INTERNET"). "Every request comes in / through one door." (accent) 18.81.
- **III · Routed by Name (24-38.05).** Three requests by host name, 2.5 s apart from 25.05, each routed to
  its container. "MATCHES THE HOST NAME" 32.55; "The name on the request / picks the container." (accent)
  33.18; "EACH ROUTE IS A LABEL ON ITS CONTAINER" 35.06.
- **IV · Push to Deploy (38-54.05).** git push 39.45, checks + tick 40.68-41.94, Coolify 43.19, new build
  beside the running rheoStream container 44.44-45.7, swap 47.55, route redraws 48.38. "Push to main."
  (accent) / "Coolify builds it and swaps it in." 48.81. "ITS ROUTE AND CERTIFICATE COME WITH IT" 50.69.
- **V · One Database Each (54-68.05).** Postgres per app 55.05, 56.31, 57.56 (the third off the box,
  "MANAGED POSTGRES"). "DUMPED NIGHTLY" 59.44; "Each app keeps / its own database." (accent) 60.7.
- **VI · What Stays Off (68-79.55).** The box shrinks to the centre 68.82. Static sites at a CDN 70.05,
  one box abroad 71.94, Nutrifax on its own server with the move dashed 73.82. "Mostly one box." (accent)
  / "Each exception has a reason." 75.05.
- **VII · Colophon (79.5-85.5).** The request path as construction lines; "One box. One door. / One
  push to deploy." (accent) 80.69; novadiem.com and "NOVADIEM STUDIO · SELF-HOSTING" 81.94.

`hyperframes check`: 0 errors. One layout info at 9.56 s (the box caption drawn by plates I and II at
the handoff): expected.
