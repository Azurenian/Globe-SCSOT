// ==========================================
// TIER 0: Core and Utilities
// ==========================================

/**
 * Gets the Sheet ID from script properties
 * @returns {string} The current Google Sheet ID
 * @throws {Error} If Sheet ID is not set
 */
function getSheetId() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SHEET_ID');
  if (!id) throw new Error('Sheet ID not set. Please set it in Settings.');
  return id;
}

/**
 * Gets the data sheet name from script properties or returns the default
 * @returns {string} The data sheet name
 */
function getSheetName() {
  var props = PropertiesService.getScriptProperties();
  var name = props.getProperty('SHEET_NAME');
  return name || 'MAJOR INCIDENTS_UPDATED'; // Default for backward compatibility
}

/**
 * Sets the data sheet name in PropertiesService
 * @param {string} sheetName - Name of the sheet to use for data
 * @returns {boolean} Success status
 * @throws {Error} If sheetName is invalid
 */
function setSheetName(sheetName) {
  if (!sheetName || sheetName.trim() === '') 
    throw new Error('Invalid Sheet Name: The sheet name cannot be empty.');
  
  // Verify the sheet exists in the current spreadsheet
  try {
    const ss = SpreadsheetApp.openById(getSheetId());
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      // More specific error with guidance
      throw new Error('Sheet "' + sheetName + '" does not exist in the connected spreadsheet. Please check the spelling and try again, or open the spreadsheet to verify available sheet names.');
    }
  } catch (e) {
    if (String(e).includes('Sheet ID not set')) {
      // Skip validation if no spreadsheet is connected yet
    } else {
      // Re-throw with clearer message if possible
      if (e.message && !e.message.includes('does not exist')) {
        throw new Error('Error verifying sheet name: ' + e.message);
      } else {
        throw e; // Otherwise re-throw the original error
      }
    }
  }
  
  PropertiesService.getScriptProperties().setProperty('SHEET_NAME', sheetName);
  return true;
}

/**
 * Resets the sheet name to the default value
 * @returns {string} The default sheet name
 */
function resetSheetName() {
  var defaultName = 'MAJOR INCIDENTS_UPDATED';
  PropertiesService.getScriptProperties().deleteProperty('SHEET_NAME');
  return defaultName;
}

/**
 * Returns the current data sheet name (for UI display)
 * @returns {string} The current sheet name
 */
function getCurrentSheetName() {
  return getSheetName();
}

/**
 * Sets the Sheet ID in PropertiesService
 * @param {string} sheetId - Google Sheet ID to save
 * @returns {boolean} Success status
 * @throws {Error} If sheetId is invalid
 */
function setSheetId(sheetId) {
  if (!sheetId || sheetId.length < 20) throw new Error('Invalid Sheet ID.');
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', sheetId);
  return true;
}

/**
 * Removes the Sheet ID from PropertiesService
 * @returns {boolean} Success status
 */
function removeSheetId() {
  PropertiesService.getScriptProperties().deleteProperty('SHEET_ID');
  return true;
}

/**
 * Retrieves the value of a specific cell from a given sheet
 * @param {string} sheetName - The name of the sheet
 * @param {string} cellId - The A1 notation of the cell (e.g., "A1")
 * @returns {*} The value of the specified cell
 * @throws {Error} If the specified sheet does not exist
 */
function getCellValue(sheetName, cellId) {
  const ss = SpreadsheetApp.openById(getSheetId());
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found.`);
  }
  const range = sheet.getRange(cellId);
  return range.getValue();
}

/**
 * Retrieves all values from a given sheet, with caching
 * @param {string} sheetName - The name of the sheet to retrieve values from
 * @returns {Array[]} 2D array of cell display values
 * @throws {Error} If the specified sheet does not exist
 */
function getSheetVal(sheetName) {
  // If sheetName is the default value token, use the configured sheet name
  if (sheetName === 'MAJOR INCIDENTS_UPDATED') {
    sheetName = getSheetName();
  }
  
  var cache = CacheService.getScriptCache();
  var cacheKey = 'sheet_' + sheetName;
  var cached = cache.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  const ss = SpreadsheetApp.openById(getSheetId());
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found.`);
  }
  var values = sheet.getDataRange().getDisplayValues();
  cache.put(cacheKey, JSON.stringify(values), 120); // Cache for 2 minutes
  return values;
}

/**
 * Retrieves all data from all sheets in the spreadsheet
 * @returns {Object} An object mapping sheet names to their 2D array of values
 */
function getAllSheetsData() {
  const ss = SpreadsheetApp.openById(getSheetId());
  const sheets = ss.getSheets();
  const allData = {};
  sheets.forEach(sheet => {
    allData[sheet.getName()] = sheet.getDataRange().getValues();
  });
  return allData;
}

/**
 * Invalidates all relevant sheet caches
 */
function invalidateAllSheetCaches() {
  var cache = CacheService.getScriptCache();
  cache.remove('sheet_' + getSheetName());
  cache.remove('sheet_MAJOR INCIDENTS_UPDATED'); // For backward compatibility
}

/**
 * Returns the current Google Sheet ID from PropertiesService
 * @returns {string|null} The Sheet ID or null if not set
 */
function getCurrentSheetId() {
  var props = PropertiesService.getScriptProperties();
  return props.getProperty('SHEET_ID') || null;
}

/**
 * Returns the name of the current Google Spreadsheet
 * @returns {string|null} The Spreadsheet name or null if not available
 */
function getCurrentSpreadsheetName() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('SHEET_ID');
  if (!sheetId) return null;
  try {
    var ss = SpreadsheetApp.openById(sheetId);
    return ss.getName();
  } catch (e) {
    return null;
  }
}

/**
 * Returns the last updated timestamp of the spreadsheet
 * @returns {string|null} ISO string of last update time or null
 */
