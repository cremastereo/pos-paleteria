using System.IO.Ports;
using System.Text.RegularExpressions;
using FiscalService.Contracts;

namespace FiscalService;

public static class ConnectionEndpoints
{
    public static void MapConnection(this WebApplication app)
    {
        app.MapGet("/serialPorts", () =>
        {
            var ports = SerialPort.GetPortNames()
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(ComSortKey)
                .ThenBy(p => p, StringComparer.OrdinalIgnoreCase)
                .ToArray();
            return Results.Json(new { ports }, SdkInvoker.JsonOptions);
        });

        app.MapPost("/openFpctrl", async (HttpContext http, SdkInvoker invoker, PortNameRequest? body) =>
        {
            var port = body?.PortName?.Trim();
            if (string.IsNullOrWhiteSpace(port))
                return Results.Json(Validation("OpenFpCtrl", "portName es requerido."), SdkInvoker.JsonOptions, statusCode: 400);
            return await invoker.Invoke(http, "OpenFpCtrl", new { portName = port }, p => PortReset.Open(p, port));
        });

        app.MapPost("/closeFpctrl", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "CloseFpCtrl", new { }, p =>
            {
                PortReset.ForceClose(p);
                return null;
            }));

        app.MapPost("/checkFprinter", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "CheckFPrinter", new { }, p => p.CheckFPrinter()));

        app.MapPost("/checkDrawer", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "CheckDrawer", new { }, p => p.CheckDrawer()));

        app.MapPost("/getPrinterStatus", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetPrinterStatus", new { }, p => p.GetPrinterStatus()));

        app.MapPost("/readFpStatus", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "ReadFpStatus", new { }, p =>
            {
                var ok = p.ReadFpStatus();
                return new ReturnValue { Value = ok, Estado = p.Estado };
            }));
    }

    private static int ComSortKey(string name)
    {
        var m = Regex.Match(name, @"(\d+)$");
        return m.Success && int.TryParse(m.Value, out var n) ? n : int.MaxValue;
    }

    internal static Envelope Validation(string method, string message) => new()
    {
        Ok = false,
        Method = method,
        StartedAt = DateTimeOffset.Now,
        Error = new EnvelopeError { Kind = "ValidationError", Message = message }
    };
}
