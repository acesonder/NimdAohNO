# MSI Installer Helper - Web Application

A web-based application for analyzing and extracting MSI (Microsoft Installer) files. Works on any platform, with full features on Windows.

## Features

- **🔍 Analyze MSI Files**: View product information, version, manufacturer, and package properties
- **📦 Extract Files**: Extract all files from MSI packages without installing
- **📋 Installation Instructions**: Get detailed file placement instructions for manual installation
- **🌐 Cross-Platform**: Works on Windows, Linux, and macOS (with varying feature levels)
- **💻 Modern UI**: Beautiful, responsive web interface

## Prerequisites

- Node.js 14.0 or later
- npm (comes with Node.js)

### Platform-Specific Requirements

**Windows:**
- No additional requirements - full functionality available
- PowerShell (included with Windows)
- msiexec (included with Windows)

**Linux:**
- For extraction: `sudo apt-get install msitools` or `sudo apt-get install p7zip-full`
- For analysis: Basic info only (full analysis requires Windows)

**macOS:**
- For extraction: `brew install msitools` or `brew install p7zip`
- For analysis: Basic info only (full analysis requires Windows)

## Installation

1. Navigate to the WebApp directory:
   ```bash
   cd WebApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode

```bash
npm start
```

or

```bash
npm run dev
```

The application will start on http://localhost:3000

### Production Mode

For production deployment:

```bash
NODE_ENV=production npm start
```

### Custom Port

```bash
PORT=8080 npm start
```

## Usage

1. **Open your browser** and navigate to `http://localhost:3000`

2. **Upload an MSI file**:
   - Click "Choose File" or drag and drop an MSI file
   - File size limit: 500MB

3. **Choose an action**:
   - **Analyze MSI**: View product information and properties
   - **Extract Files**: Extract all files from the MSI package
   - **Get Install Instructions**: View detailed file placement instructions

4. **Review Results**:
   - Analysis results show product details and properties
   - Extraction provides downloadable files
   - Instructions show where each file should be placed

## API Endpoints

### POST /api/analyze
Analyze an MSI file and return product information.

**Request:** multipart/form-data with `msiFile` field

**Response:**
```json
{
  "fileName": "example.msi",
  "fileSize": "10.5 MB",
  "productInfo": {
    "Product Name": "Example Application",
    "Manufacturer": "Example Corp",
    "Version": "1.0.0"
  },
  "properties": { ... }
}
```

### POST /api/extract
Extract files from an MSI package.

**Request:** multipart/form-data with `msiFile` field

**Response:**
```json
{
  "success": true,
  "fileCount": 42,
  "files": ["file1.exe", "file2.dll", ...],
  "downloadUrl": "/extracts/example-123456"
}
```

### POST /api/instructions
Get installation instructions for an MSI file.

**Request:** multipart/form-data with `msiFile` field

**Response:**
```json
{
  "productInfo": { ... },
  "directories": [
    {
      "directory": "[ProgramFilesFolder]\\Product",
      "files": ["app.exe", "config.ini"]
    }
  ]
}
```

### GET /api/health
Check server health.

**Response:**
```json
{
  "status": "ok",
  "platform": "win32"
}
```

## File Structure

```
WebApp/
├── public/              # Frontend files
│   ├── index.html      # Main HTML page
│   ├── styles.css      # Stylesheet
│   └── script.js       # Client-side JavaScript
├── server/             # Backend files
│   └── server.js       # Express server
├── uploads/            # Temporary upload directory (auto-created)
├── extracts/           # Extracted files directory (auto-created)
├── package.json        # Dependencies and scripts
└── README.md          # This file
```

## Security Notes

- Uploaded MSI files are temporarily stored and deleted after processing
- File size limit: 500MB
- Only .msi files are accepted
- Extracted files are stored in a separate directory with timestamped folders
- No authentication required (add authentication for production use)

## Platform Differences

### Windows
- ✅ Full MSI analysis with PowerShell
- ✅ Complete extraction using msiexec
- ✅ Detailed file placement instructions
- ✅ Product information from MSI database

### Linux/macOS
- ⚠️ Basic MSI analysis (requires msitools)
- ✅ Extraction (requires msitools or p7zip)
- ⚠️ Limited installation instructions
- ℹ️ Some features work better with msitools installed

## Troubleshooting

**Issue**: "Cannot find module 'express'"
- **Solution**: Run `npm install` to install dependencies

**Issue**: Extraction fails on Linux
- **Solution**: Install msitools: `sudo apt-get install msitools`

**Issue**: Port 3000 already in use
- **Solution**: Use a different port: `PORT=8080 npm start`

**Issue**: Analysis returns basic info only
- **Solution**: Use Windows platform for full analysis, or use the Windows desktop app

**Issue**: Large files fail to upload
- **Solution**: Increase the file size limit in `server/server.js` (multer limits)

## Development

To modify the application:

1. **Frontend**: Edit files in `public/` directory
   - `index.html`: Structure
   - `styles.css`: Styling
   - `script.js`: Client-side logic

2. **Backend**: Edit `server/server.js`
   - Add new API endpoints
   - Modify processing logic
   - Add middleware

3. **Restart server**: Changes require server restart
   ```bash
   npm start
   ```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Related Projects

- **Windows Desktop App**: Full-featured Windows application in `WindowsApp/` directory
- **MSI Tools**: Linux command-line tools for MSI handling

## License

MIT License - Feel free to use and modify

## Contributing

Contributions welcome! Please ensure:
- Code follows existing style
- Test on multiple platforms if possible
- Update documentation for new features

## Support

For full MSI installation capabilities, use the Windows desktop application in the `WindowsApp/` directory.
