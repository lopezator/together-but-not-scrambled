<p align="center">
  <img src="icon.png" alt="together-but-not-scrambled icon" width="350" height="350">
</p>

# Together, but not scrambled

Puts an end to alphabetical order bias in your stand-up queue.

Shuffle your Assignee list once per day so the same person isn't stuck starting or ending the meeting every single day. The order is seeded by the browser's current local date, so it stays stable throughout the day and resets the next day.

**Fairness, powered by chaos.**

## Browser packages

This repository now includes a dedicated extension package for each browser:

- `chrome/` — unpack and load in Chrome or Chromium-based browsers
- `firefox/` — unpack and load in Firefox

Each folder is a complete extension bundle and can be loaded as an unpacked extension without any build step.

## Chrome

1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome/` folder

## Firefox

1. Open `about:addons`
2. Click the gear menu and choose "Install Add-on From File..."
3. Select the `firefox/manifest.json` file or load the unpacked folder from the Firefox extension page
4. If using the Firefox Add-ons Developer Hub flow, load the unpacked `firefox/` directory as the extension package

## Notes

The extension targets GitHub Project boards at:

- `https://github.com/orgs/*/projects/*`
- `https://github.com/users/*/projects/*`

The logic is kept identical across both browser bundles so the behavior stays consistent in Chrome and Firefox.
