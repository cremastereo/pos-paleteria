using System.Diagnostics;

namespace FiscalService.Hosting;

public sealed class ParentWatchdog : BackgroundService
{
    private readonly int? _parentPid;
    private readonly IHostApplicationLifetime _lifetime;
    private readonly Printer.PrinterWorker _worker;

    public ParentWatchdog(IConfiguration config, IHostApplicationLifetime lifetime, Printer.PrinterWorker worker)
    {
        _parentPid = config.GetValue<int?>("parentPid");
        _lifetime = lifetime;
        _worker = worker;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_parentPid is null or <= 0) return;
        Log.Write("info", "watchdog", null, 0, true, $"watching parent pid {_parentPid}");
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);
            if (!IsAlive(_parentPid.Value))
            {
                Log.Write("warn", "watchdog", null, 0, false, "parent process exited; shutting down");
                try { _worker.Printer.CloseFpCtrl(); } catch { /* ignore */ }
                _lifetime.StopApplication();
                return;
            }
        }
    }

    private static bool IsAlive(int pid)
    {
        try
        {
            var p = Process.GetProcessById(pid);
            return !p.HasExited;
        }
        catch { return false; }
    }
}
