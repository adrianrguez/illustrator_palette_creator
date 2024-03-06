// Se verifica si hay un documento abierto y si hay grupos de muestras disponibles
// Si es así, se crea un diálogo con un dropdown list que enumera los grupos de muestras disponibles.
// Cuando el usuario selecciona un grupo y presiona "Aceptar", se muestra un mensaje con el nombre del grupo seleccionado.
// También se podría hacer algo con el grupo seleccionado, como seleccionar todas las muestras en ese grupo.
// En este ejemplo, simplemente se muestra un mensaje con el nombre del grupo seleccionado.
// Si el usuario presiona "Cancelar", se muestra un mensaje de que no se ha seleccionado ningún grupo.
// Si no hay documentos abiertos o no hay grupos de muestras disponibles, se muestra un mensaje de que no hay documentos abiertos o no hay grupos de muestras disponibles.

var logFile = new File("~/Desktop/illustrator_script_log.txt");
logFile.open('a'); // Abre el archivo en modo de append para añadir contenido
logFile.writeln("Comienza el script");

// Variables para el diseño de la mesa de trabajo
var startX = 28.9449; 
var startY = -28.9449; // Recuerda que SOLO las coordenadas Y van en sentido contrario, por eso se ponen negativas
var rectWidth = 100;
var rectHeight = 50;
var textWidth = rectWidth;
var textHeight = rectHeight;
var gap = 10;
var textGap = 3;
var numRows = 0; // Variable para controlar el número de filas
var tipografia = "Consolas"; // Tipografía por defecto para el texto

var artboardsRight = 100; // Variable para controlar el ancho de la mesa de trabajo
var artboardHeight = -100; // Variable para controlar el alto de la mesa de trabajo

var artboardWidth = 0;
var artboardX = 0; 
var artboardY = 0;

var maxColumnasMuestras = 5; // Variable para controlar el número máximo de columnas de muestras
var columnasMuestras = 0; // Variable para controlar el número de columnas de muestras creadas
var maxFilasMuestras = 7; // Variable para controlar el número máximo de filas de muestras
var filasMuestras = 0; // Variable para controlar el número de filas de muestras creadas

var maxColumnasArtboards = 7; // Variable para controlar el número máximo de columnas de mesas de trabajo
var columnasArtboards = 1; // Variable para controlar el número de columnas de mesas de trabajo creadas
var filasArtboards = 1; // Variable para controlar el número de filas de mesas de trabajo creadas

var currentArtboard = 0; // Variable para controlar la mesa de trabajo actual
var currentArtboardIndex = 0; // Variable para controlar el índice de la mesa de trabajo actual

// Se verifica si hay documentos abiertos y si hay grupos de muestras disponibles
if (app.documents.length > 0 && app.activeDocument.swatchGroups.length > 1) {
    var doc = app.activeDocument;
    var groupNames = [];
    // Se recorren los grupos de muestras para obtener sus nombres
    for (var i = 1; i < doc.swatchGroups.length; i++) { // Comenzar en 1 para omitir el grupo [All Swatches]
        groupNames.push(doc.swatchGroups[i].name);
    }
    createDialog(); // Se crea el diálogo para seleccionar un grupo de muestras
} else {
    alert('No hay documentos abiertos o no hay grupos de muestras disponibles.');
}

logFile.writeln("-------------------------------------------------------------");
logFile.writeln("");
logFile.writeln("");
logFile.close(); // Cierra el archivo

// Función para crear el diálogo de selección de grupo de muestras
function createDialog() {
    var dlg = new Window('dialog', 'Selecciona un Grupo de Muestras');
    var groupDropDown = dlg.add('dropdownlist', undefined, groupNames);
    groupDropDown.selection = 0; // Seleccionar el primer grupo por defecto
    var btnGroup = dlg.add('group');
    btnGroup.orientation = 'row';
    btnGroup.add('button', undefined, 'Aceptar', {name: 'ok'});
    btnGroup.add('button', undefined, 'Cancelar', {name: 'cancel'});
    var result = dlg.show();
    if (result == 1) { // Si el usuario presiona "Aceptar"
        var selectedGroupName = groupDropDown.selection.text;
        // Se podría hacer algo con el grupo seleccionado aquí
        // Por ejemplo, seleccionar el grupo de muestras
        for (var i = 1; i < doc.swatchGroups.length; i++) {
            if(doc.swatchGroups[i].name == selectedGroupName) {
                var swatches = doc.swatchGroups[i].getAllSwatches();
                getSwatchesFromLibrary(swatches);
                break;
            }
        }
    } else {
        alert('No se ha seleccionado ningún grupo de muestras.');
    }
}

