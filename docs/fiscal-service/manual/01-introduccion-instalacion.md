# Introducción, requisitos e instalación

Transcripción del manual MLJ-CINT-01, versión 1.4, fecha 02/04/2022. The Factory HKA, C.A.

## 1. Introducción

La librería TfhkaNet permite la integración con sistemas administrativos desarrollados bajo la tecnología de .NET, como lo son C#, J#, VB.NET y ASP.

En las siguientes páginas se describen los detalles de la interfaz de aplicación TfhkaNet, desde los requerimientos de hardware, la referencia a la librería de integración, los componentes adicionales tales como librerías dinámicas y finalmente la estructura de la clase compilada que contiene los métodos y propiedades para el uso de cualquiera de las impresoras distribuidas por The Factory HKA a través de un sistema administrativo desarrollado en .NET.

## 2. Requerimientos de hardware

- Procesador de 1 GHz o superior
- Memoria RAM de 1 GB o superior
- Espacio libre en disco duro de 50 MB
- Puerto serial físico o USB 2.0

## 3. Requerimientos de software

- Sistema operativo Windows 7, 8 y 10, las versiones más comerciales
- .NET Framework 4.0
- IDE para manejar un desarrollo en .NET

## 4. Instalación

En el SDK descargado se encuentran las tres herramientas básicas para integrar el sistema administrativo con la impresora fiscal: la librería `TfhkaNet.dll`, el manual de dicha librería y un demo funcional con código abierto donde se ejemplifica el uso de la librería.

Antes de usar la librería hay que incluirla y referenciarla en el proyecto:

1. Crear un nuevo proyecto.
2. Agregar la referencia a la librería de integración desde el IDE.
3. Una vez referenciada, incluir los métodos a utilizar.

Las páginas 8 a 11 del PDF son capturas del IDE. El texto de esas capturas no se pudo extraer. Muestran, en este orden:

- Página 8: el `using` en C# después de referenciar la DLL.
- Página 9: el `Imports` equivalente en Visual Basic.
- Página 10: la declaración y la creación del objeto `Tfhka` en C#.
- Página 11: la misma declaración en Visual Basic.

El texto que sí está en la página 12, justo antes de la sección de importación, dice: acto seguido, ya se pueden utilizar los métodos y funciones de la clase Tfhka.

## 5. Importación y declaraciones

Una vez agregada la referencia de la clase TfhkaNet a la solución e importado el espacio de nombre respectivo, se puede empezar a trabajar con la clase Tfhka, con sus atributos y métodos públicos.

En C#:

```csharp
using TfhkaNet.IF;
using TfhkaNet.IF.VE;
```

### 5.1. Declaración de un objeto tipo Tfhka

```text
<Tipo de modificador> Tfhka <Nombre del Objeto>
```

Ejemplo:

```csharp
private Tfhka Impresora;
public Tfhka Impresora;
```

### 5.2. Inicialización del objeto Tfhka

La clase Tfhka tiene solo su constructor por defecto. Esto permite inicializar las propiedades fundamentales de la interfaz. Después hay que usar el método correspondiente para abrir el puerto, explicado más adelante.

```text
<Nombre del Objeto> = new Tfhka();
```

Ejemplo:

```csharp
this.Impresora = new Tfhka();
```

En Visual Basic:

```vb
Imports TfhkaNet.IF
Imports TfhkaNet.IF.VE
```

### 5.3. Declaración e inicialización de un objeto tipo Tfhka

```vb
Dim <Nombre del Objeto> As New Tfhka()
```

Ejemplo:

```vb
Dim Impresora As New Tfhka()
```
