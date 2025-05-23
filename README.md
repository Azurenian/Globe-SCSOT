# Globe ISCS Dashboard Web App

## Overview

The Globe International Submarine Cable System (ISCS) Dashboard is a comprehensive monitoring and management tool designed to track submarine cable system availability, outages, and incidents. Built as a Google Apps Script web application, it provides real-time data visualization, incident tracking, and historical analysis tools to help maintain optimal network operations.

**Version:** scstov-dash_v1.a

## Features

### 1. Dashboard Overview

- **Ticket Management**: Create, view, edit and delete incident tickets
- **Network Availability Monitoring**: Monthly uptime visualization with color-coded indicators
- **Outage Summary Analysis**: Cross-tabulated view of outages by reason and cable system
- **Universal Search**: Search capabilities across all data sections
- **Responsive Design**: Bootstrap 5-based responsive interface

### 2. Technical Capabilities

- **Google Sheets Integration**: Dynamic data storage and retrieval
- **Modular Architecture**: Separation of concerns with modularized frontend/backend
- **Dark Mode Support**: Complete dark mode implementation with persistent settings
- **Real-time Updates**: Universal refresh mechanism across all dashboard components
- **Advanced Selection**: Multi-select capabilities with keyboard shortcuts
- **Pagination**: Advanced pagination with customizable page sizes

## Architecture

### Frontend Components

- **HTML Templates**: Modularized HTML files for each section
- **JavaScript Modules**: Separated into functional components:
  - `frontend-utils-js.html`: Core utility functions
  - `frontend-sidebar-js.html`: Navigation and section management
  - `frontend-ticketlist-js.html`: Ticket listing and pagination
  - `frontend-ticketmodal-js.html`: Modal dialog for ticket details
  - `frontend-selection-js.html`: Selection logic for tickets and entries
  - `frontend-tickets-crud-js.html`: CRUD operations for tickets
  - `frontend-outage-summary-js.html`: Outage summary table logic
  - `frontend-network-availability-js.html`: Network availability visualization

### Backend Structure

- **Code.js**: Main entry point and request routing
- **backend.js**: Three-tiered structure:
  1. **Core and Utilities**: Sheet access, configuration management
  2. **Tickets and Tables**: Data retrieval and manipulation
  3. **CRUD Operations**: Create, read, update, delete functionality

### Data Storage

- Google Sheets integration with configurable sheet ID and name
- Cached data retrieval for performance optimization
- Script Properties for persistent configuration

## Setup and Installation

### Prerequisites

- Google account with access to Google Apps Script
- Google Sheets for data storage
- ClaspJS (optional for local development)

### Deployment Steps

1. **Clone Repository**:

   ```
   git clone https://github.com/your-repo/globe-iscs.git
   cd globe-iscs
   ```

2. **Google Apps Script Deployment**:

   - Create new Google Apps Script project
   - Copy files into project or use ClaspJS to push
   - Deploy as web app with appropriate permissions

3. **Configuration**:

   - Create a Google Sheet with the required structure (see below)
   - Configure the app by visiting the Settings page and entering your Sheet ID

### Required Sheet Structure

The primary data sheet ("MAJOR INCIDENTS_UPDATED" by default) should include:

- Ticket ID (column A)
- Start Date/Time (column B)
- End Date/Time (column C)
- Duration (column D)
- Cable System (with data validation)
- Affected Segment (with data validation)
- RFO (Reason For Outage)
- Month and Year columns
- Additional detail columns as needed

## Development Guide

### Local Development

1. Install ClaspJS: `npm install -g @google/clasp`
2. Login: `clasp login`
3. Clone existing project: `clasp clone <scriptId>`
4. Make changes locally
5. Push changes: `clasp push`

### Code Structure

- **HTML Files**: Organized by feature and functionality
- **JavaScript Files**: Modularized for frontend and backend logic
- **CSS Files**: Global and component-specific styles
- **Google Apps Script Files**: Server-side logic and configuration

### Best Practices

- Keep concerns separated: HTML for structure, CSS for styling, JS for behavior
- Comment code for clarity, especially in complex functions
- Test changes in a development environment before deploying
- Use version control (e.g., Git) for tracking changes and collaboration

## Troubleshooting

- **Common Issues**:
  - Deployment errors: Check Google Apps Script permissions and settings
  - Data not updating: Ensure Google Sheets are correctly linked and accessible
  - Script timeouts: Optimize code for performance, reduce data volume if possible

- **Debugging Tips**:
  - Use `Logger.log()` in Google Apps Script to output debug information
  - Check browser console for frontend JavaScript errors
  - Validate data formats and types, especially when interacting with Google Sheets

## Support

For issues and feature requests, please use the GitHub repository's issue tracker. For questions and discussions, use the repository's discussions section or contact the maintainer.

---

**Disclaimer**: This project is not affiliated with or endorsed by Globe Telecom. It is an independent initiative for monitoring and managing submarine cable systems. Use at your own risk.
