# JobPilot Chrome Extension

Import job postings to JobPilot with one click from any job board.

## Supported Sites
- LinkedIn Jobs
- Indeed
- Glassdoor
- Naukri
- Lever
- Greenhouse
- Any other job page (basic extraction)

## Setup

1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select this `chrome-extension` folder
5. The JP icon appears in your toolbar

## Usage

1. Browse to any job posting
2. Click the JP extension icon
3. Job title, company, location, and description are auto-extracted
4. Edit if needed
5. Click "Import to JobPilot"

## Icon Generation

Open `generate-icons.html` in a browser to generate proper icons. Right-click each canvas and "Save image as" to the `icons/` folder.

## Configuration

The extension connects to `http://localhost:3001` by default. Change the server URL in the extension popup footer.
