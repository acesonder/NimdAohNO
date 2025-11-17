const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const util = require('util');
const rateLimit = require('express-rate-limit');
const execPromise = util.promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure rate limiting to prevent abuse
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Create uploads and extracts directories
const uploadsDir = path.join(__dirname, '../uploads');
const extractsDir = path.join(__dirname, '../extracts');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(extractsDir)) {
    fs.mkdirSync(extractsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'msi-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.msi') {
            cb(null, true);
        } else {
            cb(new Error('Only MSI files are allowed'));
        }
    },
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit
    }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Serve extracted files
app.use('/extracts', express.static(extractsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', platform: process.platform });
});

// Analyze MSI file endpoint
app.post('/api/analyze', apiLimiter, upload.single('msiFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const msiPath = req.file.path;
    const originalName = req.file.originalname;

    try {
        const analysisResult = {
            fileName: originalName,
            fileSize: formatFileSize(req.file.size),
            productInfo: {},
            properties: {}
        };

        // Platform-specific analysis
        if (process.platform === 'win32') {
            // Windows - use PowerShell to query MSI
            try {
                const psScript = `
                    $msi = "${msiPath.replace(/\\/g, '\\\\')}";
                    $windowsInstaller = New-Object -ComObject WindowsInstaller.Installer;
                    $database = $windowsInstaller.GetType().InvokeMember("OpenDatabase", "InvokeMethod", $null, $windowsInstaller, @($msi, 0));
                    
                    $query = "SELECT * FROM Property";
                    $view = $database.GetType().InvokeMember("OpenView", "InvokeMethod", $null, $database, ($query));
                    $view.GetType().InvokeMember("Execute", "InvokeMethod", $null, $view, $null);
                    
                    $properties = @{};
                    while ($record = $view.GetType().InvokeMember("Fetch", "InvokeMethod", $null, $view, $null)) {
                        $property = $record.GetType().InvokeMember("StringData", "GetProperty", $null, $record, 1);
                        $value = $record.GetType().InvokeMember("StringData", "GetProperty", $null, $record, 2);
                        $properties[$property] = $value;
                    }
                    
                    $properties | ConvertTo-Json;
                `;

                const { stdout } = await execPromise(`powershell -Command "${psScript}"`);
                const properties = JSON.parse(stdout);

                // Extract important properties
                analysisResult.productInfo = {
                    'Product Name': properties.ProductName || 'N/A',
                    'Manufacturer': properties.Manufacturer || 'N/A',
                    'Version': properties.ProductVersion || 'N/A',
                    'Product Code': properties.ProductCode || 'N/A'
                };

                analysisResult.properties = properties;
            } catch (error) {
                console.error('PowerShell analysis error:', error);
                analysisResult.productInfo = {
                    'Note': 'Unable to read MSI properties on this system',
                    'File Name': originalName,
                    'Suggestion': 'Use Windows application for full analysis'
                };
            }
        } else {
            // Non-Windows - provide basic info and suggest Windows app
            analysisResult.productInfo = {
                'Platform': 'Non-Windows system detected',
                'File Name': originalName,
                'Note': 'Full MSI analysis requires Windows',
                'Suggestion': 'Use the Windows desktop application for complete analysis',
                'Alternative': 'You can still extract files on any platform'
            };

            // Try to use msitools if available (Linux)
            try {
                const { stdout } = await execPromise(`msiinfo suminfo "${msiPath}" 2>&1 || echo "msitools not available"`);
                if (!stdout.includes('not available')) {
                    analysisResult.properties = {
                        'Summary': stdout.trim()
                    };
                }
            } catch (error) {
                // msitools not available
            }
        }

        // Clean up uploaded file
        setTimeout(() => {
            if (fs.existsSync(msiPath)) {
                fs.unlinkSync(msiPath);
            }
        }, 5000);

        res.json(analysisResult);
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Clean up uploaded file
        if (fs.existsSync(msiPath)) {
            fs.unlinkSync(msiPath);
        }

        res.status(500).json({
            error: 'Failed to analyze MSI file',
            details: error.message,
            platform: process.platform
        });
    }
});

