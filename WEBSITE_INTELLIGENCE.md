# Website Intelligence Document — Nino Ryssens Portfolio

> Single source of truth for the `ninoryssens.netlify.app` portfolio. Read this
> before making any change so decisions stay coherent with the existing system.
> Last reconstructed: 2026-06-13. Built from the source files + the original
> Claude Design chat transcript (`design_handoff/portfolio-website/chats/chat1.md`).

---

## 0. TL;DR — what this is

A **single-page, static portfolio site** for **Nino Ryssens**, a junior
"multi-purpose creative" from Antwerp, Belgium. It exists to win **freelance
work, internships and collaborations in 2026**. The aesthetic is a **warm light,
strictly monochrome, editorial / studio-led** look — neo-grotesque (Helvetica)
display type + IBM Plex Mono labels, generous whitespace, frosted-glass UI,
film-grain, a custom glass-lens cursor, and a coverflow hero carousel.

**Stack: hand-written vanilla HTML + CSS + JS. No framework, no build step, no
dependencies** except one Google Font (IBM Plex Mono) and one self-contained web
component (`<image-slot>`). Served as flat files (Netlify; local: `.claude/serve.py`
on port 4321). Total JS the user maintains is ~480 lines in one IIFE.

The whole thing was iterated conversationally in an AI design tool, then handed
off. **Imagery is real and dropped in; the two testimonials are deliberate,
clearly-labelled placeholders** awaiting real quotes.

---

## 1. Business Layer

| Dimension | Reconstruction |
|---|---|
| **Purpose** | Personal portfolio / digital business card. Prove craft and range, convert visitors into contact. |
| **Primary goal (the one conversion)** | Get the visitor to **email `ryssensnino4@gmail.com`** (or DM `@ninoryssens` on Instagram). There is no form, no analytics, no funnel beyond this. |
| **Revenue model** | Indirect — lands freelance gigs / an internship. "Open to freelance, internships & collaborations — 2026" (footer pre-headline). Status pill literally says **"Available for work."** |
| **Audience segments** | (1) Creative studios / agencies hiring juniors or interns; (2) direct freelance clients (SMBs like Euconsulting, civic/brand clients); (3) collaborators & peers. |
| **User intent** | "Is this person good, and what can they do?" — they came from a CV, Instagram bio link, LinkedIn, or a referral, and want fast proof of quality + a way to reach out. |
| **Market positioning** | Deliberately **studio-grade, not student-grade.** Reads like a small contemporary creative studio's site (refs: LML, Museum³/Valete, monospace studio sites). Positions Nino at the **intersection of strategy + branding + digital** — "one continuous craft, not separate departments." |
| **Competitive landscape** | Other junior creative / design-student portfolios. Edge = art-direction confidence, breadth (brand + motion + print + photo), and a polished interactive build that itself demonstrates digital craft. |
| **Brand promise (the headline)** | *"Brand, motion & image for people who would rather be remembered than noticed."* |

**Implication for future work:** every change should serve *credibility + the
email conversion.* Don't add friction, dark patterns, or anything that cheapens
the studio feel. There is currently no analytics — if measuring conversions
matters, that's a known gap (see §11).

---

## 2. Product Layer — pages, sections, interactions

It's **one HTML document** (`index.html`), anchor-navigated. Top-level order:

1. **Global overlays** (always present): `.grain` (film-grain veil), `.cursor` +
   `.cursor-dot` (custom cursor).
2. **Topbar** (`#topbar`) — floating frosted pill nav. Two modes (see §5.3).
3. **`<main id="top">`**
   - **Hero** (`.hero`) — positioning statement + sub-paragraph + live Antwerp
     clock, then the **coverflow carousel** of 4 standout projects.
   - **Work** (`#work`) — 4 case studies, numbered 01–04:
     - `#euconsulting` (01, the "Standout ★", has a 4-cell facts table)
     - `#p-onitsuka` (02, spec film — **the only real `<video>` on the page**)
     - `#p-city` (03, Baarle-Hertog city identity)
     - `#p-fashion` (04, Margiela-homage fashion editorial/magazine)
   - **About** (`#about`) — lead line, portrait, bio, Disciplines + Experience lists.
   - **Recognition & Words** (`#recognition`) — 2 testimonial quotes (**placeholders**).