function getCurrentSpreadsheetLastUpdated() {
  var props = PropertiesService.getScriptProperties();
  var sheetId = props.getProperty('SHEET_ID');
  if (!sheetId) return null;
  try {
    var ss = SpreadsheetApp.openById(sheetId);
    var lastUpdated = ss.getLastUpdated();
    return lastUpdated.toISOString();
  } catch (e) {
    return null;
  }
}

// ==========================================
// TIER 1: Tickets and Tables
// ==========================================

/**
 * Returns a paginated, searchable list of unique tickets
 * @param {string} search - Search string to filter tickets
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @returns {{tickets: string[], total: number, sheetIdError: boolean}} Paginated tickets and metadata
 */
function getTicketListPaged(search, page, pageSize) {
  try {
    // Use the configured sheet name from PropertyService
    const data = getSheetVal(getSheetName());
    if (data.length === 0) return { tickets: [], total: 0, sheetIdError: false };
    const startIdx = (typeof data[0][0] === 'string' && data[0][0].toLowerCase().includes('ticket')) ? 1 : 0;
    const seen = new Set();
    let tickets = [];
    for (let i = startIdx; i < data.length; i++) {
      const val = data[i][0];
      if (val !== undefined && val !== '' && !seen.has(val)) {
        if (!search || search.trim() === '' || String(val).toLowerCase().includes(search.trim().toLowerCase())) {
          tickets.push(val);
        }
        seen.add(val);
      }
    }
    const total = tickets.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = tickets.slice(start, end);
    return { tickets: paged, total, sheetIdError: false };
  } catch (err) {
    if (err && String(err).includes('Sheet ID not set')) {
      return { tickets: [], total: 0, sheetIdError: true };
    }
    throw err;
  }
}

/**
 * Returns rows and columns for a given Ticket ID
 * @param {string} ticketId - The Ticket ID to search for
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @param {string} search - Search string to filter rows
 * @returns {Object} { columns: string[], rows: any[][], total: number, error: string|null }
 */
function getTicketDetailsById(ticketId, page, pageSize, search) {
  try {
    if (!ticketId) return { columns: [], rows: [], total: 0, error: 'No Ticket ID provided.' };
    // Use the configured sheet name from PropertyService
    const data = getSheetVal(getSheetName());
    if (!data || data.length === 0) return { columns: [], rows: [], total: 0, error: 'No data found.' };
    const columns = data[0];
    let rows = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === String(ticketId).trim()) {
        if (!search || search.trim() === '' || data[i].some(cell => String(cell).toLowerCase().includes(search.trim().toLowerCase()))) {
          rows.push(data[i]);
        }
      }
    }
    const total = rows.length;
    if (page && pageSize) {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      rows = rows.slice(start, end);
    }
    if (rows.length === 0) return { columns, rows: [], total: 0, error: 'No data found for this Ticket ID.' };
    return { columns, rows, total, error: null };
  } catch (err) {
    return { columns: [], rows: [], total: 0, error: err.message || 'Unknown error.' };
  }
}

/**
 * Returns summary table of RFO counts per Cable System
 * @returns {Object} { cableSystems: string[], rfoTypes: string[], counts: Object, error: string|null, sheetIdError: boolean }
 */
function getOutageSummaryTable() {
  try {
    // Use the configured sheet name from PropertyService
    const data = getSheetVal(getSheetName());
    if (!data || data.length === 0) return { cableSystems: [], rfoTypes: [], counts: {}, error: 'No data found.', sheetIdError: false };
    const columns = data[0];
    const cableSystemIdx = columns.findIndex(c => String(c).toLowerCase() === 'cable system');
    const rfoIdx = columns.findIndex(c => String(c).toLowerCase() === 'rfo');
    if (cableSystemIdx === -1 || rfoIdx === -1) return { cableSystems: [], rfoTypes: [], counts: {}, error: 'Missing columns.', sheetIdError: false };
    const cableSystems = getDropdownOptions().cableSystem;
    const rfoSet = new Set();
    const counts = {};
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const cable = row[cableSystemIdx];
      const rfo = row[rfoIdx];
      if (!cable || !rfo) continue;
      rfoSet.add(rfo);
      if (!counts[rfo]) counts[rfo] = {};
      if (!counts[rfo][cable]) counts[rfo][cable] = 0;
      counts[rfo][cable]++;
    }
    const rfoTypes = Array.from(rfoSet);
    return { cableSystems, rfoTypes, counts, error: null, sheetIdError: false };
  } catch (err) {
    if (err && String(err).includes('Sheet ID not set')) {
      return { cableSystems: [], rfoTypes: [], counts: {}, error: err.message, sheetIdError: true };
    }
    return { cableSystems: [], rfoTypes: [], counts: {}, error: err.message || 'Unknown error.', sheetIdError: false };
  }
}

/**
 * Returns network availability data per cable system, segment, year, and month
 * @returns {Object} { cableSystems, segments, years, data, error, sheetIdError }
 */
