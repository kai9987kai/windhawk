using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;

internal static class Program
{
    private const string PayloadResourceName = "WindhawkPortablePayload.zip";
    private const string AppName = "Windhawk Custom Portable";
    private const string ShortcutName = "Windhawk Custom Portable";

    [STAThread]
    private static int Main(string[] args)
    {
        bool silent = args.Any(arg => string.Equals(arg, "/silent", StringComparison.OrdinalIgnoreCase));
        string targetDir = GetTargetDir(args) ?? Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "Programs",
            "Windhawk-Custom-Portable");

        try
        {
            if (!silent)
            {
                var result = MessageBox.Show(
                    "Install " + AppName + " to:\n\n" + targetDir,
                    AppName + " Installer",
                    MessageBoxButtons.OKCancel,
                    MessageBoxIcon.Information);

                if (result != DialogResult.OK)
                {
                    return 1;
                }
            }

            Directory.CreateDirectory(targetDir);
            InstallPayload(targetDir);
            CreateShellShortcuts(targetDir);

            if (!silent)
            {
                var launchResult = MessageBox.Show(
                    AppName + " was installed successfully.\n\nLaunch it now?",
                    AppName + " Installer",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information);

                if (launchResult == DialogResult.Yes)
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = Path.Combine(targetDir, "windhawk.exe"),
                        WorkingDirectory = targetDir,
                        UseShellExecute = true,
                    });
                }
            }

            return 0;
        }
        catch (Exception ex)
        {
            string message = AppName + " installation failed.\n\n" + ex.Message;

            if (silent)
            {
                Console.Error.WriteLine(message);
            }
            else
            {
                MessageBox.Show(
                    message,
                    AppName + " Installer",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
            }

            return 2;
        }
    }

    private static string GetTargetDir(string[] args)
    {
        const string Prefix = "/dir=";

        foreach (string arg in args)
        {
            if (!arg.StartsWith(Prefix, StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            string configuredPath = arg.Substring(Prefix.Length).Trim().Trim('"');
            if (string.IsNullOrWhiteSpace(configuredPath))
            {
                throw new ArgumentException("The /dir argument must include a target path.");
            }

            return Path.GetFullPath(Environment.ExpandEnvironmentVariables(configuredPath));
        }

        return null;
    }

    private static void InstallPayload(string targetDir)
    {
        string tempZipPath = Path.Combine(
            Path.GetTempPath(),
            "windhawk-custom-portable-" + Guid.NewGuid().ToString("N") + ".zip");
        string tempExtractDir = Path.Combine(
            Path.GetTempPath(),
            "windhawk-custom-portable-extract-" + Guid.NewGuid().ToString("N"));

        try
        {
            using (Stream payloadStream = Assembly.GetExecutingAssembly()
                       .GetManifestResourceStream(PayloadResourceName))
            {
                if (payloadStream == null)
                {
                    throw new InvalidOperationException("Embedded payload not found.");
                }

                using (FileStream fileStream = File.Create(tempZipPath))
                {
                    payloadStream.CopyTo(fileStream);
                }
            }

            Directory.CreateDirectory(tempExtractDir);
            ZipFile.ExtractToDirectory(tempZipPath, tempExtractDir);
            SynchronizeDirectory(tempExtractDir, targetDir);
        }
        finally
        {
            if (File.Exists(tempZipPath))
            {
                File.Delete(tempZipPath);
            }

            if (Directory.Exists(tempExtractDir))
            {
                Directory.Delete(tempExtractDir, true);
            }
        }
    }

    private static void SynchronizeDirectory(string sourceDir, string targetDir)
    {
        Directory.CreateDirectory(targetDir);

        foreach (string sourceSubdirectory in Directory.GetDirectories(sourceDir))
        {
            string directoryName = Path.GetFileName(sourceSubdirectory);
            if (string.IsNullOrEmpty(directoryName))
            {
                continue;
            }

            string targetSubdirectory = Path.Combine(targetDir, directoryName);
            SynchronizeDirectory(sourceSubdirectory, targetSubdirectory);
        }

        foreach (string sourceFile in Directory.GetFiles(sourceDir))
        {
            string fileName = Path.GetFileName(sourceFile);
            if (string.IsNullOrEmpty(fileName))
            {
                continue;
            }

            string targetFile = Path.Combine(targetDir, fileName);
            if (File.Exists(targetFile))
            {
                File.SetAttributes(targetFile, FileAttributes.Normal);
            }

            File.Copy(sourceFile, targetFile, true);
        }

        var sourceEntries = Directory.GetFileSystemEntries(sourceDir)
            .Select(Path.GetFileName)
            .Where(name => !string.IsNullOrEmpty(name))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (string targetEntry in Directory.GetFileSystemEntries(targetDir))
        {
            string entryName = Path.GetFileName(targetEntry);
            if (string.IsNullOrEmpty(entryName) || sourceEntries.Contains(entryName))
            {
                continue;
            }

            if (Directory.Exists(targetEntry))
            {
                DeleteDirectory(targetEntry);
            }
            else if (File.Exists(targetEntry))
            {
                File.SetAttributes(targetEntry, FileAttributes.Normal);
                File.Delete(targetEntry);
            }
        }
    }

    private static void DeleteDirectory(string path)
    {
        foreach (string filePath in Directory.GetFiles(path, "*", SearchOption.AllDirectories))
        {
            File.SetAttributes(filePath, FileAttributes.Normal);
        }

        Directory.Delete(path, true);
    }

    private static void CreateShellShortcuts(string targetDir)
    {
        string exePath = Path.Combine(targetDir, "windhawk.exe");
        string desktopShortcutPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory),
            ShortcutName + ".lnk");
        string startMenuShortcutPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.Programs),
            ShortcutName + ".lnk");

        CreateShortcut(desktopShortcutPath, exePath, targetDir);
        CreateShortcut(startMenuShortcutPath, exePath, targetDir);

        // Windows doesn't reliably expose taskbar pinning to third-party
        // installers, so only use it when the shell advertises a taskbar verb.
        TryPinToTaskbar(startMenuShortcutPath);
    }

    private static void CreateShortcut(string shortcutPath,
                                       string targetPath,
                                       string workingDirectory)
    {
        string shortcutDirectory = Path.GetDirectoryName(shortcutPath);
        if (!string.IsNullOrEmpty(shortcutDirectory))
        {
            Directory.CreateDirectory(shortcutDirectory);
        }

        Type shellType = Type.GetTypeFromProgID("WScript.Shell");
        if (shellType == null)
        {
            throw new InvalidOperationException("WScript.Shell is not available.");
        }

        object shellObject = Activator.CreateInstance(shellType);

        try
        {
            object shortcutObject = shellType.InvokeMember(
                "CreateShortcut",
                BindingFlags.InvokeMethod,
                null,
                shellObject,
                new object[] { shortcutPath });

            Type shortcutType = shortcutObject.GetType();
            shortcutType.InvokeMember("TargetPath",
                                      BindingFlags.SetProperty,
                                      null,
                                      shortcutObject,
                                      new object[] { targetPath });
            shortcutType.InvokeMember("WorkingDirectory",
                                      BindingFlags.SetProperty,
                                      null,
                                      shortcutObject,
                                      new object[] { workingDirectory });
            shortcutType.InvokeMember("IconLocation",
                                      BindingFlags.SetProperty,
                                      null,
                                      shortcutObject,
                                      new object[] { targetPath + ",0" });
            shortcutType.InvokeMember("Save",
                                      BindingFlags.InvokeMethod,
                                      null,
                                      shortcutObject,
                                      Array.Empty<object>());

            Marshal.FinalReleaseComObject(shortcutObject);
        }
        finally
        {
            Marshal.FinalReleaseComObject(shellObject);
        }
    }

    private static void TryPinToTaskbar(string shortcutPath)
    {
        try
        {
            Type shellType = Type.GetTypeFromProgID("Shell.Application");
            if (shellType == null)
            {
                return;
            }

            object shellObject = Activator.CreateInstance(shellType);

            try
            {
                string folderPath = Path.GetDirectoryName(shortcutPath);
                string shortcutName = Path.GetFileName(shortcutPath);
                if (string.IsNullOrEmpty(folderPath) || string.IsNullOrEmpty(shortcutName))
                {
                    return;
                }

                object folder = shellType.InvokeMember(
                    "NameSpace",
                    BindingFlags.InvokeMethod,
                    null,
                    shellObject,
                    new object[] { folderPath });
                if (folder == null)
                {
                    return;
                }

                try
                {
                    Type folderType = folder.GetType();
                    object item = folderType.InvokeMember(
                        "ParseName",
                        BindingFlags.InvokeMethod,
                        null,
                        folder,
                        new object[] { shortcutName });
                    if (item == null)
                    {
                        return;
                    }

                    try
                    {
                        Type itemType = item.GetType();
                        object verbs = itemType.InvokeMember(
                            "Verbs",
                            BindingFlags.InvokeMethod,
                            null,
                            item,
                            Array.Empty<object>());
                        if (verbs == null)
                        {
                            return;
                        }

                        try
                        {
                            Type verbsType = verbs.GetType();
                            int count = (int)verbsType.InvokeMember(
                                "Count",
                                BindingFlags.GetProperty,
                                null,
                                verbs,
                                null);

                            for (int i = 0; i < count; i++)
                            {
                                object verb = verbsType.InvokeMember(
                                    "Item",
                                    BindingFlags.InvokeMethod,
                                    null,
                                    verbs,
                                    new object[] { i });
                                if (verb == null)
                                {
                                    continue;
                                }

                                try
                                {
                                    string name = (string)verb.GetType().InvokeMember(
                                        "Name",
                                        BindingFlags.GetProperty,
                                        null,
                                        verb,
                                        null);
                                    string normalizedName =
                                        (name ?? string.Empty).Replace("&", string.Empty)
                                                              .Trim()
                                                              .ToLowerInvariant();

                                    if (normalizedName.Contains("taskbar"))
                                    {
                                        verb.GetType().InvokeMember(
                                            "DoIt",
                                            BindingFlags.InvokeMethod,
                                            null,
                                            verb,
                                            Array.Empty<object>());
                                        return;
                                    }
                                }
                                finally
                                {
                                    Marshal.FinalReleaseComObject(verb);
                                }
                            }
                        }
                        finally
                        {
                            Marshal.FinalReleaseComObject(verbs);
                        }
                    }
                    finally
                    {
                        Marshal.FinalReleaseComObject(item);
                    }
                }
                finally
                {
                    Marshal.FinalReleaseComObject(folder);
                }
            }
            finally
            {
                Marshal.FinalReleaseComObject(shellObject);
            }
        }
        catch
        {
            // Best-effort only. Current Windows builds may block taskbar pinning
            // for third-party installers.
        }
    }
}
