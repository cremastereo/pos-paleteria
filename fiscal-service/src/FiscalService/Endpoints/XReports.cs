namespace FiscalService;

public static class XReportEndpoints
{
    public static void MapXReports(this WebApplication app)
    {
        app.MapPost("/getXReport", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetXReport", new { }, p => p.GetXReport()));
        app.MapPost("/getX2Report", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetX2Report", new { }, p => p.GetX2Report()));
        app.MapPost("/getX4Report", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetX4Report", new { }, p => p.GetX4Report()));
        app.MapPost("/getX5Report", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetX5Report", new { }, p => p.GetX5Report()));
        app.MapPost("/getX6Report", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetX6Report", new { }, p =>
            {
                var m = p.GetType().GetMethod("GetX6Report", Type.EmptyTypes);
                if (m is null)
                    throw new MissingMethodException("TfhkaNet.IF.VE.Tfhka", "GetX6Report");
                return m.Invoke(p, null);
            }));
        app.MapPost("/getX7Report", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "GetX7Report", new { }, p => p.GetX7Report()));
        app.MapPost("/printXReport", async (HttpContext http, SdkInvoker invoker) =>
            await invoker.Invoke(http, "PrintXReport", new { }, p =>
            {
                p.PrintXReport();
                return null;
            }));
    }
}
