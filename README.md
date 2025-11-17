# MSI Installer Helper

A comprehensive solution for installing MSI files with administrator privileges or extracting and analyzing their contents. Available as both a Windows desktop application and a cross-platform web application.

## 🚀 Features

### Windows Desktop Application
- **Install with Admin Privileges**: Automatically elevates permissions and installs MSI files
- **Extract & Analyze**: Extracts MSI contents and reads the internal database
- **Detailed Instructions**: Provides file-by-file installation guidance
- **Modern GUI**: Easy-to-use Windows Forms interface

### Web Application
- **Universal Access**: Works on any platform with a web browser
- **File Analysis**: View MSI package information and properties
- **Content Extraction**: Extract files without installation
- **Installation Guide**: Get detailed manual installation instructions
- **Beautiful UI**: Modern, responsive web interface

## 📦 What's Included

### Windows Desktop App (`WindowsApp/`)
A native Windows application built with .NET 8.0 and Windows Forms that provides:
- MSI installation with UAC elevation
- MSI database analysis using Windows Installer API
- File extraction and directory mapping
- Complete installation instructions

**Requirements:**
- Windows 10 or later
- .NET 8.0 SDK (for building) or Runtime (for running)

### Web Application (`WebApp/`)
A Node.js/Express web application that provides:
- Cross-platform MSI analysis (best on Windows)
- File extraction (requires platform-specific tools)
- Installation instructions
- RESTful API for integration

**Requirements:**
- Node.js 14.0 or later
- Optional: msitools (Linux) or p7zip (any platform)

## 🛠️ Quick Start

### Windows Desktop Application

1. **Build the application:**
   ```bash
   cd WindowsApp/MSIInstallerHelper
   dotnet restore
   dotnet build -c Release
   ```

2. **Run the application:**
   ```bash
   bin/Release/net8.0-windows/MSIInstallerHelper.exe
   ```

3. **Use the application:**
   - Click "Browse" to select an MSI file
   - Choose "Install with Admin" for elevated installation
   - Choose "Extract & Show Instructions" for manual installation

See [WindowsApp/README.md](WindowsApp/README.md) for detailed instructions.

### Web Application

1. **Install dependencies:**
   ```bash
   cd WebApp
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

4. **Upload and analyze:**
   - Upload an MSI file
   - Choose to analyze, extract, or get instructions

See [WebApp/README.md](WebApp/README.md) for detailed instructions.

## 📖 Use Cases

### Scenario 1: Standard Installation
**Problem**: Need to install an MSI file but don't have admin rights

**Solution**: Use the Windows desktop app's "Install with Admin" button
- Automatically requests elevation
- Handles UAC prompts
- Installs normally

### Scenario 2: Manual Installation
**Problem**: Cannot use admin rights but need the software installed

**Solution**: Use either app's extraction feature
1. Extract the MSI contents
2. Review the file placement instructions
3. Manually copy files to appropriate locations

### Scenario 3: Analysis
**Problem**: Want to know what an MSI will install before running it

**Solution**: Use the analysis feature
- View product information
- See all files that will be installed
- Review installation locations
- Check package properties

### Scenario 4: Cross-Platform Analysis
**Problem**: Need to analyze MSI files on Linux/Mac

**Solution**: Use the web application
- Upload MSI file from any platform
- Get basic analysis information
- Extract files (with msitools installed)
- View installation instructions

## 🔧 Technology Stack

### Windows Application
- **.NET 8.0**: Modern .NET framework
- **Windows Forms**: Native Windows UI
- **Windows Installer API**: MSI database access
- **C#**: Programming language

### Web Application
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Multer**: File upload handling
- **HTML/CSS/JavaScript**: Frontend
- **PowerShell/msitools**: MSI processing

## 📁 Repository Structure

```
NimdAohNO/
├── WindowsApp/              # Windows desktop application
│   ├── MSIInstallerHelper/  # Main application
│   │   ├── Program.cs       # Entry point
│   │   ├── MainForm.cs      # Main GUI form
│   │   ├── app.manifest     # UAC manifest
│   │   └── *.csproj         # Project file
│   └── README.md            # Windows app documentation
│
├── WebApp/                  # Web application
│   ├── public/              # Frontend files
│   │   ├── index.html       # Main page
│   │   ├── styles.css       # Styling
│   │   └── script.js        # Client logic
│   ├── server/              # Backend
│   │   └── server.js        # Express server
│   ├── package.json         # Dependencies
│   └── README.md            # Web app documentation
│
└── README.md                # This file
```

## 🔐 Security Considerations

- **Admin Elevation**: Windows app requests elevation only when needed
- **File Validation**: Only .msi files are accepted
- **Temporary Storage**: Uploaded files are deleted after processing
- **No Credentials Stored**: Applications don't store sensitive data
- **Local Processing**: All processing happens locally (no external services)

## 🌟 Common MSI Installation Paths

When extracting and manually installing, files typically go to:

| MSI Variable | Windows Path |
|--------------|--------------|
| `[ProgramFilesFolder]` | `C:\Program Files\` |
| `[ProgramFiles64Folder]` | `C:\Program Files\` |
| `[SystemFolder]` | `C:\Windows\System32\` |
| `[WindowsFolder]` | `C:\Windows\` |
| `[AppDataFolder]` | `%APPDATA%` |
| `[CommonAppDataFolder]` | `C:\ProgramData\` |
| `[TempFolder]` | `%TEMP%` |

## ⚠️ Limitations

### Windows Desktop App
- Requires Windows operating system
- Needs .NET 8.0 Runtime
- Admin rights required for installation (not for extraction)

### Web Application
- Full MSI analysis requires Windows platform
- Linux/Mac require additional tools (msitools/p7zip)
- Large file uploads may timeout on slow connections
- Registry entries not handled in manual installation

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Add more detailed MSI property analysis
- Improve cross-platform extraction
- Add registry entry extraction
- Support for MSP (patch) files
- Batch processing capabilities

## 📄 License

MIT License - See LICENSE file for details

## 🐛 Troubleshooting

### Windows App Issues

**Issue**: Application won't start
- Install .NET 8.0 Desktop Runtime from Microsoft

**Issue**: "Access Denied" during installation
- Approve the UAC prompt when it appears

**Issue**: Extraction fails
- Check write permissions in the target directory

### Web App Issues

**Issue**: Cannot install dependencies
- Update Node.js to version 14.0 or later

**Issue**: Extraction fails on Linux
- Install msitools: `sudo apt-get install msitools`

**Issue**: Limited analysis on non-Windows
- Use Windows desktop app for full functionality

## 📞 Support

For issues, feature requests, or questions:
1. Check the relevant README (Windows or Web app)
2. Review the troubleshooting sections
3. Open an issue on GitHub

## 🎯 Roadmap

- [ ] Add support for MSP (patch) files
- [ ] Implement registry entry extraction
- [ ] Add file comparison between MSI versions
- [ ] Create Docker container for web app
- [ ] Add authentication for web app
- [ ] Support batch MSI processing
- [ ] Add file checksum verification
- [ ] Create installer for Windows app

## ✨ Credits

Built with modern development practices and tools to solve a common Windows administration challenge.

---

**Note**: This tool is designed to help system administrators and users who need to work with MSI files without full administrative access or who need to understand what an installer will do before running it.