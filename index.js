let userAgent = navigator.userAgent;
let osType = userAgent.match(/Android|Linux|iPhone|iPad|Mobile|X11|Macintosh|Android|Windows/gi);
let isMobile = osType.includes('Mobile');

var bashurl = 'http://222.21.113.253:3000';
var cdate = formatDate(new Date());
var rygh = '220002'
window.onload = async () => {
    //初始化日历组件
    var duty_title = document.querySelector('.sectiontitle>span');
    const calendar = new rtianCalender()
    calendar.render({
        elem: '#mycalendar',
        // showPublicHoliday: true,
        theme: "blank",
        // date: '2025-12-01',
        width: 280,
        height: 300,
        done: async function (date) {
            //重定义日历事件：切换月份时，获取当前月份的节假日，并渲染到日历
            await renderDuty(date);
        },
        change: async function (date) {
            //重定义日历事件：切换到指定日期
            await init(date)
        }
    });
    //初始化当前日期的值班信息表
    await init(cdate)

    const calendarBtn = document.querySelector('.calendarico');
    const calendarAside = document.querySelector('aside')
    calendarBtn.addEventListener('click', () => {
        calendarAside.classList.toggle('hidden');
    })
    window.addEventListener('resize', () => {
        if (window.innerWidth > 800) {
            calendarAside.classList.remove('hidden');
        } else {
            calendarAside.classList.add('hidden');
        }
    })

    async function init(date) {
        await renderMyDuty(date);//在日历上显示个人值班日
        await renderDuty(date);//生成当日值班
    }
    //自定义事件：点击日期，渲染当日值班表
    async function renderDuty(dt) {
        let d = new Date(dt);
        let day = d.getDay();
        let days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        let dtstr = `${dt}(${days[day]})`;
        duty_title.innerHTML = dtstr;
        const data = await getDayDuty(dt);
        if (data) {
            let dutydata = data.data;
            if (!rtianDuty.doms) {
                //首次渲染，构建页面元素及内容
                rtianDuty.render({
                    elem: '#duty-content',
                    data: dutydata,
                    fixname: true //姓名对齐：两字和三字对齐
                })
                fixLetterSpace();//修复 处级干部和带班校领导 文字对齐
            } else {
                //仅更新人员数据
                rtianDuty.reload(dutydata)
            }
        } else {
            duty_title.innerHTML = '<span style="color:red">获取数据异常！</span>';
        }
    }

    async function renderMyDuty(date) {//在日历上显示个人值班日
        let month = date.slice(0, 7);
        let duty_data = await getMyDuty(rygh, month);
        calendar.renderMaker(duty_data);
    }

    async function getDayDuty(date) {//获取单日值班表
        return new Promise((resolve, reject) => {
            fetch(`${bashurl}/getduty?date=${date}`).then(resp => {
                resolve(resp.json());
            }).catch(err => {
                console.error(`服务器: ${bashurl}`);
                console.error('无法从服务器 getduty 获取数据。');
                resolve(null);
            })
        })
    }
    async function getMyDuty(rygh, month) {
        //获取个人值班日 
        // 根据工号获取当月个人值班日期；数组
        return new Promise(async (resolve, reject) => {
            fetch(`${bashurl}/getmydutydate?rygh=${rygh}&month=${month}`).then(resp => {
                resolve(resp.json());
            }).catch(err => {
                console.error(`服务器: ${bashurl}`);
                console.error('无法从服务器 getmydutydate 获取数据。');

                resolve([]);
            })
        })
    }
    function fixLetterSpace() {//修复文字对齐：4字和5字对齐
        let dom = document.querySelector('.item-0 .level-1.item-1 .key-level-1')
        let value = dom.innerText;
        dom.innerHTML = `<span class="letter1">${value.slice(0, -1)}</span><span>${value.slice(-1)}</span>`
    }

    //值班单位列表
    async function getDept() {
        return new Promise((resolve, reject) => {
            fetch('./duty.json').then(resp => {
                resolve(resp.json());
            }).catch(err => {
                console.error(`服务器: ${bashurl}`);
                console.error('无法从服务器 getdept 获取数据。');
                resolve([]);
            })
        })
    }
    async function renderDept() {
        let data = await getDept();
        let d = data.data
        let list = []
        for (let fzlx in d) {
            for (let dept in d[fzlx]) {
                list.push(dept)
            }
        }
        let deptlist = document.querySelector('#deptlist')
        let html = ''
        for (let i = 0; i < list.length; i++) {
            html += `<li>${list[i]}</li>`
        }
        deptlist.innerHTML = html;
        //--------------
        let dutydata = await getDeptDuty('信息工程学院', '2025-06');
        console.log(dutydata)
        let dutyhtml = rtianDuty.renderDutyhtml(dutydata.data);
        rtianDuty.dom.innerHTML = `<div class="deptduty-content">${dutyhtml}</div>`;
    }
    async function getDeptDuty(dept, ym) {
        return new Promise((resolve, reject) => {
            fetch(`${bashurl}/getduty?date=${ym}&part=${dept}`).then(resp => {
                resolve(resp.json());
            }).catch(err => {
                console.error(`服务器: ${bashurl}`);
                console.error('无法从服务器 getdeptduty 获取数据。');
                resolve([]);
            })
        })
    }



    // renderDept();
}
function formatDate(date) {
    let y, m, d;
    if (typeof date == 'string') {
        [y, m, d] = date.split(/-|\//g);
    } else {
        y = date.getFullYear();
        m = date.getMonth() + 1;
        d = date.getDate();
    }
    return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`
}