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
    const data = getSheetVal('MAJOR INCIDENTS_UPDATED');
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
    const data = getSheetVal('MAJOR INCIDENTS_UPDATED');
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
    const data = getSheetVal('MAJOR INCIDENTS_UPDATED');
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
    const data = getSheetVal('MAJOR INCIDENTS_UPDATED');
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
    var columns = getSheetVal('MAJOR INCIDENTS_UPDATED')[0];
    
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
    var columns = getSheetVal('MAJOR INCIDENTS_UPDATED')[0];
    
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
  return { cableSystem, affectedSegment };
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

