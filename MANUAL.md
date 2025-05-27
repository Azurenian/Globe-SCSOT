# Globe SCSOT User Manual

**Complete Guide to Using the Submarine Cable System Operations Tool**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Interface Overview](#interface-overview)
3. [Settings Configuration](#settings-configuration)
4. [Dashboard Features](#dashboard-features)
5. [Incident Management](#incident-management)
6. [Data Operations (CRUD)](#data-operations-crud)
7. [Reporting & Analytics](#reporting--analytics)
8. [Advanced Features](#advanced-features)
9. [Troubleshooting](#troubleshooting)
10. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Time Login

1. **Access the Application**

   - Open the web application URL provided by your administrator
   - The app will load with a professional interface showing the Globe logo

2. **Initial Setup Required**
   - If you see "Data source not set" warnings, proceed to Settings configuration
   - The application needs to be connected to your Google Sheet data source

### Understanding the Interface

The application has two main areas:

- **Left Sidebar**: Navigation menu with different sections
- **Main Content Area**: Where all the data and tools are displayed

---

## Interface Overview

### Sidebar Navigation

Click on any item in the left sidebar to navigate:

- **📊 Dashboard**: Main view with incident lists and details
- **⚙️ Settings**: Configure data sources and application settings
- **❓ Help**: Documentation and support information

### Top Navigation Bar

- **Spreadsheet Name**: Shows currently connected data source
- **Last Updated**: Timestamp of last data refresh
- **🔄 Refresh Button**: Updates all data from the source
- **🌙 Dark Mode Toggle**: Switch between light and dark themes
- **📄 Open in Sheets**: Direct link to your Google Sheet

### Status Indicators

- **Green Badge**: Successfully connected to data source
- **Red Text**: Connection issues or missing configuration
- **Loading Spinners**: Data is being fetched or updated

---

## Settings Configuration

### Step 1: Connect Your Data Source

1. **Navigate to Settings**

   - Click "⚙️ Settings" in the left sidebar

2. **Enter Google Sheet Information**

   - **Option A**: Copy your full Google Sheet URL
     ```
     Example: https://docs.google.com/spreadsheets/d/1ABC123.../edit
     ```
   - **Option B**: Copy just the Sheet ID (the long string of characters)
     ```
     Example: 1ABC123DEF456GHI789JKL...
     ```

3. **Save Configuration**
   - Paste the URL or ID in the "Google Sheet Link/ID" field
   - Click "Save & Apply"
   - Wait for the confirmation message

### Step 2: Configure Sheet Name (Optional)

1. **Custom Sheet Name**

   - If your data is not in the default sheet "MAJOR INCIDENTS_UPDATED"
   - Enter the exact name of your data sheet
   - Click "Save" next to the sheet name field

2. **Reset to Default**
   - Click "Reset to Default" to use "MAJOR INCIDENTS_UPDATED"

### Verification

After configuration:

- The top navigation should show your spreadsheet name
- Dashboard should load with your incident data
- No more "Data source not set" warnings

---

## Dashboard Features

### T1 - Incident List

**Purpose**: View and manage all incident tickets

#### Using the Incident List

1. **Viewing Tickets**

   - All unique ticket IDs are listed
   - Use pagination controls at the bottom to navigate through pages

2. **Search Functionality**

   - Type in the search box to filter tickets
   - Search works on Ticket ID text
   - Click the magnifying glass icon or press Enter to search

3. **Reset Search**

   - Click the reset button (↻) to clear filters

4. **Page Size Options**

   - Select 5, 10, or 20 items per page from the dropdown
   - Useful for managing large datasets

5. **Page Navigation**
   - Use numbered buttons to jump to specific pages
   - Use arrow buttons (‹ ›) for previous/next page
   - Or type a page number in the "Go to page" box

#### Incident Selection

- **Single Click**: Select a ticket (highlighted in blue)
- **Ctrl+Click**: Add multiple tickets to selection
- **Shift+Click**: Select a range of tickets
- **Double Click**: Open detailed view in modal

### T2 - Incident Details Modal

**Purpose**: View detailed information for a specific incident

#### Opening Details

1. **Double-click any ticket** in the T1 list
2. A modal window opens showing all data rows for that ticket

#### Using the Details Modal

1. **Search Within Ticket**

   - Use the search box to filter rows within the current ticket
   - Useful for tickets with many detail rows

2. **Pagination**

   - Details are paginated if there are many rows
   - Use page controls similar to the main list

3. **Row Selection**

   - Click rows to select them (for editing/deleting)
   - Multiple selection works like in the main list

4. **Closing the Modal**
   - Click the "×" in the top right
   - Click outside the modal
   - Press the Escape key

---

## Data Operations (CRUD)

### Creating New Data

#### Add New Ticket

1. **Access the Add Function**

   - In T1 section, click the green "+" button (Add Ticket)

2. **Fill in Required Information**

   - **Ticket ID**: Enter unique identifier (required)
   - **Start Date/Time**: Select date and time (required)
   - **End Date/Time**: Select date and time (required)
   - **Cable System**: Choose from dropdown (required)
   - **Affected Segment**: Choose from dropdown (required)
   - **Other fields**: Fill as needed

3. **Automatic Calculations**

   - **Duration**: Automatically calculated from start/end times
   - **Month**: Auto-filled from start date
   - **Year**: Auto-filled from start date

4. **Save the Ticket**
   - Click "Add Ticket" button
   - Wait for confirmation message

#### Add New Detail Row

1. **Open Ticket Details** (double-click a ticket)
2. **Click the green "+" button** (Add Row)
3. **Fill in the form** with all required fields
4. **Click "Add Row"** to save

### Reading/Viewing Data

#### Search and Filter

1. **Global Search**

   - Use search boxes in T1 and modal views
   - Searches across all visible text

2. **Pagination Navigation**
   - Use page controls to browse large datasets
   - Adjust page size for better viewing

#### Data Display

- **T1 List**: Shows unique ticket IDs only
- **T2 Modal**: Shows complete row data with all columns
- **Color coding**: Selected items highlighted in blue

### Updating Existing Data

#### Edit Ticket Details

1. **Select a Row**

   - In the T2 modal, click to select a row
   - Only one row can be edited at a time

2. **Click Edit Button**

   - Click the blue pencil icon (Edit Row)

3. **Modify Information**

   - Form pre-populated with current values
   - Change any fields as needed
   - Dropdown validations enforced

4. **Save Changes**
   - Click "Save Changes"
   - Confirmation message displayed

#### Important Notes

- **Validation**: Cable System and Affected Segment must match predefined lists
- **Date Formats**: Use the date/time pickers for consistency
- **Required Fields**: Fields marked with red asterisk (\*) must be filled

### Deleting Data

#### Delete Entire Tickets

1. **Select Tickets**

   - In T1 list, select one or more tickets
   - Use Ctrl+Click for multiple selection

2. **Click Delete Button**

   - Click the red trash icon (Delete Ticket)

3. **Confirm Deletion**
   - Review the list of tickets to be deleted
   - Click "Delete Selected Tickets" to confirm

#### Delete Detail Rows

1. **Select Rows**

   - In T2 modal, select one or more rows

2. **Click Delete Button**

   - Click the red trash icon (Delete Row)

3. **Confirm Deletion**
   - Review the rows to be deleted
   - Click "Delete Selected Rows" to confirm

---

## Reporting & Analytics

### A - Outage Summary Table

**Purpose**: Matrix view of outage counts by Cable System and RFO type

#### Understanding the Display

1. **Rows**: Different RFO (Reason for Outage) types
2. **Columns**: Different Cable Systems
3. **Values**: Count of incidents for each combination

#### Using Outage Summary

1. **Search RFO Types**

   - Use the search box to filter specific RFO types
   - Useful for focusing on specific outage categories

2. **Pagination**

   - Large numbers of RFO types are paginated
   - Adjust page size as needed

3. **Data Refresh**
   - Automatically updates when main data refreshes
   - Manual refresh using the main refresh button

### B - Network Availability

**Purpose**: Color-coded network availability percentages

#### Understanding the Display

1. **Color Coding**:

   - **Dark Blue**: ≥90% availability (excellent)
   - **Light Green**: 70-89% availability (good)
   - **Yellow**: 40-69% availability (fair)
   - **Orange**: 20-39% availability (poor)
   - **Red**: <20% availability (critical)

2. **Data Organization**:
   - **Rows**: Years
   - **Columns**: Months (Jan-Dec)
   - **Values**: Availability percentages

#### Using Network Availability

1. **Select Cable System**

   - Use the dropdown to choose which cable system to view

2. **Select Segment**

   - Choose which affected segment to analyze

3. **Pagination Through Years**

   - Use page controls to view different year ranges
   - Adjust "Years per page" setting

4. **Page Navigation**
   - Jump to specific year ranges using page controls

---

## Advanced Features

### Theme Switching

#### Dark Mode

1. **Toggle Switch**

   - Use the moon/sun icon in the top navigation
   - Theme preference is saved automatically

2. **Benefits**
   - Reduced eye strain in low-light environments
   - Professional appearance for extended use

### Data Refresh Options

#### Automatic Refresh

- **Universal Refresh**: Updates all sections simultaneously
- **Section Refresh**: Individual sections update as needed

#### Manual Refresh

1. **Refresh Button**: Click 🔄 in top navigation
2. **Full Page Refresh**: Use browser refresh or Ctrl+F5
3. **Right-click Refresh**: Right-click the refresh button for a full reload

### Keyboard Shortcuts

- **Ctrl+Click**: Multi-select items
- **Shift+Click**: Range select
- **Escape**: Close modals
- **Enter**: Submit forms/searches
- **Tab**: Navigate through form fields

### Export Options

#### Open in Sheets

1. **Direct Access**

   - Click "📄 Open in Sheets" button
   - Opens your Google Sheet in a new tab

2. **Full Editing**
   - Make bulk changes directly in Google Sheets
   - Refresh the app to see changes

---

## Troubleshooting

### Common Issues and Solutions

#### 1. "Data source not set" Error

**Symptoms**: Orange warning banner, no data loading

**Solutions**:

1. Go to Settings and configure Google Sheet ID
2. Verify the Sheet ID is correct (40+ characters)
3. Ensure you have access to the Google Sheet
4. Try pasting the full URL instead of just the ID

#### 2. No Data Appearing

**Symptoms**: Empty lists, "No tickets found" messages

**Possible Causes & Solutions**:

1. **Sheet Name Issue**:

   - Verify sheet name in Settings matches your data sheet
   - Default is "MAJOR INCIDENTS_UPDATED"

2. **Column Structure**:

   - Ensure your sheet has the required columns
   - First column should contain Ticket IDs

3. **Data Format**:
   - Check that dates are in proper format
   - Verify there's actual data in the sheet

#### 3. CRUD Operations Failing

**Symptoms**: "Failed to save" messages, edit operations not working

**Solutions**:

1. **Permissions**: Ensure you have edit access to the Google Sheet
2. **Data Validation**: Check dropdown values match sheet validation rules
3. **Required Fields**: Fill all required fields marked with \*
4. **Network**: Verify stable internet connection

#### 4. Search Not Working

**Symptoms**: Search returns no results or wrong results

**Solutions**:

1. **Reset Search**: Click the reset button (↻)
2. **Check Spelling**: Verify search terms are correct
3. **Case Sensitivity**: Search is case-insensitive, but check for typos
4. **Clear Cache**: Refresh the page completely

#### 5. Slow Performance

**Symptoms**: Long loading times, delayed responses

**Solutions**:

1. **Reduce Page Size**: Use smaller page sizes (5-10 items)
2. **Use Search**: Filter data to reduce load
3. **Clear Browser Cache**: Ctrl+Shift+Delete in most browsers
4. **Check Connection**: Ensure stable, fast internet

### Error Messages

#### Understanding Error Messages

1. **"Sheet ID not set"**: Need to configure data source in Settings
2. **"Sheet not found"**: Invalid sheet name or ID
3. **"No data found"**: Sheet exists but has no data
4. **"Failed to load"**: Network or permission issues
5. **"Invalid input"**: Form validation failed

#### Recovery Steps

1. **For Setup Errors**: Go to Settings and reconfigure
2. **For Data Errors**: Check your Google Sheet directly
3. **For Network Errors**: Check internet connection and try again
4. **For Permission Errors**: Contact your administrator

---

## Tips & Best Practices

### Data Management

1. **Consistent Naming**

   - Use consistent formats for Ticket IDs
   - Follow established naming conventions

2. **Required Field Strategy**

   - Always fill required fields (marked with \*)
   - Use dropdown values exactly as defined

3. **Date Handling**
   - Use the built-in date/time pickers
   - Ensure end times are after start times
   - Verify time zones are consistent

### Workflow Efficiency

1. **Search First**

   - Use search to find existing tickets before creating new ones
   - Filter data to focus on relevant items

2. **Batch Operations**

   - Select multiple items for deletion when possible
   - Use the sheet directly for bulk edits

3. **Regular Refresh**
   - Refresh data periodically for latest updates
   - Use automatic refresh when collaborating

### Performance Optimization

1. **Page Size Management**

   - Use smaller page sizes for faster loading
   - Increase page size when browsing is needed

2. **Targeted Searches**

   - Use specific search terms to reduce data load
   - Clear searches when done to see full dataset

3. **Theme Selection**
   - Dark mode may improve performance on some devices
   - Choose based on your environment and preference

### Collaboration

1. **Sheet Integration**

   - Use "Open in Sheets" for complex edits
   - Coordinate with team members on bulk changes

2. **Data Consistency**

   - Follow team standards for data entry
   - Verify dropdown values before submission

3. **Change Communication**
   - Refresh frequently when multiple users are active
   - Communicate major changes to team members

### Backup and Safety

1. **Google Sheets Backup**

   - Google automatically saves and versions your sheet
   - Access version history through Google Sheets

2. **Verification**

   - Double-check critical data entries
   - Verify calculations and dates

3. **Recovery**
   - Contact administrators for major issues
   - Use Google Sheets revision history if needed

---

## Appendix

### Required Sheet Columns

The application expects these columns in your Google Sheet:

| Column Name      | Type     | Required | Description       |
| ---------------- | -------- | -------- | ----------------- |
| Ticket ID        | Text     | Yes      | Unique identifier |
| Start Date/Time  | DateTime | Yes      | Incident start    |
| End Date/Time    | DateTime | Yes      | Incident end      |
| Duration         | Formula  | No       | Auto-calculated   |
| Month            | Text     | No       | Auto-filled       |
| Year             | Number   | No       | Auto-filled       |
| Cable System     | Dropdown | Yes      | Predefined list   |
| Affected Segment | Dropdown | Yes      | Predefined list   |
| RFO              | Text     | No       | Reason for outage |

### Data Validation Setup

For dropdown fields, create data validation in Google Sheets:

1. **Cable System Column**:

   - Select the entire column
   - Data → Data validation
   - Criteria: List of items
   - Add your cable systems

2. **Affected Segment Column**:
   - Select the entire column
   - Data → Data validation
   - Criteria: List of items
   - Add your segments

### Browser Support

| Browser | Minimum Version | Recommended |
| ------- | --------------- | ----------- |
| Chrome  | 90+             | Latest      |
| Firefox | 88+             | Latest      |
| Safari  | 14+             | Latest      |
| Edge    | 90+             | Latest      |

---

**End of Manual**

For additional support, contact your system administrator or refer to the technical documentation in LOGS.md.
