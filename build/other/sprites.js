/*!
 * icon生成器: 特殊字符区域
 */

(function () {

    'use strict';

    // icon 之间的padding
    var ICON_PADDING = 5;
    // 初始OFFSET
    var OFFSET = 0;

    var  CURRENT_INDEX = 0;

    var canvas;
    var ctx;

    var result = {};
    var icons = window.icons;
    var maxHeight = -1;

    window.onload = function () {
        initCanvas();
        start();
    };

    function initCanvas() {
        canvas = document.createElement('canvas');
        canvas.width = 10000;
        canvas.height = 500;
        ctx = canvas.getContext('2d');

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function start() {
        generate();
    }

    function next(value, width, height) {
        CURRENT_INDEX++;

        result[value] = {
            pos: {
                x: OFFSET,
                y: 0
            },
            size: {
                width: width,
                height: height
            }
        };

        maxHeight = Math.max(maxHeight, height);
        OFFSET += width + ICON_PADDING;

        generate();
    }

    function end() {
        var newCanvas = document.createElement('canvas');
        var newCtx = newCanvas.getContext('2d');

        newCanvas.width = OFFSET;
        newCanvas.height = maxHeight;

        var imgData = ctx.getImageData(0, 0, OFFSET, maxHeight);

        newCtx.putImageData(imgData, 0, 0);
        var dataUrl = newCanvas.toDataURL('image/png');

        console.log(JSON.stringify(result))
        console.log(dataUrl)
    }

    function generate() {
        if (CURRENT_INDEX >= icons.length) {
            return end();
        }

        var current = icons[CURRENT_INDEX];

        drawIcon(current.value, current.file);
    }

    function drawIcon(value, url) {
        var img = new Image();
        img.onload = function () {
            ctx.drawImage(img, OFFSET, 0);
            next(value, img.width, img.height);
        };

        img.src = url;
    }
})();
