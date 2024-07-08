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
    })
    .catch((err) => {
        console.error("Error al acceder a la cámara: ", err);
    });

// Función para cargar la imagen de referencia
function loadReferenceImage(callback) {
    const img = new Image();
    img.src = referenceImage.src;  // Utiliza la dirección de la imagen de referencia del atributo src
    img.onload = () => callback(img);  // Ejecuta el callback cuando la imagen está cargada
}

// Función para capturar la imagen de la cámara
function captureImage() {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);  // Captura la imagen del video
    return canvas.toDataURL('image/png');  // Devuelve la imagen capturada en formato data URL
}

// Función para comparar las imágenes píxel por píxel usando Canvas
function compareImages(img1Src, img2) {
    const img1 = new Image();
    img1.src = img1Src;
    img1.onload = () => {
        const tempCanvas1 = document.createElement('canvas');
        const tempContext1 = tempCanvas1.getContext('2d');
        tempCanvas1.width = img1.width;
        tempCanvas1.height = img1.height;
        tempContext1.drawImage(img1, 0, 0);

        const tempCanvas2 = document.createElement('canvas');
        const tempContext2 = tempCanvas2.getContext('2d');
        tempCanvas2.width = img2.width;
        tempCanvas2.height = img2.height;
        tempContext2.drawImage(img2, 0, 0);

        const imgData1 = tempContext1.getImageData(0, 0, tempCanvas1.width, tempCanvas1.height).data;
        const imgData2 = tempContext2.getImageData(0, 0, tempCanvas2.width, tempCanvas2.height).data;

        let diff = 0;
        for (let i = 0; i < imgData1.length; i += 4) {
            const rDiff = Math.abs(imgData1[i] - imgData2[i]);
            const gDiff = Math.abs(imgData1[i + 1] - imgData2[i + 1]);
            const bDiff = Math.abs(imgData1[i + 2] - imgData2[i + 2]);
            diff += rDiff + gDiff + bDiff;
        }

        const similarityThreshold = 1000000; // Ajusta este umbral según sea necesario

        if (diff < similarityThreshold) {
            alert("Las imágenes son similares.");
        } else {
            alert("Las imágenes no son similares.");
        }
    };
}

// Capturar y comparar la imagen cuando se hace clic en el botón
captureButton.addEventListener('click', () => {
    const capturedImage = captureImage();  // Captura la imagen de la cámara
    loadReferenceImage((referenceImg) => {  // Carga la imagen de referencia
        compareImages(capturedImage, referenceImg);  // Compara las imágenes
    });
});

