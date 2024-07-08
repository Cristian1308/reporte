// Obtener referencias a los elementos HTML
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const context = canvas.getContext('2d');

// Activar la cámara
navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((err) => {
        console.error("Error al acceder a la cámara: ", err);
    });

// Capturar la imagen cuando se hace clic en el botón
captureButton.addEventListener('click', () => {
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const capturedImage = canvas.toDataURL('image/png');

    // Aquí puedes comparar la imagen capturada con una imagen de referencia
    compareImages(capturedImage, '/reference.jpg');
});

// Función para cargar la imagen de una URL en un elemento HTML
function loadImage(src, callback) {
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => callback(img);
    img.src = src;
}

// Función para comparar las imágenes píxel por píxel usando Canvas
function compareImages(img1Src, img2Src) {
    loadImage(img1Src, (img1) => {
        loadImage(img2Src, (img2) => {
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

            const imgData1 = tempContext1.getImageData(0, 0, img1.width, img1.height).data;
            const imgData2 = tempContext2.getImageData(0, 0, img2.width, img2.height).data;

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
        });
    });
}
