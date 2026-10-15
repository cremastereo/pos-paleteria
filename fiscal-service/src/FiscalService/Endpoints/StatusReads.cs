namespace FiscalService;

public static class StatusReadEndpoints
{
    public static void MapStatusReads(this WebApplication app)
    {
        app.MapPost("/getS1PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS1PrinterData", new { }, p => p.GetS1PrinterData()));
        app.MapPost("/getS2PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS2PrinterData", new { }, p => p.GetS2PrinterData()));
        app.MapPost("/getS2EPrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS2EPrinterData", new { }, p => p.GetS2EPrinterData()));
        app.MapPost("/getS21PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS21PrinterData", new { }, p => p.GetS21PrinterData()));
        app.MapPost("/getS22PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS22PrinterData", new { }, p => p.GetS22PrinterData()));
        app.MapPost("/getS23PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS23PrinterData", new { }, p => p.GetS23PrinterData()));
        app.MapPost("/getS25PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS25PrinterData", new { }, p => p.GetS25PrinterData()));
        app.MapPost("/getS3PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS3PrinterData", new { }, p => p.GetS3PrinterData()));
        app.MapPost("/getS4PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS4PrinterData", new { }, p => p.GetS4PrinterData()));
        app.MapPost("/getS5PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS5PrinterData", new { }, p => p.GetS5PrinterData()));
        app.MapPost("/getS6PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS6PrinterData", new { }, p => p.GetS6PrinterData()));
        app.MapPost("/getS7PrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS7PrinterData", new { }, p => p.GetS7PrinterData()));
        app.MapPost("/getS8EPrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS8EPrinterData", new { }, p => p.GetS8EPrinterData()));
        app.MapPost("/getS8PPrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetS8PPrinterData", new { }, p => p.GetS8PPrinterData()));
        app.MapPost("/getSVPrinterData", (HttpContext http, SdkInvoker invoker) => invoker.Invoke(http, "GetSVPrinterData", new { }, p => p.GetSVPrinterData()));
    }
}
