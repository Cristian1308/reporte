// Obtener referencias a los elementos HTML
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const referenceImage = document.getElementById('reference');
const context = canvas.getContext('2d');

// Activar la cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
        console.log("Cámara activada");
    })
    .catch((err) => {
        console.error("Error al acceder a la cámara: ", err);
    });

// Función para cargar la imagen de referencia
function loadReferenceImage(callback) {
    const img = new Image();
    img.src = referenceImage.src;
    img.crossOrigin = "anonymous"; // Asegurar el acceso CORS
    img.onload = () => {
        console.log("Imagen de referencia cargada");
        callback(img);
    };
    img.onerror = () => {
        console.error("Error al cargar la imagen de referencia");
    };
}

// Función para capturar la imagen de la cámara
function captureImage() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    console.log("Imagen capturada:", dataURL);
    return dataURL;
}

// Función para comparar las imágenes usando OpenCV.js
function compareImages(img1Src, img2) {
    const img1 = new Image();
    img1.src = img1Src;
    img1.onload = () => {
        console.log("Imagen capturada cargada");

        // Crear matrices de OpenCV
        let mat1 = cv.imread(img1);
        let mat2 = cv.imread(img2);

        // Convertir a escala de grises
        let gray1 = new cv.Mat();
        let gray2 = new cv.Mat();
        cv.cvtColor(mat1, gray1, cv.COLOR_RGBA2GRAY);
        cv.cvtColor(mat2, gray2, cv.COLOR_RGBA2GRAY);

        // Calcular el histograma de ambas imágenes
        let hist1 = new cv.Mat();
        let hist2 = new cv.Mat();
        let mask = new cv.Mat();
        let channels = new cv.MatVector();
        channels.push_back(new cv.Mat());

        let histSize = [256];
        let ranges = [0, 255];

        cv.calcHist(gray1, channels, mask, hist1, histSize, ranges);
        cv.calcHist(gray2, channels, mask, hist2, histSize, ranges);

        // Normalizar los histogramas
        cv.normalize(hist1, hist1, 0, 1, cv.NORM_MINMAX);
        cv.normalize(hist2, hist2, 0, 1, cv.NORM_MINMAX);

        // Calcular la correlación entre los histogramas
        let correlation = cv.compareHist(hist1, hist2, cv.HISTCMP_CORREL);

        console.log("Correlación:", correlation);

        const similarityThreshold = 0.9; // Ajusta este umbral según sea necesario

        if (correlation > similarityThreshold) {
            alert("Las imágenes son similares.");
        } else {
            alert("Las imágenes no son similares.");
        }

        // Liberar recursos
        mat1.delete();
        mat2.delete();
        gray1.delete();
        gray2.delete();
        hist1.delete();
        hist2.delete();
        mask.delete();
        channels.delete();
    };
    img1.onerror = () => {
        console.error("Error al cargar la imagen capturada");
    };
}

// Capturar y comparar la imagen cuando se hace clic en el botón
captureButton.addEventListener('click', () => {
    console.log("Botón de captura presionado");
    const capturedImage = captureImage();
    loadReferenceImage((referenceImg) => {
        compareImages(capturedImage, referenceImg);
    });
});

