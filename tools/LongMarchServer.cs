using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

static class LongMarchServer
{
    const int Port = 28765;
    const string DefaultGameUrl = "http://127.0.0.1:28765/";
    static string AppRoot;
    static string WebRoot;
    static string SaveRoot;
    static readonly object FileLock = new object();

    class LaunchOptions
    {
        public string WindowMode = "maximized";
        public bool Fullscreen = false;
    }

    static class NativeMethods
    {
        internal delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
        [DllImport("user32.dll")] internal static extern bool EnumWindows(EnumWindowsProc callback, IntPtr lParam);
        [DllImport("user32.dll", CharSet = CharSet.Unicode)] internal static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
        [DllImport("user32.dll")] internal static extern int GetWindowTextLength(IntPtr hWnd);
        [DllImport("user32.dll")] internal static extern bool IsWindowVisible(IntPtr hWnd);
        [DllImport("user32.dll")] internal static extern bool ShowWindow(IntPtr hWnd, int command);
        [DllImport("user32.dll")] internal static extern bool SetForegroundWindow(IntPtr hWnd);
        [DllImport("user32.dll")] internal static extern bool SetWindowPos(IntPtr hWnd, IntPtr insertAfter, int x, int y, int width, int height, uint flags);
    }

    [STAThread]
    static void Main(string[] args)
    {
        bool openBrowser = Environment.GetEnvironmentVariable("LONGMARCH_NO_BROWSER") != "1" && !HasArgument(args, "--no-browser");
        AppRoot = FindAppRoot(args);
        WebRoot = Path.Combine(AppRoot, "web");
        SaveRoot = Environment.GetEnvironmentVariable("LONGMARCH_SAVE_ROOT");
        if (String.IsNullOrWhiteSpace(SaveRoot))
            SaveRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "长征·星火征途存档");
        SaveRoot = Path.GetFullPath(SaveRoot);
        Directory.CreateDirectory(Path.Combine(SaveRoot, "saves"));
        EnsureReadme();
        SyncLibraryFromFolders();

        TcpListener listener;
        try
        {
            listener = new TcpListener(IPAddress.Loopback, Port);
            listener.Start();
        }
        catch
        {
            try { WriteLog("启动提示：端口已被占用，正在打开已运行的存档服务。"); } catch { }
            if (openBrowser) OpenGame(true);
            return;
        }

