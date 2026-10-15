using System.Diagnostics;
using System.Text.Json;
using FiscalService.Contracts;
using FiscalService.Serialization;
using TfhkaNet.IF;
using TfhkaNet.IF.VE;

namespace FiscalService.Printer;

public sealed class SdkInvoker
{
    public static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    private readonly PrinterWorker _worker;
    private static readonly TimeSpan SlotWait = TimeSpan.FromSeconds(5);

    public SdkInvoker(PrinterWorker worker) => _worker = worker;

    public async Task<IResult> Invoke(
        HttpContext http,
        string method,
        object? args,
        Func<Tfhka, object?> call)
    {
        var alwaysStatus = http.Request.Query["withStatus"] == "always";
        Envelope envelope;
        try
        {
            envelope = await _worker.Enqueue(() => Run(method, args, call, alwaysStatus), SlotWait);
        }
        catch (BusyException ex)
        {
            Log.Write("warn", "busy", method, 0, false, ex.Message);
            return Results.Json(new Envelope
            {
                Ok = false,
                Method = method,
                Args = args,
                StartedAt = DateTimeOffset.Now,
                DurationMs = 0,
                Error = new EnvelopeError { Kind = "Busy", Type = nameof(BusyException), Message = ex.Message }
            }, JsonOptions, statusCode: 503);
        }
        catch (Exception ex)
        {
            Log.Write("error", "enqueue", method, 0, false, ex.Message);
            return Results.Json(Fail(method, args, DateTimeOffset.Now, 0, ex), JsonOptions, statusCode: 500);
        }

        Log.Write(envelope.Ok ? "info" : "warn", "sdk", method, envelope.DurationMs, envelope.Ok, envelope.Error?.Message);
        return Results.Json(envelope, JsonOptions, statusCode: 200);
    }

    private Envelope Run(string method, object? args, Func<Tfhka, object?> call, bool alwaysStatus)
    {
        var started = DateTimeOffset.Now;
        var sw = Stopwatch.StartNew();
        var warnings = new List<string>();
        try
        {
            var raw = call(_worker.Printer);
            sw.Stop();
            object? result = WrapResult(raw);
            object? printerStatus = null;
            if (alwaysStatus || IsFalseBool(raw))
            {
                try { printerStatus = ObjectDumper.Dump(_worker.Printer.GetPrinterStatus()); }
                catch (Exception ex)
                {
                    warnings.Add($"GetPrinterStatus automático falló: {ex.Message}");
                }
            }
            return new Envelope
            {
                Ok = true,
                Method = method,
                Args = args,
                StartedAt = started,
                DurationMs = sw.ElapsedMilliseconds,
                Result = result,
                PrinterStatus = printerStatus,
                SdkState = DumpSdkState(),
                Warnings = warnings
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            return Fail(method, args, started, sw.ElapsedMilliseconds, ex, DumpSdkState());
        }
    }

    private static Envelope Fail(string method, object? args, DateTimeOffset started, long ms, Exception ex, object? sdkState = null)
    {
        var inner = ex is System.Reflection.TargetInvocationException { InnerException: { } i } ? i : ex;
        var kind = inner is PrinterException ? "PrinterException" : "SdkException";
        return new Envelope
        {
            Ok = false,
            Method = method,
            Args = args,
            StartedAt = started,
            DurationMs = ms,
            SdkState = sdkState,
            Error = new EnvelopeError
            {
                Kind = kind,
                Type = inner.GetType().FullName,
                Message = inner.Message,
                StatusError = ObjectDumper.DumpExceptionStatus(inner),
                StackTrace = inner.StackTrace
            }
        };
    }

    private object DumpSdkState()
    {
        var p = _worker.Printer;
        object? dumpProp(string name)
        {
            try
            {
                var prop = p.GetType().GetProperty(name)
                           ?? p.GetType().BaseType?.GetProperty(name)
                           ?? p.GetType().BaseType?.BaseType?.GetProperty(name);
                return ObjectDumper.Dump(prop?.GetValue(p));
            }
            catch (Exception ex) { return $"<error: {ex.Message}>"; }
        }
        return new Dictionary<string, object?>
        {
            ["ComPort"] = dumpProp("ComPort"),
            ["StatusPort"] = dumpProp("StatusPort"),
            ["Estado"] = dumpProp("Estado"),
            ["Status_Error"] = dumpProp("Status_Error"),
            ["SerialPortDataReady"] = dumpProp("SerialPortDataReady"),
            ["SerialPortReceiveTimeout"] = dumpProp("SerialPortReceiveTimeout"),
            ["SendCmdRetryAttempts"] = dumpProp("SendCmdRetryAttempts"),
            ["SendCmdRetryInterval"] = dumpProp("SendCmdRetryInterval")
        };
    }

    private static object? WrapResult(object? raw)
    {
        if (raw is null) return null;
        if (raw is ReturnValue rv)
        {
            return new Dictionary<string, object?>
            {
                ["returnValue"] = ObjectDumper.Dump(rv.Value),
                ["fileContent"] = rv.FileContent,
                ["fileLineCount"] = rv.FileLineCount,
                ["Estado"] = rv.Estado
            }.Where(kv => kv.Value is not null).ToDictionary(kv => kv.Key, kv => kv.Value);
        }
        if (raw is bool or int or long or double or string)
            return new Dictionary<string, object?> { ["returnValue"] = raw };
        return ObjectDumper.Dump(raw);
    }

    private static bool IsFalseBool(object? raw)
    {
        if (raw is bool b) return !b;
        if (raw is ReturnValue { Value: bool rb }) return !rb;
        return false;
    }
}

public static class Log
{
    public static void Write(string level, string evt, string? method, long durationMs, bool ok, string? message = null)
    {
        var payload = new Dictionary<string, object?>
        {
            ["ts"] = DateTimeOffset.Now.ToString("o"),
            ["level"] = level,
            ["event"] = evt,
            ["method"] = method,
            ["durationMs"] = durationMs,
            ["ok"] = ok,
            ["message"] = message
        };
        Console.WriteLine(JsonSerializer.Serialize(payload));
        Console.Out.Flush();
    }
}