function getNetworkAvailabilityData() {
  try {
    // Use the configured sheet name from PropertyService
    const data = getSheetVal(getSheetName());
    if (!data || data.length === 0) return { cableSystems: [], segments: [], years: [], data: {}, error: 'No data found.', sheetIdError: false };
    const columns = data[0].map(c => String(c).toLowerCase());
    const csIdx = columns.findIndex(c => c === 'cable system');
    const segIdx = columns.findIndex(c => c.includes('affected segment'));
    const startIdx = columns.findIndex(c => c.includes('start date'));
    const endIdx = columns.findIndex(c => c.includes('end date'));
    if (csIdx === -1 || segIdx === -1 || startIdx === -1 || endIdx === -1) return { cableSystems: [], segments: [], years: [], data: {}, error: 'Missing columns.', sheetIdError: false };
    
    const dropdowns = getDropdownOptions();
    const csArr = dropdowns.cableSystem || [];
    const segArr = dropdowns.affectedSegment || [];
    const allYears = new Set();
    
    // Gather all downtime events
    const events = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let cs = String(row[csIdx] || '').trim();
      let seg = String(row[segIdx] || '').trim();
      if (!cs || !seg) continue;
      const start = new Date(row[startIdx]);
      const end = new Date(row[endIdx]);
      if (isNaN(start) || isNaN(end) || end <= start) continue;
      
      // For each month/year in this event
      let cur = new Date(start);
      while (cur <= end) {
        const year = cur.getFullYear();
        const month = cur.getMonth();
        allYears.add(year);
        
        // Compute start/end for this month
        const monthStart = new Date(year, month, 1, 0, 0, 0);
        const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
        const overlapStart = cur > monthStart ? cur : monthStart;
        const overlapEnd = end < monthEnd ? end : monthEnd;
        
        if (overlapEnd > overlapStart) {
          events.push({ cs, seg, year, month, start: overlapStart, end: overlapEnd });
        }
        
        cur = new Date(year, month + 1, 1, 0, 0, 0);
      }
    }
    
    // Build data structure
    const result = {};
    const yearArr = Array.from(allYears).sort();
    
    for (const cs of csArr) {
      result[cs] = {};
      for (const seg of segArr) {
        result[cs][seg] = {};
        for (const year of yearArr) {
          result[cs][seg][year] = {};
          
          for (let m = 0; m < 12; m++) {
            // Total seconds in month
            const daysInMonth = new Date(year, m + 1, 0).getDate();
            const totalSec = daysInMonth * 24 * 60 * 60;
            
            // Get all downtime intervals for this cs/seg/year/month
            const intervals = events
              .filter(ev => ev.cs === cs && ev.seg === seg && ev.year === year && ev.month === m)
              .map(ev => ({
                start: ev.start.getTime(),
                end: ev.end.getTime()
              }))
              .sort((a, b) => a.start - b.start);
            
            // Merge overlapping intervals
            const mergedIntervals = [];
            for (const interval of intervals) {
              if (mergedIntervals.length === 0 || interval.start > mergedIntervals[mergedIntervals.length - 1].end) {
                // No overlap, add the new interval
                mergedIntervals.push(interval);
              } else {
                // Overlap found, merge with the last interval
                mergedIntervals[mergedIntervals.length - 1].end = 
                  Math.max(mergedIntervals[mergedIntervals.length - 1].end, interval.end);
              }
            }
            
            // Calculate total downtime from merged intervals
            let downtime = 0;
            for (const interval of mergedIntervals) {
              downtime += Math.floor((interval.end - interval.start) / 1000);
            }
            
            let percent = 100;
            if (totalSec > 0) {
              percent = ((totalSec - downtime) / totalSec) * 100;
              if (percent < 0) percent = 0;
              if (percent > 100) percent = 100;
            }
            result[cs][seg][year][m] = percent;
          }
        }
      }
    }
    
    return { cableSystems: csArr, segments: segArr, years: yearArr, data: result, error: null, sheetIdError: false };
  } catch (err) {
    if (err && String(err).includes('Sheet ID not set')) {
      return { cableSystems: [], segments: [], years: [], data: {}, error: err.message, sheetIdError: true };
    }
    return { cableSystems: [], segments: [], years: [], data: {}, error: err.message || 'Unknown error.', sheetIdError: false };
  }
}

/**
 * Gets paginated data for the Major Incidents table with search functionality
 * @param {number} page - Page number (1-based)
 * @param {number} pageSize - Number of items per page
 * @param {string} search - Search query
 * @returns {Object} { columns: string[], rows: any[][], total: number, error: string|null, sheetIdError: boolean }
 */
function getMajorIncidentsTableData(page = 1, pageSize = 10, search = "") {
  try {
    // Use the configured sheet name from PropertyService
    const data = getSheetVal(getSheetName());
    if (!data || data.length === 0) {
      return { columns: [], rows: [], total: 0, error: 'No data found.', sheetIdError: false };
    }

    const columns = data[0];
    let rows = data.slice(1); // Skip header row

    // Apply search filter
    if (search && search.trim() !== "") {
      const searchTerm = search.trim().toLowerCase();
      rows = rows.filter(row => 
        row.some(cell => 
          String(cell).toLowerCase().includes(searchTerm)
        )
      );
    }

    const total = rows.length;
    
    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedRows = rows.slice(startIndex, endIndex);

    return {
      columns,
      rows: paginatedRows,
      total,
      error: null,
      sheetIdError: false
    };
  } catch (err) {
    if (err && String(err).includes('Sheet ID not set')) {
      return { columns: [], rows: [], total: 0, error: err.message, sheetIdError: true };
    }
    return { columns: [], rows: [], total: 0, error: err.message || 'Unknown error.', sheetIdError: false };
  }
}

/**
 * Gets the table structure (column headers) for Major Incidents
 * @returns {Object} { columns: string[], error: string|null }
 */
function getMajorIncidentsTableStructure() {
  try {
    // Use the configured sheet name from PropertyService
    const data = getSheetVal(getSheetName());
    if (!data || data.length === 0) {
      return { columns: [], error: 'No data found.' };
    }

    return {
      columns: data[0],
      error: null
    };
  } catch (err) {
    return { columns: [], error: err.message || 'Unknown error.' };
  }
}

// ==========================================
// TIER 2: CRUD Operations
// ==========================================

/**
 * Adds a new ticket to the sheet
 * @param {string} ticketId - The Ticket ID to add
 * @param {string[]} rowData - Complete row data with all columns
 * @returns {Object} { success: boolean, error: string|null }
 */
