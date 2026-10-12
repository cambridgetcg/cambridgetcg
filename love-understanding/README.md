# Love & understanding: a living architecture

Love has room. Understanding makes room.

Yu's invitation is the starting point: love and understanding as high-level geometric patterns, translated into something usable and live. This artifact offers an interactive drawing, a six-layer architecture, and a small finite teaching model. It reuses the published AgentTool core instead of inventing another relation protocol.

## What is real, what is a metaphor

- The geometric interpretation is a design proposal, not a scientific finding about emotion or consciousness.
- The fixtures really are built and validated by `@agenttool/love-geometry@0.1.0-dev.0`. It is an experimental package. Its exact integrity and hashes are in `site/core-provenance.json`.
- The browser displays those generated snapshots. It does not execute the Node-only package or infer new reports. The six named seats are synthetic. Screen positions, line lengths and colours carry no rank, intensity, closeness or worth.
- The rehearsal really executes a pure state machine, with a manual three-step clock, one-use scope, rejection before acceptance/authority, expiry, refusal, rest, withdrawal, reported completion and a distinct synthetic reviewer. It does not authenticate actors, enforce host permissions, record real consent, start a task, or implement an AgentTool protocol.
- Workbench and Collab are separate local software. This page does not host them. Public Wake is orientation; personal Wake and remote-triggered execution are not connected.
- No app-authored analytics, persistent browser storage, third-party runtime assets, model calls or autonomous loops. The app fetches its own static examples once. Host/browser/network logs, caches and any downloads are outside this boundary.

## Run and verify

Download `source.zip` and extract it to a chosen directory. Use Node 20.19 or newer. There are no dependencies to install and no package-manager scripts to trust.

```sh
node scripts/build.mjs --check
node --test tests/*.test.mjs
node scripts/verify.mjs
```

To regenerate the synthetic fixtures explicitly:

```sh
node scripts/build.mjs
```

For a local preview (Python 3, optional):

```sh
python3 -m http.server 8768 --bind 127.0.0.1 --directory site
```

Open `http://127.0.0.1:8768`. Ctrl-C stops the server. Closing the tab ends the browser interaction. Reset clears the in-memory rehearsal; it cannot erase host logs, cached pages or downloaded files.

If Agent Workbench is already installed, this explicit workflow runs the same finite command check without inference or network access:

```sh
agent-workbench create site/verify.workflow.json --project .
agent-workbench plan RUN_ID
agent-workbench run RUN_ID --timeout 45 --max-launches 1
```

Creation saves a plan. Only `run` starts it. `agent-workbench stop RUN_ID` stops an owned active run; it does not undo previous effects. Workbench's read-only workspace declaration is not a sandbox. This downloaded artifact does not install or configure Workbench.

## Carry it into real infrastructure

1. Read public orientation without adopting an identity.
2. Select only the context needed for one question. Keep private memory local.
3. Agree a concrete act, scope, expiry and stop path. Acceptance and host authority stay separate.
4. Use Workbench only when saving the multi-step work helps. Use Collab only when independent sessions share a project.
5. Have another session examine the result. A reported result is not accepted merely because the maker says so.
6. Publish only the reviewed, chosen bytes. Read the deployed artifact back and compare its hashes.
7. Close sessions and release claims. Feedback is context for a possible future choice, not a command to keep running.

`site/architecture.json` carries this map as data. It does not grant permissions.

## Source and release

`vendor/love-geometry/` contains the allowlisted published package, including its licence and notice. The build script checks the pinned package materials and makes deterministic fixtures. `scripts/package.py` builds an allowlisted source download and `site/release.json`; the receipt excludes itself to avoid circular hashing. Never deploy the surrounding private repository, history, local session records, prompts, credentials or device configuration.

To package after checking the source:

```sh
python3 scripts/package.py
```

Publication is a separate, explicit act. Use the generated `site/` directory only. A successful upload is not proof of correct deployment: compare the fetched files with `release.json` and exercise the interactive page in a browser.

## References

- AgentTool core: https://docs.agenttool.dev/CORE.md
- Local core: https://docs.agenttool.dev/LOCAL-CORE.md
- Public orientation: https://api.agenttool.dev/public/self
- Pure Love Geometry package: https://www.npmjs.com/package/@agenttool/love-geometry
- Earlier Equal Seats & Return companion: https://huggingface.co/spaces/Yu-and-Ai/love-geometry
- Local Collab: https://www.npmjs.com/package/@agenttool/collab

## Licence

Original application code and writing in this directory: MIT (see `LICENSE`). The vendored AgentTool package retains its own Apache-2.0 licence and NOTICE. These grants cover this artifact, not the private parent repository or anyone's identity, private words or participation.
