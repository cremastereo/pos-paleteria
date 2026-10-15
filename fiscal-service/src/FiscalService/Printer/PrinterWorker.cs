using System.Collections.Concurrent;
using TfhkaNet.IF.VE;

namespace FiscalService.Printer;

public sealed class PrinterWorker : IDisposable
{
    private readonly BlockingCollection<WorkItem> _queue = new(new ConcurrentQueue<WorkItem>());
    private readonly Thread _thread;
    private readonly Tfhka _printer = new();
    private volatile bool _busy;

    public PrinterWorker()
    {
        _thread = new Thread(Loop)
        {
            IsBackground = true,
            Name = "Tfhka-PrinterWorker",
            Priority = ThreadPriority.AboveNormal
        };
        _thread.SetApartmentState(ApartmentState.STA);
        _thread.Start();
    }

    public Tfhka Printer => _printer;
    public bool Busy => _busy;

    public Task<T> Enqueue<T>(Func<T> work, TimeSpan waitForSlot)
    {
        var tcs = new TaskCompletionSource<T>(TaskCreationOptions.RunContinuationsAsynchronously);
        var item = new WorkItem(() =>
        {
            try { tcs.SetResult(work()); }
            catch (Exception ex) { tcs.SetException(ex); }
        });

        if (!_queue.TryAdd(item, waitForSlot))
            throw new Contracts.BusyException();

        return tcs.Task;
    }

    public Task Enqueue(Action work, TimeSpan waitForSlot) =>
        Enqueue(() => { work(); return true; }, waitForSlot);

    private void Loop()
    {
        foreach (var item in _queue.GetConsumingEnumerable())
        {
            _busy = true;
            try { item.Run(); }
            finally { _busy = false; }
        }
    }

    public void Dispose()
    {
        _queue.CompleteAdding();
        if (!_thread.Join(TimeSpan.FromSeconds(2)))
        {
            PortReset.ForceClose(_printer);
        }
        _queue.Dispose();
    }

    private sealed record WorkItem(Action Run);
}
