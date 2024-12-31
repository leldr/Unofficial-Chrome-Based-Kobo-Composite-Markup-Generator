// script.js

// Global Variables
let outputDirHandle = null;

// Elements
const sqliteFileInput = document.getElementById('sqliteFile');
const inputDirInput = document.getElementById('inputDir');
const selectOutputDirBtn = document.getElementById('selectOutputDirBtn');
const outputDirPathSpan = document.getElementById('outputDirPath');
const runButton = document.getElementById('runButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar').children[0];
const logDiv = document.getElementById('log');

// Event Listeners
selectOutputDirBtn.addEventListener('click', async () => {
  try {
    outputDirHandle = await window.showDirectoryPicker();
    outputDirPathSpan.textContent = outputDirHandle.name;
    checkRunButtonState();
  } catch (err) {
    log(`Error selecting output directory: ${err.message}`);
  }
});

sqliteFileInput.addEventListener('change', () => {
  checkRunButtonState();
});

inputDirInput.addEventListener('change', () => {
  checkRunButtonState();
});

runButton.addEventListener('click', async () => {
  // Disable Run button to prevent multiple clicks
  runButton.disabled = true;

  // Clear previous logs and reset progress
  logDiv.textContent = '';
  progressBar.style.width = '0%';
  progressBar.textContent = '0%';
  progressContainer.style.display = 'block';

  // Get selected files and directory
  const sqliteFile = sqliteFileInput.files[0];
  const inputFiles = Array.from(inputDirInput.files);

  if (!sqliteFile) {
    alert('Please select a KoboReader.sqlite file.');
    runButton.disabled = false;
    return;
  }

  if (inputFiles.length === 0) {
    alert('Please select the input directory containing .jpg and .svg files.');
    runButton.disabled = false;
    return;
  }

  if (!outputDirHandle) {
    alert('Please select an output directory.');
    runButton.disabled = false;
    return;
  }

  try {
    // Initialize sql.js
    const SQL = await initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    log('Reading SQLite file...');
    const arrayBuffer = await sqliteFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const db = new SQL.Database(uint8Array);

    // Function to execute SQL queries
    const executeQuery = (query, params = []) => {
      try {
        return db.exec(query, params);
      } catch (err) {
        log(`SQL Error: ${err.message}`);
        return [];
      }
    };

    // Map baseName to .jpg and .svg files
    const fileMap = {};
    inputFiles.forEach(file => {
      const ext = pathExtension(file.name).toLowerCase();
      const base = pathBaseName(file.name);
      if (ext === '.jpg' || ext === '.svg') {
        if (!fileMap[base]) fileMap[base] = {};
        fileMap[base][ext] = file;
      }
    });

    // Identify matching pairs
    const pairs = [];
    for (const [base, exts] of Object.entries(fileMap)) {
      if (exts['.jpg'] && exts['.svg']) {
        pairs.push({ base, jpg: exts['.jpg'], svg: exts['.svg'] });
      }
    }

    if (pairs.length === 0) {
      log('No matching .jpg + .svg pairs found.');
      runButton.disabled = false;
      return;
    }

    log(`Found ${pairs.length} matching pairs.`);

    // Process each pair
    for (let i = 0; i < pairs.length; i++) {
      const { base, jpg, svg } = pairs[i];
      log(`\nProcessing pair ${i + 1} of ${pairs.length}: ${jpg.name} & ${svg.name}`);

      // Query the database for additional info
      const volumeId = getVolumeId(base, db);
      const sectionTitle = getSectionTitle(base, db);
      const bookPartNumber = getBookPartNumber(base, db);
      const orderingNumber = getOrderingNumber(base, db);

      const bookTitle = volumeId ? extractBookTitle(volumeId) : 'UnknownBook';
      const bookmarkSectionName = sectionTitle && sectionTitle.trim().length > 1
        ? sectionTitle
        : `Chapter ${sectionTitle || ''}`;
      const safePartName = bookPartNumber || 'PartX';
      const safeLocation = orderingNumber || 'LocX';
      const shortBase = base.substring(0, 8);

      const outputName = `markup_${bookmarkSectionName}_${safePartName}${safeLocation}_${shortBase}.png`;

      log(`Book Title: ${bookTitle}`);
      log(`Section: ${bookmarkSectionName}`);
      log(`Part: ${safePartName}`);
      log(`Location: ${safeLocation}`);
      log(`Output File: ${outputName}`);

      // Overlay SVG on JPG
      try {
        const pngBlob = await overlaySvgOnJpg(jpg, svg);
        await writeFileToDirectory(pngBlob, bookTitle, outputName);
        log(`Successfully processed and saved: ${outputName}`);
      } catch (err) {
        log(`Error processing pair ${base}: ${err.message}`);
      }

      // Update progress bar
      const progressPercent = Math.round(((i + 1) / pairs.length) * 100);
      progressBar.style.width = `${progressPercent}%`;
      progressBar.textContent = `${progressPercent}%`;
    }

    log('\nAll matching .jpg + .svg pairs have been processed.');
  } catch (err) {
    log(`Unexpected error: ${err.message}`);
  } finally {
    runButton.disabled = false;
  }
});