4. **Footer / Contact** (`.megafoot #contact`) — dark inverted closing block:
   big headline, Email / Social / Status columns, meta row, giant `RYSSENS`
   wordmark bleeding off the bottom.

### Interaction inventory (every interactive thing and why it exists)

| Interaction | Where | Purpose | File |
|---|---|---|---|
| **Custom glass-lens cursor** | whole page (fine pointers only) | studio-craft signal; ring lerps behind a dot, swells on `[data-cursor]` hover | `main.js` cursor block + `.cursor` CSS |
| **`data-cursor` labels** | most links/tiles | contextual word ("View", "Play", "Say hi"…) — *note: the label TEXT is in the attribute but the current cursor only grows; it does not render the text (that readable-label version was removed early per user request)* | HTML attrs |
| **Coverflow carousel** | hero | the "standout above the fold" — center card 100%, neighbours 0.8 scale + 0.5 opacity, loops both ways, edge fade-mask | `main.js` carousel block |
| carousel controls | hero | arrows, dots (24px hit area), drag/swipe (`pointer*`), ←/→ keys (only when on-screen), click side-card to focus, click center to jump to its `#section` | same |
| **Scroll reveal** | `.reveal` elements | gentle fade-up on entry; rect-based (not IntersectionObserver — see §6) with 2.6s safety fallback + reduced-motion bypass | `main.js` reveal block |
| **Scroll-spy** | nav `.lk` links | underlines the active section as you scroll | `main.js` spy() |
| **Nav dropdown** | mobile/tablet pill | "···" dots open a frosted menu; scroll-locks body; closes on link/outside/ESC/breakpoint-cross | `main.js` nav block |
| **Lightbox** | every collage/portrait thumbnail | full-size uncropped viewer; per-project groups; arrows/ESC/swipe; click-to-zoom 2.4× + drag-pan; focus trap; neighbour preload | `main.js` lightbox IIFE |
| **Hover media** | `.hovermedia` tiles | scale 1.04 + scanline sweep + lift + "↗ View" cue | CSS `.hovermedia*` |
| **Live clock** | hero + footer (`[data-clock]`) | "HH:MM:SS CET", Europe/Brussels — a small "this person is real, here, now" signal | `main.js` tick() |
| **`<image-slot>` avatar** | nav pfp | drag-to-fill image placeholder, persists via sidecar **only inside the omelette/design runtime**; on Netlify it's read-only and falls back to `src="media/portrait.jpg"` | `image-slot.js` |
| **Marquee** | (code present, **not in current HTML**) | the disciplines marquee was deleted per user request; the JS duplicator + CSS remain dormant | `main.js` / CSS |

**Conversion path:** Hero hook → carousel proof → scroll Work for depth →
About for credibility → (Recognition) → footer CTA → email/Instagram.
The carousel's center card *and* the nav both route into the same Work sections,
so there are multiple paths to the same proof.

---

## 3. Design System

**Philosophy (from the brief + iteration):** *timeless, confident, highly
curated; contemporary digital design with an editorial / art-direction mindset.*
Originally briefed dark; **flipped to warm light** at the user's request while
keeping the cinematic editorial structure. **Strictly monochrome — no accent
color, ever** (an explicit brief constraint). The build itself is meant to
*demonstrate* digital craft.

### 3.1 Color (CSS custom properties, `:root` in `styles.css`)
```
--bg:        #f4f2ed   warm off-white paper       --fg:        #1a1916  near-black ink
--bg-soft:   #eae7df   media/placeholder fill      --fg-strong: #0d0c0a  darkest (headings)
--panel:     #e6e2d9   (defined, lightly used)     --fg-dim:    rgba(26,25,22,.58) body text
--line:      rgba(26,25,22,.15)  borders           --fg-faint:  rgba(26,25,22,.34) meta/idx
--line-soft: rgba(26,25,22,.08)  hairlines
```
Footer inverts: bg `#161510`, text `rgba(255,255,255,.9)` with .42/.34/.22 tiers.
**Rule: never introduce a hue.** All "color" is warm-grey opacity tiers. White
(`#fff`) is used only for text *over imagery* (carousel overlays, badges) and in
the dark footer.

