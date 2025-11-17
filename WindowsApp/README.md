# MSI Installer Helper - Windows Application

A Windows desktop application that helps you install MSI files with administrator privileges or extract their contents with detailed file placement instructions.

## Features

1. **Install with Admin Privileges**
   - Select any MSI file
   - Install it with administrator elevation
   - Handles UAC prompts automatically

2. **Extract & Analyze MSI**
   - Extract all files from an MSI package
   - Analyze the MSI database
   - Get detailed installation instructions showing:
     - Product information
     - File destination mappings
     - Manual installation steps

## Building the Application

### Requirements
- Windows 10 or later
- .NET 8.0 SDK or later
- Visual Studio 2022 (optional, for GUI development)

### Build Instructions

1. Open a command prompt or PowerShell window
2. Navigate to the MSIInstallerHelper directory:
   ```
   cd WindowsApp/MSIInstallerHelper
   ```

3. Restore dependencies:
   ```
   dotnet restore
   ```

4. Build the application:
   ```
   dotnet build -c Release
   ```

5. The executable will be located in:
   ```
   bin/Release/net8.0-windows/MSIInstallerHelper.exe
   ```

## Usage

### Method 1: Install with Admin
1. Launch MSIInstallerHelper.exe
2. Click "Browse..." to select an MSI file
3. Click "Install with Admin" button
4. Approve the UAC prompt when it appears
5. Follow the MSI installer wizard

### Method 2: Extract & Get Instructions
1. Launch MSIInstallerHelper.exe
2. Click "Browse..." to select an MSI file
3. Click "Extract & Show Instructions" button
4. Review the extracted files and installation guide
5. Follow the manual installation steps provided

## How It Works

### Admin Installation
Uses `msiexec.exe` with the `/i` flag and UAC elevation to install the MSI package with administrator privileges.

### Extraction & Analysis
- Uses `msiexec.exe /a` to perform an administrative installation (extraction)
- Reads the MSI database using Windows Installer API
- Analyzes the File and Directory tables
- Maps files to their intended installation locations
- Provides human-readable instructions

## Common Installation Paths

The application automatically translates Windows Installer directory identifiers:

- `[ProgramFilesFolder]` → `C:\Program Files`
- `[ProgramFiles64Folder]` → `C:\Program Files`
- `[SystemFolder]` → `C:\Windows\System32`
- `[WindowsFolder]` → `C:\Windows`
- `[AppDataFolder]` → `%APPDATA%` (User's AppData\Roaming)
- `[CommonAppDataFolder]` → `C:\ProgramData`

## Dependencies

- **Microsoft.Deployment.WindowsInstaller** (v3.11.2): For reading MSI database structures

## Troubleshooting

**Issue**: "Access Denied" when installing
- **Solution**: Make sure you approve the UAC prompt when it appears

**Issue**: Extraction fails
- **Solution**: Ensure the MSI file is not corrupted and you have write permissions to the extraction directory

**Issue**: Application won't start
- **Solution**: Make sure you have .NET 8.0 Runtime (Windows Desktop) installed

## Security Notes

- The application requests "asInvoker" execution level by default
- When installing, it uses `runas` verb to request elevation only when needed
- Extracted files are saved in a folder next to the original MSI file

## License

This tool is provided as-is for helping with MSI installations.
