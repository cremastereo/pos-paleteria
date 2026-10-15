using FiscalService.Contracts;

namespace FiscalService;

public static class RawCommandEndpoints
{
    private static readonly string[] DocumentedReports = ["U0X", "U0Z", "U1Z", "U1X"];
    private static readonly string[] DocumentedStatus = ["S1", "S2", "S3", "S4", "S5", "S8E", "S8P"];

    public static void MapRawCommands(this WebApplication app)
    {
        app.MapPost("/sendCmd", async (HttpContext http, SdkInvoker invoker, SendCmdRequest? body) =>
        {
            if (string.IsNullOrEmpty(body?.Cmd))
                return Results.Json(ConnectionEndpoints.Validation("SendCmd", "cmd es requerido."), SdkInvoker.JsonOptions, statusCode: 400);
            return await invoker.Invoke(http, "SendCmd", new { cmd = body.Cmd }, p => p.SendCmd(Convert.ToString(body.Cmd)));
        });

        app.MapPost("/sendFileCmd", async (HttpContext http, SdkInvoker invoker, FilePathRequest? body) =>
        {
            if (string.IsNullOrWhiteSpace(body?.FilePath))
                return Results.Json(ConnectionEndpoints.Validation("SendFileCmd", "filePath es requerido."), SdkInvoker.JsonOptions, statusCode: 400);
            var path = body.FilePath;
            var lines = File.Exists(path) ? File.ReadAllLines(path).Length : 0;
            return await invoker.Invoke(http, "SendFileCmd", new { filePath = path }, p =>
                new ReturnValue { Value = p.SendFileCmd(path), FileLineCount = lines });
        });

        app.MapPost("/uploadReportCmd", async (HttpContext http, SdkInvoker invoker, UploadRequest? body) =>
            await Upload(http, invoker, "UploadReportCmd", DocumentedReports, body, (p, cmd, file) => p.UploadReportCmd(cmd, file)));

        app.MapPost("/uploadStatusCmd", async (HttpContext http, SdkInvoker invoker, UploadRequest? body) =>
            await Upload(http, invoker, "UploadStatusCmd", DocumentedStatus, body, (p, cmd, file) => p.UploadStatusCmd(cmd, file)));
    }

    private static async Task<IResult> Upload(
        HttpContext http,
        SdkInvoker invoker,
        string method,
        string[] documented,
        UploadRequest? body,
        Func<TfhkaNet.IF.VE.Tfhka, string, string, bool> call)
    {
        if (string.IsNullOrWhiteSpace(body?.Cmd))
            return Results.Json(ConnectionEndpoints.Validation(method, "cmd es requerido."), SdkInvoker.JsonOptions, statusCode: 400);
        var cmd = body.Cmd.Trim();
        var file = string.IsNullOrWhiteSpace(body.FilePath)
            ? Path.Combine(Path.GetTempPath(), "tfhka-tester", cmd + ".txt")
            : body.FilePath!;
        Directory.CreateDirectory(Path.GetDirectoryName(file)!);
        var undocumented = !documented.Contains(cmd, StringComparer.OrdinalIgnoreCase);

        var result = await invoker.Invoke(http, method, new { cmd, filePath = file, undocumented }, p =>
        {
            var ok = call(p, cmd, file);
            string? content = null;
            if (File.Exists(file))
            {
                try { content = File.ReadAllText(file); }
                catch (Exception ex) { content = $"<error leyendo archivo: {ex.Message}>"; }
            }
            if (undocumented)
                content = $"[aviso: cmd '{cmd}' no está en la lista documentada del manual ({string.Join(", ", documented)})]\n{content}";
            return new ReturnValue { Value = ok, FileContent = content };
        });

        return result;
    }
}
