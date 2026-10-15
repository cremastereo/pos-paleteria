using System.Collections;
using System.Globalization;
using System.Reflection;
using System.Text.Json;

namespace FiscalService.Serialization;

public static class ObjectDumper
{
    public static object? Dump(object? value, int depth = 0)
    {
        if (value is null) return null;
        if (depth > 6) return value.ToString();

        var type = value.GetType();
        if (value is string or bool or byte or sbyte or short or ushort or int or uint or long or ulong or float or double or decimal)
            return value;
        if (value is DateTime dt)
            return dt.ToString("o", CultureInfo.InvariantCulture);
        if (value is DateTimeOffset dto)
            return dto.ToString("o", CultureInfo.InvariantCulture);
        if (type.IsEnum)
            return new Dictionary<string, object?> { ["name"] = value.ToString(), ["value"] = Convert.ToInt32(value) };
        if (value is JsonElement el)
            return el;
        if (value is byte[] bytes)
            return Convert.ToBase64String(bytes);
        if (value is IDictionary dict)
        {
            var map = new Dictionary<string, object?>();
            foreach (DictionaryEntry entry in dict)
                map[entry.Key?.ToString() ?? ""] = Dump(entry.Value, depth + 1);
            return map;
        }
        if (value is IEnumerable enumerable && value is not string)
        {
            var list = new List<object?>();
            foreach (var item in enumerable) list.Add(Dump(item, depth + 1));
            return list;
        }

        var result = new Dictionary<string, object?>();
        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!prop.CanRead || prop.GetIndexParameters().Length > 0) continue;
            if (ShouldSkip(prop.Name, type)) continue;
            try
            {
                result[prop.Name] = Dump(prop.GetValue(value), depth + 1);
            }
            catch (Exception ex)
            {
                var inner = ex is TargetInvocationException { InnerException: { } i } ? i : ex;
                result[prop.Name] = $"<error: {inner.GetType().Name}: {inner.Message}>";
            }
        }
        foreach (var field in type.GetFields(BindingFlags.Public | BindingFlags.Instance))
        {
            if (result.ContainsKey(field.Name)) continue;
            try
            {
                result[field.Name] = Dump(field.GetValue(value), depth + 1);
            }
            catch (Exception ex)
            {
                result[field.Name] = $"<error: {ex.GetType().Name}: {ex.Message}>";
            }
        }
        return result;
    }

    public static object? DumpExceptionStatus(Exception ex)
    {
        var status = ex.GetType().GetProperty("StatusError")?.GetValue(ex)
                     ?? ex.GetType().GetProperty("PrinterStatus")?.GetValue(ex)
                     ?? ex.GetType().GetProperty("Status")?.GetValue(ex);
        return status is null ? null : Dump(status);
    }

    private static bool ShouldSkip(string name, Type owner)
    {
        if (typeof(Exception).IsAssignableFrom(owner) && name is "TargetSite" or "Data" or "HelpLink" or "Source")
            return true;
        return false;
    }
}
