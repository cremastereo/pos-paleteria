# Anexos

Transcripción del manual MLJ-CINT-01, versión 1.4, fecha 02/04/2022. The Factory HKA, C.A.

## 5. Anexos

### 5.1. Anexo 1: lista de código de status

Tabla 2: Lista de status. La librería `TfhkaNet.dll` retorna este valor en decimal.

| Hex | Decimal | Comentario |
| --- | --- | --- |
| 0 | 0 | Estado desconocido. |
| 1 | 1 | En modo prueba y en espera. |
| 2 | 2 | En modo prueba y emisión de documentos fiscales. |
| 3 | 3 | En modo prueba y emisión de documentos no fiscales. |
| 4 | 4 | En modo fiscal y en espera. |
| 5 | 5 | En modo fiscal y emisión de documentos fiscales. |
| 6 | 6 | En modo fiscal y emisión de documentos no fiscales. |
| 7 | 7 | En modo fiscal, cercana carga completa de la memoria fiscal y en espera. |
| 8 | 8 | En modo fiscal, cercana carga completa de la memoria fiscal y en emisión de documentos fiscales. |
| 9 | 9 | En modo fiscal, cercana carga completa de la memoria fiscal y en emisión de documentos no fiscales. |
| 0A | 10 | En modo fiscal, carga completa de la memoria fiscal y en espera. |
| 0B | 11 | En modo fiscal, carga completa de la memoria fiscal y en emisión de documentos fiscales. |
| 0C | 12 | En modo fiscal, carga completa de la memoria fiscal y en emisión de documentos no fiscales. |

### 5.2. Anexo 2: lista de código de error

Tabla 3: Lista de errores. La librería `TfhkaNet.dll` retorna este valor en decimal. El encabezado de la tabla en el PDF dice “STATUS”; el contenido es la lista de errores.

| Hex | Decimal | Comentario |
| --- | --- | --- |
| 00 | 0 | No hay error. |
| 01 | 1 | Fin en la entrega de papel. |
| 02 | 2 | Error de índole mecánico en la entrega de papel. |
| 03 | 3 | Fin en la entrega de papel y error mecánico. |
| 50 | 80 | Comando inválido o valor inválido. |
| 54 | 84 | Tasa inválida. |
| 58 | 88 | No hay asignadas directivas. |
| 5C | 92 | Comando inválido. |
| 60 | 96 | Error fiscal. |
| 64 | 100 | Error de la memoria fiscal. |
| 6C | 108 | Memoria fiscal llena. |
| 70 | 112 | Buffer completo (debe enviar el comando de reinicio). |
| 80 | 128 | Error en la comunicación. |
| 89 | 137 | No hay respuesta. |
| 90 | 144 | Error LRC. |
| 91 | 145 | Error interno API. |
| 99 | 153 | Error en la apertura del archivo. |
