const doms = { // 弹框元素
    boxBtn: document.getElementById('buttonBox'),
    popupContainer: document.getElementById('popup'),
    popupContent: document.getElementById('popup-content')
}

const drawMap = (type) => {
    addInteraction(type)
    doms.boxBtn.classList.add('active')
}

/**
 * 绘制图形
 * @param {*} type 
 */
let draw = null;
function addInteraction(type) {
    exitDraw();
    if (type == 'Box') {
        draw = new ol.interaction.Draw({
            source: vectorLayer.getSource(),
            type: 'Circle',
            geometryFunction: ol.interaction.Draw.createBox()
        });
    } else if (type == 'Circle') {
        draw = new ol.interaction.Draw({
            source: vectorLayer.getSource(),
            type: 'Circle',
            geometryFunction: ol.interaction.Draw.createRegularPolygon(40)
        });
    } else {
        draw = new ol.interaction.Draw({
            source: vectorLayer.getSource(),
            type: type,
        });
    }

    map.addInteraction(draw);

    // 监听鼠标移动事件
    map.on('pointermove', mouseMove);

    draw.on("drawend", function (event) {
        // map.un("pointermove", mouseMove)
        // doms.popupContainer.style.display = 'none';
        doms.popupContent.innerHTML = "单击放置首个顶点"
    });
    draw.on('drawstart', function (event) {
        console.log('开始绘制');
        // map.on("click", exitDraw);
        doms.popupContent.innerHTML = "单击绘制完成"
    });

    map.on("dbclick", exitDraw);
}

function mouseMove(evt) {
    var pixel = map.getEventPixel(evt.originalEvent);
    //   console.log("🚀 ~ map.on ~ pixel:", pixel)
    var coord = map.getCoordinateFromPixel(pixel)
    if (coord) {
        doms.popupContainer.style.display = 'block';
        doms.popupContainer.style.left = (pixel[0] + 10) + 'px';
        doms.popupContainer.style.top = (pixel[1] + 10) + 'px';
    } else {
        doms.popupContainer.style.display = 'none';
    }
}
/**
 * 编辑修改绘制图形的顶点
 */
function editDraw() {
    var modify = new ol.interaction.Modify({ source: vectorLayer.getSource() });
    map.addInteraction(modify);
}

/**
 * 退出绘制
 */
function exitDraw() {
    if (draw) {
        map.removeInteraction(draw);
        map.un("pointermove", mouseMove)
        doms.popupContainer.style.display = 'none';
    }
}

/**
 * 添加平移和旋转功能的函数
 */
function addTranslateAndRotateInteraction() {
    // 创建一个选择交互操作，用于选择已绘制的图形
    var select = new ol.interaction.Select();

    // 创建一个平移交互操作
    var translate = new ol.interaction.Translate({
        features: select.getFeatures() // 设置要平移的图形
    });

    // // 创建一个旋转交互操作
    // var rotate = new ol.interaction.Rotate({
    //     features: select.getFeatures() // 设置要旋转的图形
    // });

    // 监听选择图形的事件
    select.on('select', function (event) {
        // 选中的图形
        var selectedFeatures = event.selected;
        if (selectedFeatures.length > 0) {
            // 启用平移和旋转交互操作
            map.addInteraction(translate);
            // map.addInteraction(rotate);
        } else {
            // 如果没有选中图形，移除平移和旋转交互操作
            map.removeInteraction(translate);
            // map.removeInteraction(rotate);
        }
    });

    // 添加选择交互操作到地图中
    map.addInteraction(select);
}