// Utility Functions

function log(message) {
  logDiv.textContent += message + '\n';
  logDiv.scrollTop = logDiv.scrollHeight;
}

function pathExtension(filename) {
  return filename.substring(filename.lastIndexOf('.'));
}

function pathBaseName(filename) {
  return filename.substring(0, filename.lastIndexOf('.'));
}

function extractBookTitle(volumeId) {
  // Assuming volumeId is a path-like string, extract the last segment
  const parts = volumeId.split('/');
  return parts[parts.length - 1] || 'UnknownBook';
}

function getVolumeId(base, db) {
  const query = "SELECT VolumeID FROM Bookmark WHERE BookmarkID = ?";
  const stmt = db.prepare(query);
  stmt.bind([base]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row.VolumeID || null;
  }
  stmt.free();
  return null;
}

function getSectionTitle(base, db) {
  const query = `
    SELECT Title 
    FROM content 
    WHERE ContentID = (
      SELECT ContentID 
      FROM Bookmark 
      WHERE BookmarkID = ?
    )
  `;
  const stmt = db.prepare(query);
  stmt.bind([base]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row.Title || null;
  }
  stmt.free();
  return null;
}

function getBookPartNumber(base, db) {
  const query = `
    SELECT adobe_location
    FROM content 
    WHERE ContentID = (
      SELECT ContentID 
      FROM Bookmark 
      WHERE BookmarkID = ?
    )
  `;
  const stmt = db.prepare(query);
  stmt.bind([base]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    if (row.adobe_location) {
      const parts = row.adobe_location.split('/');
      const lastPart = parts[parts.length - 1];
      return lastPart.split('.')[0];
    }
  }
  stmt.free();
  return null;
}

function getOrderingNumber(base, db) {
  const query = `
    SELECT StartContainerPath 
    FROM Bookmark 
    WHERE BookmarkID = ?
  `;
  const stmt = db.prepare(query);
  stmt.bind([base]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    if (row.StartContainerPath) {
      const pattern = /point\((\/[\d/]+:\d+)\)/;
      const match = row.StartContainerPath.match(pattern);
      if (match) {
        const cleaned = match[1].replace(':', '.').replace(/\//g, '.');
        return cleaned;
      }
    }
  }
  stmt.free();
  return null;
}

async function overlaySvgOnJpg(jpgFile, svgFile) {
  // Load JPG Image
  const jpgImg = await loadImageFromFile(jpgFile);
  
  // Load SVG Image
  const svgImg = await loadSVGImageFromFile(svgFile);
  
  // Create Canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set desired dimensions
  const finalWidth = 1264;
  const finalHeight = 1680;
  canvas.width = finalWidth;
  canvas.height = finalHeight;

  // Draw JPG
  ctx.drawImage(jpgImg, 0, 0, finalWidth, finalHeight);

  // Draw SVG
  ctx.drawImage(svgImg, 0, 0, finalWidth, finalHeight);

  // Convert Canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/png');
  });
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // To avoid CORS issues
    img.onload = () => {
      resolve(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${file.name}`));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

function loadSVGImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const svgText = event.target.result;
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load SVG: ${file.name}`));
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgText);
    };
    reader.onerror = () => {
      reject(new Error(`Failed to read SVG file: ${file.name}`));
    };
    reader.readAsText(file);
  });
}

async function writeFileToDirectory(blob, bookTitle, outputName) {
  // Create or get the bookTitle folder
  let bookDirHandle;
  try {
    bookDirHandle = await outputDirHandle.getDirectoryHandle(bookTitle, { create: true });
  } catch (err) {
    throw new Error(`Failed to create/access directory "${bookTitle}": ${err.message}`);
  }

  // Create the file
  let fileHandle;
  try {
    fileHandle = await bookDirHandle.getFileHandle(outputName, { create: true });
  } catch (err) {
    throw new Error(`Failed to create file "${outputName}": ${err.message}`);
  }

  // Write to the file
  try {
    const writableStream = await fileHandle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
  } catch (err) {
    throw new Error(`Failed to write to file "${outputName}": ${err.message}`);
  }
}

// Enable Run button only when all inputs are provided
function checkRunButtonState() {
  if (sqliteFileInput.files.length > 0 && inputDirInput.files.length > 0 && outputDirHandle) {
    runButton.disabled = false;
  } else {
    runButton.disabled = true;
  }
}

// Notes on File System Access API usage:

// The File System Access API is only available in secure contexts (HTTPS) and supported in Chromium-based browsers (e.g., Chrome, Edge).
// Users may need to run this tool via a local server (e.g., using VSCode's Live Server extension) to enable full functionality.

// Optional: Provide feedback if the browser doesn't support the File System Access API
if (!window.showDirectoryPicker) {
  alert('Your browser does not support the File System Access API. Please use a Chromium-based browser (e.g., Chrome, Edge) and access this tool via a local server.');
}

// Utility function to display errors in logs
function displayError(message) {
  log(`Error: ${message}`);
}