        if (openBrowser) OpenGame(false);
        while (true)
        {
            try
            {
                TcpClient client = listener.AcceptTcpClient();
                ThreadPool.QueueUserWorkItem(state => HandleClient((TcpClient)state), client);
            }
            catch (Exception error)
            {
                try { WriteLog(error.ToString()); } catch { }
            }
        }
    }

    static bool HasArgument(string[] args, string expected)
    {
        foreach (string value in args) if (String.Equals(value, expected, StringComparison.OrdinalIgnoreCase)) return true;
        return false;
    }

    static IntPtr FindGameWindow()
    {
        IntPtr found = IntPtr.Zero;
        NativeMethods.EnumWindows((handle, state) =>
        {
            if (!NativeMethods.IsWindowVisible(handle)) return true;
            int length = NativeMethods.GetWindowTextLength(handle);
            if (length <= 0) return true;
            var title = new StringBuilder(length + 1);
            NativeMethods.GetWindowText(handle, title, title.Capacity);
            if (!String.Equals(title.ToString().Trim(), "长征·星火征途", StringComparison.OrdinalIgnoreCase)) return true;
            found = handle;
            return false;
        }, IntPtr.Zero);
        return found;
    }

    static LaunchOptions ReadLaunchOptions()
    {
        var options = new LaunchOptions();
        try
        {
            string path = Path.Combine(SaveRoot, "settings.json");
            if (!File.Exists(path)) return options;
            var serializer = new JavaScriptSerializer();
            var data = serializer.DeserializeObject(File.ReadAllText(path, Encoding.UTF8)) as Dictionary<string, object>;
            if (data == null) return options;
            object mode;
            if (data.TryGetValue("startupWindowMode", out mode))
            {
                string value = Convert.ToString(mode);
                if (!String.IsNullOrWhiteSpace(value) && (value == "maximized" || ParseWindowSize(value) != null)) options.WindowMode = value;
            }
            object fullscreen;
            if (data.TryGetValue("startFullscreen", out fullscreen)) options.Fullscreen = Convert.ToBoolean(fullscreen);
        }
        catch (Exception error)
        {
            try { WriteLog("读取窗口设置失败：" + error.Message); } catch { }
        }
        return options;
    }

    static int[] ParseWindowSize(string value)
    {
        if (String.IsNullOrWhiteSpace(value)) return null;
        string[] parts = value.ToLowerInvariant().Split('x');
        int width, height;
        if (parts.Length != 2 || !Int32.TryParse(parts[0], out width) || !Int32.TryParse(parts[1], out height)) return null;
        if (width < 960 || height < 540 || width > 3840 || height > 2160) return null;
        return new[] { width, height };
    }

    static void QueueConfigureGameWindow(LaunchOptions options, bool waitForWindow = false)
    {
        Action configure = () =>
        {
            bool activated = false;
            int forced = 0;
            int[] size = ParseWindowSize(options.WindowMode);
            for (int attempt = 0; attempt < 100 && forced < 35; attempt++)
            {
                IntPtr window = FindGameWindow();
                if (window != IntPtr.Zero)
                {
                    if (!activated)
                    {
                        NativeMethods.SetForegroundWindow(window);
                        activated = true;
                    }
                    if (options.Fullscreen || size == null)
                    {
                        NativeMethods.ShowWindow(window, 3);
                    }
                    else
                    {
                        NativeMethods.ShowWindow(window, 9);
                        var area = System.Windows.Forms.Screen.FromHandle(window).WorkingArea;
                        int x = area.X + Math.Max(0, (area.Width - size[0]) / 2);
                        int y = area.Y + Math.Max(0, (area.Height - size[1]) / 2);
                        NativeMethods.SetWindowPos(window, IntPtr.Zero, x, y, size[0], size[1], 0x0040 | 0x0004);
                    }
                    forced++;
                }
                Thread.Sleep(200);
            }
        };
        if (waitForWindow) configure();
        else ThreadPool.QueueUserWorkItem(state => configure());
    }

    static void OpenGame(bool waitForWindow = false)
    {
        try
        {
            string url = Environment.GetEnvironmentVariable("LONGMARCH_GAME_URL");
            if (String.IsNullOrWhiteSpace(url)) url = DefaultGameUrl;
            LaunchOptions options = ReadLaunchOptions();
            string edge86 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            string edge64 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            string edge = File.Exists(edge86) ? edge86 : edge64;
            if (File.Exists(edge))
            {
                int[] size = ParseWindowSize(options.WindowMode);
                string arguments = "--app=\"" + url + "\" --no-first-run";
                if (options.Fullscreen) arguments += " --start-fullscreen";
                else if (size == null) arguments += " --start-maximized";
                else arguments += " --window-size=" + size[0] + "," + size[1];
                var info = new ProcessStartInfo();
                info.FileName = edge;
                info.Arguments = arguments;
                info.WorkingDirectory = AppRoot;
                info.UseShellExecute = false;
                Process.Start(info);
                QueueConfigureGameWindow(options, waitForWindow);
                return;
            }
            Process.Start(new ProcessStartInfo { FileName = url, UseShellExecute = true });
            QueueConfigureGameWindow(options, waitForWindow);
        }
        catch (Exception error)
        {
            try { WriteLog("打开游戏失败：" + error.Message); } catch { }
        }
    }

    static string FindAppRoot(string[] args)
    {
        for (int i = 0; i < args.Length - 1; i++)
            if (String.Equals(args[i], "--root", StringComparison.OrdinalIgnoreCase))
                return Path.GetFullPath(args[i + 1]);
        return AppDomain.CurrentDomain.BaseDirectory;
    }

    static void EnsureReadme()
    {
        string path = Path.Combine(SaveRoot, "存档说明.txt");
        if (File.Exists(path)) return;
        string text = "长征·星火征途存档目录\r\n\r\nlibrary.json 保存存档列表。\r\nsaves 下的每个子文件夹是一份独立存档，内含 meta.json 与 run.json，可整体复制备份或迁移。\r\n卸载游戏不会删除此文件夹；删除游戏本体前请先保留这里的存档。\r\n";
        File.WriteAllText(path, text, new UTF8Encoding(false));
    }

    static void WriteLog(string text)
    {
        Directory.CreateDirectory(SaveRoot);
        File.AppendAllText(Path.Combine(SaveRoot, "server.log"), DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture) + " " + text + "\r\n", new UTF8Encoding(false));
    }

    static void HandleClient(TcpClient client)
    {
        using (client)
        {
            try
            {
                client.ReceiveTimeout = 10000;
                NetworkStream stream = client.GetStream();
                string headerText;
                byte[] body = ReadRequest(stream, out headerText);
                string[] lines = headerText.Split(new[] { "\r\n" }, StringSplitOptions.None);
                if (lines.Length == 0) return;
                string[] first = lines[0].Split(' ');
                if (first.Length < 2) return;
                string method = first[0].ToUpperInvariant();
                string rawUrl = first[1];
                string path = Uri.UnescapeDataString(rawUrl.Split('?')[0]);
                var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                for (int i = 1; i < lines.Length; i++)
                {
                    int colon = lines[i].IndexOf(':');
                    if (colon > 0) headers[lines[i].Substring(0, colon).Trim()] = lines[i].Substring(colon + 1).Trim();
                }
                Route(stream, method, path, headers, body);
            }
            catch (Exception error)
            {
                try { WriteResponse(client.GetStream(), 500, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{\"ok\":false,\"error\":\"server error\"}")); } catch { }
                try { WriteLog(error.ToString()); } catch { }
            }
        }
    }

    static byte[] ReadRequest(NetworkStream stream, out string headerText)
    {
        var all = new List<byte>();
        int state = 0;
        while (state < 4)
        {
            int value = stream.ReadByte();
            if (value < 0) break;
            byte b = (byte)value;
            all.Add(b);
            if ((state == 0 || state == 2) && b == 13) state++;
            else if ((state == 1 || state == 3) && b == 10) state++;
            else state = b == 13 ? 1 : 0;
        }
        byte[] headerBytes = all.ToArray();
        headerText = Encoding.ASCII.GetString(headerBytes);
        int contentLength = 0;
        foreach (string line in headerText.Split(new[] { "\r\n" }, StringSplitOptions.None))
            if (line.StartsWith("Content-Length:", StringComparison.OrdinalIgnoreCase))
                Int32.TryParse(line.Substring(15).Trim(), out contentLength);
        byte[] body = new byte[contentLength];
        int offset = 0;
        while (offset < contentLength)
        {
            int read = stream.Read(body, offset, contentLength - offset);
            if (read <= 0) break;
            offset += read;
        }
        if (offset == body.Length) return body;
        return body.Take(offset).ToArray();
    }

    static void Route(NetworkStream stream, string method, string path, Dictionary<string,string> headers, byte[] body)
    {
        if (path == "/api/ping")
        {
            string json = "{\"ok\":true,\"saveRoot\":" + Json(SaveRoot) + "}";
            WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes(json));
            return;
        }
        if (path == "/api/save-root")
        {
            WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{\"path\":" + Json(SaveRoot) + "}"));
            return;
        }
        if (path == "/api/open-save-folder")
        {
            Process.Start(new ProcessStartInfo { FileName = "explorer.exe", Arguments = "\"" + SaveRoot + "\"", UseShellExecute = true });
            WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{\"ok\":true}"));
            return;
        }
        if (path.StartsWith("/api/storage/", StringComparison.Ordinal))
        {
            HandleStorage(stream, method, path.Substring("/api/storage/".Length), body);
            return;
        }
        if (method != "GET" && method != "HEAD")
        {
            WriteResponse(stream, 405, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Method not allowed"));
            return;
        }
        string relative = path == "/" ? "index.html" : path.TrimStart('/');
        string full = Path.GetFullPath(Path.Combine(WebRoot, relative.Replace('/', Path.DirectorySeparatorChar)));
        string prefix = Path.GetFullPath(WebRoot).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
        if (!full.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) && !String.Equals(full, Path.GetFullPath(WebRoot), StringComparison.OrdinalIgnoreCase))
        {
            WriteResponse(stream, 403, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Forbidden"));
            return;
        }
        if (!File.Exists(full))
        {
            WriteResponse(stream, 404, "text/plain; charset=utf-8", Encoding.UTF8.GetBytes("Not found"));
            return;
        }
        byte[] data = File.ReadAllBytes(full);
        WriteResponse(stream, 200, Mime(full), method == "HEAD" ? new byte[0] : data);
    }

    static void HandleStorage(NetworkStream stream, string method, string storagePath, byte[] body)
    {
        if (storagePath == "library")
        {
            if (method == "GET") { SyncLibraryFromFolders(); ReadOr404(stream, Path.Combine(SaveRoot, "library.json")); return; }
            if (method == "PUT" || method == "POST")
            {
                lock (FileLock)
                {
                    File.WriteAllBytes(Path.Combine(SaveRoot, "library.json"), body);
                    UpdateSlotMetaFromLibrary(body);
                }
                WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{\"ok\":true}"));
                return;
            }
            if (method == "DELETE") { DeleteFile(Path.Combine(SaveRoot, "library.json")); WriteOk(stream); return; }
        }
        if (storagePath == "settings")
        {
            string settings = Path.Combine(SaveRoot, "settings.json");
            if (method == "GET") { if (File.Exists(settings)) ReadOr404(stream, settings); else WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{}")); return; }
            if (method == "PUT" || method == "POST") { lock (FileLock) File.WriteAllBytes(settings, body); WriteOk(stream); return; }
            if (method == "DELETE") { DeleteFile(settings); WriteOk(stream); return; }
        }
        if (storagePath == "history")
        {
            string legacyHistory = Path.Combine(SaveRoot, "history.json");
            if (method == "GET") { if (File.Exists(legacyHistory)) ReadOr404(stream, legacyHistory); else WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("[]")); return; }
            if (method == "PUT" || method == "POST") { lock (FileLock) File.WriteAllBytes(legacyHistory, body); WriteOk(stream); return; }
            if (method == "DELETE") { DeleteFile(legacyHistory); WriteOk(stream); return; }
        }
        if (storagePath.StartsWith("history/", StringComparison.Ordinal))
        {
            string historySlotId = storagePath.Substring("history/".Length);
            string historyFolder = SlotFolder(historySlotId);
            string slotHistory = Path.Combine(historyFolder, "history.json");
            if (method == "GET") { if (!File.Exists(slotHistory)) WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("[]")); else ReadOr404(stream, slotHistory); return; }
            if (method == "PUT" || method == "POST")
            {
                lock (FileLock) { Directory.CreateDirectory(historyFolder); File.WriteAllBytes(slotHistory, body); }
                WriteOk(stream);
                return;
            }
            if (method == "DELETE") { DeleteFile(slotHistory); WriteOk(stream); return; }
        }
        if (storagePath.StartsWith("slot/", StringComparison.Ordinal))
        {
            string deleteSlotId = storagePath.Substring("slot/".Length);
            string deleteFolder = SlotFolder(deleteSlotId);
            if (method == "DELETE") { if (Directory.Exists(deleteFolder)) Directory.Delete(deleteFolder, true); WriteOk(stream); return; }
        }
        if (storagePath.StartsWith("run/", StringComparison.Ordinal))
        {
            string slotId = storagePath.Substring(4);
            string folder = SlotFolder(slotId);
            string run = Path.Combine(folder, "run.json");
            if (method == "GET") { if (!File.Exists(run)) { WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("null")); return; } EnsureDiscoveredInLibrary(folder); ReadOr404(stream, run); return; }
            if (method == "PUT" || method == "POST")
            {
                lock (FileLock)
                {
                    Directory.CreateDirectory(folder);
                    File.WriteAllBytes(run, body);
                    WriteSlotMeta(slotId, folder, body);
                }
                WriteOk(stream);
                return;
            }
            if (method == "DELETE") { DeleteFile(run); WriteOk(stream); return; }
        }
        WriteNotFound(stream);
    }

    static void SyncLibraryFromFolders()
    {
        try
        {
            string savesRoot = Path.Combine(SaveRoot, "saves");
            if (!Directory.Exists(savesRoot)) return;
            var serializer = new JavaScriptSerializer();
            string libraryPath = Path.Combine(SaveRoot, "library.json");
            var library = File.Exists(libraryPath)
                ? serializer.DeserializeObject(File.ReadAllText(libraryPath, Encoding.UTF8)) as Dictionary<string, object>
                : null;
            if (library == null) library = new Dictionary<string, object>();

            var byId = new Dictionary<string, Dictionary<string, object>>(StringComparer.OrdinalIgnoreCase);
            object existingObj;
            if (library.TryGetValue("slots", out existingObj))
            {
                var existing = existingObj as object[];
                if (existing != null)
                {
                    foreach (var raw in existing)
                    {
                        var slot = raw as Dictionary<string, object>;
                        if (slot == null || !slot.ContainsKey("id")) continue;
                        byId[Convert.ToString(slot["id"])] = slot;
                    }
                }
            }

            foreach (string folder in Directory.GetDirectories(savesRoot))
            {
                string metaPath = Path.Combine(folder, "meta.json");
                Dictionary<string, object> meta = null;
                if (File.Exists(metaPath))
                {
                    try { meta = serializer.DeserializeObject(File.ReadAllText(metaPath, Encoding.UTF8)) as Dictionary<string, object>; }
                    catch { }
                }
                if (meta == null || !meta.ContainsKey("id"))
                {
                    string leaf = Path.GetFileName(folder);
                    int split = leaf.LastIndexOf('_');
                    if (split <= 0 || split >= leaf.Length - 1) continue;
                    meta = new Dictionary<string, object>();
                    meta["id"] = leaf.Substring(split + 1);
                    meta["name"] = leaf.Substring(0, split);
                    meta["createdAt"] = File.GetCreationTimeUtc(metaPath).ToString("o", CultureInfo.InvariantCulture);
                    meta["updatedAt"] = File.GetLastWriteTimeUtc(metaPath).ToString("o", CultureInfo.InvariantCulture);
                }
                string id = Convert.ToString(meta["id"]);
                if (String.IsNullOrWhiteSpace(id)) continue;
                Dictionary<string, object> current;
                if (byId.TryGetValue(id, out current))
                {
                    if (meta.ContainsKey("name")) current["name"] = meta["name"];
                    if (meta.ContainsKey("createdAt")) current["createdAt"] = meta["createdAt"];
                    if (meta.ContainsKey("updatedAt")) current["updatedAt"] = meta["updatedAt"];
                }
                else
                {
                    byId[id] = meta;
                }
            }

            library["version"] = 1;
            library["slots"] = byId.Values.Cast<object>().ToArray();
            if (!library.ContainsKey("activeSlotId") && byId.Count > 0)
                library["activeSlotId"] = byId.Keys.First();
            File.WriteAllText(libraryPath, serializer.Serialize(library), new UTF8Encoding(false));
        }
        catch { }
    }

    static void WriteSlotMeta(string slotId, string folder, byte[] runBody)
    {
        string name = "行军存档", createdAt = DateTime.UtcNow.ToString("o", CultureInfo.InvariantCulture), updatedAt = createdAt;
        try
        {
            var serializer = new JavaScriptSerializer();
            var run = serializer.DeserializeObject(Encoding.UTF8.GetString(runBody)) as Dictionary<string, object>;
            if (run != null && run.ContainsKey("savedAt")) updatedAt = Convert.ToString(run["savedAt"], CultureInfo.InvariantCulture);
            string libraryPath = Path.Combine(SaveRoot, "library.json");
            if (File.Exists(libraryPath))
            {
                var lib = serializer.DeserializeObject(File.ReadAllText(libraryPath, Encoding.UTF8)) as Dictionary<string, object>;
                object slotsObj;
                if (lib != null && lib.TryGetValue("slots", out slotsObj))
                {
                    var slots = slotsObj as object[];
                    if (slots != null)
                    {
                        foreach (var item in slots)
                        {
                            var slot = item as Dictionary<string, object>;
                            if (slot != null && Convert.ToString(slot["id"]) == slotId) { name = Convert.ToString(slot["name"]); createdAt = Convert.ToString(slot["createdAt"]); break; }
                        }
                    }
                }
            }
        }
        catch { }
        string meta = "{\"id\":" + Json(slotId) + ",\"name\":" + Json(name) + ",\"createdAt\":" + Json(createdAt) + ",\"updatedAt\":" + Json(updatedAt) + "}";
        File.WriteAllText(Path.Combine(folder, "meta.json"), meta, new UTF8Encoding(false));
    }

    static void UpdateSlotMetaFromLibrary(byte[] body)
    {
        try
        {
            var serializer = new JavaScriptSerializer();
            var lib = serializer.DeserializeObject(Encoding.UTF8.GetString(body)) as Dictionary<string, object>;
            object slotsObj;
            if (lib == null || !lib.TryGetValue("slots", out slotsObj)) return;
            var slots = slotsObj as object[];
            if (slots == null) return;
            foreach (var item in slots)
            {
                var slot = item as Dictionary<string, object>;
                if (slot == null || !slot.ContainsKey("id")) continue;
                string id = Convert.ToString(slot["id"]);
                string folder = SlotFolder(id);
                if (!Directory.Exists(folder)) continue;
                string meta = "{\"id\":" + Json(id) + ",\"name\":" + Json(Convert.ToString(slot["name"])) + ",\"createdAt\":" + Json(Convert.ToString(slot["createdAt"])) + ",\"updatedAt\":" + Json(Convert.ToString(slot["updatedAt"])) + "}";
                File.WriteAllText(Path.Combine(folder, "meta.json"), meta, new UTF8Encoding(false));
            }
        }
        catch { }
    }

    static void EnsureDiscoveredInLibrary(string folder)
    {
        try
        {
            string metaPath = Path.Combine(folder, "meta.json");
            if (!File.Exists(metaPath)) return;
            string metaText = File.ReadAllText(metaPath, Encoding.UTF8);
            var serializer = new JavaScriptSerializer();
            var meta = serializer.DeserializeObject(metaText) as Dictionary<string, object>;
            if (meta == null) return;
            string libraryPath = Path.Combine(SaveRoot, "library.json");
            Dictionary<string, object> lib;
            if (File.Exists(libraryPath)) lib = serializer.DeserializeObject(File.ReadAllText(libraryPath, Encoding.UTF8)) as Dictionary<string, object>;
            else lib = new Dictionary<string, object>();
            if (lib == null) lib = new Dictionary<string, object>();
            object slotsObj; var slotList = new List<object>();
            if (lib.TryGetValue("slots", out slotsObj)) { var existing = slotsObj as object[]; if (existing != null) slotList.AddRange(existing); }
            string id = Convert.ToString(meta["id"]);
            bool found = slotList.OfType<Dictionary<string, object>>().Any(s => Convert.ToString(s["id"]) == id);
            if (!found) slotList.Add(meta);
            lib["version"] = 1; lib["slots"] = slotList; if (!lib.ContainsKey("activeSlotId")) lib["activeSlotId"] = id;
            File.WriteAllText(libraryPath, serializer.Serialize(lib), new UTF8Encoding(false));
        }
        catch { }
    }

    static string SlotFolder(string slotId)
    {
        string saves = Path.Combine(SaveRoot, "saves");
        Directory.CreateDirectory(saves);
        string[] existing = Directory.GetDirectories(saves, "*_" + slotId);
        if (existing.Length > 0) return existing.OrderByDescending(Directory.GetLastWriteTimeUtc).First();
        string libraryPath = Path.Combine(SaveRoot, "library.json");
        string name = "行军存档";
        try
        {
            if (File.Exists(libraryPath))
            {
                var serializer = new JavaScriptSerializer();
                var lib = serializer.DeserializeObject(File.ReadAllText(libraryPath, Encoding.UTF8)) as Dictionary<string, object>;
                object slotsObj;
                if (lib != null && lib.TryGetValue("slots", out slotsObj))
                {
                    var slots = slotsObj as object[];
                    if (slots != null)
                        foreach (var item in slots)
                        {
                            var slot = item as Dictionary<string, object>;
                            if (slot != null && Convert.ToString(slot["id"]) == slotId) { name = Convert.ToString(slot["name"]); break; }
                        }
                }
            }
        }
        catch { }
        return Path.Combine(saves, SafeName(name) + "_" + slotId);
    }

    static string SafeName(string value)
    {
        string result = value ?? "行军存档";
        foreach (char c in Path.GetInvalidFileNameChars()) result = result.Replace(c, '_');
        return String.IsNullOrWhiteSpace(result) ? "行军存档" : result.Trim();
    }

    static string Json(string value) { return new JavaScriptSerializer().Serialize(value ?? ""); }
    static void DeleteFile(string path) { if (File.Exists(path)) File.Delete(path); }
    static void WriteOk(NetworkStream stream) { WriteResponse(stream, 200, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{\"ok\":true}")); }
    static void WriteNotFound(NetworkStream stream) { WriteResponse(stream, 404, "application/json; charset=utf-8", Encoding.UTF8.GetBytes("{\"ok\":false}")); }
    static void ReadOr404(NetworkStream stream, string path) { if (File.Exists(path)) WriteResponse(stream, 200, "application/json; charset=utf-8", File.ReadAllBytes(path)); else WriteNotFound(stream); }

    static string Mime(string path)
    {
        switch (Path.GetExtension(path).ToLowerInvariant())
        {
            case ".html": return "text/html; charset=utf-8";
            case ".js": return "application/javascript; charset=utf-8";
            case ".css": return "text/css; charset=utf-8";
            case ".json": return "application/json; charset=utf-8";
            case ".svg": return "image/svg+xml";
            case ".png": return "image/png";
            case ".ico": return "image/x-icon";
            case ".webp": return "image/webp";
            case ".wav": return "audio/wav";
            case ".mp3": return "audio/mpeg";
            default: return "application/octet-stream";
        }
    }

    static void WriteResponse(NetworkStream stream, int status, string contentType, byte[] body)
    {
        string reason = status == 200 ? "OK" : status == 404 ? "Not Found" : status == 403 ? "Forbidden" : status == 405 ? "Method Not Allowed" : "Error";
        string header = "HTTP/1.1 " + status + " " + reason + "\r\nContent-Type: " + contentType + "\r\nContent-Length: " + body.Length + "\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n";
        byte[] headerBytes = Encoding.ASCII.GetBytes(header);
        stream.Write(headerBytes, 0, headerBytes.Length);
        if (body.Length > 0) stream.Write(body, 0, body.Length);
        stream.Flush();
    }
}
