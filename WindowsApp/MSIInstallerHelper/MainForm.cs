using System;
using System.Diagnostics;
using System.IO;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Deployment.WindowsInstaller;

namespace MSIInstallerHelper
{
    public partial class MainForm : Form
    {
        private TextBox txtMsiPath;
        private Button btnBrowse;
        private Button btnInstallAsAdmin;
        private Button btnExtract;
        private TextBox txtOutput;
        private Label lblTitle;
        private Label lblInstructions;

        public MainForm()
        {
            InitializeComponent();
            this.Text = "MSI Installer Helper";
            this.Size = new System.Drawing.Size(800, 600);
            this.StartPosition = FormStartPosition.CenterScreen;
        }

        private void InitializeComponent()
        {
            this.SuspendLayout();

            // Title Label
            lblTitle = new Label
            {
                Text = "MSI Installer Helper",
                Font = new System.Drawing.Font("Segoe UI", 16F, System.Drawing.FontStyle.Bold),
                Location = new System.Drawing.Point(20, 20),
                Size = new System.Drawing.Size(760, 40),
                TextAlign = System.Drawing.ContentAlignment.MiddleCenter
            };
            this.Controls.Add(lblTitle);

            // Instructions Label
            lblInstructions = new Label
            {
                Text = "Select an MSI file to install with admin privileges or extract its contents",
                Location = new System.Drawing.Point(20, 70),
                Size = new System.Drawing.Size(760, 30),
                TextAlign = System.Drawing.ContentAlignment.MiddleCenter
            };
            this.Controls.Add(lblInstructions);

            // MSI Path TextBox
            txtMsiPath = new TextBox
            {
                Location = new System.Drawing.Point(20, 110),
                Size = new System.Drawing.Size(600, 25),
                PlaceholderText = "Select MSI file..."
            };
            this.Controls.Add(txtMsiPath);

            // Browse Button
            btnBrowse = new Button
            {
                Text = "Browse...",
                Location = new System.Drawing.Point(630, 108),
                Size = new System.Drawing.Size(130, 30)
            };
            btnBrowse.Click += BtnBrowse_Click;
            this.Controls.Add(btnBrowse);

            // Install as Admin Button
            btnInstallAsAdmin = new Button
            {
                Text = "Install with Admin",
                Location = new System.Drawing.Point(20, 150),
                Size = new System.Drawing.Size(200, 40),
                BackColor = System.Drawing.Color.LightGreen
            };
            btnInstallAsAdmin.Click += BtnInstallAsAdmin_Click;
            this.Controls.Add(btnInstallAsAdmin);

            // Extract Button
            btnExtract = new Button
            {
                Text = "Extract & Show Instructions",
                Location = new System.Drawing.Point(230, 150),
                Size = new System.Drawing.Size(200, 40),
                BackColor = System.Drawing.Color.LightBlue
            };
            btnExtract.Click += BtnExtract_Click;
            this.Controls.Add(btnExtract);

            // Output TextBox
            txtOutput = new TextBox
            {
                Location = new System.Drawing.Point(20, 200),
                Size = new System.Drawing.Size(740, 330),
                Multiline = true,
                ScrollBars = ScrollBars.Both,
                ReadOnly = true,
                Font = new System.Drawing.Font("Consolas", 9F)
            };
            this.Controls.Add(txtOutput);

            this.ResumeLayout(false);
        }

        private void BtnBrowse_Click(object? sender, EventArgs e)
        {
            using (OpenFileDialog openFileDialog = new OpenFileDialog())
            {
                openFileDialog.Filter = "MSI Files (*.msi)|*.msi|All Files (*.*)|*.*";
                openFileDialog.Title = "Select an MSI File";

                if (openFileDialog.ShowDialog() == DialogResult.OK)
                {
                    txtMsiPath.Text = openFileDialog.FileName;
                    txtOutput.Clear();
                }
            }
        }

