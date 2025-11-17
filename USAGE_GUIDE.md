# MSI Installer Helper - Usage Guide

This guide provides detailed instructions on how to use both the Windows Desktop Application and the Web Application to work with MSI files.

## Table of Contents
- [Windows Desktop Application](#windows-desktop-application)
- [Web Application](#web-application)
- [Common Use Cases](#common-use-cases)
- [Tips and Best Practices](#tips-and-best-practices)

## Windows Desktop Application

### Prerequisites
- Windows 10 or Windows 11
- .NET 8.0 Runtime (Desktop) - [Download from Microsoft](https://dotnet.microsoft.com/download/dotnet/8.0)

### Installation
1. Download or build the application from the `WindowsApp/` directory
2. If building from source:
   ```bash
   cd WindowsApp/MSIInstallerHelper
   dotnet restore
   dotnet build -c Release
   ```
3. Run the executable: `bin/Release/net8.0-windows/MSIInstallerHelper.exe`

### Using the Application

#### Option 1: Install with Admin Privileges
This is the recommended method for normal software installation.

1. **Launch** the MSI Installer Helper application
2. **Click "Browse..."** to select your MSI file
3. **Click "Install with Admin"** button
4. **Approve the UAC prompt** when Windows asks for administrator permission
5. **Follow the installer wizard** that appears

**When to use:**
- You want to install software normally
- You have admin rights or can approve UAC prompts
- You want the complete installation including registry entries and shortcuts

#### Option 2: Extract and Get Instructions
This is useful when you cannot use admin rights or want to see what the installer does.

1. **Launch** the MSI Installer Helper application
2. **Click "Browse..."** to select your MSI file
3. **Click "Extract & Show Instructions"** button
4. **Wait** for extraction to complete
5. **Review** the detailed output showing:
   - Product information (name, version, manufacturer)
   - File-by-file destination mapping
   - Step-by-step manual installation instructions
   - Common directory translations

**When to use:**
- You don't have admin rights
- You want to understand what the installer does before running it
- You need to install files manually
- You're troubleshooting installation issues

### Understanding the Output

The application provides several types of information:

**Product Information:**
```
Product Name: Example Application
Manufacturer: Example Corp
Version: 1.0.0
Product Code: {12345678-1234-1234-1234-123456789012}
```

**File Installation Guide:**
```
Destination: [ProgramFilesFolder]\Example\
  - example.exe
  - config.ini
  - readme.txt

Destination: [SystemFolder]
  - example.dll
```

**Manual Installation Steps:**
1. Navigate to the extracted folder (shown in output)
2. Create directories as needed:
   - `C:\Program Files\Example\` for application files
   - Copy system files to `C:\Windows\System32\` if needed
3. Copy files according to the destination mappings shown

## Web Application

### Prerequisites
- Node.js 14.0 or later
- npm (included with Node.js)
- Optional: msitools (Linux) or p7zip (any platform) for extraction

### Installation
1. Navigate to the `WebApp/` directory
2. Install dependencies:
   ```bash
   npm install
   ```

### Starting the Server
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

**To use a different port:**
```bash
PORT=8080 npm start
```

### Using the Web Interface

#### Step 1: Upload MSI File
1. **Open your browser** to `http://localhost:3000`
2. **Upload a file** by either:
   - Clicking "Choose File" and selecting an MSI file
   - Dragging and dropping an MSI file onto the upload area

#### Step 2: Choose an Action
After uploading, three options become available:

**🔍 Analyze MSI**
- View product information
- See package properties
- Check version and manufacturer details

**📂 Extract Files**
- Extract all files from the MSI package
- Download extracted files
- Review package contents without installing

**📋 Get Install Instructions**
- View file placement instructions
- See directory mappings
- Learn how to install manually

#### Step 3: Review Results
Results are displayed in a scrollable text area showing:
- Detailed analysis output
- File lists and locations
- Step-by-step instructions
- Common directory translations

### API Usage

The web application also provides a RESTful API:

#### Analyze Endpoint
```bash
curl -X POST -F "msiFile=@example.msi" http://localhost:3000/api/analyze
```

**Response:**
```json
{
  "fileName": "example.msi",
  "fileSize": "10.5 MB",
  "productInfo": {
    "Product Name": "Example Application",
    "Manufacturer": "Example Corp",
    "Version": "1.0.0"
  }
}
```

#### Extract Endpoint
```bash
curl -X POST -F "msiFile=@example.msi" http://localhost:3000/api/extract
```

**Response:**
```json
{
  "success": true,
  "fileCount": 42,
  "files": ["file1.exe", "file2.dll", ...],
  "downloadUrl": "/extracts/example-123456"
}
```

#### Instructions Endpoint
```bash
curl -X POST -F "msiFile=@example.msi" http://localhost:3000/api/instructions
```

**Response:**
```json
{
  "productInfo": {...},
  "directories": [...]
}
```

## Common Use Cases

### Use Case 1: Installing Software Without Admin Rights

**Problem:** You need to install software but don't have administrator rights on your computer.

**Solution:**
1. Use either application to extract the MSI file
2. Review the installation instructions
3. Manually copy files to accessible locations (e.g., your user directory)
4. Create shortcuts manually if needed

**Example:**
Instead of installing to `C:\Program Files\App\`, install to:
- `C:\Users\YourName\AppData\Local\App\` (for personal use)
- A folder on your desktop or documents
- A network drive you have access to

### Use Case 2: Understanding What an Installer Does

**Problem:** You want to know what files an installer will add before running it.

**Solution:**
1. Upload the MSI file to either application
2. Click "Analyze" to see product information
3. Click "Extract & Show Instructions" to see all files
4. Review the file list and destinations

### Use Case 3: Troubleshooting Installation Issues

**Problem:** An installation keeps failing and you need to diagnose the issue.

**Solution:**
1. Extract the MSI using the application
2. Check if all expected files are present
3. Review where files should be installed
4. Manually place files to test if the application works
5. Check for missing dependencies

### Use Case 4: Cross-Platform MSI Analysis

**Problem:** You're on Linux or Mac but need to analyze a Windows MSI file.

**Solution:**
1. Use the web application (works on any platform)
2. Upload the MSI file
3. Analyze to get basic information
4. Extract files (requires msitools on Linux)
5. Review the structure and contents

## Tips and Best Practices

### General Tips

1. **Always backup** important files before manual installation
2. **Check file permissions** when placing files manually
3. **Use the Windows app** when on Windows for best results
4. **Scan downloaded MSI files** with antivirus before processing
5. **Keep extracted files** until you confirm the software works

### Windows Application Tips

1. **Run as administrator** if you encounter permission issues with extraction
2. **Check the output window** carefully for any error messages
3. **Keep the application open** until installation completes
4. **Note the extraction path** shown in the output for later reference

### Web Application Tips

1. **Use Chrome or Firefox** for best compatibility
2. **Check the platform note** - full features require Windows
3. **Wait for large files** - extraction can take time
4. **Save the results** by copying from the results window
5. **Use the API** for automation or batch processing

### Manual Installation Tips

1. **Create directories first** before copying files
2. **Respect file paths** shown in the instructions
3. **Copy system files carefully** - wrong placement can cause issues
4. **Check file extensions** to ensure correct file types
5. **Test the application** in a safe location first

### Directory Translation Guide

When manually installing, translate MSI variables to actual Windows paths:

| MSI Variable | Windows 10/11 Path | Notes |
|--------------|-------------------|-------|
| `[ProgramFilesFolder]` | `C:\Program Files\` | 64-bit programs |
| `[ProgramFilesFolder (x86)]` | `C:\Program Files (x86)\` | 32-bit programs |
| `[SystemFolder]` | `C:\Windows\System32\` | System files |
| `[WindowsFolder]` | `C:\Windows\` | Windows directory |
| `[AppDataFolder]` | `C:\Users\[Username]\AppData\Roaming\` | User data |
| `[LocalAppDataFolder]` | `C:\Users\[Username]\AppData\Local\` | Local user data |
| `[CommonAppDataFolder]` | `C:\ProgramData\` | Shared data |
| `[TempFolder]` | `C:\Users\[Username]\AppData\Local\Temp\` | Temporary files |
| `[DesktopFolder]` | `C:\Users\[Username]\Desktop\` | Desktop |
| `[StartMenuFolder]` | `C:\Users\[Username]\AppData\Roaming\Microsoft\Windows\Start Menu\` | Start menu |

## Troubleshooting

### Windows Application

**Q: Application won't start**
- A: Install .NET 8.0 Desktop Runtime from Microsoft

**Q: "Access Denied" error**
- A: Right-click the application and select "Run as administrator"

**Q: Extraction creates empty folder**
- A: The MSI file may be corrupted or require special handling

**Q: Can't find extracted files**
- A: Check the output window for the exact path

### Web Application

**Q: Server won't start**
- A: Check if port 3000 is already in use, try a different port

**Q: Upload fails**
- A: Check file size (500MB limit) and ensure it's a valid MSI file

**Q: Analysis shows limited info**
- A: Full analysis requires Windows platform, consider using Windows app

**Q: Extraction fails on Linux**
- A: Install msitools: `sudo apt-get install msitools`

**Q: "Too many requests" error**
- A: Wait 15 minutes - rate limiting is active for security

## Security Considerations

### Windows Application
- Requests admin elevation only when needed
- Doesn't store or transmit any data
- Processes files locally only
- Uses Windows built-in MSI handling

### Web Application
- Rate limited to prevent abuse (10 requests per 15 minutes per IP)
- Validates file types and sizes
- Automatically cleans up temporary files
- Doesn't store uploaded files permanently
- No authentication by default (add for production use)

### Best Practices
- Only process MSI files from trusted sources
- Scan files with antivirus before processing
- Don't expose the web application to the public internet without authentication
- Review extracted files before executing anything
- Keep the applications updated

## Getting Help

If you encounter issues:
1. Check this usage guide
2. Review the README files in each application directory
3. Check the troubleshooting sections
4. Review error messages carefully
5. Open an issue on GitHub with details

## License

This tool is provided under the MIT License. See the LICENSE file for details.

---

**Last Updated:** November 2024
