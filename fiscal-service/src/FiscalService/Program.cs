using System.Globalization;
using System.Text;
using FiscalService;
using FiscalService.Contracts;
using FiscalService.Hosting;
using FiscalService.Printer;
using TfhkaNet.IF.VE;

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

var port = 5050;
string? token = null;
int? parentPid = null;
for (var i = 0; i < args.Length; i++)
{
    var key = args[i];
    var val = i + 1 < args.Length ? args[i + 1] : null;
    switch (key)
    {
        case "--port" when val is not null:
            port = int.Parse(val, CultureInfo.InvariantCulture); i++; break;
        case "--token" when val is not null:
            token = val; i++; break;
        case "--parent-pid" when val is not null:
            parentPid = int.Parse(val, CultureInfo.InvariantCulture); i++; break;
    }
}

token ??= Guid.NewGuid().ToString("N");

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    ApplicationName = "FiscalService"
});
builder.WebHost.UseUrls($"http://127.0.0.1:{port}");
builder.Logging.ClearProviders();
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Configuration["parentPid"] = parentPid?.ToString(CultureInfo.InvariantCulture);
builder.Services.AddSingleton(new PrinterWorker());
builder.Services.AddSingleton<SdkInvoker>();
builder.Services.AddHostedService<ParentWatchdog>();
builder.Services.AddSingleton(new ServiceOptions(port, token, parentPid));

var app = builder.Build();
app.UseCors();
app.Use(async (ctx, next) =>
{
    if (ctx.Request.Path == "/health")
    {
        await next();
        return;
    }
    if (!ctx.Request.Headers.TryGetValue("X-Tfhka-Token", out var provided) || provided != token)
    {
        ctx.Response.StatusCode = 401;
        await ctx.Response.WriteAsJsonAsync(new Envelope
        {
            Ok = false,
            Method = ctx.Request.Path,
            StartedAt = DateTimeOffset.Now,
            Error = new EnvelopeError { Kind = "Unauthorized", Message = "Token inválido o ausente (header X-Tfhka-Token)." }
        }, SdkInvoker.JsonOptions);
        return;
    }
    await next();
});

app.MapMeta();
app.MapConnection();
app.MapRawCommands();
app.MapXReports();
app.MapZReports();
app.MapStatusReads();

app.Lifetime.ApplicationStarted.Register(() =>
{
    var asm = typeof(Tfhka).Assembly.GetName();
    Console.WriteLine($"READY {System.Text.Json.JsonSerializer.Serialize(new { port, pid = Environment.ProcessId, sdkVersion = asm.Version?.ToString() })}");
    Console.Out.Flush();
    Log.Write("info", "ready", null, 0, true, $"listening on 127.0.0.1:{port} sdk={asm.Version} arch={(Environment.Is64BitProcess ? "x64" : "x86")} culture={CultureInfo.CurrentCulture.Name}");
});

app.Run();

public sealed record ServiceOptions(int Port, string Token, int? ParentPid);