        private void BtnInstallAsAdmin_Click(object? sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtMsiPath.Text) || !File.Exists(txtMsiPath.Text))
            {
                MessageBox.Show("Please select a valid MSI file.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            try
            {
                txtOutput.Text = "Starting installation with administrator privileges...\r\n";
                
                ProcessStartInfo startInfo = new ProcessStartInfo
                {
                    FileName = "msiexec.exe",
                    Arguments = $"/i \"{txtMsiPath.Text}\"",
                    Verb = "runas", // Request admin elevation
                    UseShellExecute = true
                };

                Process? process = Process.Start(startInfo);
                txtOutput.AppendText("Installation process started successfully!\r\n");
                txtOutput.AppendText("The installer will run with administrator privileges.\r\n");
                txtOutput.AppendText("\r\nNote: You may need to approve the UAC prompt.\r\n");
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error starting installation: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                txtOutput.AppendText($"\r\nError: {ex.Message}\r\n");
            }
        }

        private void BtnExtract_Click(object? sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtMsiPath.Text) || !File.Exists(txtMsiPath.Text))
            {
                MessageBox.Show("Please select a valid MSI file.", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            try
            {
                string msiPath = txtMsiPath.Text;
                string extractPath = Path.Combine(Path.GetDirectoryName(msiPath) ?? "", 
                    Path.GetFileNameWithoutExtension(msiPath) + "_extracted");

                // Create extraction directory
                if (Directory.Exists(extractPath))
                {
                    var result = MessageBox.Show($"Directory {extractPath} already exists. Overwrite?", 
                        "Confirm", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                    if (result == DialogResult.No)
                        return;
                    
                    Directory.Delete(extractPath, true);
                }

                Directory.CreateDirectory(extractPath);

                txtOutput.Text = $"Extracting MSI file to: {extractPath}\r\n\r\n";

                // Extract MSI using msiexec
                ProcessStartInfo extractInfo = new ProcessStartInfo
                {
                    FileName = "msiexec.exe",
                    Arguments = $"/a \"{msiPath}\" /qn TARGETDIR=\"{extractPath}\"",
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                using (Process? extractProcess = Process.Start(extractInfo))
                {
                    extractProcess?.WaitForExit();
                    
                    if (extractProcess?.ExitCode == 0)
                    {
                        txtOutput.AppendText("Extraction completed successfully!\r\n\r\n");
                        AnalyzeMsiAndProvideInstructions(msiPath, extractPath);
                    }
                    else
                    {
                        txtOutput.AppendText($"Extraction may have issues. Exit code: {extractProcess?.ExitCode}\r\n");
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error during extraction: {ex.Message}", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                txtOutput.AppendText($"\r\nError: {ex.Message}\r\n");
            }
        }

        private void AnalyzeMsiAndProvideInstructions(string msiPath, string extractPath)
        {
            try
            {
                txtOutput.AppendText("=== INSTALLATION ANALYSIS ===\r\n\r\n");
                
                // Analyze MSI database
                using (Database database = new Database(msiPath, DatabaseOpenMode.ReadOnly))
                {
                    // Get product information
                    txtOutput.AppendText("PRODUCT INFORMATION:\r\n");
                    txtOutput.AppendText($"Product Name: {GetProperty(database, "ProductName")}\r\n");
                    txtOutput.AppendText($"Manufacturer: {GetProperty(database, "Manufacturer")}\r\n");
                    txtOutput.AppendText($"Version: {GetProperty(database, "ProductVersion")}\r\n");
                    txtOutput.AppendText($"\r\n");

                    // Get file installation information
                    txtOutput.AppendText("FILE INSTALLATION GUIDE:\r\n\r\n");
                    
                    var fileLocations = GetFileLocations(database);
                    
                    foreach (var location in fileLocations.OrderBy(x => x.Key))
                    {
                        txtOutput.AppendText($"Destination: {location.Key}\r\n");
                        foreach (var file in location.Value)
                        {
                            txtOutput.AppendText($"  - {file}\r\n");
                        }
                        txtOutput.AppendText("\r\n");
                    }

                    txtOutput.AppendText("\r\nMANUAL INSTALLATION STEPS:\r\n");
                    txtOutput.AppendText("1. Navigate to the extracted folder\r\n");
                    txtOutput.AppendText($"2. Copy files according to the destinations listed above\r\n");
                    txtOutput.AppendText($"3. Common destinations:\r\n");
                    txtOutput.AppendText($"   - [ProgramFilesFolder] = C:\\Program Files\r\n");
                    txtOutput.AppendText($"   - [ProgramFiles64Folder] = C:\\Program Files\r\n");
                    txtOutput.AppendText($"   - [SystemFolder] = C:\\Windows\\System32\r\n");
                    txtOutput.AppendText($"   - [WindowsFolder] = C:\\Windows\r\n");
                    txtOutput.AppendText($"   - [AppDataFolder] = %APPDATA%\r\n");
                    txtOutput.AppendText($"   - [CommonAppDataFolder] = C:\\ProgramData\r\n");
                }

                txtOutput.AppendText($"\r\nExtracted files location: {extractPath}\r\n");
            }
            catch (Exception ex)
            {
                txtOutput.AppendText($"\r\nError analyzing MSI: {ex.Message}\r\n");
                txtOutput.AppendText("\r\nBASIC INSTRUCTIONS:\r\n");
                txtOutput.AppendText($"Files have been extracted to: {extractPath}\r\n");
                txtOutput.AppendText("Please review the extracted files and copy them manually to appropriate locations.\r\n");
            }
        }

        private string GetProperty(Database database, string propertyName)
        {
            try
            {
                using (View view = database.OpenView($"SELECT `Value` FROM `Property` WHERE `Property` = '{propertyName}'"))
                {
                    view.Execute();
                    Record? record = view.Fetch();
                    return record?[1]?.ToString() ?? "N/A";
                }
            }
            catch
            {
                return "N/A";
            }
        }

        private Dictionary<string, List<string>> GetFileLocations(Database database)
        {
            var fileLocations = new Dictionary<string, List<string>>();

            try
            {
                // Query the File table
                using (View view = database.OpenView("SELECT `File`, `FileName`, `Component_` FROM `File`"))
                {
                    view.Execute();
                    
                    while (true)
                    {
                        Record? record = view.Fetch();
                        if (record == null) break;

                        string fileName = record[2]?.ToString() ?? "";
                        if (fileName.Contains("|"))
                        {
                            fileName = fileName.Split('|').Last();
                        }

                        string component = record[3]?.ToString() ?? "";
                        string directory = GetComponentDirectory(database, component);

                        if (!fileLocations.ContainsKey(directory))
                        {
                            fileLocations[directory] = new List<string>();
                        }

                        fileLocations[directory].Add(fileName);
                    }
                }
            }
            catch (Exception ex)
            {
                fileLocations["Error"] = new List<string> { $"Could not read file table: {ex.Message}" };
            }

            return fileLocations;
        }

        private string GetComponentDirectory(Database database, string component)
        {
            try
            {
                using (View view = database.OpenView($"SELECT `Directory_` FROM `Component` WHERE `Component` = '{component}'"))
                {
                    view.Execute();
                    Record? record = view.Fetch();
                    string? dirId = record?[1]?.ToString();
                    
                    if (dirId != null)
                    {
                        return ResolveDirectory(database, dirId);
                    }
                }
            }
            catch { }

            return "[UNKNOWN]";
        }

        private string ResolveDirectory(Database database, string directoryId)
        {
            try
            {
                using (View view = database.OpenView($"SELECT `DefaultDir`, `Directory_Parent` FROM `Directory` WHERE `Directory` = '{directoryId}'"))
                {
                    view.Execute();
                    Record? record = view.Fetch();
                    
                    if (record != null)
                    {
                        string defaultDir = record[1]?.ToString() ?? "";
                        string? parent = record[2]?.ToString();

                        if (defaultDir.Contains("|"))
                        {
                            defaultDir = defaultDir.Split('|').Last();
                        }

                        if (string.IsNullOrEmpty(parent))
                        {
                            return $"[{directoryId}]";
                        }
                        else
                        {
                            string parentPath = ResolveDirectory(database, parent);
                            return $"{parentPath}\\{defaultDir}";
                        }
                    }
                }
            }
            catch { }

            return $"[{directoryId}]";
        }
    }
}
