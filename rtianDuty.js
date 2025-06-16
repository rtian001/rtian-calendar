/**
            * 作者：Rtian
            * 版本：1.0.0
            * 日期：2025-06-06

            */
(function (window, document) {
    "use strict";
    var rtianDuty = {
        render: function (options) {
            let me = this;
            let data = options.data || {};
            let dom = options.dom || {};
            let html = me.renderDutyModule(data);
            document.querySelector(options.elem).innerHTML = html;
        },

        renderDutyModule: function (data) {
            let me = this;
            let d = data.data;
            let html = me.renderDutyhtml(d);
            return html;

        },

        renderDutyhtml: function (data, level = 0) {
            let idx = 0
            let html = ''
            if (Array.isArray(data)) {
                let valuehtml = ''
                for (const value of data) {
                    let { rygh, xm, tel } = value;
                    let spaceclass = xm.length == 2 ? 'space' : '';
                    valuehtml += `<div class="duty-value"><span class="name ${spaceclass}">${xm}</span><span class="tel">${tel.trim()}</span></div>`
                }
                let values = `<div class="duty-values">${valuehtml}</div>`
                return { isemputy: valuehtml.length == 0, value: values }
            }
            for (const key in data) {
                let isflex = '', childhtml = '', ishidden = '';
                let child = this.renderDutyhtml(data[key], level + 1)
                if (typeof child == 'object') {
                    let { isemputy, value } = child;
                    isflex = 'flex';
                    ishidden = (isemputy && level == 2) ? 'hidden' : '';
                    childhtml = value;
                } else {
                    childhtml = child
                }
                let keyhtml = `<div class="duty-key"><span class="key-level-${level}">${key.trim()}</span></div>`
                let itemhtml = `<div class="duty-item level-${level} item-${idx++} ${isflex} ${ishidden}">${keyhtml}${childhtml}</div>`
                html += itemhtml
            }
            let res = `<div class="duty-items">${html}</div>`
            return res
        },
    };
    window.rtianDuty = rtianDuty;
})(window, window.document);