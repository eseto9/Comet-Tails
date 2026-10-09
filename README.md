# Comet Tails

**Sling · Steal · Bank.** A one-button orbital slingshot game in a single HTML file. No dependencies, no build step, no server.

Hold to grapple the nearest anchor star and orbit it. Release to fling off. Sweep up stardust to grow your tail, then graze the sun's corona to bank it. Payouts are triangular (a tail of *n* pays 1+2+…+n), so long tails pay hugely. But anything that crosses your tail severs it, and the sun's core is lethal.

## Play

Open `index.html` in any modern desktop or mobile browser. You can also enable GitHub Pages on this repo and play it at `https://<user>.github.io/comet-tails/`.

## Modes

| Mode | Description |
|---|---|
| **Solo** | 3 hulls and escalating waves: asteroids, rogue comets that hunt your tail, drifting stars. Bank a tail of 20+ to repair a hull. High scores are saved locally. |
| **Local Versus** | 2–4 players on one device, with optional bots. A 2-minute match whose last 20 s is a **Supernova**: the corona grows and banks pay ×2. |
| **Online Duel** | Peer-to-peer over WebRTC with up to 4 players, joined by copy/paste invite and answer codes. No server. |

## Controls

- **Solo / Online:** Space (or A, L, V, ↑, W), tap or hold anywhere, or any gamepad button
- **Local:** P1 `A` · P2 `L` · P3 `V` · P4 `↑` · gamepads · touch left/right half of the screen
- `Esc` / `P` pauses · `M` mutes

## Multiplayer mechanics

- **Tail slicing:** fly through a rival's tail to scatter their dust, then grab it.
- **Shared heat:** anchor stars overheat when orbited too long, for everyone.
- **Head bumps:** colliding heads knock both comets off their orbits.

## Netcode

The host runs the only real simulation, at a fixed 60 Hz. Guests send their button state every tick and receive 30 Hz snapshots.

- **Your own comet** is predicted locally with the same physics function and corrected against each snapshot by replaying unconfirmed inputs.
- **Other entities** are drawn about 100 ms in the past, blended between snapshots.
- **Fairness:** the host's own input is delayed by half the round-trip time, so hosting gives no advantage.
- **Leaving and joining:** a player who disconnects is replaced by a bot, and players can join a match already in progress.

## Testing online locally

1. Open `index.html` in two tabs.
2. Tab A: **Online Duel → Host a room → Create invite code**, then copy it.
3. Tab B: **Join a room**, paste the invite, then **Create answer code** and copy it.
4. Tab A: paste the answer and press **Connect**. Both players press **Ready**.

Across networks it uses public STUN servers. Two networks with strict NATs may need a TURN server.

## Tuning

All gameplay constants live in the `CFG` object at the top of the script.