### 3.2 Typography
- **Display/sans:** `"Helvetica Neue", Helvetica, Arial, …` — system stack, no
  webfont. `h1–h3`: weight 500, `letter-spacing: -0.03em`, `line-height: .96`.
- **Mono/labels:** `"IBM Plex Mono"` (the only loaded webfont) — uppercase,
  letter-spacing ~.04–.1em, ~10.5–11px. Used for every label, tag, meta, counter,
  number. **The mono is the "studio" signature.**
- **Everything fluid:** sizes are `clamp(min, vw, max)` throughout — e.g. hero
  statement `clamp(26px,3.4vw,52px)`, project name `clamp(30px,4.2vw,66px)`,
  footer headline `clamp(34px,5.4vw,84px)`, giant wordmark `clamp(72px,18vw,300px)`.
- `text-wrap: balance/pretty` on headlines; tight tracking on big type, slightly
  negative on body (`-0.005em`).

### 3.3 Layout / grid system
- **`--pad: clamp(24px, 7vw, 128px)`** = page gutters. **`--maxw: 1160px`** =
  content cap. **`--bleed: maxw + 2*pad`** lets full-bleed blocks (hero, carousel)
  align their inner content to the `.wrap` column. Effective content width =
  `min(maxw, 100vw - 2*pad)` → ~80% on a 1440 laptop, ~60% on 1920 → editorial
  framing, never full-bleed. **Rescale the whole site by tuning `--pad`/`--maxw`.**
- `.section` = `clamp(60px,7.5vw,124px)` vertical rhythm, hairline top border.
- `.wrap` = `max-width:var(--maxw); margin:0 auto`.
- `.sec-head` = title left / mono meta right, baseline-aligned, bottom rule.
- **Collage grid:** 2 columns, every tile forced to **4:3** (`.col` uses
  `display:contents` so tiles become direct grid items) → uniform, no tile bigger
  than another regardless of source dims; `object-fit:cover` crops, full image is
  one click away in the lightbox. Opt-in `.span-2` = 16:7 full-width banner.
- Aspect helpers: `.ar-21 .ar-169 .ar-43 .ar-11 .ar-34 .ar-32`.

### 3.4 Components / patterns
Radius scale: `--radius: 22px` (media, panels), `+6px` for the big cards,
`100px` for pills, `50%` for circles. **Frosted glass** (`backdrop-filter: blur()
saturate()`) is the signature UI material — nav pill, dropdown (now solid, see
§3.6), carousel arrows, badges, lightbox controls, the cursor itself.
Recurring components: frosted **pill** (nav, buttons, tags), **badge** (mono
category label top-left of media), **facts table** (`.facts` 4-up dl), **media
tile** (`.media` + `.fill` + `.scan` + hover cue), **mega-footer**.

### 3.5 Motion
- Easing tokens: `--ease: cubic-bezier(.22,1,.36,1)` (standard out),
  `--spring: cubic-bezier(.34,1.56,.64,1)` (overshoot, for taps/dots),
  `--ease-morph` + `--morph-dur:.72s` (legacy from the nav-morph era).
- Reveals: 1s fade + 28px rise, optional `.d1/.d2/.d3` stagger delays.
- All motion respects `prefers-reduced-motion: reduce` (reveals shown instantly,
  smooth-scroll off, marquee off, lightbox transitions minimized).

