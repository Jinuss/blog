const AMAP_URL = 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}';

var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});

const map = new ol.Map({
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                // url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
                url: AMAP_URL,
                wrapX: false
            })
        }),
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
        center: ol.proj.fromLonLat([104.1954, 35.8617]),
        zoom: 10,
        minZoom: 4,
        maxZoom: 18
    }),
});