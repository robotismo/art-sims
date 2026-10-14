# Art Simulations

Hand-built generative-art simulations. Each is a self-contained, animated, interactive `index.html` —
open it in a browser and it runs.

**Volume I — The Leaf Atlas** grows leaf structure from first principles: eight standalone canvas sims,
no frameworks or build step. **Volume II — Cosmos** turns to the GPU — three.js + WebGL2 GPGPU pushing
a million-plus particles through curl-noise flow, strange attractors, and a spiral galaxy.

```
open index.html        # the gallery
```

---

## The brief

This volume is a direct response to the **[lamm-mit Leaf-inspired Image Generation
collection](https://huggingface.co/collections/lamm-mit/leaf-inspired-image-generation)** from MIT's
Laboratory for Atomistic and Molecular Mechanics (Markus J. Buehler). That collection is a family of
diffusion models — `SD2.x → SDXL → SD3-medium → FLUX.1-dev` — fine-tuned with DreamBooth/LoRA on images
of **leaf microstructure** (trigger token `<leaf microstructure>`). Prompt them and they paint golden
venation, cellular tissue, and porous hierarchies, which the lab then translates into real
moisture-responsive, load-bearing bio-materials
([Luu et al., 2025](https://arxiv.org/html/2508.06591)).

A diffusion model *learns the statistics* of leaf imagery. These simulations take the opposite route:
they encode the **generative process** itself, so the same structures emerge from a handful of local
rules. Same destination, inverse path.

---

## Volume I — The Leaf Atlas

| # | Piece | Algorithm | Leaf principle (per lamm-mit) |
|---|-------|-----------|-------------------------------|
| 01 | **Auxin Bloom** | Space colonization (Runions et al. 2005) + Murray's law | Hierarchical venation networks |
| 02 | **Turing Tissue** | Gray–Scott reaction–diffusion | Cellular geometry & tissue density |
| 03 | **Crinkle Margin** | Differential growth | Corrugated folding (*Rhapis excelsa*) |
| 04 | **Slime Veins** | *Physarum* multi-agent stigmergy | Vascular transport efficiency |
| 05 | **Phyllotaxis Bloom** | Golden-angle packing (Vogel's model) | Leaf arrangement & Fibonacci order |
| 14 | **Frond** | L-system (Lindenmayer) + turtle graphics | Recursive compound-leaf branching |
| 15 | **Dendrite** | Diffusion-limited aggregation (Witten–Sander) | Fractal vein/frost growth |
| 16 | **Areole** | Voronoi (jump-flooding) + Lloyd relaxation | Areole tessellation between veins |

### 01 · Auxin Bloom — `01-auxin-bloom/`
Scatters hormone "attractors" through a leaf silhouette. The nearest vein tip grows one step toward
every attractor pulling on it; attractors vanish once reached. When the blade is full, stroke widths are
set by **Murray's law** (a parent vein's cubed radius = sum of its children's), producing a believable
pinnate hierarchy. *Controls: density, growth speed.*

### 02 · Turing Tissue — `02-turing-tissue/`
The classic **Gray–Scott** two-reagent system on a grid clipped to a leaf. Minute changes to the feed/kill
rates flip it between labyrinthine veins, dividing cells, coral, and worms. *Controls: pattern preset, flow rate.*

### 03 · Crinkle Margin — `03-crinkle-margin/`
A closed ribbon of nodes stays evenly spaced, repels its neighbours, and inserts new nodes over time.
Too much length in too little plane forces it to buckle — the mechanics of kale and dehydrated palm
fronds. *Controls: stiffness, node spacing.*

### 04 · Slime Veins — `04-slime-veins/`
~42,000 agents each sense a chemical trail at three points, steer toward the strongest, move, and deposit
their own trail, which diffuses and decays. A self-pruning **transport network** emerges with no
coordinator. *Controls: turn angle, sensor distance.*

### 05 · Phyllotaxis Bloom — `05-phyllotaxis-bloom/`
Each primordium is placed one fixed turn from the last and pushed out by √n. At the **golden angle
(137.5°)** units pack with zero gaps and Fibonacci spiral arms appear; shift the angle a fraction of a
degree and the packing collapses into spokes. *Controls: divergence angle slider.*

### 14 · Frond — `14-frond/`
An **L-system** (Lindenmayer, 1968) rewrites a single symbol with one production rule — *X → F+[[X]−X]−F[−FX]+X* —
a few times, and a **turtle** reads the resulting string as draw / turn / branch commands. Self-similar branching and
leaflets fall out of pure recursion: the grammar of how ferns and compound leaves grow. *Controls: angle, depth.*

### 15 · Dendrite — `15-dendrite/`
**Diffusion-limited aggregation** (Witten & Sander, 1981): particles random-walk in from far away and freeze the
instant they touch the cluster. Exposed tips intercept wanderers first, so roughness amplifies into a self-similar
**dendrite** — frost, electrodeposits, and the finest veins, from one rule. *Controls: growth rate.*

### 16 · Areole — `16-areole/`
Assign every pixel in a leaf to its nearest of N seed points and you get a **Voronoi diagram** — cells (areoles)
divided by edges (the minor veins) — computed fast with the **jump-flooding** algorithm. **Lloyd relaxation** then
drifts each seed to its cell's centroid, settling the patchwork into the even mosaic a leaf actually grows.
*Controls: areole count.*

---

## Volume II — Cosmos

The first **GPU-driven** piece in the series. Where Volume I ran on the 2D canvas, this volume moves to
**three.js + WebGL2 GPGPU** and pushes the machine's graphics card: ~1 million particles (up to ~4.2M)
advected every frame, position and velocity living in floating-point textures, updated by fragment shaders.

| # | Piece | Algorithm | Principle |
|---|-------|-----------|-----------|
| 06 | **Flux** | Curl-noise flow · strange attractors · density-wave spiral (GPGPU) | One velocity field, three faces |
| 07 | **Genesis** | Newtonian N-body galaxy collision · velocity-streak lines (GPGPU) | Tidal forces & galaxy mergers |
| 08 | **Magnetosphere** | Charged dust in a magnetic dipole (GPGPU) | The Lorentz force made visible |
| 09 | **Maelstrom** | Point-vortex turbulence (GPGPU) | Vorticity, merging & chaos |
| 10 | **Singularity** | Black-hole accretion disk (GPGPU) | Relativistic orbits & Doppler beaming |

### 06 · Flux — `06-flux/`
A million points of massless dust obey a **single GPU velocity field** — only the force changes between
three morphable modes:

- **Flow** — the curl of a noise potential, **v = ∇×Ψ**, which is divergence-free (∇·v = 0): dust can
  never pile into sinks or leak from sources, so it folds and shears like real smoke and the aurora's
  charged-particle sheets.
- **Chaos** — a **strange attractor** (Lorenz ⇄ Aizawa) used as the flow field; the butterfly effect
  drawn by a million traces, with an on-demand morph between attractors.
- **Galaxy** — a rotating logarithmic-spiral potential over differential rotation; the arms are
  **standing density waves** (Lin–Shu) — traffic-jams of orbits, not fixed stars.

Stir the field with the cursor, orbit/dive with the mouse, switch modes to watch the cloud physically
flow from one face to the next. An FPS-adaptive governor scales the particle count to keep 60fps and
climbs toward the GPU's ceiling. *Controls: mode, reseed, flow scale, drift, glow, trails, particle
count ("Push it"), Save PNG.* Built with **three.js r184 loaded from a CDN**, so unlike the offline Vol. I
pieces it needs an internet connection the first time it loads.

---

### 07 · Genesis — `07-genesis/`
A Newtonian **N-body galaxy encounter**: two massive cores, each wrapped in a disk of a million dust grains, interact
under gravity and shear into tidal bridges and arms — then the encounter auto-replays. Two selectable modes: **Flyby**
(a grazing hyperbolic pass — the galaxies graze and part) and **Merge** (a bound eccentric dance that spirals together).
Each grain is drawn as a short **velocity-aligned streak** (GL_LINES), so the gravitational flow itself becomes the
structure rather than a smooth glow. *Controls: encounter (flyby/merge), galaxies (2–5), gravity, drift, glow, Save PNG.*

### 08 · Magnetosphere — `08-magnetosphere/`
Charged dust spirals down a planet's **magnetic dipole** field lines and burns in auroral sheets at the poles — the
Lorentz force made visible.

### 09 · Maelstrom — `09-maelstrom/`
A handful of **point vortices** stir a sea of tracer light into turbulence — storms that merge, orbit, and devour
one another.

### 10 · Singularity — `10-singularity/`
A million motes fall toward a **black hole**; the accretion disk's inner edge burns, Doppler-beamed bright by its own
orbital speed.

---

## Volume III — Emergence

Order without a designer — three studies where elaborate structure falls out of a few local rules. **Forged with
Opus 4.8 in `ultracode` multi-agent orchestration**: each piece was built by one agent, then adversarially verified and
repaired by a second, and is badged *Opus 4.8 · ultracode* in-app.

| # | Piece | Algorithm | Principle |
|---|-------|-----------|-----------|
| 11 | **Lichtenberg** | Dielectric breakdown model (stochastic Laplacian growth) | Field-driven fractal branching |
| 12 | **Stable Fluids** | Jos Stam semi-Lagrangian Navier–Stokes | Incompressible flow & vorticity |
| 13 | **Murmuration** | Reynolds boids + uniform spatial hash | Leaderless collective motion |

### 11 · Lichtenberg — `11-lichtenberg/`
Solves the **Laplace equation** for electric potential around a growing conductive cluster, then advances the discharge
into a neighbouring cell with probability ∝ field<sup>η</sup>. A stochastic fractal grows outward into the branched
**Lichtenberg figure** a real spark etches into charged acrylic. *Controls: branchiness (η), growth speed.*

### 12 · Stable Fluids — `12-stable-fluids/`
A faithful **Jos Stam** solver: diffuse → **pressure-project** to incompressibility → **semi-Lagrangian advection**,
with **vorticity confinement** reviving the small swirls advection would smear away. Drag on the canvas to stir the ink.
*Controls: swirl, fade, clear.*

### 13 · Murmuration — `13-murmuration/`
2,500 starlings obey three **Reynolds rules** (separation, alignment, cohesion) found through a **uniform spatial-hash
grid** so the flock stays O(n); a hawk triggers the rolling flash-waves of a real murmuration with no leader at all.
*Controls: birds, cohesion, alignment, hawk toggle.*

---

## Volume IV — Magnum Opus

The crown of the series — one piece that gathers everything the prior seventeen learned into a single showpiece on the
proven GPGPU engine, **forged with Opus 4.8**.

| # | Piece | Algorithm | Principle |
|---|-------|-----------|-----------|
| 17 | **Aurelian** | Curl-noise flow + Lamb–Oseen vortices · velocity-streak lines (GPGPU) | Divergence-free flow made visible |

### 17 · Aurelian — `17-aurelian/`
Millions of motes are advected through a **divergence-free** velocity field — a weighted sum of solenoidal terms
(**v = ∇×Ψ** curl-noise octaves plus drifting **Lamb–Oseen** line-vortices), so the flow folds and braids matter
forever without ever compressing it. Each mote is drawn not as a point but as a short **velocity-aligned line
segment**, so coherent currents read as silk and turbulence as braid — the light *is* the flow. A director eases the
field through four **movements** — *Laminar → Turbulent → Vortical → Calm* — with randomized durations and freshly
reseeded vortices each cycle, so it is a generative composition that **never repeats**. Stir it with the cursor and the
divergence-free field heals the channel you carve. Default ~2.1M filaments at 60fps on this M2 Pro; "Push it" climbs to
4.2M / 6.6M. *Controls: reseed, turbulence, swirl, streak length, glow, particle count, Save PNG.*

---

## How it's built

- **Pure browser canvas + vanilla JS.** Every file is standalone and portable — email one, it still runs.
- Typed arrays and uniform-grid spatial hashing keep the heavier sims (RD, physarum) at interactive frame rates.
- A shared dark **gold-and-emerald** palette echoes the lamm-mit aesthetic across all five.
- Every piece has a **Save PNG** button.

```
ArtSimulations/
├── index.html                                       # gallery with generative thumbnails
├── 01-auxin-bloom/ … 05-phyllotaxis-bloom/  14-frond/ 15-dendrite/ 16-areole/   # Vol. I · Leaf Atlas (canvas)
├── 06-flux/                                          # Vol. II · Cosmos — three.js GPGPU
├── 07-genesis/ 08-magnetosphere/ 09-maelstrom/ 10-singularity/   # Vol. II · Cosmos (cont.)
├── 11-lichtenberg/ 12-stable-fluids/ 13-murmuration/             # Vol. III · Emergence
└── README.md
```

No server required — `open index.html`. (Or `python3 -m http.server` and browse to it.)

---

## Roadmap

Volume I is the first of many. Queued:

- **Cymatics / Chladni plates** — standing-wave nodal figures traced by migrating sand
- **Ferrofluid spikes** — the Rosensweig instability of a magnetized fluid
- **Crack propagation** — brittle fracture networks and craquelure
- More **Vol. III · Emergence** studies, and deeper **Vol. II · Cosmos** GPGPU (fluid & flame)
- Later volumes: shells & spirals, crystal & fracture

---

## Sources

- [Leaf-inspired Image Generation — lamm-mit collection (Hugging Face)](https://huggingface.co/collections/lamm-mit/leaf-inspired-image-generation)
- [lamm-mit/leaf-FLUX.1-dev](https://huggingface.co/lamm-mit/leaf-FLUX.1-dev) · [SDXL-leaf-inspired](https://huggingface.co/lamm-mit/SDXL-leaf-inspired)
- [Luu et al., *Generative AI Extracts Structure–Function Relationships from Plants for New Materials* (arXiv 2508.06591)](https://arxiv.org/html/2508.06591)
- [lamm-mit/LLMsxPlants (code & notebooks)](https://github.com/lamm-mit/LLMsxPlants)
- Runions et al., *Modeling and visualization of leaf venation patterns*, SIGGRAPH 2005
- Jones, *Characteristics of pattern formation in Physarum polycephalum*, 2010