function addTableRow(ticketId, rowData) {
  try {
    if (!ticketId || !Array.isArray(rowData)) return { success: false, error: 'Invalid input.' };
    
    // Backend validation for dropdowns
    var opts = getDropdownOptions();
    var columns = getSheetVal(getSheetName())[0];
    
    // Validate dropdown values
    for (var i = 0; i < columns.length; i++) {
      if (typeof rowData[i] === 'string') rowData[i] = rowData[i].trim();
      var label = String(columns[i]).trim().toLowerCase();
      if (label === 'cable system' && !opts.cableSystem.includes(rowData[i])) {
        return { success: false, error: 'Cable System must be one of: ' + opts.cableSystem.join(', ') };
      }
      if (label === 'affected segment' && !opts.affectedSegment.includes(rowData[i])) {
        return { success: false, error: 'Affected Segment must be one of: ' + opts.affectedSegment.join(', ') };
      }
    }
    
    const ss = SpreadsheetApp.openById(getSheetId());
    const sheetName = getSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found.' };
    
    // Ensure Ticket ID in first column
    rowData[0] = ticketId.trim();
    while (rowData.length < sheet.getLastColumn()) rowData.push('');
    sheet.appendRow(rowData);
    
    // Invalidate cache
    var cache = CacheService.getScriptCache();
    cache.remove('sheet_' + sheetName);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Edits a row in the ticket table
 * @param {string} ticketId - The Ticket ID whose row is to be edited
 * @param {number} rowIndex - 0-based index among rows for this ticketId
 * @param {string[]} rowData - Array of new cell values for the row
 * @returns {Object} { success: boolean, error: string|null }
 */
function editTableRow(ticketId, rowIndex, rowData) {
  try {
    if (!ticketId || typeof rowIndex !== 'number' || !Array.isArray(rowData)) 
      return { success: false, error: 'Invalid input.' };
    
    // Backend validation for dropdowns
    var opts = getDropdownOptions();
    var columns = getSheetVal(getSheetName())[0];
    
    // Validate dropdown values
    for (var i = 0; i < columns.length; i++) {
      if (typeof rowData[i] === 'string') rowData[i] = rowData[i].trim();
      var label = String(columns[i]).trim().toLowerCase();
      if (label === 'cable system' && !opts.cableSystem.includes(rowData[i])) {
        return { success: false, error: 'Cable System must be one of: ' + opts.cableSystem.join(', ') };
      }
      if (label === 'affected segment' && !opts.affectedSegment.includes(rowData[i])) {
        return { success: false, error: 'Affected Segment must be one of: ' + opts.affectedSegment.join(', ') };
      }
    }
    
    const ss = SpreadsheetApp.openById(getSheetId());
    const sheetName = getSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found.' };
    const data = sheet.getDataRange().getDisplayValues();
    let found = -1, count = -1;
    
    // Find the specific row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].trim() === ticketId.trim()) {
        count++;
        if (count === rowIndex) { found = i+1; break; }
      }
    }
    if (found === -1) return { success: false, error: 'Row not found.' };
    
    // Update row
    for (let c = 0; c < rowData.length; c++) {
      sheet.getRange(found, c+1).setValue(rowData[c]);
    }
    
    // Invalidate cache
    var cache = CacheService.getScriptCache();
    cache.remove('sheet_' + sheetName);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes tickets from the sheet
 * @param {string[]} ticketIds - Array of Ticket IDs to delete
 * @returns {Object} { success: boolean, error: string|null }
 */
function deleteTickets(ticketIds) {
  try {
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) 
      return { success: false, error: 'No tickets selected.' };
    
    const ss = SpreadsheetApp.openById(getSheetId());
    const sheetName = getSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found.' };
    const data = sheet.getDataRange().getDisplayValues();
    let rowsToDelete = [];
    
    for (let i = 1; i < data.length; i++) {
      if (ticketIds.includes(data[i][0].trim())) 
        rowsToDelete.push(i+1); // +1 for 1-based
    }
    
    // Delete from bottom up
    rowsToDelete.sort((a,b)=>b-a).forEach(r => sheet.deleteRow(r));
    
    // Invalidate cache
    var cache = CacheService.getScriptCache();
    cache.remove('sheet_' + sheetName);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes rows in the ticket table for a given Ticket ID
 * @param {string} ticketId - The Ticket ID whose rows are to be deleted
 * @param {number[]} rowIndices - 0-based indices among rows for this ticketId
 * @returns {Object} { success: boolean, error: string|null }
 */
function deleteTableRows(ticketId, rowIndices) {
  try {
    if (!ticketId || !Array.isArray(rowIndices) || rowIndices.length === 0) 
      return { success: false, error: 'Invalid input.' };
    
    const ss = SpreadsheetApp.openById(getSheetId());
    const sheetName = getSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found.' };
    const data = sheet.getDataRange().getDisplayValues();
    let foundRows = [];
    let count = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].trim() === ticketId.trim()) {
        count++;
        if (rowIndices.includes(count)) foundRows.push(i+1); // 1-based
      }
    }
    
    foundRows.sort((a,b)=>b-a).forEach(r => sheet.deleteRow(r));
    
    // Invalidate cache
    var cache = CacheService.getScriptCache();
    cache.remove('sheet_' + sheetName);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Returns dropdown options for Cable System and Affected Segment
 * @returns {Object} An object with cableSystem and affectedSegment arrays
 */
function getDropdownOptions() {
  // Use cache for dropdowns to speed up modal loading
  var cache = CacheService.getScriptCache();
  var cacheKey = 'dropdown_options_' + getSheetName(); // Cache key includes sheet name
  var cached = cache.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // Ignore parse error, fallback to live fetch
    }
  }

  const ss = SpreadsheetApp.openById(getSheetId());
  const sheetName = getSheetName();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { cableSystem: [], affectedSegment: [] };
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let cableSystemCol = -1, affectedSegmentCol = -1;

  for (let i = 0; i < headers.length; i++) {
    const h = String(headers[i]).toLowerCase();
    if (h === 'cable system') cableSystemCol = i + 1;
    if (h.includes('affected segment')) affectedSegmentCol = i + 1;
  }

  function getValidationOptions(col) {
    if (col === -1) return [];
    // Check data validation on row 2 (first data row)
    const rule = sheet.getRange(2, col).getDataValidation();
    if (!rule) return [];
    const criteria = rule.getCriteriaType();
    const args = rule.getCriteriaValues();
    if (criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST && Array.isArray(args[0])) {
      return args[0].map(String);
    }
    // If using a range, fetch values from the referenced range
    if (criteria === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE && args[0] && args[0].getValues) {
      return args[0].getValues().flat().map(String).filter(v => v !== '');
    }
    return [];
  }

  const cableSystem = getValidationOptions(cableSystemCol);
  const affectedSegment = getValidationOptions(affectedSegmentCol);
  const result = { cableSystem, affectedSegment };
  
  // Cache for 2 minutes
  cache.put(cacheKey, JSON.stringify(result), 120);
  return result;
}

