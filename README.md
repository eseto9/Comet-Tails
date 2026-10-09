# Comet Tails

**Sling · Steal · Bank.** A one-button orbital slingshot game in a single HTML file. No dependencies, no build step, and no server needed to play.

## What's on screen

| | Looks like | What it does |
|---|---|---|
| **Peg** | cyan ring with a crosshair | **Hold** to grapple it and swing around. The peg you'd grab right now is ringed in your color. |
| **Stardust** | small gold sparkle | Fly through it to grow your tail. Dust near your comet drifts toward you. |
| **Prism** | big pink sparkle | Worth 3 stardust. |
| **Corona** | dashed ring around the sun | Graze it to **bank** your tail. A tail of *n* pays 1+2+…+n, so long tails pay hugely. The white core is lethal. |

Release the button to fling off in a straight line. Anything that crosses your tail severs it and scatters the dust.

## Play

Open `index.html` in any modern desktop or mobile browser. You can also enable **GitHub Pages** (Settings → Pages → `main` / root) and play at `https://eseto9.github.io/Comet-Tails/`.

## Strategy layer

| Feature | Modes | How it works |
|---|---|---|
| **Color sets** | all | Stardust comes in gold, ember and nebula. A tail that is 75%+ one color (5+ motes) banks for **×1.5**, and 100% one color (8+) for **×2**. Prisms take your tail's main color. Your comet shows the live set % under it. |
| **Unstable dust** | all | Flashing red, worth 5 motes, spawns near the corona or the edges. It decays out of your tail after 8 s unless you bank. |
| **Perk draft** | solo, co-op | After every wave, pick 1 of 3 team upgrades: Magnet+, Heat Sink, Tail Plating, Greed, Long Reach, Repair, Solar Flare, Deflector, Prismatic, Stabilizer. Choices replay exactly in the Daily ghost. |
| **Peg ownership** | versus | Orbit a peg for 1 s to paint it your color. Rivals overheat your pegs 2× faster, and each lap around your own peg adds +1 mote in your set color. |
| **Bounty** | versus | The leader wears a 👑. Slicing their tail instantly pays you half of what that tail would have banked. |

## Thrills

| Feature | What happens |
|---|---|
| **Near misses** | Skim a rock (+1 mote), the sun's core (+2, *Sungrazer*) or a black hole (+2, *Event Horizon*) without dying. |
| **Slingshot** | Let go near top speed for a SLINGSHOT callout, speed lines and a zoom punch. |
| **Slow motion** | Huge banks, perfect sets, bounties, boss kills and the final moment of a match slow time down (offline). Online it's a visual punch only, so the shared simulation stays fair. |
| **Boss waves** | Every 5th wave in solo/co-op. **The Devourer**: a giant hunter whose jaws are lethal; slice 4+ motes off its tail to wound it, or lure it into rocks or the sun. **The Singularity**: a drifting black hole that bends your flight and swallows dust; survive until it collapses into treasure. |
| **Map events** | Every ~30 s in every mode: Meteor Shower, Dust Bloom, Peg Blackout, Solar Flare (bigger corona). Mirrored in versus for fairness. |
| **Records** | 18 achievements and lifetime stats, saved locally. Open them from **Records** on the title screen. |
| **Spectating** | **Watch** a full 4-bot exhibition match from the title screen, or tick *Join as a spectator* to watch an online room without playing. |

## Modes

| Mode | Description |
|---|---|
| **Solo** | 3 hulls and escalating waves. Each wave has a visible objective (bank 8, 12, 16… stardust; every 5th wave: beat the boss). Clearing it opens the perk draft. Asteroids, rogue comets and drifting pegs ramp up as you go. Bank a tail of 20+ to repair a hull. |
| **Daily Constellation** | The same seeded sky for everyone each day. Your best run today is saved as input data and replayed as a white **ghost** to race. |
| **Local Versus** | 2–4 players on one device, with optional bots. A 2-minute match whose final 20 s is a **Supernova** (bigger corona, ×2 banks). |
| **Local Co-op: Comet Train** | Team up against the waves with a shared hull pool and no friendly fire. Teammates joined by the dashed link beam bank **together as one tail**, so 10 + 10 pays 210 instead of 55 + 55. |
| **Online** | Versus or Co-op for up to 4 players over WebRTC peer-to-peer, joined by copy/paste invite codes. With the optional relay, you can use **room codes** and **Quick Match** instead. |

## Controls

- **Solo / Online:** Space (or A, L, V, ↑, W), tap or hold anywhere, or any gamepad button
- **Local:** P1 `A` · P2 `L` · P3 `V` · P4 `↑` · gamepads · touch left/right half of the screen
- `Esc` / `P` pauses · `M` mutes

## Netcode

The host runs the only real simulation, at a fixed 60 Hz. Guests send their button state every tick and receive 30 Hz snapshots.

- **Your own comet** is predicted locally with the same physics function and corrected against each snapshot by replaying unconfirmed inputs.
- **Other entities** are drawn about 100 ms in the past, blended between snapshots.
- **Fairness:** the host's own input is delayed by half the round-trip time, so hosting gives no advantage.
- **Leaving and joining:** a player who disconnects is replaced by a bot, and players can join a match already in progress.

## Optional relay server (room codes, quick match, TURN)

`server/relay.js` is a small Node server that does matchmaking and WebRTC signalling only. Gameplay still flows peer-to-peer. It also serves the game with the relay URL pre-filled.

```bash
cd server
npm install
npm start
```

Then open `http://localhost:8787` and choose **Online → Room codes & Quick match**.

- **Deploy:** works on any Node host (Render, Fly.io, Railway, a VPS). Players then use `wss://your-host`, or set `CFG.RELAY_URL` in `index.html` to make it the default.
- **Strict networks:** set `ICE_SERVERS` to a JSON array that includes a TURN server, and the relay hands it to clients:
  ```bash
  ICE_SERVERS='[{"urls":"stun:stun.l.google.com:19302"},{"urls":"turn:turn.example.com:3478","username":"u","credential":"p"}]' npm start
  ```
- **Next step:** the simulation code has no DOM dependencies, so it could run on the server itself for server-authoritative ranked play.

## Testing online without a server

1. Open `index.html` in two tabs.
2. Tab A: **Online → Host a room → Create invite code**, then copy it.
3. Tab B: **Join a room**, paste the invite, then **Create answer code** and copy it.
4. Tab A: paste the answer and press **Connect**. The host can switch between Versus and Co-op in the lobby. Both players press **Ready**.

## Tuning

All gameplay constants live in the `CFG` object at the top of the script.
