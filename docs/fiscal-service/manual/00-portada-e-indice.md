# Manual de integración — Librería TfhkaNet

Transcripción de *Manual de integración, Librería TfhkaNet*, código **MLJ-CINT-01**, versión **1.4**, fecha **02/04/2022**. The Factory HKA, C.A., Venezuela. Marzo 2022.

Se omitió el pie de página que se repite en cada hoja (“The Factory HKA, C.A. - VENEZUELA” y la cabecera de código, versión y fecha). Las capturas de pantalla del IDE no tienen texto extraíble; donde el original es solo imagen, esta transcripción lo indica.

## Historial de revisiones

| Revisión | Fecha | Páginas afectadas | Comentario |
| --- | --- | --- | --- |
| 1.0 | 18/04/2014 | Todas | Versión inicial |
| 1.1 | 13/10/2014 | Todas | Agregado SV, X01, X02, X03, X04, Z01, Z02, Z03 y Z04 |
| 1.2 | 23/02/2018 | Todas | Actualización de formato del documento. Corrección de estructuras de datos de reportes X, Z y de los estados |
| 1.3 | 29/10/2021 | Todas | Modificación de formato |
| 1.4 | 04/04/2022 | Todas | S2PrinterData (objeto asociado a las lecturas, comandos S2 y sus variantes). ReportData (objeto asociado a las lecturas U0X y sus variantes; se agregan las bases imponibles IGTF). Acumuladores X (objeto asociado a las lecturas U0Z y sus variantes; se agregan las bases imponibles IGTF). Se crea comando de extracción de S25. Se agregan requerimientos de software |

Tabla 1: Control de versiones.

## Índice

1. Índice de contenido — página 3
2. Introducción — página 6
3. Requerimientos de hardware — página 6
4. Requerimientos de software — página 6
5. Instalación — página 7
6. Importación y declaraciones — página 12
7. Declaración de un objeto tipo Tfhka — página 12
8. Inicialización del objeto Tfhka — página 12
9. Declaración e inicialización de un objeto tipo Tfhka — página 13
10. Funciones de la clase Tfhka — página 13
11. OpenFpctrl — página 13
12. CloseFpctrl — página 13
13. CheckFprinter — página 13
14. CheckDrawer — página 14
15. ReadFpStatus — página 14
16. SendCmd — página 14
17. SendFileCmd — página 15
18. UploadReportCmd — página 15
19. UploadStatusCmd — página 16
20. Propiedades de la clase Tfhka — página 16
21. Métodos orientados a objetos de la clase Tfhka — página 17
22. GetPrinterStatus tipo PrinterStatus — página 17
23. GetXReport tipo ReportData — página 17
24. GetX2Report tipo ReportData — página 19
25. GetX4Report tipo AcumuladosX — página 20
26. GetX5Report tipo AcumuladosX — página 21
27. GetX6Report tipo AcumuladosX — página 21
28. GetX7Report tipo AcumuladosX — página 22
29. PrintXReport tipo Void — página 23
30. GetZReport tipo ReportData y tipo ReportData[] — página 23
31. GetZ2Report tipo ReportData — página 27
32. PrintZReport tipo Void — página 29
33. GetS1PrinterData tipo S1PrinterData — página 30
34. GetS2PrinterData tipo S2PrinterData — página 31
35. GetS2EPrinterData tipo S2PrinterData — página 31
36. GetS21PrinterData tipo S2PrinterData — página 32
37. GetS22PrinterData tipo S2PrinterData — página 32
38. GetS23PrinterData tipo S2PrinterData — página 33
39. GetS25PrinterData tipo S2PrinterData — página 34
40. GetS3PrinterData tipo S3PrinterData — página 34
41. GetS4PrinterData tipo S4PrinterData — página 35
42. GetS5PrinterData tipo S5PrinterData — página 35
43. GetS6PrinterData tipo S6PrinterData — página 36
44. GetS7PrinterData tipo S7PrinterData — página 36
45. GetS8EPrinterData tipo S8EPrinterData — página 37
46. GetS8PPrinterData tipo S8PPrinterData — página 37
47. GetSVPrinterData tipo SVPrinterData — página 38
48. PrinterException — página 38
49. Anexos — página 39
50. Anexo 1: Lista de código de status — página 39
51. Anexo 2: Lista de código de error — página 40

## Contacto (última página)

The Factory HKA  
La California Norte, Callejón Gutiérrez  
Edif. Riva, PB Ofic. 2-1, Caracas - Venezuela  
Departamento de Soporte e Integración  
integration@thefactoryhka.com  
Teléfono (212) 237.4112 • 2398176  
www.thefactoryhka.com.ve

## Continúa

- [Introducción e instalación](01-introduccion-instalacion.md)
- [Funciones y propiedades](02-funciones.md)
- [Reportes X y Z](03-reportes-x-z.md)
- [Estados S y PrinterException](04-estados-s.md)
- [Anexos de status y error](05-anexos.md)
