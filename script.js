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
    compareImages(capturedImage, 'reference.jpg');
});

// Función para cargar la imagen de una URL en un elemento HTML
function loadImage(src, callback) {
    let img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => callback(img);
    img.src = src;
}

// Función para calcular la suma de los elementos en una matriz
function sumMatrix(matrix) {
    let sum = 0;
    for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.cols; j++) {
            sum += matrix.ucharPtr(i, j).reduce((a, b) => a + b, 0);
        }
    }
    return sum;
}

// Función para comparar las imágenes usando OpenCV.js
function compareImages(img1Src, img2Src) {
    loadImage(img1Src, (img1) => {
        loadImage(img2Src, (img2) => {
            let mat1 = cv.imread(img1);
            let mat2 = cv.imread(img2);

            // Cambiar el tamaño de las imágenes para que coincidan, si es necesario
            let size = new cv.Size(640, 480);
            cv.resize(mat1, mat1, size);
            cv.resize(mat2, mat2, size);

            let diff = new cv.Mat();
            cv.absdiff(mat1, mat2, diff);

            // Calcular la suma de diferencias
            let diffSum = sumMatrix(diff);
            let similarityThreshold = 1000000; // Establecer un umbral adecuado

            if (diffSum < similarityThreshold) {
                alert("Las imágenes son similares.");
            } else {
                alert("Las imágenes no son similares.");
            }

            // Mostrar la diferencia en el canvas
            let result = new cv.Mat();
            cv.threshold(diff, result, 127, 255, cv.THRESH_BINARY);
            cv.imshow('canvas', result);

            mat1.delete();
            mat2.delete();
            diff.delete();
            result.delete();
        });
    });
}
