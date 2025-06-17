/**
            * 作者：Rtian
            * 版本：1.0.0
            * 日期：2025-06-06

            */
(function (window, document) {
    "use strict";
    var rtianDuty = {
        fixname: false,//姓名对齐：两字和三字对齐
        render: function (options) {
            let me = this;
            let data = options.data || {};
            ('fixname' in options) && (this.fixname = options.fixname);
            let elem = options.elem;
            this.dom = document.querySelector(elem)
            let html = me.renderDutyModule(data);
            this.dom.innerHTML = html;
            this.dom.scrollTo({ top: 0, behavior: 'smooth' });
            //获取各部门的dom
            this.doms = this.getDeptDom(data.data)
        },
        reload(options) {
            //无需重新生成框架，只需根据人数填充
            let data = options.data;
            let d = data.data;
            for (let p in d) {
                for (let dept in d[p]) {
                    if (Array.isArray(d[p][dept])) {
                        let valuehtml = this.getValueHtml(d[p][dept])
                        this.doms[dept].innerHTML = valuehtml
                    } else {
                        for (let c in d[p][dept]) {
                            let valuehtml = this.getValueHtml(d[p][dept][c])
                            this.doms[dept + c].innerHTML = valuehtml
                        }
                    }

                }
            }
            this.dom.scrollTo({ top: 0, behavior: 'smooth' });
        },
        getValueHtml(values) {
            let valuehtml = ''
            for (let value of values) {
                let [rygh, xm, tel] = value;
                let namespace = (xm.length == 2 && this.fixname) ? 'space' : '';
                valuehtml += `<div class="duty-value" title="工号：${rygh}"><span class="name ${namespace}">${xm}</span><span class="tel">${tel}</span></div>`
            }
            return valuehtml
        },

        getDeptDom(d) {
            let doms = this.dom.querySelectorAll('.duty-values')
            let res = {}
            let i = 0;
            for (let p in d) {
                for (let dept in d[p]) {
                    if (Array.isArray(d[p][dept])) {
                        res[dept] = doms[i]
                        i++
                    } else {
                        for (let c in d[p][dept]) {
                            res[dept + c] = doms[i]
                            i++
                        }
                    }

                }
            }
            return res;
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
                let valuehtml = this.getValueHtml(data)
                let values = `<div class="duty-values">${valuehtml}</div>`
                return values
            }
            for (const key in data) {
                let child = this.renderDutyhtml(data[key], level + 1)
                let keyhtml = `<div class="duty-key"><span class="key-level-${level} ">${key}</span></div>`
                let itemhtml = `<div class="duty-item level-${level} item-${idx++}">${keyhtml}${child}</div>`
                html += itemhtml
            }
            let res = `<div class="duty-items">${html}</div>`
            return res
        },
    };
    window.rtianDuty = rtianDuty;
})(window, window.document);