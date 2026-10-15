using System.Text.Json.Serialization;

namespace FiscalService.Contracts;

public sealed class Envelope
{
    public bool Ok { get; set; }
    public string Method { get; set; } = "";
    public object? Args { get; set; }
    public DateTimeOffset StartedAt { get; set; }
    public long DurationMs { get; set; }
    public object? Result { get; set; }
    public object? PrinterStatus { get; set; }
    public object? SdkState { get; set; }
    public List<string> Warnings { get; set; } = new();
    public EnvelopeError? Error { get; set; }
}

public sealed class EnvelopeError
{
    public string Kind { get; set; } = "SdkException";
    public string? Type { get; set; }
    public string Message { get; set; } = "";
    public object? StatusError { get; set; }
    public string? StackTrace { get; set; }
}

public sealed class ReturnValue
{
    [JsonPropertyName("returnValue")]
    public object? Value { get; set; }

    [JsonPropertyName("fileContent")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? FileContent { get; set; }

    [JsonPropertyName("fileLineCount")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public int? FileLineCount { get; set; }

    [JsonPropertyName("Estado")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Estado { get; set; }
}

public class BusyException : Exception
{
    public BusyException() : base("El servicio está ocupado con otra llamada al SDK.") { }
}

public sealed class PortNameRequest
{
    public string? PortName { get; set; }
}

public sealed class SendCmdRequest
{
    public string? Cmd { get; set; }
}

public sealed class FilePathRequest
{
    public string? FilePath { get; set; }
}

public sealed class UploadRequest
{
    public string? Cmd { get; set; }
    public string? FilePath { get; set; }
}

public sealed class DateRangeRequest
{
    public string? StartDate { get; set; }
    public string? EndDate { get; set; }
}

public sealed class NumberRangeRequest
{
    public int? StartNumber { get; set; }
    public int? EndNumber { get; set; }
}

public sealed class ConfirmRequest
{
    public bool Confirm { get; set; }
}
