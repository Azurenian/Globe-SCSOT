# Globe ISCS Dashboard Web App

A comprehensive, modular web dashboard for Globe ISCS, built with Google Apps Script and Bootstrap 5. The dashboard provides visual analytics and management tools for submarine cable systems, featuring network availability monitoring, outage tracking, and incident ticket management.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [Technical Stack](#technical-stack)
5. [Network Availability Calculation](#network-availability-calculation)
6. [File Structure](#file-structure)
7. [Setup and Configuration](#setup-and-configuration)

---

## Project Overview

The Globe ISCS Dashboard is a web application designed to provide a comprehensive view of submarine cable system availability and incident management. It features a responsive interface with dark mode support, interactive data tables, and a modular design for easy expansion. The dashboard connects to Google Sheets as its data source, enabling real-time updates and collaborative data management.

---

## Architecture

The project follows a tiered architecture for clarity and maintainability:

- **Tier 0**: Core components (main HTML, sidebar, layout, global styles)
- **Tier 1**: Dashboard components (outage summary, network availability visualizations)
- **Tier 2**: Detailed views and management tools (ticket details, CRUD operations)
- **Frontend JS**: Modularized JavaScript files for each component
- **Backend JS**: Google Apps Script backend with tiered functionality

This structure separates concerns and allows for isolated development of features.

---

## Core Features

- **Network Availability Visualization**: Color-coded monthly availability metrics by cable system and segment
- **Outage Summary**: Aggregated view of outages by reason and cable system
- **Ticket Management**: Create, read, update, and delete incident tickets
- **Dark Mode**: Full dark mode support with preserved styling and readability
- **Search & Filtering**: Search functionality across tickets and outage data
- **Responsive Design**: Mobile-friendly interface with Bootstrap 5
- **Google Sheets Integration**: Direct connection to Google Sheets for data management

---

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Backend**: Google Apps Script (GAS)
- **Data Storage**: Google Sheets
- **Libraries**: GSAP for animations, Chart.js for visualizations
- **Icons**: Bootstrap Icons
- **Fonts**: Inter (Google Fonts)

---

## Network Availability Calculation

The system calculates network availability percentages using a sophisticated algorithm that properly handles overlapping downtime incidents.

### Mathematical Formula

Network Availability is calculated as:

```
Network Availability (%) = ((Total Time - Downtime) / Total Time) × 100
```

Where:

- **Total Time** = Total seconds in the month (days in month × 24 hours × 60 minutes × 60 seconds)
- **Downtime** = Total seconds the system was down, with overlapping incidents merged

### Overlapping Downtime Handling

When multiple incidents affect the same time period, the system uses an interval merging algorithm:

1. Sort all downtime intervals by start time
2. Merge overlapping intervals into continuous periods
3. Calculate total downtime based on merged intervals

### Example

For January 2025 (31 days), if a cable system has these incidents:

- Incident 1: Down from Jan 10, 1:00 PM to Jan 10, 5:00 PM (4 hours)
- Incident 2: Down from Jan 10, 3:00 PM to Jan 10, 7:00 PM (4 hours)

**Traditional method:** 4 hours + 4 hours = 8 hours of downtime
**Correct merged method:** Jan 10, 1:00 PM to Jan 10, 7:00 PM = 6 hours of downtime

**Total time in January:** 31 days × 24 hours × 60 minutes × 60 seconds = 2,678,400 seconds
**Downtime after merging:** 6 hours × 60 minutes × 60 seconds = 21,600 seconds

**Network Availability:** ((2,678,400 - 21,600) / 2,678,400) × 100 = 99.19%

This approach ensures accurate reporting even when multiple outages overlap in the same time period.

---

## File Structure

### Core Files (Tier 0)

- **main.html**: Entry point and container for all components
- **Code.js**: Google Apps Script entry point and routing
- **backend.js**: Core backend functionality in tiered structure
- **sidebar.html**: Navigation sidebar component
- **appstyles.html**: Global styles and theme definition
- **dashboard.html**: Dashboard container that includes Tier 1 components
- **settings.html**: Settings page for Google Sheets connection
- **help.html**: Help documentation and user guide

### Dashboard Components (Tier 1)

- **t1-dashboard.html**: Main dashboard view with cards and data visualization
- **frontend-outage-summary-js.html**: Outage summary table logic
- **frontend-network-availability-js.html**: Network availability visualization

### Management Components (Tier 2)

- **t2-tickets.html**: Ticket management modals and UI
- **frontend-ticketlist-js.html**: Ticket listing functionality
- **frontend-ticketmodal-js.html**: Ticket detail modal interactions
- **frontend-tickets-crud-js.html**: Create, read, update, delete operations

### Utility Components

- **frontend-dark-mode-js.html**: Dark mode toggle functionality
- **frontend-utils-js.html**: Shared utility functions
- **frontend-selection-js.html**: Selection logic for tables and lists
- **frontend-open-in-sheets-js.html**: Google Sheets linking
- **frontend-spreadsheet-name-js.html**: Spreadsheet name display
- **frontend-settings-js.html**: Settings page functionality

### Configuration

- **appsscript.json**: Google Apps Script project configuration
- **.clasp.json**: CLASP deployment configuration

---

## Setup and Configuration

1. **Prerequisites**:

   - Google account with access to Google Apps Script and Google Sheets
   - Basic understanding of HTML, CSS, JavaScript, and Google Apps Script

2. **Deployment**:

   - Clone repository
   - Use CLASP to push code to Google Apps Script
   - Deploy as web app
   - Configure spreadsheet connection in Settings

3. **Data Structure**:

   - Create required sheets in Google Sheets
   - Configure validation rules for Cable System and Affected Segment columns
   - Ensure ticket data follows expected format

4. **Usage**:

   - Access deployed web app URL
   - Configure data source on first run
   - Use dashboard to visualize and manage submarine cable data