// Función para obtener las muestras de la librería de colores
function getSwatchesFromLibrary(swatches) {
    // Se obtiene el ancho y alto de la mesa de trabajo actual
    artboardWidth = doc.artboards[0].artboardRect[2];
    artboardHeight = doc.artboards[0].artboardRect[3];

    // Se obtiene la posición X e Y de la mesa de trabajo actual
    artboardX = doc.artboards[0].artboardRect[0];
    artboardY = doc.artboards[0].artboardRect[1];

    currentArtboard = doc.artboards[0];
    currentArtboardIndex = 0;
    doc.artboards.setActiveArtboardIndex(0);

    artboardsRight = artboardWidth; // Asumir que se comienza con un ancho de mesa de trabajo inicial

    // Iterar sobre cada color en la librería de colores
    for (var i = 0; i < swatches.length; i++) {
        var swatch = swatches[i];
        var color = swatch.color;
        crearSwatch(color, swatch.name);
    }
}

// Función para crear una nueva mesa de trabajo
function createNewArtboard(artboardX, artboardY, artboardWidth, artboardHeight) {
    var newArtboard = doc.artboards.add([artboardX, artboardY, artboardWidth, artboardHeight]);
    doc.artboards.setActiveArtboardIndex(doc.artboards.length - 1);
    currentArtboard = doc.artboards[doc.artboards.length - 1];
    return newArtboard;
}

// Función para crear un rectángulo de muestra
function createSampleRectangle(color, x, y, width, height) {
    var rectangle = doc.pathItems.rectangle(y, x, width, height);
    rectangle.fillColor = color;
    rectangle.stroked = false;
    return rectangle;
}

// Función para crear un marco de texto para el nombre del color y los valores CMYK
function createTextFrame(text, x, y, tipografia) {
    var textFrame = doc.textFrames.areaText(doc.pathItems.rectangle(y - rectHeight - textGap, x, textWidth, -textHeight));
    textFrame.contents = text;
    // Ajustar la tipografía del texto
    textFrame.textRange.characterAttributes.textFont = app.textFonts.getByName(tipografia);
    textFrame.textRange.characterAttributes.size = 10;
    return textFrame;
}

// Función para crear un rectángulo de muestra y un marco de texto
function crearSwatch(color, swatchName) {
    var cmyk = color.spot.color;
    var text = swatchName + "\n" + "CMYK: \n" + Math.round(cmyk.cyan) + "|" + Math.round(cmyk.magenta) + "|" + Math.round(cmyk.yellow) + "|" + Math.round(cmyk.black);
    
    var x = startX + (rectWidth + gap) * columnasMuestras + (artboardWidth * (columnasArtboards - 1));
    var y = startY - (rectHeight + gap + textGap + textHeight) * filasMuestras + (artboardHeight * (filasArtboards - 1));
    var width = rectWidth;
    var height = rectHeight;
    
    var rectangle = createSampleRectangle(color, x, y, width, height);
    var textFrame = createTextFrame(text, x, y - (textGap + rectHeight), tipografia);

    // Asegúrate de establecer la mesa de trabajo activa para el rectángulo y el marco de texto
    rectangle.artboardIndex = currentArtboard;
    textFrame.artboardIndex = currentArtboard;

    // Actualizar contadores de columnas y filas
    columnasMuestras++;
    if (columnasMuestras >= maxColumnasMuestras) {
        columnasMuestras = 0;
        filasMuestras++;
    }
    if (filasMuestras >= maxFilasMuestras) {
        columnasArtboards++;
        filasMuestras = 0;
        columnasMuestras = 0;
    }
    if (columnasArtboards >= maxColumnasArtboards) {
        columnasArtboards = 1;
        filasArtboards++;
        filasMuestras = 0;
        columnasMuestras = 0;
    }
}