### 3.6 Design rules — preserve vs. evolve
**Preserve (load-bearing identity):**
- Monochrome-only palette via the `--fg*`/`--bg*` tokens. No hues.
- Helvetica display + IBM Plex Mono labels pairing.
- `clamp()` fluid type + `aspect-ratio` media (this is *why* there's no CLS).
- The `--pad`/`--maxw`/`--bleed` framing system.
- Mono uppercase labels as the structural "studio" voice.
- Lightbox-backs-every-thumbnail contract; carousel grouping logic.

**Settled decisions (don't relitigate without reason) — the user iterated to these:**
- The hover cursor does **not** show a readable text label (the negative-circle
  label was explicitly removed — "almost not readable").
- Cursor has **no black center dot** (removed on request) — glass ring only.
- The **dropdown menu is fully solid** `#faf9f6`, **no transparency, no blur** —
  the user explicitly walked it from frosted → 94% → fully opaque because
  background content (carousel dots) bled through the glass.
- Nav is **two discrete modes by one breakpoint**, not a scroll-morph — the
  earlier scroll-scrubbed morph was replaced (see §5.3).
- The disciplines **marquee is deleted** from the page (lives only in About list).
- Footer is the **dark inverted** closing block (adopted from a reference, kept
  monochrome — no accent, no emoji).

**Reasonable to evolve:** real testimonials (placeholders by design), per-project
detail pages (`View project →` links currently go to `#` / "Soon"), SEO/meta,
favicon, video weight (see §11).

---

## 4. Content Intelligence

- **Brand voice:** confident, spare, art-directed. Lowercase-cool but literate.
  Short declaratives. Mono labels do the structural talking; prose is warm but
  controlled. Belgian/Antwerp rootedness is a recurring trust signal (live CET
  clock, "Est. Antwerp, BE", "Based in Antwerp, Belgium").
- **Signature line:** *"would rather be remembered than noticed."* — the whole
  brand attitude in one clause.
- **Value props, repeated:** (1) strategy→image as *one continuous craft*;
  (2) breadth across brand/motion/print/photo; (3) "clarity first, craft always";
  (4) work that "earns a second look."
- **Trust mechanisms:** real in-house experience (Euconsulting, 1 yr full-time),
  current study (AP Hogeschool), the live clock, the "Available for work" status,
  and (pending) collaborator quotes.
- **Conversion messaging:** *"Let's create something worth keeping."* + a single
  email + Instagram + status. Low-pressure, peer-to-peer, not corporate.
- **Recurring lexical patterns:** mono labels like `In-house · Graphic Design`,
  `Identity · Comms`, year ranges `2024 — 2025`, numeric indices `01–04`,
  the `·` middot as separator, the `→`/`↗`/`↳` arrows.

**Rule for new content:** write tight, monochrome-minded, label-as-mono, prose
warm-but-restrained. Keep the "studio of one" register. Don't add hype, emoji,
or corporate filler. Convert relative claims to specifics where you can.

---

## 5. Technical Architecture

### 5.1 Structure & dependencies
```
index.html        homepage; loads styles.css, then image-slot.js, then main.js (end of body)
styles.css        all design tokens + component CSS, no preprocessor (shared by ALL pages)
main.js           one "use strict" IIFE, homepage interactions
image-slot.js     self-contained <image-slot> custom element (Shadow DOM), homepage avatar only
projects/         PROJECT DETAIL PAGES (multi-page now — see §13)
  euconsulting.html  full case study; loads ../styles.css + case.css, then case.js
  case.css           detail-page-only components (hero, sections, cards, IG mockup, story viewer)
  case.js            detail-page IIFE (cursor/reveal/nav reused + accordion, lightbox, story viewer)
media/            homepage assets: euconsulting/(t1-t6 + img/photos/files/videos subfolders for
                  the detail page) baarle/ onitsuka/(+spec-ad.mp4) fashion/ portrait.jpg
.claude/serve.py  local static server on :4321 (launch.json config "portfolio")
design_handoff/   ORIGIN: Claude Design bundle — README + chat transcript + screenshots (gitignored)
```
External deps: **IBM Plex Mono** (Google Fonts, `display=swap`, preconnected).
No npm, no bundler, no runtime framework. `image-slot.js` references a
`window.omelette.writeFile` host bridge that exists **only in the design tool's
runtime** — on Netlify it's absent, so the slot is read-only and uses its `src`.

### 5.2 Data flow / state
Almost stateless. Transient JS state only: carousel `active` index; lightbox
`group/index/zoom/pan`; nav open/closed; reveal "already shown" set. No router,
no store, no persistence in production (the only persistence — image-slot's
`.image-slots.state.json` sidecar — is design-runtime only).

### 5.3 Navigation architecture (the most-iterated piece — read before touching nav)
The nav went through several designs in the transcript: full bar → scroll-hiding
dock → scroll-scrubbed morph → **final: two discrete modes chosen by ONE media
query, never by scroll.** This is intentional and load-bearing:
- **Closed pill** (mobile + tablet, the base/default): avatar + handle + round
  "···" dots that open a frosted **solid** dropdown. Acts as the hamburger.
- **Open pill** (desktop only): inline links + Contact CTA, no dropdown.
- **The single switch:** `@media (min-width:1024px) and (hover:hover) and
  (pointer:fine)`. The JS `desktopMq` matchMedia is the **exact twin** of this CSS
  query, so layout (CSS) and dropdown behavior (JS) can never disagree → no
  hybrid state. The hover/pointer test disambiguates a touch tablet (~1366px)
  from a small laptop (~1280px) where width alone overlaps. **If you change the
  breakpoint, change it in BOTH `styles.css` (line ~225) and `main.js` (`desktopMq`)
  or the nav will desync.**

### 5.4 Responsive architecture
Mobile-first base; layered breakpoints: `520`, `600`, `620`, `760`, `860`,
`761–1024` (tablet), `1024+` (desktop nav). Type/space fluid via `clamp()`;
media via `aspect-ratio` (no CLS). Touch refinements: `touch-action:pan-y` on
carousel stage (vertical scroll vs horizontal swipe), reduced backdrop-blur on
coarse pointers (GPU cost), explicit `:active` tap states, ≥44px hit targets,
custom cursor auto-disabled on `(hover:none)/(pointer:coarse)`.

### 5.5 Performance strategy (what's already done)
- LCP: hero carousel image (`media/euconsulting/t6.jpg`) is **preloaded** with
  `fetchpriority="high"`; first carousel `<img>` also `fetchpriority="high"`;
  the rest `loading="lazy"`.
- Font `display=swap` + preconnect; video `preload="metadata"` with poster.
- `content-visibility:auto` + `contain-intrinsic-size` on `#recognition` and the
  footer to skip offscreen layout/paint.
- `aspect-ratio` everywhere → zero layout shift.
- Tiny JS, no framework, deferred at end of body.

### 5.6 `<image-slot>` component (deep but isolated)
A `@ds-adherence-ignore` scaffold (raw px/hex by design). Shadow-DOM custom
element: drag/drop or click-to-browse an image, downscales via canvas to WebP
(≤1200px / 2× slot), persists to a shared `.image-slots.state.json` sidecar
through `window.omelette.writeFile`. Supports reframe mode (double-click →
pan/resize/wheel-zoom crop) for `fit=cover`. **Production-irrelevant** (no host
bridge on Netlify) but keep it: it's how Nino swaps the avatar inside the design
tool, and the HTML uses `<image-slot id="pfp-top" … src="media/portrait.jpg">`.

---

## 6. Notable engineering decisions & their "why" (so you don't "fix" them)
- **Reveals use rect-based scroll checks, not IntersectionObserver** — IO simply
  didn't fire in the design tool's preview iframe (transcript line ~99). There's
  a 2.6s safety `setTimeout` that force-reveals everything so content can never
  get stuck hidden. Keep the fallback if you refactor to IO.
- **Carousel white text is set inline with `!important` from JS** (the SCRIM +
  white overlay block) — deliberate, so white always wins the cascade over any
  thumbnail. CSS also sets it; JS is the reliability belt.
- **Dropdown solidity / `visibility:hidden` when closed** — fixes a Safari quirk
  where `backdrop-filter` renders even at `opacity:0` (the "white blob bleeding
  out of the pill"). Don't switch closed-state back to opacity-only.
- **`display:contents` on `.collage .col`** — lets the two column wrappers vanish
  so tiles align on one even grid. Don't add styling to `.col`; it has no box.

---

## 7. User Experience map
- **Entry points:** Instagram bio link, CV/email signature, LinkedIn, referral,
  direct. All land on `#top` (hero).
- **Journeys:** hooked by statement → carousel signals quality fast → scroll Work
  for depth (lightbox for detail) → About for who/credibility → footer to act.
- **Funnel:** Hero → Work proof → About trust → **Contact (email/IG)**. Nav +
  carousel-center-card both shortcut to Work.
- **Friction / known gaps:** `View project →` links are dead (`#`, "Soon") — no
  per-project pages yet; testimonials are placeholders; no analytics so the funnel
  is unmeasured; the heavy hero video (§11) can slow first load on mobile.

---

## 8. Relationship Map (change-impact)
- **Design tokens (`:root`) → everything.** Editing `--fg*`/`--bg*`/`--pad`/
  `--maxw` reflows the whole site. Safest global lever.
- **Nav breakpoint lives in two files** (CSS media query + JS `desktopMq`) — must
  change together (§5.3).
- **Carousel ↔ Work sections:** carousel card `href`s (`#euconsulting`,
  `#p-onitsuka`, `#p-city`, `#p-fashion`) must match the `<article id=…>`s, or the
  center-card jump breaks. Adding/removing a project means updating: carousel
  card, Work article, and counts/numbering (`01 / 04`, `Index / 01 — 04`).
- **Lightbox auto-discovers** `.hovermedia` tiles with an `img.fill`, grouped by
  closest `.collage`/`.portrait`. New collage tiles are picked up automatically;
  carousel cards and the feature video are explicitly excluded.
- **`.reveal` / `.d1-3`** classes drive entry animation — keep adding them to new
  blocks for consistency (the safety timeout covers them regardless).
- **Mono label language** is shared across badges, tags, meta, counters — restyle
  `.mono`/`.label` once and it propagates.

---

## 9. Asset inventory
`media/`: `euconsulting/t1–t6.jpg` (1.7M), `baarle/t1–t4.jpg` (2.2M),
`fashion/{cover,spread,cap,necklace,poster-wall}.jpg` (2.2M),
`onitsuka/t1–t4.jpg + spec-ad.mp4` (**~65M video** — the heavy item),
`portrait.jpg` (362K). Images are reasonably sized; **the spec-ad video is the
one real weight problem.**

---

## 10. Deployment
Static flat-file host on **Netlify** (`ninoryssens.netlify.app`). No
`netlify.toml`, `_redirects`, `robots.txt`, `sitemap.xml`, or favicon present.
Local dev: `python3 .claude/serve.py 4321` (or the "portfolio" launch config).
Git: single `main` branch, working tree clean. `.gitignore` excludes `.DS_Store`,
`.claude/`, `.gh-token`, `design_handoff/`.

---

## 11. Known gaps / opportunities (ranked, system-coherent)
1. **Compress/stream the 65MB `spec-ad.mp4`** (re-encode H.264/H.265 + maybe a
   poster-only-until-click load, or host on a CDN/Vimeo). Biggest perf win, esp. mobile.
2. **Real testimonials** — replace the two `Placeholder`-pilled quotes; remove the
   "↳ Real quotes…" note when done.
3. **SEO/meta + favicon** — add `<meta name="description">`, Open Graph/Twitter
   cards (so Instagram/LinkedIn link previews look studio-grade), and a favicon.
4. **Per-project pages** — DONE for Euconsulting (`projects/euconsulting.html`, see §13).
   The other three projects' `View project →` links are currently *hidden* (no page yet);
   reuse the §13 pattern when their content is ready.
5. **Analytics** — there is none; the email conversion is unmeasured. A
   privacy-light option (Plausible/Netlify Analytics) would close the loop.
6. **A11y polish** — already strong (focus-visible rings, ARIA on nav/carousel/
   lightbox, reduced-motion, ≥44px targets); a final screen-reader pass on the
   carousel + lightbox would finish it.

---

## 12. How to work on this site (operating rules)
- **No framework, no build.** Edit the three files directly; reload the static
  server. Keep JS in the single IIFE and CSS token-driven.
- **Honor the settled decisions in §3.6** — they're the result of explicit user
  iteration, not oversights.
- **Stay monochrome.** Never add a hue. "Color" = warm-grey opacity tiers + the
  dark footer + white-on-image.
- **Use the tokens** (`--fg*`, `--bg*`, `--pad`, `--maxw`, `--radius`, `--ease`,
  `--spring`) and the existing component classes before inventing new ones.
- **Mono for all labels/meta**; Helvetica for display/body.
- **New media tiles** → `.media.ar-43` (or `.span-2`) inside a `.collage .col`,
  with `<img class="fill" loading="lazy" alt="…">` + `.hovermedia` → lightbox is automatic.
- **Touching nav** → change the breakpoint in `styles.css` AND `main.js` together.
- **Verify the real thing** via the static server; the design tool's screenshot
  tool historically couldn't render `backdrop-filter`/mid-transition states.
  NOTE: the IDE's Claude Preview runtime is sandboxed out of `~/Documents`, so
  `preview_start` fails there; verify instead with a throwaway
  `python3 -m http.server` (Bash, sandbox disabled) + `curl`, plus `node --check`.

---

## 13. Project detail pages (multi-page architecture)
Added 2026-06-13. The homepage `View project →` links now route to full case-study
pages under `projects/`. **Euconsulting is the first and the template for the rest.**

**Files (all in the live design system — monochrome, Helvetica + IBM Plex Mono):**
- `projects/euconsulting.html` — links `../styles.css` (shared tokens/components) +
  `case.css` (page-only); loads `case.js` at end of body. Reuses the homepage's
  `.topbar`, `.grain`, `.cursor`, `.reveal`, `.media/.badge/.scan/.hovermedia`,
  `.lb` lightbox chrome and `.megafoot` so it reads as one site.
- `projects/case.css` — detail-only components: `.case-hero` + `.case-meta`
  (a `.facts`-style 4-up), `.case-index` (in-page section chips), `.work`
  collapsible sections (`grid-template-rows 0fr→1fr`), `.cardgrid/.card`,
  the **monochrome Instagram mockup** (`.ig-*` — recolored to site tokens, no
  rainbow ring / no blue buttons), the `.sv-*` story viewer, and `.lb-content/
  .lb-media` lightbox extensions for PDF (iframe) + video.
- `projects/case.js` — self-contained IIFE (no shared runtime with main.js):
  reuses cursor + reveal + nav-pill logic verbatim; adds the section accordion
  (+ open-from-hash), a unified lightbox (image / PDF / video + photo-gallery
  prev-next via `.pgal .pitem`), and the IG story viewer driven by
  `window.IG_HIGHLIGHTS = [{label, stories:[...]}]` declared inline in the HTML.

**Content model (from the user's older `Portfolio-main` repo, restyled):** hero
(eyebrow · headline · lede · Client/Partner/Period/Disciplines meta · hero image)
→ section index chips → 6 collapsible sections: 01 Communication, 02 Posters,
03 Offerte, 04 Animation (the 44s motion graphic, plays fullscreen), 05 Social
(banners + the IG profile mockup: 18-post grid, bio, 4 story highlights), 06
Photography (4 BBQ/trade-fair galleries, 40 photos) → dark `.megafoot`.
Deliberately **omits** the reference's NL/EN + light/dark toggles and its
scope/credit disclaimer (user choices).

**Assets:** `media/euconsulting/{img,photos,files,videos}/` — 109 files (~123 MB,
of which `files/` PDFs ≈ 55 MB and `img/` ≈ 52 MB) copied from the source repo.
⚠️ Large for git; candidate for compression / Git LFS later.

**To add a detail page for another project:** copy `euconsulting.html` as the
template, swap content + `media/<project>/…` paths, keep the same class structure
so `case.css`/`case.js` light up automatically, then point that project's
homepage `View project →` link at it (and un-hide it — the link was removed, not
just disabled). Cards opt into the lightbox via `data-image` / `data-pdf` /
`data-video` + `data-title`; photo galleries use `.pgal > .pitem[data-image]`.
