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

// Función para comparar las imágenes usando OpenCV.js
function compareImages(img1Src, img2Src) {
    let img1 = new Image();
    let img2 = new Image();

    img1.src = img1Src;
    img2.src = img2Src;

    img1.onload = () => {
        img2.onload = () => {
            let mat1 = cv.imread(img1);
            let mat2 = cv.imread(img2);

            let diff = new cv.Mat();
            cv.absdiff(mat1, mat2, diff);
            let result = new cv.Mat();
            cv.threshold(diff, result, 127, 255, cv.THRESH_BINARY);

            // Mostrar la diferencia
            cv.imshow('canvas', result);

            mat1.delete();
            mat2.delete();
            diff.delete();
            result.delete();
        };
    };
}
