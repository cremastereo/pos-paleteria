# Funciones y propiedades de la clase Tfhka

Transcripción del manual MLJ-CINT-01, versión 1.4, fecha 02/04/2022. The Factory HKA, C.A.

## 2. Funciones de la clase Tfhka

### 2.1. OpenFpctrl

Permite realizar la apertura del puerto de comunicaciones por el cual se establecerá comunicación con la impresora. Este método se ejecuta en el constructor único de la clase, pero puede ser ejecutado nuevamente de ser requerido.

```text
BOOLEAN OpenFpctrl(String IpPortName)
```

Parámetros:

- `String IpPortName`: nombre del puerto COM a abrir.

Retorno:

- `True`: puerto abierto.
- `False`: falla en apertura.

### 2.2. CloseFpctrl

Permite cerrar el puerto COM asociado, abierto anteriormente.

```text
VOID CloseFpctrl()
```

### 2.3. CheckFprinter

Permite verificar si la impresora está conectada al PC.

```text
BOOLEAN CheckFprinter()
```

Retorno:

- `True`: impresora conectada.
- `False`: impresora no detectada.

### 2.4. CheckDrawer

Permite comprobar si la gaveta de dinero está conectada al PC.

```text
BOOLEAN CheckDrawer()
```

Retorno:

- `True`: gaveta conectada.
- `False`: gaveta no detectada.

### 2.5. ReadFpStatus

Permite leer las variables de estado y error de la impresora. Al ejecutar este método se establece el valor de la variable tipo `String` Estado. Ver anexos 1 y 2.

```text
BOOLEAN ReadFpStatus()
```

Retorno:

- `True`: método ejecutado exitosamente.
- `False`: error en ejecución del método.

Importante: este método está obsoleto y no se recomienda su uso. Será eliminado en futuras versiones de la librería. Usar `GetPrinterStatus()`, descrito más adelante.

### 2.6. SendCmd

Permite realizar el envío de comandos hacia la impresora, en forma de tramas de caracteres ASCII, tal como es descrito en los manuales de integración de las respectivas impresoras y en el manual general de protocolos y comandos del protocolo TFHKA.

```text
BOOL SendCmd(String Cmd)
```

Parámetros:

- `String cmd`: trama de comando en ASCII que se enviará a la impresora.

Retorno:

- `True`: método ejecutado exitosamente.
- `False`: error en ejecución del método.

### 2.7. SendFileCmd

Permite realizar el envío de un archivo de lotes de comando hacia la impresora.

```text
INT SendFileCmd(String file)
```

Parámetros:

- `String rutaFile`: ruta en la cual se encuentra el archivo de comandos por lote que se enviará a la impresora.

Retorno: `INT`, número de líneas del archivo de lotes de comandos ejecutadas exitosamente.

### 2.8. UploadReportCmd

Permite almacenar en un archivo de texto simple un reporte de la impresora.

```text
BOOLEAN UploadReportCmd(String cmd, String file)
```

Parámetros:

- `String cmd`: tipo de reporte a solicitar. Los reportes que pueden ser solicitados son los siguientes (consultar el manual de protocolos y comandos): `U0X`, `U0Z`, `U1Z`, `U1X`.
- `String file`: ruta del archivo donde se almacenará el reporte solicitado.

Retorno:

- `True`: método ejecutado exitosamente.
- `False`: error en ejecución del método.

### 2.9. UploadStatusCmd

Esta función permite almacenar en un archivo de texto simple un status de la impresora.

```text
BOOLEAN UploadStatusCmd(String cmd, String file)
```

Parámetros:

- `String cmd`: tipo de status a solicitar. Los status que pueden ser solicitados son los siguientes (consultar el manual de protocolos y comandos): `S1`, `S2`, `S3`, `S4`, `S5`, `S8E`, `S8P`.
- `String file`: ruta del archivo donde se almacenará el status solicitado.

Retorno:

- `True`: método ejecutado exitosamente.
- `False`: error en ejecución del método.

## 3. Propiedades de la clase Tfhka

- `string ComPort`: nombre del puerto de comunicación.
- `string Estado`: descripción del estado en el que se encuentra la impresora.
- `Int SendCmnRetryAttempts`: número de reintentos cuando no se procesa un método correctamente o recibe NAK. El manual indica valor en milisegundos. Rango permitido: 50–10000 (0,05 a 10 segundos).
- `bool SerialPortDataReady`: indica si el puerto de comunicación está listo para recibir información.
- `Byte[] SerialPortInputBuffer`: buffer de entrada de datos por el puerto serial.
- `Int SerialPortReceiveTimeout`: tiempo máximo para la ejecución de un método. Valor en segundos. Rango permitido: 5–180.
- `String Status_Error`: descripción del estado y error en el que se encuentra la impresora.
- `Bool StatusPort`: indica si el puerto de comunicación está abierto o cerrado.

## 4.1. GetPrinterStatus tipo PrinterStatus

Obtiene un reporte del status y error de la impresora en un objeto del tipo `PrinterStatus` que contiene el código y una descripción tanto para el status como para el error actual.

```text
PrinterStatus GetPrinterStatus()
```

Retorno: un objeto de tipo `PrinterStatus` con los siguientes atributos.

- `bool ErrorValidity`: validez del error.
- `int PrinterErrorCode`: valor entero del error (ver anexo 2).
- `string PrinterErrorDescription`: descripción del error.
- `int PrinterStatusCode`: valor entero del status (ver anexo 1).
- `string PrinterStatusDescription`: descripción del status.
