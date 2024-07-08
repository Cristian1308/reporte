// Obtener referencias a los elementos HTML
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const referenceImage1 = document.getElementById('reference1');
const referenceImage2 = document.getElementById('reference2');
const overlayCanvas = document.getElementById('overlay');
const overlayContext = overlayCanvas.getContext('2d');
const context = canvas.getContext('2d');

// Cargar los modelos de face-api.js
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo);

// Activar la cámara
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            console.log("Cámara activada");

            // Esperar a que el video esté listo antes de dibujar el óvalo
            video.addEventListener('loadeddata', () => {
                drawOverlay();
            });
        })
        .catch((err) => {
            console.error("Error al acceder a la cámara: ", err);
        });
}

// Dibujar un óvalo en la vista de la cámara
function drawOverlay() {
    overlayCanvas.width = video.videoWidth;
    overlayCanvas.height = video.videoHeight;
    overlayContext.strokeStyle = 'red';
    overlayContext.lineWidth = 3;
    overlayContext.beginPath();
    overlayContext.ellipse(overlayCanvas.width / 2, overlayCanvas.height / 2, 150, 200, 0, 0, 2 * Math.PI);
    overlayContext.stroke();
}

// Función para cargar una imagen de referencia y detectar el rostro
async function loadReferenceImage(imgElement) {
    const img = await faceapi.fetchImage(imgElement.src);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detections) {
        console.error("No se detectó ningún rostro en la imagen de referencia");
        return null;
    }
    return detections.descriptor;
}

// Función para capturar la imagen de la cámara
function captureImage() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    console.log("Imagen capturada:", dataURL);
    return dataURL;
}

// Función para detectar el rostro en la imagen capturada y compararlo con las referencias
async function compareImages(capturedImageSrc) {
    const referenceDescriptor1 = await loadReferenceImage(referenceImage1);
    const referenceDescriptor2 = await loadReferenceImage(referenceImage2);
    
    if (!referenceDescriptor1 || !referenceDescriptor2) {
        alert("No se pudo cargar una o ambas imágenes de referencia");
        return;
    }

    const img = await faceapi.fetchImage(capturedImageSrc);
    const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detections) {
        alert("No se detectó ningún rostro en la imagen capturada");
        return;
    }

    const distance1 = faceapi.euclideanDistance(referenceDescriptor1, detections.descriptor);
    const distance2 = faceapi.euclideanDistance(referenceDescriptor2, detections.descriptor);
    console.log("Distancia Euclidiana a Cristian:", distance1);
    console.log("Distancia Euclidiana a Sergio:", distance2);

    const similarityThreshold = 0.6; // Umbral para determinar si las imágenes son similares

    if (distance1 < similarityThreshold) {
        alert("Bienvenido Cristian");
    } else if (distance2 < similarityThreshold) {
        alert("Bienvenido Sergio");
    } else {
        alert("Las imágenes no son similares a ninguna referencia.");
    }
}

// Capturar y comparar la imagen cuando se hace clic en el botón
captureButton.addEventListener('click', () => {
    console.log("Botón de captura presionado");
    const capturedImage = captureImage();
    compareImages(capturedImage);
});
