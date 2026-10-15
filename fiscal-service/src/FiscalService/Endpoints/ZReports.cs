using System.Globalization;
using FiscalService.Contracts;

namespace FiscalService;

public static class ZReportEndpoints
{
    public static void MapZReports(this WebApplication app)
    {
        app.MapPost("/getZReport", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetZReport", new { }, p => p.GetZReport()));

        app.MapPost("/getZReportByDate", async (HttpContext http, SdkInvoker invoker, DateRangeRequest? body) =>
        {
            if (!TryDates(body, out var start, out var end, out var error))
                return Results.Json(ConnectionEndpoints.Validation("GetZReportByDate", error!), SdkInvoker.JsonOptions, statusCode: 400);
            return await invoker.Invoke(http, "GetZReportByDate", new { startDate = start, endDate = end }, p => p.GetZReport(start, end));
        });

        app.MapPost("/getZReportByNumber", async (HttpContext http, SdkInvoker invoker, NumberRangeRequest? body) =>
        {
            if (body?.StartNumber is null || body.EndNumber is null)
                return Results.Json(ConnectionEndpoints.Validation("GetZReportByNumber", "startNumber y endNumber son requeridos."), SdkInvoker.JsonOptions, statusCode: 400);
            var a = body.StartNumber.Value;
            var b = body.EndNumber.Value;
            return await invoker.Invoke(http, "GetZReportByNumber", new { startNumber = a, endNumber = b }, p => p.GetZReport(a, b));
        });

        app.MapPost("/getZ2Report", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetZ2Report", new { }, p => p.GetZ2Report()));

        app.MapPost("/printZReport", async (HttpContext http, SdkInvoker invoker, ConfirmRequest? body) =>
        {
            if (body?.Confirm != true)
                return Results.Json(ConnectionEndpoints.Validation("PrintZReport", "confirm:true es obligatorio (cierre diario Z)."), SdkInvoker.JsonOptions, statusCode: 400);
            return await invoker.Invoke(http, "PrintZReport", new { confirm = true }, p =>
            {
                p.PrintZReport();
                return null;
            });
        });

        app.MapPost("/printZReportByDate", async (HttpContext http, SdkInvoker invoker, DateRangeRequest? body) =>
        {
            if (!TryDates(body, out var start, out var end, out var error))
                return Results.Json(ConnectionEndpoints.Validation("PrintZReportByDate", error!), SdkInvoker.JsonOptions, statusCode: 400);
            return await invoker.Invoke(http, "PrintZReportByDate", new { startDate = start, endDate = end }, p =>
            {
                p.PrintZReport(start, end);
                return null;
            });
        });

        app.MapPost("/printZReportByNumber", async (HttpContext http, SdkInvoker invoker, NumberRangeRequest? body) =>
        {
            if (body?.StartNumber is null || body.EndNumber is null)
                return Results.Json(ConnectionEndpoints.Validation("PrintZReportByNumber", "startNumber y endNumber son requeridos."), SdkInvoker.JsonOptions, statusCode: 400);
            var a = body.StartNumber.Value;
            var b = body.EndNumber.Value;
            return await invoker.Invoke(http, "PrintZReportByNumber", new { startNumber = a, endNumber = b }, p =>
            {
                p.PrintZReport(a, b);
                return null;
            });
        });
    }

    private static bool TryDates(DateRangeRequest? body, out DateTime start, out DateTime end, out string? error)
    {
        start = default;
        end = default;
        if (string.IsNullOrWhiteSpace(body?.StartDate) || string.IsNullOrWhiteSpace(body.EndDate))
        {
            error = "startDate y endDate son requeridos (YYYY-MM-DD o ISO).";
            return false;
        }
        if (!DateTime.TryParse(body.StartDate, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out start) ||
            !DateTime.TryParse(body.EndDate, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out end))
        {
            error = "No se pudieron interpretar startDate/endDate.";
            return false;
        }
        error = null;
        return true;
    }
}
