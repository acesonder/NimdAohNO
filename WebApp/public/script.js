let selectedFile = null;

// Initialize drag and drop
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const actionsSection = document.getElementById('actionsSection');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const loadingSpinner = document.getElementById('loadingSpinner');

// File input change handler
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// Drag and drop handlers
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#764ba2';
    uploadBox.style.background = '#f0f2ff';
});

uploadBox.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#667eea';
    uploadBox.style.background = '#f8f9ff';
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = '#667eea';
    uploadBox.style.background = '#f8f9ff';
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.msi')) {
        handleFileSelect(file);
    } else {
        showError('Please select a valid MSI file');
    }
});

// Handle file selection
function handleFileSelect(file) {
    if (!file.name.toLowerCase().endsWith('.msi')) {
        showError('Please select a valid MSI file (.msi extension)');
        return;
    }

    selectedFile = file;
    fileName.textContent = `Selected: ${file.name} (${formatFileSize(file.size)})`;
    actionsSection.style.display = 'block';
    resultsSection.style.display = 'none';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Action button handlers
document.getElementById('analyzeBtn').addEventListener('click', () => {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }
    analyzeFile();
});

document.getElementById('extractBtn').addEventListener('click', () => {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }
    extractFile();
});

document.getElementById('instructionsBtn').addEventListener('click', () => {
    if (!selectedFile) {
        showError('Please select a file first');
        return;
    }
    getInstructions();
});

// Analyze MSI file
async function analyzeFile() {
    showLoading();
    
    const formData = new FormData();
    formData.append('msiFile', selectedFile);
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayAnalysisResults(data);
        } else {
            showError(data.error || 'Failed to analyze MSI file');
        }
    } catch (error) {
        showError('Error communicating with server: ' + error.message);
    }
}

// Extract MSI file
async function extractFile() {
    showLoading();
    
    const formData = new FormData();
    formData.append('msiFile', selectedFile);
    
    try {
        const response = await fetch('/api/extract', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayExtractionResults(data);
        } else {
            showError(data.error || 'Failed to extract MSI file');
        }
    } catch (error) {
        showError('Error communicating with server: ' + error.message);
    }
}

// Get installation instructions
async function getInstructions() {
    showLoading();
    
    const formData = new FormData();
    formData.append('msiFile', selectedFile);
    
    try {
        const response = await fetch('/api/instructions', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayInstructions(data);
        } else {
            showError(data.error || 'Failed to get instructions');
        }
    } catch (error) {
        showError('Error communicating with server: ' + error.message);
    }
}

// Display analysis results
function displayAnalysisResults(data) {
    hideLoading();
    resultsSection.style.display = 'block';
    
    let html = '=== MSI FILE ANALYSIS ===\n\n';
    html += `File Name: ${data.fileName}\n`;
    html += `File Size: ${data.fileSize}\n\n`;
    
    html += '--- PRODUCT INFORMATION ---\n';
    if (data.productInfo) {
        for (const [key, value] of Object.entries(data.productInfo)) {
            html += `${key}: ${value}\n`;
        }
    } else {
        html += 'Product information not available\n';
    }
    
    html += '\n--- PACKAGE PROPERTIES ---\n';
    if (data.properties) {
        for (const [key, value] of Object.entries(data.properties)) {
            html += `${key}: ${value}\n`;
        }
    }
    
    html += '\n--- NOTES ---\n';
    html += 'This MSI file can be:\n';
    html += '1. Installed with admin privileges (requires Windows)\n';
    html += '2. Extracted to view contents\n';
    html += '3. Analyzed for manual installation instructions\n';
    
    resultsContent.textContent = html;
    resultsContent.scrollTop = 0;
}

// Display extraction results
function displayExtractionResults(data) {
    hideLoading();
    resultsSection.style.display = 'block';
    
    let html = '=== EXTRACTION RESULTS ===\n\n';
    html += `Extracted ${data.fileCount || 0} files\n\n`;
    
    if (data.files && data.files.length > 0) {
        html += '--- EXTRACTED FILES ---\n';
        data.files.forEach(file => {
            html += `  ${file}\n`;
        });
    }
    
    if (data.downloadUrl) {
        html += `\n--- DOWNLOAD ---\n`;
        html += `Download URL: ${data.downloadUrl}\n`;
        html += `(Note: Click the link above to download extracted files)\n`;
    }
    
    html += '\n--- NEXT STEPS ---\n';
    html += '1. Download the extracted files using the link above\n';
    html += '2. Review the files to understand the package contents\n';
    html += '3. Use "Get Install Instructions" to see where files should be placed\n';
    
    resultsContent.textContent = html;
    resultsContent.scrollTop = 0;
}

// Display installation instructions
function displayInstructions(data) {
    hideLoading();
    resultsSection.style.display = 'block';
    
    let html = '=== INSTALLATION INSTRUCTIONS ===\n\n';
    
    if (data.productInfo) {
        html += '--- PRODUCT INFORMATION ---\n';
        for (const [key, value] of Object.entries(data.productInfo)) {
            html += `${key}: ${value}\n`;
        }
        html += '\n';
    }
    
    html += '--- INSTALLATION DIRECTORIES ---\n\n';
    
    if (data.directories && data.directories.length > 0) {
        data.directories.forEach(dir => {
            html += `${dir.directory}\n`;
            if (dir.files && dir.files.length > 0) {
                dir.files.forEach(file => {
                    html += `  └─ ${file}\n`;
                });
            }
            html += '\n';
        });
    } else {
        html += 'Directory information not available.\n\n';
    }
    
    html += '--- COMMON DIRECTORY MAPPINGS ---\n';
    html += '[ProgramFilesFolder]      → C:\\Program Files\\\n';
    html += '[ProgramFiles64Folder]    → C:\\Program Files\\\n';
    html += '[SystemFolder]            → C:\\Windows\\System32\\\n';
    html += '[System64Folder]          → C:\\Windows\\System32\\\n';
    html += '[WindowsFolder]           → C:\\Windows\\\n';
    html += '[AppDataFolder]           → %APPDATA%\n';
    html += '[LocalAppDataFolder]      → %LOCALAPPDATA%\n';
    html += '[CommonAppDataFolder]     → C:\\ProgramData\\\n';
    html += '[TempFolder]              → %TEMP%\\\n';
    html += '[DesktopFolder]           → Desktop\n';
    html += '[StartMenuFolder]         → Start Menu\n\n';
    
    html += '--- MANUAL INSTALLATION STEPS ---\n';
    html += '1. Extract the MSI file first (use Extract button)\n';
    html += '2. Review the directory mappings above\n';
    html += '3. Create necessary directories on your system\n';
    html += '4. Copy files from extracted folder to their destinations\n';
    html += '5. Update registry entries if needed (advanced)\n';
    html += '6. Create shortcuts if needed\n\n';
    
    html += '--- WARNINGS ---\n';
    html += '• Manual installation may skip important setup steps\n';
    html += '• Registry entries won\\'t be created automatically\n';
    html += '• Dependencies may not be checked\n';
    html += '• Prefer using "Install with Admin" option when possible\n';
    
    resultsContent.textContent = html;
    resultsContent.scrollTop = 0;
}

// Show loading spinner
function showLoading() {
    resultsSection.style.display = 'block';
    loadingSpinner.style.display = 'block';
    resultsContent.style.display = 'none';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
    resultsContent.style.display = 'block';
}

// Show error message
function showError(message) {
    hideLoading();
    resultsSection.style.display = 'block';
    resultsContent.textContent = `ERROR: ${message}\n\nPlease try again or select a different file.`;
}
