# JSON to Excel

App web para cargar JSON, elegir campos (incluye subcampos) y exportar a Excel.

## Funciones
- Importar JSON desde un textarea o usar un ejemplo.
- Detectar arreglos dentro de la clave `data`.
- Seleccionar campos y subcampos anidados.
- Vista previa de los primeros registros.
- Exportar a archivo `.xlsx`.

## Ejecutar en desarrollo
1. `npm install`
2. `npm run dev`

## Como usar
1. Pega tu JSON en el area de texto.
2. Presiona "Analizar JSON".
3. Marca los campos que quieres exportar.
4. Escribe un nombre de archivo si lo deseas.
5. Presiona "Exportar Excel".

## Modulo Excel o CSV a JSON
Ruta: `/excel-json/`

1. Carga un archivo .xlsx, .xls o .csv.
2. Selecciona la hoja.
3. Elige salida JSON o Lista.
4. Copia o descarga el resultado.

## Notas
- Los subcampos se muestran con su ruta en notacion con puntos (ejemplo: `puesto.nombre`).
- Los arreglos se exportan como texto JSON.
