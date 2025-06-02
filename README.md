# Globe ISCS Dashboard Web App

A comprehensive, modular web dashboard for Globe ISCS, built with Google Apps Script and Bootstrap 5. The dashboard provides visual analytics and management tools for submarine cable systems, featuring network availability monitoring, outage tracking, and incident ticket management.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Technical Stack](#technical-stack)
5. [File Structure](#file-structure)
6. [Setup and Configuration](#setup-and-configuration)
7. [Deployment & Usage](#deployment--usage)
8. [Customization & Extensibility](#customization--extensibility)
9. [Changelog & Versioning](#changelog--versioning)
10. [Troubleshooting](#troubleshooting)
11. [Support & Contact](#support--contact)

---

## Project Overview

The Globe ISCS Dashboard is a web application designed to provide a comprehensive view of submarine cable system availability and incident management. It features a responsive interface with dark mode support, interactive data tables, and a modular design for easy expansion. The dashboard connects to Google Sheets as its data source, enabling real-time updates and collaborative data management.

**Key Goals:**

- Centralize monitoring and management of submarine cable system incidents
- Provide real-time analytics and visualizations for network availability and outages
- Enable CRUD operations for incident tickets
- Support both technical and non-technical users with an intuitive UI
- Ensure maintainability and extensibility for future enhancements

---

## Architecture

The project follows a tiered, modular architecture for clarity and maintainability:

- **Tier 0:** Core components (main HTML, sidebar, layout, global styles)
- **Tier 1:** Dashboard components (outage summary, network availability visualizations)
- **Tier 2:** Detailed views and management tools (ticket details, CRUD operations)
- **Frontend JS:** Modularized JavaScript files for each component (pagination, modals, selection, CRUD, etc.)
- **Backend JS:** Google Apps Script backend with tiered, well-documented functions

**Key Principles:**

- Separation of concerns: UI, logic, and data access are clearly separated
- Modularization: Each feature/component has its own HTML and JS file
- Maintainability: All functions and files are documented and organized
- Responsive design: Uses Bootstrap 5 for mobile and desktop compatibility
- Dark mode: Full support for light/dark themes, including logo and color adjustments

---

## Core Features

- **Dashboard Overview:**
  - Displays active spreadsheet, quick stats, and major incidents
  - Real-time data from Google Sheets
- **Incident Ticket Management:**
  - List, search, paginate, and manage incident tickets
  - Modal dialogs for ticket details, add/edit/delete operations
  - Multi-select and double-click support for efficient workflows
- **Network Availability Visualization:**
  - Interactive tables and charts for cable system availability by year/segment
  - Pagination and filtering for large datasets
- **Outage Summary:**
  - Aggregated outage data with search and pagination
  - Custom table styling for clarity and accessibility
- **Settings & Configuration:**
  - Link/unlink Google Sheets by ID
  - Set or reset the data sheet name
  - View current configuration and last updated timestamp
- **Dark Mode:**
  - Toggle between light and dark themes
  - Dynamic logo and color adjustments for accessibility
- **Help & Documentation:**
  - In-app help section with accordion-based navigation
  - Quick access to troubleshooting and support
- **Universal Refresh:**
  - One-click refresh for all dashboard data and UI components
- **Accessibility & UX:**
  - Keyboard navigation, ARIA roles, and color contrast compliance
  - Responsive layout for all screen sizes

---

## Technical Stack

- **Frontend:**
  - HTML5, CSS3 (Bootstrap 5), JavaScript (modular, ES6+)
  - Bootstrap Icons, Google Fonts (Inter)
  - GSAP (GreenSock) for animations
  - Chart.js for data visualizations
- **Backend:**
  - Google Apps Script (V8 runtime)
  - Integration with Google Sheets API
  - Modular backend (`backend.js`, `Code.js`) with tiered function structure
- **Deployment:**
  - Google Apps Script Web App (deployed via clasp and Apps Script editor)
  - Uses `.clasp.json` for local development and deployment

---

## File Structure

```
├── appsscript.json                # Apps Script project manifest
├── .clasp.json                    # clasp configuration for deployment
├── backend.js                     # Main backend logic (tiered, documented)
├── Code.js                        # Web app entry point and backend utilities
├── main.html                      # Main HTML template (includes all sections)
├── sidebar.html                   # Sidebar navigation and branding
├── appstyles.html                 # Custom CSS styles (modular, dark mode ready)
├── dashboard.html                 # Dashboard section (Tier 1)
├── t1-dashboard.html              # Dashboard widgets and ticket list (Tier 1)
├── t2-tickets.html                # Ticket modals and CRUD dialogs (Tier 2)
├── settings.html                  # Settings/configuration section
├── help.html                      # In-app help and documentation
├── frontend-*.js.html             # Modular frontend JS (pagination, CRUD, utils, etc.)
├── LOGS.md                        # Development logs and changelog
├── README.md                      # This file
```

**Frontend JS Modules:**

- `frontend-utils-js.html`: Universal refresh, reload, and utility functions
- `frontend-sidebar-js.html`: Sidebar navigation and section switching
- `frontend-ticketlist-js.html`: Ticket list pagination and search
- `frontend-ticketmodal-js.html`: Ticket details modal logic
- `frontend-selection-js.html`: List and modal selection logic
- `frontend-tickets-crud-js.html`: CRUD operations for tickets and table rows
- `frontend-dark-mode-js.html`: Dark mode toggle and logo switching
- `frontend-open-in-sheets-js.html`: Open linked sheet in new tab
- `frontend-spreadsheet-name-js.html`: Display active spreadsheet name
- `frontend-spreadsheet-last-updated-js.html`: Show last updated timestamp
- `frontend-network-availability-js.html`: Network availability table logic
- `frontend-outage-summary-js.html`: Outage summary table logic
- ...and more as needed

**Backend Structure:**

- `backend.js`: Tiered functions for sheet management, data access, and business logic
- `Code.js`: Web app entry point, HTML includes, and utility endpoints

---

## Setup and Configuration

### Prerequisites

- Google account with access to Google Apps Script and Google Sheets
- [Node.js](https://nodejs.org/) and [clasp](https://github.com/google/clasp) (for local development)

### Initial Setup

1. **Clone the repository:**

   ```
   git clone <repo-url>
   cd globe-iscs
   ```

2. **Install clasp (if not already):**

   ```
   npm install -g @google/clasp
   ```

3. **Login to clasp:**

   ```
   clasp login
   ```

4. **Pull or push project files as needed:**

   ```
   clasp pull   # To fetch latest from Apps Script
   clasp push   # To deploy local changes
   ```

5. **Set up Google Sheet:**

   - Create a Google Sheet with the required structure for incident data
   - Note the Sheet ID (from the URL)

### Configuration in the Web App

- Open the deployed web app URL
- Go to **Settings**
- Enter the Google Sheet ID and (optionally) the data sheet name
- Save configuration; the app will validate and connect to the sheet

---

## Deployment & Usage

### Deploy as Web App

1. Open the project in the [Apps Script Editor](https://script.google.com/)
2. Click **Deploy > New deployment**
3. Select **Web app**
4. Set access to **Anyone** (or as required)
5. Deploy and copy the web app URL

### Using the Dashboard

- Access the web app via the deployment URL
- Use the sidebar to navigate between Dashboard, Help, and Settings
- Manage tickets, view network availability, and review outage summaries
- Use the refresh button to reload all data from the linked Google Sheet
- Toggle dark mode for accessibility

---

## Customization & Extensibility

- **Add new dashboard widgets:** Create new HTML/JS modules and include them in `main.html`
- **Extend backend logic:** Add new functions to `backend.js` and expose them as needed
- **Modify data structure:** Update Google Sheet columns and adjust frontend/backend parsing accordingly
- **Styling:** Edit `appstyles.html` for custom CSS; all styles are modular and dark mode compatible
- **Localization:** All UI text is in HTML/JS and can be updated for other languages

---

## Changelog & Versioning

See `LOGS.md` for a detailed development log and version history.

- Current version: **scstov-dash_v2.fl** (see sidebar and help section)
- Major updates include modularization, dark mode, accessibility, and full CRUD support

---

## Troubleshooting

- **Sheet not linked:** Ensure the correct Google Sheet ID is entered in Settings
- **Data not updating:** Use the refresh button or check Google Sheet permissions
- **UI issues:** Clear browser cache or try a different browser
- **Script errors:** Check Apps Script logs for details
- **Access issues:** Ensure deployment permissions are set to allow access

---

## Support & Contact

For technical support, feature requests, or bug reports, please contact the project maintainer or open an issue in the repository.

---

© 2025 Globe SCSOT. All rights reserved.