// Extract MSI file endpoint
app.post('/api/extract', apiLimiter, upload.single('msiFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const msiPath = req.file.path;
    const originalName = req.file.originalname;
    const extractDir = path.join(extractsDir, path.basename(originalName, '.msi') + '-' + Date.now());

    try {
        fs.mkdirSync(extractDir, { recursive: true });

        if (process.platform === 'win32') {
            // Windows - use msiexec
            await execPromise(`msiexec /a "${msiPath}" /qn TARGETDIR="${extractDir}"`);
        } else {
            // Linux - try msiextract or 7z
            try {
                await execPromise(`msiextract -C "${extractDir}" "${msiPath}"`);
            } catch (error) {
                // Try 7z as fallback
                try {
                    await execPromise(`7z x "${msiPath}" -o"${extractDir}"`);
                } catch (error2) {
                    throw new Error('Extraction tools not available. Please install msitools or p7zip.');
                }
            }
        }

        // List extracted files
        const files = getAllFiles(extractDir);
        const relativeFiles = files.map(f => path.relative(extractDir, f));

        // Clean up uploaded file
        if (fs.existsSync(msiPath)) {
            fs.unlinkSync(msiPath);
        }

        res.json({
            success: true,
            fileCount: files.length,
            files: relativeFiles.slice(0, 100), // Limit to first 100 files
            extractPath: extractDir,
            downloadUrl: `/extracts/${path.basename(extractDir)}`,
            note: relativeFiles.length > 100 ? `Showing first 100 of ${relativeFiles.length} files` : ''
        });
    } catch (error) {
        console.error('Extraction error:', error);

        // Clean up
        if (fs.existsSync(msiPath)) {
            fs.unlinkSync(msiPath);
        }
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }

        res.status(500).json({
            error: 'Failed to extract MSI file',
            details: error.message,
            platform: process.platform,
            suggestion: process.platform !== 'win32' 
                ? 'Install msitools (Linux) or use Windows application for extraction'
                : 'Ensure you have permission to extract files'
        });
    }
});

// Get installation instructions endpoint
app.post('/api/instructions', apiLimiter, upload.single('msiFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const msiPath = req.file.path;
    const originalName = req.file.originalname;

    try {
        const instructions = {
            productInfo: {},
            directories: []
        };

        if (process.platform === 'win32') {
            // Windows - query MSI database for file/directory information
            try {
                const psScript = `
                    $msi = "${msiPath.replace(/\\/g, '\\\\')}";
                    $installer = New-Object -ComObject WindowsInstaller.Installer;
                    $db = $installer.GetType().InvokeMember("OpenDatabase", "InvokeMethod", $null, $installer, @($msi, 0));
                    
                    # Get product info
                    $productInfo = @{};
                    $propQuery = "SELECT Property, Value FROM Property";
                    $propView = $db.GetType().InvokeMember("OpenView", "InvokeMethod", $null, $db, ($propQuery));
                    $propView.GetType().InvokeMember("Execute", "InvokeMethod", $null, $propView, $null);
                    
                    while ($record = $propView.GetType().InvokeMember("Fetch", "InvokeMethod", $null, $propView, $null)) {
                        $prop = $record.GetType().InvokeMember("StringData", "GetProperty", $null, $record, 1);
                        $val = $record.GetType().InvokeMember("StringData", "GetProperty", $null, $record, 2);
                        if ($prop -in @('ProductName','Manufacturer','ProductVersion')) {
                            $productInfo[$prop] = $val;
                        }
                    }
                    
                    $result = @{
                        productInfo = $productInfo;
                        note = "Full directory mapping requires Windows Installer API";
                    };
                    
                    $result | ConvertTo-Json;
                `;

                const { stdout } = await execPromise(`powershell -Command "${psScript}"`);
                const result = JSON.parse(stdout);
                instructions.productInfo = result.productInfo || {};
            } catch (error) {
                console.error('PowerShell instructions error:', error);
            }
        }

        // Provide general instructions
        if (Object.keys(instructions.productInfo).length === 0) {
            instructions.productInfo = {
                'File': originalName,
                'Note': 'Extract the MSI file first to see actual files',
                'Platform': process.platform
            };
        }

        // Add common directory information
        instructions.directories = [
            {
                directory: '[ProgramFilesFolder]\\[ProductName]',
                files: ['Application files typically go here']
            },
            {
                directory: '[SystemFolder]',
                files: ['System DLLs and drivers']
            },
            {
                directory: '[CommonAppDataFolder]\\[Manufacturer]\\[ProductName]',
                files: ['Shared configuration files']
            },
            {
                directory: '[AppDataFolder]\\[ProductName]',
                files: ['User-specific settings']
            }
        ];

        // Clean up uploaded file
        setTimeout(() => {
            if (fs.existsSync(msiPath)) {
                fs.unlinkSync(msiPath);
            }
        }, 5000);

        res.json(instructions);
    } catch (error) {
        console.error('Instructions error:', error);

        // Clean up uploaded file
        if (fs.existsSync(msiPath)) {
            fs.unlinkSync(msiPath);
        }

        res.status(500).json({
            error: 'Failed to generate instructions',
            details: error.message,
            suggestion: 'Use Windows application for detailed file placement instructions'
        });
    }
});

// Helper function to get all files recursively
function getAllFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath);

        files.forEach(function(file) {
            const fullPath = path.join(dirPath, file);
            if (fs.statSync(fullPath).isDirectory()) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            } else {
                arrayOfFiles.push(fullPath);
            }
        });

        return arrayOfFiles;
    } catch (error) {
        console.error('Error reading directory:', error);
        return arrayOfFiles;
    }
}

// Helper function to format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: error.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`MSI Installer Helper Web App running on http://localhost:${PORT}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Upload directory: ${uploadsDir}`);
    console.log(`Extract directory: ${extractsDir}`);
    console.log('\nNote: Full MSI analysis features require Windows platform');
    console.log('On Linux, install msitools for extraction: sudo apt-get install msitools');
});
