const IMAGE = new Image();
const WIDTH = 300;
const HEIGHT = 300;
IMAGE.onload = imageLoader;
IMAGE.src = "myphoto.png"; // 300x300!

function imageLoader()
{
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = IMAGE.width;
    canvas.height = IMAGE.height;
    ctx.drawImage(IMAGE, 0, 0, canvas.width, canvas.height);
    // whiteAndBlack(canvas)

    const result = document.getElementById("result");
    // convolve(canvas, result)
    convolveSovel(canvas, result)
}


function whiteAndBlack(canvas)
{
    const ctx = canvas.getContext("2d");
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // console.log(imgData)
    // 300 x 300 x 4 // pixel[0] = { r: 10, g: 0, b:255, a:0 } // EXAMPLE
    const pixel = imgData.data;
    // console.log(pixel)
    for (let p = 0; p < pixel.length; p += 4)
    {
        const red = pixel[p]
        const green = pixel[p + 1]
        const blue = pixel[p + 2]

        const gray = (red + green + blue) / 3

        pixel[p] = gray
        pixel[p + 1] = gray
        pixel[p + 2] = gray
    }
    ctx.putImageData(imgData, 0, 0)
}



function convolve(canvasSource, canvasDestiny)
{
    canvasDestiny.width = canvasSource.width;
    canvasDestiny.height = canvasSource.height;

    const cxtSource = canvasSource.getContext("2d")
    const imgDataSource = cxtSource.getImageData(0, 0, canvasSource.width, canvasSource.height)
    const pixelSource = imgDataSource.data

    const cxtDestiny = canvasDestiny.getContext("2d")
    const imgDataDestiny = cxtDestiny.getImageData(0, 0, canvasDestiny.width, canvasDestiny.height)
    const pixelDestiny = imgDataDestiny.data

    // kernel
    const kernel = [  // Basic
        [-1, -1, -1],
        [-1, 8, -1],
        [-1, -1, -1],
    ]
    // const kernel = [ //Focus
    //     [0, -1, 0],
    //     [-1, 5, -1],
    //     [0, -1, 0],
    // ]
    // const kernel = [ //blur
    //     [1 / 16, 2 / 16, 1 / 16],
    //     [2 / 16, 4 / 16, 2 / 16],
    //     [1 / 16, 2 / 16, 1 / 16],
    // ]

    for (let y = 1; y < canvasSource.height - 1; y++)
    {
        for (let x = 1; x < canvasSource.width - 1; x++)
        {
            // index into array
            const idx = (y * canvasSource.width + x) * 4
            // boxs
            const box1 = kernel[0][0] * pixelSource[(((y - 1) * canvasSource.width + (x - 1)) * 4)]
            const box2 = kernel[0][1] * pixelSource[(((y - 1) * canvasSource.width + x) * 4)]
            const box3 = kernel[0][2] * pixelSource[(((y - 1) * canvasSource.width + (x + 1)) * 4)]
            const box4 = kernel[1][0] * pixelSource[((y * canvasSource.width + (x - 1)) * 4)]
            const box5 = kernel[1][1] * pixelSource[((y * canvasSource.width + x) * 4)]
            const box6 = kernel[1][2] * pixelSource[((y * canvasSource.width + (x + 1)) * 4)]
            const box7 = kernel[2][0] * pixelSource[(((y + 1) * canvasSource.width + (x - 1)) * 4)]
            const box8 = kernel[2][1] * pixelSource[(((y + 1) * canvasSource.width + x) * 4)]
            const box9 = kernel[2][2] * pixelSource[(((y + 1) * canvasSource.width + (x + 1)) * 4)]

            const result = (box1 + box2 + box3 + box4 + box5 + box6 + box7 + box8 + box9)


            pixelDestiny[idx] = result
            pixelDestiny[idx + 1] = result
            pixelDestiny[idx + 2] = result
            pixelDestiny[idx + 3] = 255

            // pixelDestiny[idx] = pixelSource[idx]
            // pixelDestiny[idx + 1] = pixelSource[idx + 1]
            // pixelDestiny[idx + 2] = pixelSource[idx + 2]
            // pixelDestiny[idx + 3] = pixelSource[idx + 3]
        }
    }
    cxtDestiny.putImageData(imgDataDestiny, 0, 0)

}