/**
 * Adds a new ticket
 * @param {string} ticketId - The Ticket ID to add
 * @returns {Object} { success: boolean, error: string|null }
 */
function addTicket(ticketId) {
  try {
    if (!ticketId || !ticketId.trim()) return { success: false, error: 'Ticket ID required.' };
    const ss = SpreadsheetApp.openById(getSheetId());
    const sheetName = getSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found.' };
    
    // Check for duplicate
    const values = sheet.getRange(2, 1, sheet.getLastRow()-1, 1).getDisplayValues().flat();
    if (values.includes(ticketId.trim())) return { success: false, error: 'Ticket ID already exists.' };
    
    // Add new row
    const numCols = sheet.getLastColumn();
    const newRow = [ticketId.trim()];
    while (newRow.length < numCols) newRow.push('');
    sheet.appendRow(newRow);
    
    // Invalidate cache
    var cache = CacheService.getScriptCache();
    cache.remove('sheet_' + sheetName);
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Adds a new row to the Major Incidents table
 * @param {string[]} rowData - Complete row data with all columns
 * @returns {Object} { success: boolean, error: string|null }
 */
function addMajorIncidentsRow(rowData) {
  try {
    if (!Array.isArray(rowData)) {
      return { success: false, error: 'Invalid input data.' };
    }

    // Backend validation for dropdowns
    const opts = getDropdownOptions();
    const columns = getSheetVal(getSheetName())[0];
    
    // Validate dropdown values
    for (let i = 0; i < columns.length && i < rowData.length; i++) {
      if (typeof rowData[i] === 'string') rowData[i] = rowData[i].trim();
      const label = String(columns[i]).trim().toLowerCase();
      
      if (label === 'cable system' && rowData[i] && !opts.cableSystem.includes(rowData[i])) {
        return { success: false, error: 'Cable System must be one of: ' + opts.cableSystem.join(', ') };
      }
      if (label === 'affected segment' && rowData[i] && !opts.affectedSegment.includes(rowData[i])) {
        return { success: false, error: 'Affected Segment must be one of: ' + opts.affectedSegment.join(', ') };
      }
    }

    const ss = SpreadsheetApp.openById(getSheetId());
    const sheetName = getSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found.' };

    // Ensure row has enough columns
    const numCols = sheet.getLastColumn();
    while (rowData.length < numCols) rowData.push('');

    sheet.appendRow(rowData);

    // Invalidate cache
    invalidateAllSheetCaches();
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Edits a row in the Major Incidents table
 * @param {number} rowIndex - 0-based index of the row to edit (excluding header)
 * @param {string[]} rowData - Array of new cell values for the row
 * @returns {Object} { success: boolean, error: string|null }
 */
function editMajorIncidentsRow(rowIndex, rowData) {
  try {
    if (typeof rowIndex !== 'number' || !Array.isArray(rowData)) {
      return { success: false, error: 'Invalid input parameters.' };
    }

    // Backend validation for dropdowns
    const opts = getDropdownOptions();
    const data = getSheetVal(getSheetName());
    if (!data || data.length === 0) {
      return { success: false, error: 'No data found.' };
    }

    const columns = data[0];
    
    // Validate dropdown values
    for (let i = 0; i < columns.length && i < rowData.length; i++) {
      if (typeof rowData[i] === 'string') rowData[i] = rowData[i].trim();
      const label = String(columns[i]).trim().toLowerCase();
      
      if (label === 'cable system' && rowData[i] && !opts.cableSystem.includes(rowData[i])) {
        return { success: false, error: 'Cable System must be one of: ' + opts.cableSystem.join(', ') };
      }
      if (label === 'affected segment' && rowData[i] && !opts.affectedSegment.includes(rowData[i])) {
        return { success: false, error: 'Affected Segment must be one of: ' + opts.affectedSegment.join(', ') };
      }
    }

    const ss = SpreadsheetApp.openById(getSheetId());
    const sheetName = getSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found.' };

    // Convert to 1-based sheet row index (adding 2: 1 for 1-based indexing, 1 for header row)
    const sheetRowIndex = rowIndex + 2;
    
    // Validate row exists
    if (sheetRowIndex > sheet.getLastRow()) {
      return { success: false, error: 'Row not found.' };
    }

    // Update each cell in the row
    for (let c = 0; c < rowData.length; c++) {
      sheet.getRange(sheetRowIndex, c + 1).setValue(rowData[c]);
    }

    // Invalidate cache
    invalidateAllSheetCaches();
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Deletes rows from the Major Incidents table
 * @param {number[]} rowIndices - Array of 0-based row indices to delete (excluding header)
 * @returns {Object} { success: boolean, error: string|null }
 */
function deleteMajorIncidentsRows(rowIndices) {
  try {
    if (!Array.isArray(rowIndices) || rowIndices.length === 0) {
      return { success: false, error: 'No rows specified for deletion.' };
    }

    const ss = SpreadsheetApp.openById(getSheetId());
    const sheetName = getSheetName();
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return { success: false, error: 'Sheet not found.' };

    // Convert to 1-based sheet row indices and sort in descending order
    const sheetRowIndices = rowIndices
      .map(index => index + 2) // +2 for 1-based indexing and header row
      .sort((a, b) => b - a); // Sort in descending order for safe deletion

    // Validate all rows exist
    const lastRow = sheet.getLastRow();
    for (const rowIndex of sheetRowIndices) {
      if (rowIndex > lastRow || rowIndex < 2) {
        return { success: false, error: 'Invalid row index: ' + (rowIndex - 2) };
      }
    }

    // Delete rows from bottom up
    sheetRowIndices.forEach(rowIndex => {
      sheet.deleteRow(rowIndex);
    });

    // Invalidate cache
    invalidateAllSheetCaches();
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Exports Outage Summary data in specified format
 * @param {Object} params - Export parameters
 * @returns {Object} { success: boolean, data: string, filename: string, mimeType: string, error: string }
 */
function exportOutageSummary(params) {
  try {
    const {
      format,
      filename = 'outage-summary',
      includeRFO = true,
      includeCableSystems = true,
      includeTotals = false,
      searchFilter = '',
      title = 'Outage Summary Report',
      includeDate = true
    } = params;

    // Get outage summary data
    const summaryData = getOutageSummaryTable();
    if (summaryData.error) {
      return { success: false, error: summaryData.error };
    }

    let { cableSystems, rfoTypes, counts } = summaryData;
    
    // Apply search filter
    if (searchFilter && searchFilter.trim() !== '') {
      rfoTypes = rfoTypes.filter(rfo => 
        rfo.toLowerCase().includes(searchFilter.trim().toLowerCase())
      );
    }

    if (format === 'csv') {
      return exportOutageSummaryCSV(cableSystems, rfoTypes, counts, {
        filename,
        includeRFO,
        includeCableSystems,
        includeTotals,
        title,
        includeDate
      });
    } else if (format === 'pdf') {
      return exportOutageSummaryPDF(cableSystems, rfoTypes, counts, {
        filename,
        includeRFO,
        includeCableSystems,
        includeTotals,
        title,
        includeDate
      });
    } else {
      return { success: false, error: 'Invalid export format specified.' };
    }
  } catch (error) {
    return { success: false, error: error.message || 'Export failed.' };
  }
}

/**
 * Exports Network Availability data in specified format
 * @param {Object} params - Export parameters
 * @returns {Object} { success: boolean, data: string, filename: string, mimeType: string, error: string }
 */
function exportNetworkAvailability(params) {
  try {
    const {
      format,
      filename = 'network-availability',
      cableSystem = '',
      segment = '',
      yearStart = '',
      yearEnd = '',
      includeMonthHeaders = true,
      includeColorCoding = false,
      includeAverages = false,
      title = 'Network Availability Report',
      includeDate = true
    } = params;

    // Get network availability data
    const networkData = getNetworkAvailabilityData();
    if (networkData.error) {
      return { success: false, error: networkData.error };
    }

    let { cableSystems, segments, years, data } = networkData;
    
    // Apply filters
    if (cableSystem) cableSystems = [cableSystem];
    if (segment) segments = [segment];
    if (yearStart || yearEnd) {
      const startYear = yearStart ? parseInt(yearStart) : Math.min(...years);
      const endYear = yearEnd ? parseInt(yearEnd) : Math.max(...years);
      years = years.filter(year => year >= startYear && year <= endYear);
    }

    if (format === 'csv') {
      return exportNetworkAvailabilityCSV(cableSystems, segments, years, data, {
        filename,
        includeMonthHeaders,
        includeAverages,
        title,
        includeDate
      });
    } else if (format === 'pdf') {
      return exportNetworkAvailabilityPDF(cableSystems, segments, years, data, {
        filename,
        includeMonthHeaders,
        includeColorCoding,
        includeAverages,
        title,
        includeDate
      });
    } else {
      return { success: false, error: 'Invalid export format specified.' };
    }
  } catch (error) {
    return { success: false, error: error.message || 'Export failed.' };
  }
}

/**
 * Helper function to export Outage Summary as CSV
 */
function exportOutageSummaryCSV(cableSystems, rfoTypes, counts, options) {
  const { filename, includeRFO, includeCableSystems, includeTotals, title, includeDate } = options;
  
  let csvContent = '';
  
  // Add metadata
  if (includeDate) {
    csvContent += `"Generated on","${new Date().toLocaleString()}"\n`;
  }
  csvContent += `"Report","${title}"\n\n`;
  
  // Build headers for the table
  let headers = [];
  if (includeRFO) headers.push('RFO');
  if (includeCableSystems) {
    cableSystems.forEach(cs => headers.push(cs));
  }
  if (includeTotals) headers.push('Total');
  
  // Add headers to CSV
  csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
  
  // Build data rows in table format
  rfoTypes.forEach(rfo => {
    let row = [];
    if (includeRFO) row.push(`"${rfo}"`);
    
    let rowTotal = 0;
    if (includeCableSystems) {
      cableSystems.forEach(cs => {
        const value = (counts[rfo] && counts[rfo][cs]) ? counts[rfo][cs] : 0;
        row.push(value);
        rowTotal += value;
      });
    }
    
    if (includeTotals) row.push(rowTotal);
    csvContent += row.join(',') + '\n';
  });
  
  // Convert to base64
  const blob = Utilities.newBlob(csvContent, 'text/csv', `${filename}.csv`);
  const base64Data = Utilities.base64Encode(blob.getBytes());
  
  return {
    success: true,
    data: base64Data,
    filename: `${filename}.csv`,
    mimeType: 'text/csv'
  };
}

/**
 * Helper function to export Network Availability as CSV
 */
function exportNetworkAvailabilityCSV(cableSystems, segments, years, data, options) {
  const { filename, includeMonthHeaders, includeAverages, title, includeDate } = options;
  
  let csvContent = '';
  
  // Add metadata
  if (includeDate) {
    csvContent += `"Generated on","${new Date().toLocaleString()}"\n`;
  }
  csvContent += `"Report","${title}"\n\n`;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get current date for comparison
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based (0 = January, 11 = December)
  
  // Create a unified table format for all cable systems and segments
  let headers = ['Cable System', 'Segment', 'Year'];
  if (includeMonthHeaders) {
    months.forEach(month => headers.push(month));
  }
  if (includeAverages) headers.push('Average');
  
  // Add headers to CSV
  csvContent += headers.map(h => `"${h}"`).join(',') + '\n';
  
  // Build data rows in unified table format
  cableSystems.forEach(cs => {
    segments.forEach(seg => {
      years.forEach(year => {
        let row = [`"${cs}"`, `"${seg}"`, year];
        let yearSum = 0;
        let monthCount = 0;
        
        if (includeMonthHeaders) {
          for (let m = 0; m < 12; m++) {
            // Check if this month/year is in the future
            const isFutureDate = parseInt(year) > currentYear || 
                                (parseInt(year) === currentYear && m > currentMonth);
            
            if (isFutureDate) {
              // For future dates, display "---"
              row.push('---');
            } else {
              // For past or current dates, display the percentage
              const value = data[cs]?.[seg]?.[year]?.[m];
              if (typeof value === 'number') {
                row.push(value.toFixed(2));
                yearSum += value;
                monthCount++;
              } else {
                row.push('---');
              }
            }
          }
        }
        
        if (includeAverages && monthCount > 0) {
          row.push((yearSum / monthCount).toFixed(2));
        } else if (includeAverages) {
          row.push('---');
        }
        
        csvContent += row.join(',') + '\n';
      });
    });
  });
  
  // Convert to base64
  const blob = Utilities.newBlob(csvContent, 'text/csv', `${filename}.csv`);
  const base64Data = Utilities.base64Encode(blob.getBytes());
  
  return {
    success: true,
    data: base64Data,
    filename: `${filename}.csv`,
    mimeType: 'text/csv'
  };
}

/**
 * Helper function to export Outage Summary as PDF (simplified HTML-to-PDF approach)
 */
function exportOutageSummaryPDF(cableSystems, rfoTypes, counts, options) {
  const { filename, includeRFO, includeCableSystems, includeTotals, title, includeDate } = options;
  
  // Create HTML content for PDF
  let htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          .metadata { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
  `;
  
  if (includeDate) {
    htmlContent += `<div class="metadata">Generated on: ${new Date().toLocaleString()}</div>`;
  }
  
  htmlContent += '<table><thead><tr>';
  
  // Build headers
  if (includeRFO) htmlContent += '<th>RFO</th>';
  if (includeCableSystems) {
    cableSystems.forEach(cs => htmlContent += `<th>${cs}</th>`);
  }
  if (includeTotals) htmlContent += '<th>Total</th>';
  
  htmlContent += '</tr></thead><tbody>';
  
  // Build data rows
  rfoTypes.forEach(rfo => {
    htmlContent += '<tr>';
    if (includeRFO) htmlContent += `<td>${rfo}</td>`;
    
    let rowTotal = 0;
    if (includeCableSystems) {
      cableSystems.forEach(cs => {
        const value = (counts[rfo] && counts[rfo][cs]) ? counts[rfo][cs] : 0;
        htmlContent += `<td>${value}</td>`;
        rowTotal += value;
      });
    }
    
    if (includeTotals) htmlContent += `<td>${rowTotal}</td>`;
    htmlContent += '</tr>';
  });
  
  htmlContent += '</tbody></table></body></html>';
  
  // Convert HTML to PDF using DriveApp (simplified approach)
  const blob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html');
  const pdfBlob = blob.getAs('application/pdf');
  const base64Data = Utilities.base64Encode(pdfBlob.getBytes());
  
  return {
    success: true,
    data: base64Data,
    filename: `${filename}.pdf`,
    mimeType: 'application/pdf'
  };
}

/**
 * Helper function to export Network Availability as PDF
 */
function exportNetworkAvailabilityPDF(cableSystems, segments, years, data, options) {
  const { filename, includeMonthHeaders, includeColorCoding, includeAverages, title, includeDate } = options;
  
  // Create HTML content for PDF
  let htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          h2 { color: #555; margin-top: 30px; }
          .metadata { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; page-break-inside: avoid; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: center; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .na-darkblue { background-color: #26348d !important; color: white; }
          .na-lightgreen { background-color: #b9e7c5 !important; }
          .na-yellow { background-color: #ffe066 !important; }
          .na-orange { background-color: #fd7e14 !important; color: white; }
          .na-red { background-color: #dc3545 !important; color: white; }
          .na-future { color: #999999; background-color: #f8f9fa; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
  `;
  
  if (includeDate) {
    htmlContent += `<div class="metadata">Generated on: ${new Date().toLocaleString()}</div>`;
  }
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Get current date for comparison
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based (0 = January, 11 = December)
  
  // Export data for each cable system and segment combination
  cableSystems.forEach(cs => {
    segments.forEach(seg => {
      htmlContent += `<h2>${cs} - ${seg}</h2>`;
      htmlContent += '<table><thead><tr><th>Year</th>';
      
      if (includeMonthHeaders) {
        months.forEach(month => htmlContent += `<th>${month}</th>`);
      }
      if (includeAverages) htmlContent += '<th>Average</th>';
      
      htmlContent += '</tr></thead><tbody>';
      
      // Build data rows
      years.forEach(year => {
        htmlContent += '<tr><td>' + year + '</td>';
        let yearSum = 0;
        let monthCount = 0;
        
        if (includeMonthHeaders) {
          for (let m = 0; m < 12; m++) {
            // Check if this month/year is in the future
            const isFutureDate = parseInt(year) > currentYear || 
                                (parseInt(year) === currentYear && m > currentMonth);
            
            if (isFutureDate) {
              // For future dates, display "---" with neutral styling
              htmlContent += '<td class="na-future">---</td>';
            } else {
              // For past or current dates, display the percentage with color coding
              const value = data[cs]?.[seg]?.[year]?.[m];
              if (typeof value === 'number') {
                let cellClass = '';
                if (includeColorCoding) {
                  if (value >= 90) cellClass = 'na-darkblue';
                  else if (value >= 70) cellClass = 'na-lightgreen';
                  else if (value >= 40) cellClass = 'na-yellow';
                  else if (value >= 20) cellClass = 'na-orange';
                  else cellClass = 'na-red';
                }
                htmlContent += `<td class="${cellClass}">${value.toFixed(2)}%</td>`;
                yearSum += value;
                monthCount++;
              } else {
                htmlContent += '<td>---</td>';
              }
            }
          }
        }
        
        if (includeAverages && monthCount > 0) {
          htmlContent += `<td>${(yearSum / monthCount).toFixed(2)}%</td>`;
        } else if (includeAverages) {
          htmlContent += '<td>---</td>';
        }
        
        htmlContent += '</tr>';
      });
      
      htmlContent += '</tbody></table>';
    });
  });
  
  htmlContent += '</body></html>';
  
  // Convert HTML to PDF
  const blob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html');
  const pdfBlob = blob.getAs('application/pdf');
  const base64Data = Utilities.base64Encode(pdfBlob.getBytes());
  
  return {
    success: true,
    data: base64Data,
    filename: `${filename}.pdf`,
    mimeType: 'application/pdf'
  };
}

/**
 * Exports Major Incidents data in specified format
 * @param {Object} params - Export parameters
 * @returns {Object} { success: boolean, data: string, filename: string, mimeType: string, error: string }
 */
function exportMajorIncidents(params) {
  try {
    const {
      format,
      filename = 'major-incidents',
      includeHeaders = true,
      searchFilter = '',
      title = 'Major Incidents Report',
      includeDate = true
    } = params;

    // Get major incidents data
    let result = getMajorIncidentsTableData(1, 1000, searchFilter); // Get all data with large page size
    if (result.error) {
      return { success: false, error: result.error };
    }

    let { columns, rows } = result;
    
    if (format === 'csv') {
      return exportMajorIncidentsCSV(columns, rows, {
        filename,
        includeHeaders,
        title,
        includeDate
      });
    } else if (format === 'pdf') {
      return exportMajorIncidentsPDF(columns, rows, {
        filename,
        includeHeaders,
        title,
        includeDate
      });
    } else {
      return { success: false, error: 'Invalid export format specified.' };
    }
  } catch (error) {
    return { success: false, error: error.message || 'Export failed.' };
  }
}

/**
 * Helper function to export Major Incidents as CSV
 */
function exportMajorIncidentsCSV(columns, rows, options) {
  const { filename, includeHeaders, title, includeDate } = options;
  
  let csvContent = '';
  
  // Add metadata
  if (includeDate) {
    csvContent += `"Generated on","${new Date().toLocaleString()}"\n`;
  }
  csvContent += `"Report","${title}"\n\n`;
  
  // Add headers
  if (includeHeaders) {
    csvContent += columns.map(h => `"${h}"`).join(',') + '\n';
  }
  
  // Add data rows
  rows.forEach(row => {
    csvContent += row.map(cell => {
      // Escape quotes and wrap in quotes
      const cellStr = String(cell || '');
      return `"${cellStr.replace(/"/g, '""')}"`;
    }).join(',') + '\n';
  });
  
  // Convert to base64
  const blob = Utilities.newBlob(csvContent, 'text/csv', `${filename}.csv`);
  const base64Data = Utilities.base64Encode(blob.getBytes());
  
  return {
    success: true,
    data: base64Data,
    filename: `${filename}.csv`,
    mimeType: 'text/csv'
  };
}

/**
 * Helper function to export Major Incidents as PDF
 */
function exportMajorIncidentsPDF(columns, rows, options) {
  const { filename, includeHeaders, title, includeDate } = options;
  
  // Create HTML content for PDF
  let htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          .metadata { text-align: center; margin-bottom: 20px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
  `;
  
  if (includeDate) {
    htmlContent += `<div class="metadata">Generated on: ${new Date().toLocaleString()}</div>`;
  }
  
  htmlContent += '<table>';
  
  // Add headers
  if (includeHeaders && columns.length > 0) {
    htmlContent += '<thead><tr>';
    columns.forEach(header => {
      htmlContent += `<th>${header}</th>`;
    });
    htmlContent += '</tr></thead>';
  }
  
  // Add data rows
  htmlContent += '<tbody>';
  rows.forEach(row => {
    htmlContent += '<tr>';
    row.forEach(cell => {
      htmlContent += `<td>${cell || ''}</td>`;
    });
    htmlContent += '</tr>';
  });
  htmlContent += '</tbody></table></body></html>';
  
  // Convert HTML to PDF
  const blob = Utilities.newBlob(htmlContent, 'text/html', 'temp.html');
  const pdfBlob = blob.getAs('application/pdf');
  const base64Data = Utilities.base64Encode(pdfBlob.getBytes());
  
  return {
    success: true,
    data: base64Data,
    filename: `${filename}.pdf`,
    mimeType: 'application/pdf'
  };
}

