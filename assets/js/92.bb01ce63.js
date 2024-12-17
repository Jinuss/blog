(window.webpackJsonp=window.webpackJsonp||[]).push([[92],{490:function(t,s,a){"use strict";a.r(s);var v=a(4),_=Object(v.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h3",{attrs:{id:"概述"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#概述"}},[t._v("#")]),t._v(" 概述")]),t._v(" "),s("p",[t._v("Openlayers 地图默认"),s("strong",[t._v("9")]),t._v("种默认的交互功能，如键盘方向键控制地图移动方向和偏移大小，还有鼠标配合键盘按键地图缩放旋转等，这些功能也可以通过配置选项进行禁用。")]),t._v(" "),s("h3",{attrs:{id:"功能"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#功能"}},[t._v("#")]),t._v(" 功能")]),t._v(" "),s("p",[t._v("Openlayers 默认的交互功能可以在"),s("code",[t._v("ol/interaction/default")]),t._v("中进行配置，其用法如下：")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" Map "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"ol/Map"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("import")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" defaults "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("from")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"ol/interaction"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" DefaultsOptions "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" map "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Map")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("/*..其它选项配置..*/")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token literal-property property"}},[t._v("interactions")]),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("defaults")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("DefaultsOptions"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br")])]),s("p",[t._v("如果上述"),s("code",[t._v("defaults()")]),t._v("没有传参，"),s("code",[t._v("DefaultsOptions")]),t._v("在 Openlayers 中默认就会视作一个空对象"),s("code",[t._v("{}")]),t._v(",如此 Openlayers 将通过三元运算判断，采用默认行为。")]),t._v(" "),s("h3",{attrs:{id:"defaultsoptions-选项参数"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#defaultsoptions-选项参数"}},[t._v("#")]),t._v(" "),s("code",[t._v("DefaultsOptions")]),t._v(" 选项参数")]),t._v(" "),s("p",[t._v("对应"),s("strong",[t._v("9")]),t._v("种交互行为，"),s("code",[t._v("DefaultsOptions")]),t._v("有"),s("strong",[t._v("11")]),t._v("种属性，如下表：")]),t._v(" "),s("table",[s("thead",[s("tr",[s("th",[t._v("属性")]),t._v(" "),s("th",[t._v("类型以及默认值")]),t._v(" "),s("th",[t._v("描述")]),t._v(" "),s("th",[s("code",[t._v("interaction")]),t._v("类")]),t._v(" "),s("th",[t._v("文章地址")])])]),t._v(" "),s("tbody",[s("tr",[s("td",[s("code",[t._v("altShiftDragRotate")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("true")])]),t._v(" "),s("td",[t._v("是否启用"),s("code",[t._v("Alt+Shift")]),t._v("拖拽地图进行旋转")]),t._v(" "),s("td",[s("code",[t._v("DragRotate()")])]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("onFocusOnly")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("false")])]),t._v(" "),s("td",[t._v("仅参数，仅当地图具有焦点时才进行交互,对"),s("code",[t._v("DragPan")]),t._v("和"),s("code",[t._v("MouseWheelZoom")]),t._v("类交互有影响是它们的参数之一")]),t._v(" "),s("td",[t._v("无")]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("doubleClickZoom")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("true")])]),t._v(" "),s("td",[t._v("是否启用双击地图缩放")]),t._v(" "),s("td",[s("code",[t._v("DoubleClickZoom({delta: zoomDelta,duration: zoomDuration})")])]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("keyboard")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("true")])]),t._v(" "),s("td",[t._v("是否启用键盘控制，方向键和"),s("code",[t._v("+")]),t._v("/"),s("code",[t._v("-")]),t._v("按键")]),t._v(" "),s("td",[s("code",[t._v("KeyboardPan")]),t._v(" 和"),s("code",[t._v("KeyboardZoom({delta:zoomDelta,zoomDuration})")])]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("mouseWheelZoom")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("true")])]),t._v(" "),s("td",[t._v("是否启用鼠标滚轮缩放")]),t._v(" "),s("td",[s("code",[t._v("MouseWheelZoom({onFocusOnly:onFocusOnly,duration:zoomDuration,})")])]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("shiftDragZoom")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("true")])]),t._v(" "),s("td",[t._v("是否启用"),s("code",[t._v("Shift")]),t._v("缩放地图")]),t._v(" "),s("td",[s("code",[t._v("DragZoom({duration: zoomDuration})")])]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("dragPan")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("true")])]),t._v(" "),s("td",[t._v("是否可以拖动地图")]),t._v(" "),s("td",[s("code",[t._v("DragPan({onFocusOnly: options.onFocusOnly,kinetic: kinetic,}")])]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("pinchRotate")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("true")])]),t._v(" "),s("td",[t._v("用于触摸设备，是否启用手指控制地图旋转")]),t._v(" "),s("td",[s("code",[t._v("PinchRotate()")])]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("pinchZoom")])]),t._v(" "),s("td",[t._v("布尔值:"),s("code",[t._v("true")])]),t._v(" "),s("td",[t._v("用于触摸设备，是否启用手指控制地图缩放")]),t._v(" "),s("td",[s("code",[t._v("PinchZoom({duration:zoomDuration,})")])]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("zoomDelta")])]),t._v(" "),s("td",[t._v("数值或者"),s("code",[t._v("undefined")])]),t._v(" "),s("td",[t._v("仅参数，缩放地图时的增量")]),t._v(" "),s("td",[t._v("无")]),t._v(" "),s("td")]),t._v(" "),s("tr",[s("td",[s("code",[t._v("zoomDuration")])]),t._v(" "),s("td",[t._v("数值或者"),s("code",[t._v("undefined")])]),t._v(" "),s("td",[t._v("仅参数，缩放地图动画的持续时长 单位毫秒")]),t._v(" "),s("td",[t._v("无")]),t._v(" "),s("td")])])]),t._v(" "),s("h3",{attrs:{id:"总结"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#总结"}},[t._v("#")]),t._v(" 总结")]),t._v(" "),s("p",[t._v("Openlayers 中默认的地图交互行为总共有"),s("strong",[t._v("9")]),t._v("种，主要分为两类：非触摸设备交互"),s("strong",[t._v("7")]),t._v("种和触摸设备"),s("strong",[t._v("2")]),t._v("种，涉及的交互行为就是鼠标和键盘的操作控制地图的旋转角度和缩放。")])])}),[],!1,null,null,null);s.default=_.exports}}]);