function convolveSovel(canvasSource, canvasDestiny)
{
    canvasDestiny.width = canvasSource.width;
    canvasDestiny.height = canvasSource.height;

    const cxtSource = canvasSource.getContext("2d")
    const imgDataSource = cxtSource.getImageData(0, 0, canvasSource.width, canvasSource.height)
    const pixelSource = imgDataSource.data

    const cxtDestiny = canvasDestiny.getContext("2d")
    const imgDataDestiny = cxtDestiny.getImageData(0, 0, canvasDestiny.width, canvasDestiny.height)
    const pixelDestiny = imgDataDestiny.data

    // kernel
    const SovelVertical = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1],
    ]
    const SovelHorizontal = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1],
    ]

    for (let y = 1; y < canvasSource.height - 1; y++)
    {
        for (let x = 1; x < canvasSource.width - 1; x++)
        {
            // index into array
            const idx = (y * canvasSource.width + x) * 4

            // * convolves with Sovel
            let totalY = 0
            let totalX = 0
            for (let kernelY = 0; kernelY < 3; kernelY++)
            {
                for (let kernelX = 0; kernelX < 3; kernelX++)
                {
                    totalY += SovelVertical[kernelY][kernelX]
                        * pixelSource[(((y + (kernelY - 1)) * canvasSource.width + (x + (kernelX - 1))) * 4)]
                    totalX += SovelHorizontal[kernelY][kernelX]
                        * pixelSource[(((y + (kernelY - 1)) * canvasSource.width + (x + (kernelX - 1))) * 4)]
                }
            }
            let mag = Math.sqrt((totalY * totalY) + (totalX * totalX))

            // * boxs vertical
            // const boxY1 = SovelVertical[0][0] * pixelSource[(((y - 1) * canvasSource.width + (x - 1)) * 4)]
            // const boxY2 = SovelVertical[0][1] * pixelSource[(((y - 1) * canvasSource.width + x) * 4)]
            // const boxY3 = SovelVertical[0][2] * pixelSource[(((y - 1) * canvasSource.width + (x + 1)) * 4)]
            // const boxY4 = SovelVertical[1][0] * pixelSource[((y * canvasSource.width + (x - 1)) * 4)]
            // const boxY5 = SovelVertical[1][1] * pixelSource[((y * canvasSource.width + x) * 4)]
            // const boxY6 = SovelVertical[1][2] * pixelSource[((y * canvasSource.width + (x + 1)) * 4)]
            // const boxY7 = SovelVertical[2][0] * pixelSource[(((y + 1) * canvasSource.width + (x - 1)) * 4)]
            // const boxY8 = SovelVertical[2][1] * pixelSource[(((y + 1) * canvasSource.width + x) * 4)]
            // const boxY9 = SovelVertical[2][2] * pixelSource[(((y + 1) * canvasSource.width + (x + 1)) * 4)]

            // const resultY = boxY1 + boxY2 + boxY3 + boxY4 + boxY5 + boxY6 + boxY7 + boxY8 + boxY9


            // // boxs horizHntal
            // const boxX1 = SovelHorizontal[0][0] * pixelSource[(((y - 1) * canvasSource.width + (x - 1)) * 4)]
            // const boxX2 = SovelHorizontal[0][1] * pixelSource[(((y - 1) * canvasSource.width + x) * 4)]
            // const boxX3 = SovelHorizontal[0][2] * pixelSource[(((y - 1) * canvasSource.width + (x + 1)) * 4)]
            // const boxX4 = SovelHorizontal[1][0] * pixelSource[((y * canvasSource.width + (x - 1)) * 4)]
            // const boxX5 = SovelHorizontal[1][1] * pixelSource[((y * canvasSource.width + x) * 4)]
            // const boxX6 = SovelHorizontal[1][2] * pixelSource[((y * canvasSource.width + (x + 1)) * 4)]
            // const boxX7 = SovelHorizontal[2][0] * pixelSource[(((y + 1) * canvasSource.width + (x - 1)) * 4)]
            // const boxX8 = SovelHorizontal[2][1] * pixelSource[(((y + 1) * canvasSource.width + x) * 4)]
            // const boxX9 = SovelHorizontal[2][2] * pixelSource[(((y + 1) * canvasSource.width + (x + 1)) * 4)]

            // const resultX = boxX1 + boxX2 + boxX3 + boxX4 + boxX5 + boxX6 + boxX7 + boxX8 + boxX9

            // let mag = Math.sqrt((resultY * resultY) + (resultX * resultX))
            mag = mag < 50 ? 0 : mag;

            pixelDestiny[idx] = mag
            pixelDestiny[idx + 1] = mag
            pixelDestiny[idx + 2] = mag
            pixelDestiny[idx + 3] = 255

        }
    }
    cxtDestiny.putImageData(imgDataDestiny, 0, 0)

}