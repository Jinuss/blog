const AMAP_URL = 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'; //矢量图

const GOOGLE_URL = 'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}' //影像图

var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});

function getTileLayer(url, visible) {
    return new ol.layer.Tile({
        source: new ol.source.XYZ({
            url: url,
            wrapX: false
        }),
    })
}

const AMAP_LAYER = getTileLayer(AMAP_URL, true)

const GOOGLE_LAYER = getTileLayer(GOOGLE_URL, true)

const map = new ol.Map({
    layers: [
        AMAP_LAYER,
        GOOGLE_LAYER,
        new ol.layer.Vector({
            source: new ol.source.Vector({
                url: './china.json', // 中国边界的 GeoJSON 文件路径
                format: new ol.format.GeoJSON()
            }),
            style: new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'red', // 设置边界描边的颜色
                    width: 2 // 设置边界描边的宽度
                })
            })
        }),
        vectorLayer
    ],
    target: 'map',
    view: new ol.View({
        center: ol.proj.fromLonLat([114.3005, 30.5928]),
        zoom: 10,
        minZoom: 4,
        maxZoom: 18
    }),
});

GOOGLE_LAYER.setVisible(false)