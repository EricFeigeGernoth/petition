//Fill in the updated field of signature with signature with new signature
var canvas = document.getElementById("canvas");
var button = document.getElementById("petitionButton");
var signature = document.querySelector("input[name=signature]");

var ctx = canvas.getContext("2d");

let drawing = false;

let positionX = 0;
let positionY = 0;

function sicdraw(movementPosition) {
    if (!drawing) {
        return;
    } else {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(positionX, positionY);
        ctx.lineTo(movementPosition.offsetX, movementPosition.offsetY);
        ctx.stroke();
        positionX = movementPosition.offsetX;
        positionY = movementPosition.offsetY;
    }
} //drawing function defines the draw movement

canvas.addEventListener("mousedown", function (mousePosition) {
    drawing = true;
    positionX = mousePosition.offsetX;
    positionY = mousePosition.offsetY;
});

canvas.addEventListener("mousemove", sicdraw);

canvas.addEventListener("mouseup", function () {
    drawing = false;
});

button.addEventListener("click", function () {
    signature.value = canvas.toDataURL();
});
