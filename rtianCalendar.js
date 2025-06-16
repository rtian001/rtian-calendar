/**
            * 作者：Rtian
            * 版本：1.0.0
            * 日期：2025-06-06
            * 功能：日历类
            * 显示公共节假日
            * 设置自定义节假日：如值班日期
            * 自定义点击事件： done(datestr){}
            * 自定义默认日期
            * 使用方法：默认显示当前月份,可以设置 options.date显示指定日期月份
            * let calender = new rtianCalender('#calendar');
            * calender.render();
            * 或：
            * let calender = new rtianCalender();
            * calender.render('#calendar');
            * 或
            * let calender = new rtianCalender();
            * calender.render({
            *      elem: '#calendar',
            *      showPbulicHoliday: true,
            *      done: function(dt){
            *          console.log(dt)
            *      }
            * });
            */
(function (window, document) {
    "use strict";
    class rtianCalender {
        constructor(selector) {
            this.elem = selector;
            this.dom = document.querySelector(selector);
            this.weekstart = 1;
            this.weekstr = ['日', '一', '二', '三', '四', '五', '六', '日'];
        }
        theme = "grid";
        width = 300;
        height = 350;
        showPublicHoliday = false;
        holiday = [];
        today = new Date().toISOString().slice(0, 10);
        date = this.today;
        publicHoliday = {
            '01-01': '元旦',
            '05-01': '劳动节',
            '10-01': '国庆节',
        };

        init() {
            var wkstr = this.weekstr.slice(this.weekstart)
            let th = ''
            for (let i = 0; i < 7; i++) {
                th += `<th class="week"><div>${wkstr[i]}</div></th>`
            }
            th = `<tr class="th">${th}</tr>`
            let day = 1;
            let tr = ''
            for (let i = 0; i < 6; i++) {//行
                let row = ''
                for (let j = 0; j < 7; j++) {//列
                    row += `<td class="day"><div></div></td>`
                }
                tr += `<tr>${row}</tr>`
                if (day > this.totalDay) {
                    break;
                }
            }
            let table = `<table><thead>${th}</thead><tbody>${tr}</tbody></table>`
            let head = '<div class="yearmonth"><div title="上一月" class="prev-month"><</div><div title="返回今日" class="month-year"></div><div title="下一月" class="next-month">></div></div>'
            let html = `<div id="rtian-calendar" theme="${this.theme}">${head}${table}</div>`
            this.dom.innerHTML = html;
            let div = this.dom.querySelector('#rtian-calendar');
            div.style.width = (this.width - 10) + 'px';
            div.style.height = (this.height) + 'px';
            this.days = this.dom.querySelectorAll('.day');
            this.addClickEvent();
        };

        //添加日期的点击事件
        addClickEvent() {
            //日期点击事件
            let days = this.days;
            for (let i = 0; i < days.length; i++) {
                let dom = days[i];
                dom.addEventListener('click', (e) => {
                    if (!dom.matches('.cday')) return;
                    let dt = dom.getAttribute('title');
                    let active = this.dom.querySelector('.active');
                    if (active) {
                        active.classList.remove('active');
                    }
                    dom.classList.add('active')
                    //选中日期时，将日期绑定到done
                    this.done(dt)
                })
            }
            //月份点击事件，返回今日
            let monthYear = this.dom.querySelector('.month-year');
            monthYear.addEventListener('click', (e) => {
                if (this.date == this.today) return;
                //点击返回今日
                this.date = this.today;
                let [y, m, d] = this.today.split('-').map(n => n * 1);
                this.year = y;
                this.month = m;
                this.load(y, m);
                this.change(this.today)
            })
            //上一个月点击事件
            let prevMonth = this.dom.querySelector('.prev-month');
            prevMonth.addEventListener('click', (e) => {
                let y = this.year;
                let m = this.month;
                let d = this.day;
                if (m == 1) {
                    y--;
                    m = 12;
                } else {
                    m--;
                }
                this.year = y;
                this.month = m;
                let datestr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                this.date = datestr;
                this.load(y, m)
                this.change(datestr);
            })
            //下一个月点击事件
            let nextMonth = this.dom.querySelector('.next-month');
            nextMonth.addEventListener('click', (e) => {
                let y = this.year;
                let m = this.month;
                let d = this.day;
                if (m == 12) {
                    y++;
                    m = 1;
                } else {
                    m++;
                }
                this.year = y;
                this.month = m;
                let datestr = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
                this.date = datestr;
                this.load(y, m)
                this.change(datestr);
            })
        };
        //选中日期事件
        done(dt) {
            console.log(dt)
        }
        //切换月份事件
        change(dt) {
            console.log('change', dt)
        }

        renderMaker(holidays) {
            if (!holidays) return;
            if (typeof holidays == 'string') {
                holidays = holidays.indexOf(',') < 0 ? [holidays] : holidays.split(',');
            }
            let days = this.days;
            this.holiday = holidays || this.holiday;
            for (let i = 0; i < days.length; i++) {
                let div = days[i];
                let datestr = div.getAttribute('title');
                if (this.holiday.includes(datestr)) {//设置自定义节假日
                    div.classList.add('holiday');
                }
            }
        }

        //渲染方法
        render(options) {
            if (typeof options == 'string') {
                this.elem = options;
                this.dom = document.querySelector(this.elem) || this.dom;
            }
            if (typeof options == "object") {
                ('elem' in options) && (this.elem = options.elem);
                ('done' in options) && (this.done = options.done);
                ('change' in options) && (this.change = options.change);
                ('date' in options) && (this.date = options.date);
                ('holidays' in options) && (this.holiday = options.holidays);
                ('weekstart' in options) && (this.weekstart = options.weekstart);
                ('showPublicHoliday' in options) && (this.showPublicHoliday = options.showPublicHoliday);
                ('width' in options) && (this.width = options.width);
                ('height' in options) && (this.height = options.height);
                ('theme' in options) && (this.theme = options.theme);
            }
            if (!this.dom) {
                console.error('未设置日历容器ID')
                return
            }
            this.init();
            let [y, m, d] = this.date.split('-').map(n => n * 1)
            this.day = d
            this.date = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
            this.load(y, m);
            return this
        }
        load(year, month) {
            this.year = year;
            this.month = month;
            document.querySelector('.month-year').innerHTML = `${year}年${month}月`
            let y = year, m = month, weekstart = this.weekstart;
            let cdt = new Date(y, m - 1, 1);
            let wk = cdt.getDay();
            let startDay = (wk + 7 - weekstart) % 7;
            let totalDay = new Date(y, m, 0).getDate();
            let upMonthDay = 0;
            if (startDay > 0) {
                upMonthDay = new Date(y, m - 1, 0).getDate() - startDay + 1;
            }
            let nextMonthDay = 1;
            let days = this.days;
            let day = 1;
            for (let i = 0; i < 6; i++) {
                for (let j = 0; j < 7; j++) {
                    let _m = m
                    let _d = day;
                    let idx = i * 7 + j;
                    let div = days[idx];
                    div.className = 'day';
                    if (idx < startDay) {
                        _m = m - 1
                        _d = upMonthDay
                        upMonthDay++;
                    } else if (idx >= startDay + totalDay) {
                        _m = m + 1
                        _d = nextMonthDay;
                        nextMonthDay++;
                    } else {
                        _d = day
                        div.classList.add('cday');
                        day++
                    }
                    div.innerHTML = _d;
                    let datestr = `${y}-${_m.toString().padStart(2, '0')}-${_d.toString().padStart(2, '0')}`;
                    div.setAttribute('title', datestr)
                    //--------------------
                    //设置今日、选中日期、节假日等
                    if (datestr == this.today) {//设置今日
                        div.classList.add('today');
                    }
                    if (datestr == this.date) {//设置当前日期
                        div.classList.add('active');
                    }
                    if (this.showPublicHoliday) {//设置预设公共节假日
                        let md = datestr.slice(5);
                        if (this.publicHoliday[md]) {
                            div.innerHTML += `<span class="day-h">${this.publicHoliday[md]}</span>`
                        }
                    }
                    //============================
                }
            }
            return this
        }
    }
    window.rtianCalender = rtianCalender;
})(window, window.document);