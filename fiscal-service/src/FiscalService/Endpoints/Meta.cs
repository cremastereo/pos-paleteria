using System.Globalization;
using System.Reflection;
using FiscalService.Serialization;
using TfhkaNet.IF;
using TfhkaNet.IF.VE;

namespace FiscalService;

public static class MetaEndpoints
{
    public static void MapMeta(this WebApplication app)
    {
        app.MapGet("/health", (ServiceOptions opts, PrinterWorker worker) =>
        {
            var asm = typeof(Tfhka).Assembly.GetName();
            return Results.Json(new
            {
                status = "ok",
                pid = Environment.ProcessId,
                serviceVersion = Assembly.GetExecutingAssembly().GetName().Version?.ToString(),
                sdkVersion = asm.Version?.ToString() ?? "unknown",
                arch = Environment.Is64BitProcess ? "x64" : "x86",
                culture = CultureInfo.CurrentCulture.Name,
                port = opts.Port,
                busy = worker.Busy
            });
        });

        app.MapGet("/meta/sdk", () =>
        {
            var types = typeof(Tfhka).Assembly.GetTypes()
                .Where(t => t.FullName is not null && t.FullName.StartsWith("TfhkaNet.IF", StringComparison.Ordinal))
                .OrderBy(t => t.FullName)
                .Select(DescribeType)
                .ToList();
            return Results.Json(new
            {
                assembly = typeof(Tfhka).Assembly.FullName,
                version = typeof(Tfhka).Assembly.GetName().Version?.ToString(),
                veTfhka = DescribeType(typeof(Tfhka)),
                common = DescribeType(typeof(TfhkaNet.IF.TfhkaCommon)),
                types
            }, SdkInvoker.JsonOptions);
        });

        app.MapGet("/properties", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "Properties", new { }, p => new Dictionary<string, object?>
            {
                ["ComPort"] = p.ComPort,
                ["Estado"] = p.Estado,
                ["Status_Error"] = p.Status_Error,
                ["StatusPort"] = p.StatusPort,
                ["SerialPortDataReady"] = p.SerialPortDataReady,
                ["SerialPortReceiveTimeout"] = p.SerialPortReceiveTimeout,
                ["SendCmdRetryAttempts"] = p.SendCmdRetryAttempts
            }));

        app.MapPost("/shutdown", async (HttpContext http, SdkInvoker invoker, IHostApplicationLifetime life) =>
        {
            var result = await invoker.Invoke(http, "Shutdown", new { }, p =>
            {
                p.CloseFpCtrl();
                return "closing";
            });
            _ = Task.Run(async () =>
            {
                await Task.Delay(200);
                life.StopApplication();
            });
            return result;
        });
    }

    private static object DescribeType(Type t)
    {
        var methods = t.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => !m.IsSpecialName)
            .Select(m => new
            {
                name = m.Name,
                returnType = TypeName(m.ReturnType),
                parameters = m.GetParameters().Select(p => new { name = p.Name, type = TypeName(p.ParameterType) }).ToList()
            })
            .ToList();
        var properties = t.GetProperties(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Select(p => new { name = p.Name, type = TypeName(p.PropertyType) })
            .ToList();
        return new { fullName = t.FullName, @base = t.BaseType?.FullName, methods, properties };
    }

    private static string TypeName(Type t)
    {
        if (t == typeof(void)) return "void";
        if (t == typeof(string)) return "string";
        if (t.IsArray) return TypeName(t.GetElementType()!) + "[]";
        return t.FullName ?? t.Name;
    }
}
