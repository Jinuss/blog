(window.webpackJsonp=window.webpackJsonp||[]).push([[81],{467:function(t,s,a){"use strict";a.r(s);var n=a(4),e=Object(n.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h3",{attrs:{id:"概述"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#概述"}},[t._v("#")]),t._v(" 概述")]),t._v(" "),s("p",[s("code",[t._v("Navigator.clipboard")]),t._v("对象提供了系统剪贴板读写访问能力,用以取代"),s("code",[t._v("document.execCommand()")]),t._v(",后者存在一些问题，如浏览器兼容性不一致、安全性问题和缺乏语义化，W3C 已将其从规范中移除。")]),t._v(" "),s("p",[t._v("所有 Clipboard API 方法都是异步的，并且返回一个"),s("code",[t._v("Promise")]),t._v("对象，在剪贴板访问完成后被兑现；如果剪贴板访问被拒绝，promise 对象会被拒绝。")]),t._v(" "),s("h3",{attrs:{id:"方法"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#方法"}},[t._v("#")]),t._v(" 方法")]),t._v(" "),s("ul",[s("li",[s("p",[s("code",[t._v("read()")]),t._v(" : 从剪贴板读取数据，返回一个 promise 对象，在检索到数据后，promise 将兑现一个"),s("code",[t._v("ClipboardItem")]),t._v("对象的数组来提供剪切板数据")])]),t._v(" "),s("li",[s("p",[s("code",[t._v("readText()")]),t._v(": 从剪贴板读取文本数据，返回一个 promise 对象，在检索到文本后，promise 将兑现一个字符串")])]),t._v(" "),s("li",[s("p",[s("code",[t._v("write()")]),t._v(":写入任意数据到操作系统的剪贴板中，这是一个异步操作")])]),t._v(" "),s("li",[s("p",[s("code",[t._v("writeText()")]),t._v(": 写入文本数据到操作系统的剪贴板中，待文本被完全写入剪贴板后，返回的 promise 将被兑现")])])]),t._v(" "),s("p",[t._v("示例如下：")]),t._v(" "),s("div",{staticClass:"language-js line-numbers-mode"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[t._v("navigator"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("clipboard"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("writeText")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("text"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("then")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    ElMessage"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("success")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"复制文本成功"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("err")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    console"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"🚀 ~ copyText ~ err:"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" err"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])]),t._v(" "),s("div",{staticClass:"line-numbers-wrapper"},[s("span",{staticClass:"line-number"},[t._v("1")]),s("br"),s("span",{staticClass:"line-number"},[t._v("2")]),s("br"),s("span",{staticClass:"line-number"},[t._v("3")]),s("br"),s("span",{staticClass:"line-number"},[t._v("4")]),s("br"),s("span",{staticClass:"line-number"},[t._v("5")]),s("br"),s("span",{staticClass:"line-number"},[t._v("6")]),s("br"),s("span",{staticClass:"line-number"},[t._v("7")]),s("br"),s("span",{staticClass:"line-number"},[t._v("8")]),s("br")])]),s("h3",{attrs:{id:"注意事项"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#注意事项"}},[t._v("#")]),t._v(" 注意事项")]),t._v(" "),s("p",[s("code",[t._v("navigator.clipboard")]),t._v("在 https 协议下才能使用，或者安全域下才能使用。")]),t._v(" "),s("p",[t._v("安全域包括"),s("code",[t._v("https")]),t._v(","),s("code",[t._v("localhost")]),t._v("、"),s("code",[t._v("127.0.0.1")]),t._v("、"),s("code",[t._v("localhost:3000")]),t._v("等。因此在使用前我们需要判断，同时也可以通过"),s("code",[t._v("windows.isSecureContext")]),t._v("属性来判断当前是否为安全域。")])])}),[],!1,null,null,null);s.default=e.exports}}]);