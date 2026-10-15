using System.IO.Ports;
using System.Reflection;
using TfhkaNet.IF.VE;

namespace FiscalService.Printer;

public static class PortReset
{
    public static void ForceClose(Tfhka printer)
    {
        try { printer.CloseFpCtrl(); }
        catch { /* la DLL a veces lanza NullReferenceException al cerrar */ }

        for (var type = printer.GetType(); type is not null && type != typeof(object); type = type.BaseType)
        {
            foreach (var field in type.GetFields(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic))
                CloseIfSerial(field.GetValue(printer));
            foreach (var prop in type.GetProperties(BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic))
            {
                if (!prop.CanRead || prop.GetIndexParameters().Length > 0) continue;
                try { CloseIfSerial(prop.GetValue(printer)); }
                catch { /* ignore */ }
            }
        }
    }

    public static bool Open(Tfhka printer, string port)
    {
        if (printer.StatusPort)
            ForceClose(printer);
        try
        {
            return printer.OpenFpCtrl(port);
        }
        catch (InvalidOperationException)
        {
            ForceClose(printer);
            return printer.OpenFpCtrl(port);
        }
    }

    private static void CloseIfSerial(object? value)
    {
        if (value is not SerialPort serial) return;
        try
        {
            if (serial.IsOpen) serial.Close();
        }
        catch { /* ignore */ }
    }
}
