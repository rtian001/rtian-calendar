"use strict";
var rLunar = {
    solar2lunar,
    lunar2solar,
    yueli,
    lunarInfo: {}
};
//=============日历部分：公历、农历、闰月、天干地支、星座
var
    Gan = "甲乙丙丁戊己庚辛壬癸",
    Zhi = "子丑寅卯辰巳午未申酉戌亥",
    CnZodiac = "鼠牛虎兔龙蛇马羊猴鸡狗猪",
    SolarTerms = "小寒,大寒,立春,雨水,惊蛰,春分,清明,谷雨,立夏,小满,芒种,夏至,小暑,大暑,立秋,处暑,白露,秋分,寒露,霜降,立冬,小雪,大雪,冬至".split(','),
    nStr1 = "日一二三四五六七八九〇",
    nStr2 = "初十廿卅",
    nStr3 = "正二三四五六七八九十冬腊",
    nStr4 = ["初十", "二十", "三十"],
    nStr5 = "魔羯,水瓶,双鱼,白羊,金牛,双子,巨蟹,狮子,处女,天秤,天蝎,射手,魔羯".split(',');

//============================================
// 获取年节气表
function getYearJQ(y) {
    let jqb = [];
    for(let i = -7;i < 24;i++) {
        let _jq = getJQ(y, i);
        jqb.push(_jq);
    }
    return jqb;
}
// 获取年合朔表
function getYearHS(y) {
    let jqb = getYearJQ(y);
    let hsb0 = [];
    let hsb1 = {};
    let _y = y - 1;
    let _m = 10;
    let res = [];
    //购置月份
    let mtotal = 0;
    for(let i = 0;i < jqb.length;i++) {
        let _hs = getHS(y, jqb[i]);
        let _jd = Round(_hs);
        if(!hsb0.includes(_jd)) {
            hsb0.push(_jd);
            hsb1[_jd] = [jqb[i]];
            if(_jd >= Round(jqb[1]) && _jd <= Round(jqb[25])) {
                mtotal++;
            }
        } else {
            hsb1[_jd].push(jqb[i]);
        }
    }
    console.log(Round(jqb[1]), JD2GL(jqb[1]))
    console.log(Round(jqb[25]), JD2GL(jqb[25]))
    console.log(mtotal)
    //无中气置闰
    for(let i = 0;i < hsb0.length - 1;i++) {
        let _jd = hsb0[i];
        let jq = hsb1[_jd];
        let isleap = false;
        let dn = hsb0[i + 1] - _jd;
        if(jq.length == 1 && jqb.indexOf(jq[0]) % 2 == 0) {
            isleap = true;
        } else {
            _m++;
            if(_m > 12) _m = 1, _y++;
        }
        if(_y == y || 1 == 1) {
            let ym = `${_y}-${_m}`;
            res.push({ ym: ym, hs: _jd, jq: jq, isleap: isleap, dn: dn });
        }
    }
    return res;
}
// 初始化主函数年节气表和年合朔表
function getLunarInfo(y) {
    if(!rLunar.lunarInfo['lunar-' + y]) {
        rLunar.lunarInfo['lunar-' + y] = {
            'JQB': getYearJQ(y),
            'HSB': getYearHS(y)
        };
    }
    return rLunar.lunarInfo['lunar-' + y];
}
//---------------------
function solar2lunar(y, m, d) {
    let data = getLunarInfo(y);
    let hsb = data['HSB'];
    let jd = Round(JD(y, m, d));
    let idx = hsb.findIndex(n => n.hs > jd);
    let hs = hsb[idx - 1];
    let [ly, lm] = hs.ym.split('-').map(n => n * 1);
    let ld = jd - hs.hs + 1;
    let dn = hs.dn;
    let isleap = hs.isleap;
    let obj = { year: y, month: m, day: d, lyear: ly, lmonth: lm, lday: ld, ldn: dn, isleap };
    return getDayinfo(obj);
}
function lunar2solar(ly, lm, ld, isleap = false) {
    let data = getLunarInfo(ly);
    let hsb = data['HSB'];
    let ym = ly + '-' + lm;
    let hs = hsb.find(v => v.ym == ym && v.isleap == isleap).hs;
    let { Y, M, D } = JD2GL(hs + ld - 1);
    return solar2lunar(Y, M, D);
}
function getDayinfo(dayobj) {
    let { year, month, day, lyear, lmonth, lday, isleap } = dayobj;
    let jd = Round(JD(year, month, day));
    dayobj.lyearCn = toChinaYear(lyear);
    dayobj.lmonthCn = isleap ? '闰' + toChinaMonth(lmonth) : toChinaMonth(lmonth);
    dayobj.ldayCn = toChinaDay(lday);
    dayobj.lyearGz = toGanZhiYear(lyear);
    dayobj.lmonthGz = toGanZhiMonth(jd);
    dayobj.ldayGz = toGanZhiDay(jd);
    dayobj.jq = toSolarTerm(jd);
    dayobj.sx = getCnZodiac(lyear);
    dayobj.xz = getZodiac(month, day);
    dayobj.week = getWeek(jd);
    dayobj.weekcn = '星期' + nStr1[getWeek(jd)];
    return dayobj;
}

function yueli(y, m) {
    let jd = Round(JD(y, m, 1));
    let dn = Round(JD(y, m + 1, 1)) - jd;
    let { lyear, lmonth, lday, ldn, isleap } = solar2lunar(y, m, 1);
    // let [ly,lm,ld,ldn,isLeap]=[lyear,lmonth,lday,ldn,isleap];
    let res = [];
    for(let i = 0;i < dn;i++) {
        let obj = {};
        let jd0 = jd + i;
        let { Y, M, D } = JD2GL(jd0);
        if(lday > ldn) {
            let _lunar = solar2lunar(y, m, D);
            lyear = _lunar.lyear;
            lmonth = _lunar.lmonth;
            lday = _lunar.lday;
            ldn = _lunar.ldn;
            isleap = _lunar.isleap;
        }
        obj = {
            year: Y, month: M, day: D,
            lyear: lyear, lmonth: lmonth, lday: lday,
            ldn: ldn,
            isleap: isleap,
        };
        res.push(getDayinfo(obj));
        lday++;
    }
    return res;
}

function toChinaYear(y) {
    var cyear = y.toString().split("").map(function (n) {
        return nStr1[n == 0 ? 10 : n];
    }).join("");
    return cyear + "\u5e74";
}
function toChinaMonth(m) {
    return nStr3[m - 1] + "\u6708";
}
function toChinaDay(d) {
    if(d % 10 == 0) {
        return nStr4[d / 10 - 1];
    } else {
        let n1 = d % 10,
            n2 = int2(d / 10);
        return nStr2[n2] + nStr1[n1];
    }
}
function toGanZhiYear(lYear) {
    return toGanZhi(lYear - 4);
}
function toGanZhiMonth(jd) {
    let y = JD2GL(jd)['Y'];
    let JZ = Round(JD(1998, 12, 7));//以1998年12月7日大雪甲子进行推算
    let data = getLunarInfo(y);
    let jqb = data['JQB'].map(n => Round(n));
    let jq0 = jqb[1];
    let offset = int2((jd - jq0) / 30.43685);
    let jq1 = jqb[2 * offset + 2];
    if(offset < 12 && jd >= jq1) offset += 1;
    let _offset = offset + int2((jqb[13] - JZ) / 365.2422) * 12 + 900000;
    let gzM = toGanZhi(_offset);
    return gzM;
}
function toGanZhiDay(jd) {
    var d = jd - Round(JD(2000, 1, 7)) + 900000;
    return toGanZhi(d);
}
function toGanZhi(offset) {
    return (Gan[(offset + 12000000) % 10] + Zhi[(offset + 12000000) % 12]);
}
function toSolarTerm(jd) {
    let y = JD2GL(jd)['Y'];
    let data = getLunarInfo(y);
    let jqb0 = data['JQB'];
    let jqb = jqb0.map(n => Round(n));
    let idx = jqb.indexOf(Round(jd));
    if(idx > -1) {
        // let { h, m, s } = JD2GL(jqb0[idx]);
        // return { jqmc: SolarTerms[(idx + 22) % 24], jqsj: `${h}:${m}:${s}` };
        return SolarTerms[(idx + 22) % 24];
    }
    return null;
}
function getCnZodiac(y) {
    return CnZodiac[(y - 4) % 12];
}
function getZodiac(m, d) {
    let arr = [20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
    if(d < arr[m - 1]) m--;
    return nStr5[(m + 12) % 12] + "\u5ea7";
}
//----------------------------------------------------------------
// 以下天文历法数据及函数，尽量不要动
//=======天文历法==================================================
var pai = Math.PI;
var rad = 180 / Math.PI;
var E_L0, E_L1, E_L2, E_L3, E_L4, E_L5;
var E_B0, E_B1, E_B2;
var E_R0, E_R1, E_R2, E_R3, E_R4, E_R5;
var nutB, F, t2, t3, t4, t5, v, jd0, E, dL, dE, stDegree, stDegreep, y, dt, W, p, W2;
function int2(v) { return Math.floor(v); }
function sin(v) { return Math.sin(v); }
function cos(v) { return Math.cos(v); }
function abs(v) { return Math.abs(v); }
function Round(v) { return Math.round(v); }

//地球黄经数据，最大误差0.25", v=6283 单位弧度/世纪
function csh_a() {
    E_L0 = new Array(33416565, 4.6692568, 6283.07584999, 348943, 4.626102, 12566.1517, 34971, 2.74412, 5753.38488, 34176,
        2.82887, 3.52312, 31359, 3.62767, 77713.77147, 26762, 4.41808, 7860.41939, 23427, 6.13516, 3930.2097, 13243, 0.74246,
        11506.76977, 12732, 2.0371, 529.69097, 11992, 1.10963, 1577.34354, 9903, 5.2327, 5884.9268, 9019, 2.0451, 26.2983,
        8572, 3.5085, 398.149, 7798, 1.1788, 5223.6939, 7531, 2.5334, 5507.5532, 5053, 4.5829, 18849.2275, 4924, 4.2051,
        775.5226, 3567, 2.9195, 0.0673, 3171, 5.849, 11790.6291, 2841, 1.8987, 796.298, 2710, 0.3149, 10977.0788, 2428,
        0.3448, 5486.7778, 2062, 4.8065, 2544.3144, 2054, 1.8695, 5573.1428, 2023, 2.4577, 6069.7768, 1555, 0.8331, 213.2991,
        1322, 3.4112, 2942.4634, 1262, 1.083, 20.7754, 1151, 0.6454, 0.9803, 1029, 0.636, 4694.003, 1019, 0.9757, 15720.8388,
        1017, 4.2668, 7.1135, 992, 6.21, 2146.165, 976, 0.681, 155.42, 858, 5.983, 161000.686, 851, 1.299, 6275.962, 847,
        3.671, 71430.696, 796, 1.808, 17260.155, 788, 3.037, 12036.461, 747, 1.755, 5088.629, 739, 3.503, 3154.687, 735,
        4.679, 801.821, 696, 0.833, 9437.763, 624, 3.978, 8827.39, 611, 1.818, 7084.897, 570, 2.784, 6286.599, 561, 4.387,
        14143.495, 556, 3.47, 6279.553, 520, 0.189, 12139.554, 516, 1.333, 1748.016, 511, 0.283, 5856.478, 490, 0.487,
        1194.447, 410, 5.368, 8429.241, 409, 2.399, 19651.048, 392, 6.168, 10447.388, 368, 6.041, 10213.286, 366, 2.57,
        1059.382, 360, 1.709, 2352.866, 356, 1.776, 6812.767, 333, 0.593, 17789.846, 304, 0.443, 83996.847, 300, 2.74,
        1349.867, 254, 3.165, 4690.48, 247, 0.215, 3.59, 237, 0.485, 8031.092, 236, 2.065, 3340.612, 228, 5.222, 4705.732,
        219, 5.556, 553.569, 214, 1.426, 16730.464, 211, 4.148, 951.718, 203, 0.371, 283.859, 199, 5.222, 12168.003, 199,
        5.775, 6309.374, 191, 3.822, 23581.258, 189, 5.386, 149854.4, 179, 2.215, 13367.973, 175, 4.561, 135.065, 162, 5.988,
        11769.854, 151, 4.196, 6256.778, 144, 4.193, 242.729, 143, 3.724, 38.028, 140, 4.401, 6681.225, 136, 1.889, 7632.943,
        125, 1.131, 5.523, 121, 2.622, 955.6, 120, 1.004, 632.784, 113, 0.177, 4164.312, 108, 0.327, 103.093, 105, 0.939,
        11926.254, 105, 5.359, 1592.596, 103, 6.2, 6438.496, 100, 6.029, 5746.271, 98, 1, 11371.7, 98, 5.24, 27511.47, 94,
        2.62, 5760.5, 92, 0.48, 522.58, 92, 4.57, 4292.33, 90, 5.34, 6386.17, 86, 4.17, 7058.6, 84, 3.3, 7234.79, 84, 4.54,
        25132.3, 81, 6.11, 4732.03, 81, 6.27, 426.6, 80, 5.82, 28.45, 79, 1, 5643.18, 78, 2.96, 23013.54, 77, 3.12, 7238.68,
        76, 3.97, 11499.66, 73, 4.39, 316.39, 73, 0.61, 11513.88, 72, 4, 74.78, 71, 0.32, 263.08, 68, 5.91, 90955.55, 66,
        3.66, 17298.18, 65, 5.79, 18073.7, 63, 4.72, 6836.65, 62, 1.46, 233141.31, 61, 1.07, 19804.83, 60, 3.32, 6283.01, 60,
        2.88, 6283.14, 55, 2.45, 12352.85);
    E_L1 = new Array(2060589, 2.6782346, 6283.07585, 43034, 2.63513, 12566.1517, 4253, 1.5905, 3.5231, 1193, 5.7956,
        26.2983, 1090, 2.9662, 1577.3435, 935, 2.592, 18849.228, 721, 1.138, 529.691, 678, 1.875, 398.149, 673, 4.409,
        5507.553, 590, 2.888, 5223.694, 560, 2.175, 155.42, 454, 0.398, 796.298, 364, 0.466, 775.523, 290, 2.647, 7.114, 208,
        5.341, 0.98, 191, 1.846, 5486.778, 185, 4.969, 213.299, 173, 2.991, 6275.962, 162, 0.032, 2544.314, 158, 1.43,
        2146.165, 146, 1.205, 10977.079, 125, 2.834, 1748.016, 119, 3.258, 5088.629, 118, 5.274, 1194.447, 115, 2.075,
        4694.003, 106, 0.766, 553.569, 100, 1.303, 6286.599, 97, 4.24, 1349.87, 95, 2.7, 242.73, 86, 5.64, 951.72, 76, 5.3,
        2352.87, 64, 2.65, 9437.76, 61, 4.67, 4690.48, 58, 1.77, 1059.38, 53, 0.91, 3154.69, 52, 5.66, 71430.7, 52, 1.85,
        801.82, 50, 1.42, 6438.5, 43, 0.24, 6812.77, 43, 0.77, 10447.39, 41, 5.24, 7084.9, 37, 2, 8031.09, 36, 2.43, 14143.5,
        35, 4.8, 6279.55, 34, 0.89, 12036.46, 34, 3.86, 1592.6, 33, 3.4, 7632.94, 32, 0.62, 8429.24, 32, 3.19, 4705.73, 30,
        6.07, 4292.33, 30, 1.43, 5746.27, 29, 2.32, 20.36, 27, 0.93, 5760.5, 27, 4.8, 7234.79, 25, 6.22, 6836.65, 23, 5,
        17789.85, 23, 5.67, 11499.66, 21, 5.2, 11513.88, 21, 3.96, 10213.29, 21, 2.27, 522.58, 21, 2.22, 5856.48, 21, 2.55,
        25132.3, 20, 0.91, 6256.78, 19, 0.53, 3340.61, 19, 4.74, 83996.85, 18, 1.47, 4164.31, 18, 3.02, 5.52, 18, 3.03,
        5753.38, 16, 4.64, 3.29, 16, 6.12, 5216.58, 16, 3.08, 6681.22, 15, 4.2, 13367.97, 14, 1.19, 3894.18, 14, 3.09,
        135.07, 14, 4.25, 426.6, 13, 5.77, 6040.35, 13, 3.09, 5643.18, 13, 2.09, 6290.19, 13, 3.08, 11926.25, 12, 3.45,
        536.8);
    E_L2 = new Array(87198, 1.0721, 6283.07585, 3091, 0.8673, 12566.1517, 273, 0.053, 3.523, 163, 5.188, 26.298, 158,
        3.685, 155.42, 95, 0.76, 18849.23, 89, 2.06, 77713.77, 70, 0.83, 775.52, 51, 4.66, 1577.34, 41, 1.03, 7.11, 38, 3.44,
        5573.14, 35, 5.14, 796.3, 32, 6.05, 5507.55, 30, 1.19, 242.73, 29, 6.12, 529.69, 27, 0.31, 398.15, 25, 2.28, 553.57,
        24, 4.38, 5223.69, 21, 3.75, 0.98, 17, 0.9, 951.72, 15, 5.76, 1349.87, 14, 4.36, 1748.02, 13, 3.72, 1194.45, 13,
        2.95, 6438.5, 12, 2.97, 2146.17, 11, 1.27, 161000.69, 10, 0.6, 3154.69, 10, 5.99, 6286.6, 9, 4.8, 5088.63, 9, 5.23,
        7084.9, 8, 3.31, 213.3, 8, 3.42, 5486.78, 7, 6.19, 4690.48, 7, 3.43, 4694, 6, 1.6, 2544.31, 6, 1.98, 801.82, 6, 2.48,
        10977.08, 5, 1.44, 6836.65, 5, 2.34, 1592.6, 5, 1.31, 4292.33, 5, 3.81, 149854.4, 4, 0.04, 7234.79, 4, 4.94, 7632.94,
        4, 1.57, 71430.7, 4, 3.17, 6309.37, 3, 0.99, 6040.35, 3, 0.67, 1059.38, 3, 3.18, 2352.87, 3, 3.55, 8031.09, 3, 1.92,
        10447.39, 3, 2.52, 6127.66, 3, 4.42, 9437.76, 3, 2.71, 3894.18, 3, 0.67, 25132.3, 3, 5.27, 6812.77, 3, 0.55, 6279.55
    );
    E_L3 = new Array(2892, 5.8438, 6283.0758, 168, 5.488, 12566.152, 30, 5.2, 155.42, 13, 4.72, 3.52, 7, 5.3, 18849.23, 6,
        5.97, 242.73, 4, 3.79, 553.57, 1, 4.3, 6286.6, 1, 0.91, 6127.66);
    E_L4 = new Array(77, 4.13, 6283.08, 8, 3.84, 12566.15, 4, 0.42, 155.42);
    E_L5 = new Array(2, 2.77, 6283.08, 1, 2.01, 155.42);
}

function csh_b() {
    E_B0 = new Array(2796, 3.1987, 84334.6616, 1016, 5.4225, 5507.5532, 804, 3.88, 5223.694, 438, 3.704, 2352.866, 319, 4,
        1577.344, 227, 3.985, 1047.747);
    E_B1 = new Array(90, 3.9, 5507.55, 62, 1.73, 5223.69);
    E_B2 = new Array(17, 1.63, 84334.66);
}

function csh_c() {
    E_R0 = new Array(1000139888, 0, 0, 16706996, 3.09846351, 6283.07584999, 139560, 3.055246, 12566.1517, 30837, 5.19847,
        77713.77147, 16285, 1.17388, 5753.38488, 15756, 2.84685, 7860.41939, 9248, 5.4529, 11506.7698, 5424, 4.5641,
        3930.2097, 4721, 3.661, 5884.9268, 3460, 0.9637, 5507.5532, 3288, 5.8998, 5223.6939, 3068, 0.2987, 5573.1428, 2432,
        4.2735, 11790.6291, 2118, 5.8471, 1577.3435, 1858, 5.0219, 10977.0788, 1748, 3.0119, 18849.2275);
    E_R1 = new Array(1030186, 1.1074897, 6283.07585, 17212, 1.06442, 12566.1517, 7022, 3.1416, 0);
    E_R2 = new Array(43594, 5.78455, 6283.07585, 1236, 5.5793, 12566.1517, 123, 3.142, 0, 88, 3.63, 77713.77);
    E_R3 = new Array(1446, 4.2732, 6283.0758, 67, 3.92, 12566.15);
    E_R4 = new Array(39, 2.56, 6283.08, 3, 2.27, 12566.15);
    E_R5 = new Array(1, 1.22, 6283.08);
}

function csh_d() {
    nutB = new Array(2.1824, -33.75705, 0.000036, -1720, 920, 3.5069, 1256.66393, 0.000011, -132, 57, 1.3375, 16799.4182,
        -0.000051, -23, 10, 4.3649, -67.5141, 0.000072, 21, -9, 0.04, -628.302, 0, -14, 0, 2.36, 8328.691, 0, 7, 0, 3.46,
        1884.966, 0, -5, 2, 5.44, 16833.175, 0, -4, 2, 3.69, 25128.11, 0, -3, 0, 3.55, 628.362, 0, 2, 0);
}
// 第一部分 
function earth_t(W) {//已知黄经求时间
    var t1, t2, v1, v2;
    v1 = 6283.319653318;
    t1 = (W - 1.75347) / v1;
    v2 = earthV(t1); //v的精度0.03%，详见原文
    t2 = t1 + (W - earthLon(t1, 10)) / v2;
    return t2 + (W - earthLon(t2, -1)) / v2;
}

function earthV(t) {//地球速度,t是千年数,误差小于万分3
    F = 6283.07585 * t;
    var earthV1 = 6283.32 + 210 * sin(1.527 + F) + 4.4 * sin(1.48 + F * 2) + 12.9 * sin(5.82 + F) * t +
        0.55 * sin(4.21 + F) * t * t;
    return earthV1;
}
function earthLon(t, n) { //地球经度计算,返回Date分点黄经,传入千年数
    csh_a();
    t2 = t * t;
    t3 = t2 * t;
    t4 = t3 * t;
    t5 = t4 * t;
    if(n < 0) {
        n = 1;
    } else {
        n = 3 * n / E_L0.length;
    }
    v = 1753469512 + 6283319653318 * t + 529674 * t2 + 432 * t3 - 1157 * t4 - 9 * t5; //'地球平黄经(已拟合DE406)
    v = v + 630 * cos(6 + 3 * t); //拟合DE406
    v = v + Enn(E_L0, t, n);
    v = v + Enn(E_L1, t, n) * t;
    v = v + Enn(E_L2, t, n) * t2;
    v = v + Enn(E_L3, t, n) * t3;
    v = v + Enn(E_L4, t, n) * t4;
    v = v + Enn(E_L5, t, n) * t5;
    return v / 1000000000;
}

function Enn(F, t, n) { //计算E_L0或E_L1或E_L2等
    var n1, v1, i;
    v1 = 0;
    n1 = int2(n * F.length + 0.5);
    for(var i = 0;i < n1;i = i + 3) { //按百分比取项数
        v1 = v1 + F[i] * cos(F[i + 1] + t * F[i + 2]);
    }
    return v1;
}
//第二部分
function nutation(t) { //章动计算
    csh_d();
    t2 = t * t;
    var i, c, a;
    dL = 0;
    for(var i = 0;i < nutB.length;i = i + 5) {
        c = nutB[i] + nutB[i + 1] * t + nutB[i + 2] * t2;
        if(i == 0) {
            a = -1.742 * t;
        } else {
            a = 0;
        }
        dL = dL + (nutB[i + 3] + a) * sin(c);
    }
    dL = dL / 100; //黄经章动
    return dL;
}

function gxc_sun(t, L) { //太阳光行差(黄经),L为太阳黄经,t是千年数
    v = L - (282.93735 + 17.1946 * t + 0.046 * t * t) / 180 * pai; //真近点角
    E = 0.016708634 - 0.00042037 * t - 0.00001267 * t * t;
    return -20.49552 * (1 + E * cos(v));
}

function earthCoor(t, re, n) { //'返回地球坐标
    csh_b();
    csh_c();
    t2 = t * t;
    t3 = t2 * t;
    t4 = t3 * t;
    t5 = t4 * t;
    re[0] = earthLon(t, n);
    re[1] = Enn(E_B0, t, 1) + Enn(E_B1, t, 1) * t + Enn(E_B2, t, 1) * t2;
    re[1] = re[1] / 1000000000;
    re[2] = Enn(E_R0, t, 1) + Enn(E_R1, t, 1) * t + Enn(E_R2, t, 1) * t2 + Enn(E_R3, t, 1) * t3 + Enn(E_R4, t, 1) * t4 +
        Enn(E_R5, t, 1) * t5;
    re[2] = re[2] / 1000000000;
}
function earth_L(jde) {
    var z = new Array(3);
    var testT = (jde - 2451545) / 365250; //'儒略千年数
    earthCoor(testT, z, -1); //'地球黄经
    z[0] = z[0] + pai;
    var gx = gxc_sun(testT, z[0]); //'太阳光行差
    var nu = nutation(testT * 10); //'章动计算
    var earth_0 = z[0] + (nu * 1 + gx * 1) / (rad * 3600); //'补章动与光行差
    return earth_0;
}

// 以下是月球黄经周期项及泊松项,精度3角秒,平均误差0.5角秒
//各坐标均是余弦项,各列单位:角秒,1,1,1e-4,1e-8,1e-8
var M_L0, M_L1, M_L2;
function csh_e() {
    M_L0 = new Array(22639.59, 0.784758, 8328.6914246, 1.52292, 25.07, -0.1236, 4586.44, 0.1874, 7214.0628654, -2.1848, -
        18.86, 0.083, 2369.91, 2.54295, 15542.75429, -0.6618, 6.2, -0.041, 769.03, 3.1403, 16657.382849, 3.046, 50.1, -0.25,
        666.42, 1.5277, 628.301955, -0.027, 0.1, -0.01, 411.6, 4.8266, 16866.932315, -1.28, -1.1, -0.01, 211.66, 4.115, -
    1114.62856, -3.708, -44, 0.21, 205.44, 0.2305, 6585.76091, -2.158, -19, 0.09, 191.96, 4.8985, 23871.44571, 0.861, 31,
        -0.16, 164.73, 2.5861, 14914.45233, -0.635, 6, -0.04, 147.32, 5.4553, -7700.38947, -1.55, -25, 0.12, 124.99, 0.4861,
        7771.37714, -0.331, 3, -0.02, 109.38, 3.8832, 8956.99338, 1.496, 25, -0.1, 55.18, 5.57, -1324.17803, 0.62, 7, 0,
        45.1, 0.899, 25195.62374, 0.24, 24, -0.1, 39.53, 3.812, -8538.24089, 2.8, 26, -0.1, 38.43, 4.301, 22756.81716, -2.85,
        -13, 0, 36.12, 5.496, 24986.07427, 4.57, 75, -0.4, 30.77, 1.946, 14428.1257, -4.37, -38, 0.2, 28.4, 3.286, 7842.3648,
        -2.21, -19, 0.1, 24.36, 5.641, 16171.0562, -0.69, 6, 0, 18.58, 4.414, -557.3143, -1.85, -22, 0.1, 17.95, 3.585,
        8399.6791, -0.36, 3, 0, 14.53, 4.942, 23243.1438, 0.89, 31, -0.2, 14.38, 0.971, 32200.1371, 2.38, 56, -0.3, 14.25,
        5.764, -2.3012, 1.52, 25, -0.1, 13.9, 0.374, 31085.5086, -1.32, 12, -0.1, 13.19, 1.759, -9443.32, -5.23, -69, 0.3,
        9.68, 3.1, -16029.0809, -3.1, -50, 0, 9.37, 0.3, 24080.9952, -3.5, -20, 0, 8.61, 4.16, -1742.9305, -3.7, -44, 0,
        8.45, 2.84, 16100.0686, 1.2, 28, 0, 8.05, 2.63, 14286.1504, -0.6, 6, 0, 7.63, 6.24, 17285.6848, 3, 50, 0, 7.45, 1.48,
        1256.6039, -0.1, 0, 0, 7.37, 0.27, 5957.459, -2.1, -19, 0, 7.06, 5.67, 33.757, -0.3, -4, 0, 6.38, 4.78, 7004.5134,
        2.1, 32, 0, 5.74, 2.66, 32409.6866, -1.9, 5, 0, 4.37, 4.34, 22128.5152, -2.8, -13, 0, 4, 3.25, 33524.3152, 1.8, 49,
        0, 3.21, 2.24, 14985.44, -2.5, -16, 0, 2.91, 1.71, 24499.748, 0.8, 31, 0, 2.73, 1.99, 13799.824, -4.3, -38, 0, 2.57,
        5.41, -7072.088, -1.6, -25, 0, 2.52, 3.24, 8470.667, -2.2, -19, 0, 2.49, 4.07, -486.327, -3.7, -44, 0, 2.15, 5.61, -
    1952.48, 0.6, 7, 0, 1.98, 2.73, 39414.2, 0.2, 37, 0, 1.93, 1.57, 33314.766, 6.1, 100, 0, 1.87, 0.42, 30457.207, -1.3,
        12, 0, 1.75, 2.06, -8886.006, -3.4, -47, 0, 1.44, 2.39, -695.876, 0.6, 7, 0, 1.37, 3.03, -209.549, 4.3, 51, 0, 1.26,
        5.94, 16728.371, 1.2, 28, 0, 1.22, 6.17, 6656.749, -4, -41, 0, 1.19, 5.87, 6099.434, -5.9, -63, 0, 1.18, 1.01,
        31571.835, 2.4, 56, 0, 1.16, 3.84, 9585.295, 1.5, 25, 0, 1.14, 5.64, 8364.74, -2.2, -19, 0, 1.08, 1.23, 70.988, -1.9,
        -22, 0, 1.06, 3.33, 40528.829, 3.9, 81, 0, 0.99, 5.01, 40738.378, 0, 30, 0, 0.95, 5.7, -17772.011, -7, -94, 0, 0.88,
        0.3, -0.352, 0, 0, 0, 0.82, 3, 393.021, 0, 0, 0, 0.79, 1.8, 8326.39, 3, 50, 0, 0.75, 5, 22614.842, 1, 31, 0, 0.74,
        2.9, 8330.993, 0, 0, 0, 0.67, 0.7, -24357.772, -5, -75, 0, 0.64, 1.3, 8393.126, -2, -19, 0, 0.64, 5.9, 575.338, 0, 0,
        0, 0.64, 1.1, 23385.119, -3, -13, 0, 0.58, 5.2, 24428.76, 3, 53, 0, 0.58, 3.5, -9095.555, 1, 0, 0, 0.57, 6.1,
        29970.88, -5, -32, 0, 0.56, 3, 0.329, 2, 25, 0, 0.56, 4, -17981.561, -2, -43, 0, 0.56, 0.5, 7143.075, 0, 0, 0, 0.55,
        2.3, 25614.376, 5, 75, 0, 0.54, 4.2, 15752.304, -5, -45, 0, 0.49, 3.3, -8294.934, -2, -29, 0, 0.49, 1.7, 8362.448, 1,
        21, 0, 0.48, 1.8, -10071.622, -5, -69, 0, 0.45, 0.9, 15333.205, 4, 57, 0, 0.45, 2.1, 8311.771, -2, -19, 0, 0.43, 0.3,
        23452.693, -3, -20, 0, 0.42, 4.9, 33733.865, -3, 0, 0, 0.41, 1.6, 17495.234, -1, 0, 0, 0.4, 1.5, 23314.131, -1, 9, 0,
        0.39, 2.1, 38299.571, -4, -6, 0, 0.38, 2.7, 31781.385, -2, 5, 0, 0.37, 4.8, 6376.211, 2, 32, 0, 0.36, 3.9, 16833.175,
        -1, 0, 0, 0.36, 5, 15056.428, -4, -38, 0, 0.35, 5.2, -8257.704, -3, 0, 0, 0.34, 4.2, 157.734, 0, 0, 0, 0.34, 2.7,
        13657.848, -1, 0, 0, 0.33, 5.6, 41853.007, 3, 74, 0, 0.32, 5.9, -39.815, 0, 0, 0, 0.31, 4.4, 21500.21, -3, 0, 0, 0.3,
        1.3, 786.04, 0, 0, 0, 0.3, 5.3, -24567.32, 0, 0, 0, 0.3, 1, 5889.88, -2, 0, 0, 0.29, 4.2, -2371.23, -4, 0, 0, 0.29,
        3.7, 21642.19, -7, -57, 0, 0.29, 4.1, 32828.44, 2, 56, 0, 0.29, 3.5, 31713.81, -1, 0, 0, 0.29, 5.4, -33.78, 0, 0, 0,
        0.28, 6, -16.92, -4, 0, 0, 0.28, 2.8, 38785.9, 0, 0, 0, 0.27, 5.3, 15613.74, -3, 0, 0, 0.26, 4, 25823.93, 0, 0, 0,
        0.25, 0.6, 24638.31, -2, 0, 0, 0.25, 1.3, 6447.2, 0, 0, 0, 0.25, 0.9, 141.98, -4, 0, 0, 0.25, 0.3, 5329.16, -2, 0, 0,
        0.25, 0.1, 36.05, -4, 0, 0, 0.23, 2.3, 14357.14, -2, 0, 0, 0.23, 5.2, 2.63, 0, 0, 0, 0.22, 5.1, 47742.89, 2, 63, 0,
        0.21, 2.1, 6638.72, -2, 0, 0, 0.2, 4.4, 39623.75, -4, 0, 0, 0.19, 2.1, 588.49, 0, 0, 0, 0.19, 3.1, -15400.78, -3, -
    50, 0, 0.19, 5.6, 16799.36, -1, 0, 0, 0.18, 3.9, 1150.68, 0, 0, 0, 0.18, 1.6, 7178.01, 2, 0, 0, 0.18, 2.6, 8328.34,
        2, 0, 0, 0.18, 2.1, 8329.04, 2, 0, 0, 0.18, 3.2, -9652.87, -1, 0, 0, 0.18, 1.7, -8815.02, -5, -69, 0, 0.18, 5.7,
        550.76, 0, 0, 0, 0.17, 2.1, 31295.06, -6, 0, 0, 0.17, 1.2, 7211.76, -1, 0, 0, 0.16, 4.5, 14967.42, -1, 0, 0, 0.16,
        3.6, 15540.45, 1, 0, 0, 0.16, 4.2, 522.37, 0, 0, 0, 0.16, 4.6, 15545.06, -2, 0, 0, 0.16, 0.5, 6428.02, -2, 0, 0,
        0.16, 2, 13171.52, -4, 0, 0, 0.16, 2.3, 7216.36, -4, 0, 0, 0.15, 5.6, 7935.67, 2, 0, 0, 0.15, 0.5, 29828.9, -1, 0, 0,
        0.15, 1.2, -0.71, 0, 0, 0, 0.15, 1.4, 23942.43, -1, 0, 0, 0.14, 2.8, 7753.35, 2, 0, 0, 0.14, 2.1, 7213.71, -2, 0, 0,
        0.14, 1.4, 7214.42, -2, 0, 0, 0.14, 4.5, -1185.62, -2, 0, 0, 0.14, 3, 8000.1, -2, 0, 0, 0.13, 2.8, 14756.71, -1, 0,
        0, 0.13, 5, 6821.04, -2, 0, 0, 0.13, 6, -17214.7, -5, -72, 0, 0.13, 5.3, 8721.71, 2, 0, 0, 0.13, 4.5, 46628.26, -2,
        0, 0, 0.13, 5.9, 7149.63, 2, 0, 0, 0.12, 1.1, 49067.07, 1, 55, 0, 0.12, 2.9, 15471.77, 1, 0, 0);
    M_L1 = new Array(1.677, 4.669, 628.30196, -0.03, 0, 0, 0.516, 3.372, 6585.7609, -2.16, -19, 0.1, 0.414, 5.728,
        14914.4523, -0.64, 6, 0, 0.371, 3.969, 7700.3895, 1.55, 25, 0, 0.276, 0.74, 8956.9934, 1.5, 25, 0, 0.246, 4.23, -
    2.3012, 1.5, 25, 0, 0.071, 0.14, 7842.365, -2.2, -19, 0, 0.061, 2.5, 16171.056, -0.7, 6, 0, 0.045, 0.44, 8399.679, -
    0.4, 0, 0, 0.04, 5.77, 14286.15, -0.6, 6, 0, 0.037, 4.63, 1256.604, -0.1, 0, 0, 0.037, 3.42, 5957.459, -2.1, -19, 0,
        0.036, 1.8, 23243.144, 0.9, 31, 0, 0.024, 0, 16029.081, 3, 50, 0, 0.022, 1, -1742.931, -4, -44, 0, 0.019, 3.1,
        17285.685, 3, 50, 0, 0.017, 1.3, 0.329, 2, 25, 0, 0.014, 0.3, 8326.39, 3, 50, 0, 0.013, 4, 7072.088, 2, 25, 0, 0.013,
        4.4, 8330.993, 0, 0, 0, 0.013, 0.1, 8470.667, -2, -19, 0, 0.011, 1.2, 22128.515, -3, 0, 0, 0.011, 2.5, 15542.754, -1,
        0, 0, 0.008, 0.2, 7214.06, -2, 0, 0, 0.007, 4.9, 24499.75, 1, 0, 0, 0.007, 5.1, 13799.82, -4, 0, 0, 0.006, 0.9, -
    486.33, -4, 0, 0, 0.006, 0.7, 9585.3, 1, 0, 0, 0.006, 4.1, 8328.34, 2, 0, 0, 0.006, 0.6, 8329.04, 2, 0, 0, 0.005,
        2.5, -1952.48, 1, 0, 0, 0.005, 2.9, -0.71, 0, 0, 0, 0.005, 3.6, 30457.21, -1, 0, 0);
    M_L2 = new Array(0.0049, 4.67, 628.302, 0, 0, 0, 0.0023, 2.67, -2.301, 1.5, 25, 0, 0.0015, 3.37, 6585.761, -2.2, -19,
        0, 0.0012, 5.73, 14914.452, -0.6, 6, 0, 0.0011, 3.97, 7700.389, 2, 25, 0, 0.0008, 0.7, 8956.993, 1, 25, 0);
}

function Mnn(F, t, t2, t3, t4, n) { //'计算M_L0或M_L1或M_L2
    csh_e();
    t2 = t2 / 10000, t3 = t3 / 100000000, t4 = t4 / 100000000;
    n = int2(n * F.length / M_L0.length + 0.5) * 6; //'项数是以周期项为基准,n是周期项的计算项数
    if(n > F.length) n = F.length;
    var i, v;
    v = 0;
    for(var i = 0;i < n;i = i + 6) {
        v = v + F[i] * cos(F[i + 1] + t * F[i + 2] + t2 * F[i + 3] + t3 * F[i + 4] + t4 * F[i + 5]);
    }
    return v;
}

function moonLon(t, n) { // '月球经度计算,返回Date分点黄经,传入世纪数
    csh_e();
    t2 = t * t, t3 = t2 * t, t4 = t3 * t, t5 = t4 * t;
    if(n == -1) n = int2(M_L0.length / 6 + 0.1);
    v = Mnn(M_L0, t, t2, t3, t4, n) + Mnn(M_L1, t, t2, t3, t4, n) * t + Mnn(M_L2, t, t2, t3, t4, n) * t2;
    W = 3.81034409 + 8399.684730072 * t - 0.00003319 * t2 + 0.0000000311 * t3 - 0.0000000002033 * t4; //'月球平黄经
    p = 5028.792262 * t + 1.1124406 * t2 + 0.00007699 * t3 - 0.000023479 * t4 - 0.0000000178 * t5; //'岁差
    return W + (v + p) / (rad * 3600);
}
function nutation_moon(t) { //月球章动计算=IAU1980 ,t为世纪数,返回值为角秒单位,最大误差不超过0.1角秒
    var dL = 0,
        t2 = t * t;
    var y0 = -17.2 - 0.01742 * t;
    var c;
    c = 2.1824 - 33.75705 * t + 0.000036 * t2, dL = y0 * sin(c);
    c = 3.5069 + 1256.66393 * t + 0.000011 * t2, dL = dL - 1.32 * sin(c);
    c = 1.3375 + 16799.4182 * t - 0.000051 * t2, dL = dL - 0.23 * sin(c);
    c = 4.3649 - 67.5141 * t + 0.000072 * t2, dL = dL + 0.21 * sin(c);
    c = 0.04 - 628.302 * t, dL = dL - 0.14 * sin(c);
    c = 2.36 + 8328.691 * t, dL = dL + 0.07 * sin(c);
    c = 3.46 + 1884.966 * t, dL = dL - 0.05 * sin(c);
    c = 5.44 + 16833.175 * t, dL = dL - 0.04 * sin(c);
    c = 3.69 + 25128.11 * t, dL = dL - 0.03 * sin(c);
    c = 3.55 + 628.362 * t, dL = dL + 0.02 * sin(c);
    return dL; //'this.dL=dL: //黄经章动//'this.dE=dE: //交角章动
}

function moon_L(jde) {
    var testT = (jde - 2451545) / 36525; //'儒略世纪数
    var L = moonLon(testT, -1); //计算月球坐标
    var gxmoon = 0.7848 + 8328.691425 * testT + 1.523 * testT * testT / 10000;
    var L2 = 0.7 * (1 - 0.055 * sin(gxmoon)); //结论： 月球的黄经光行差约为0 .7 角秒(最大误差16 % )
    var numoon = nutation_moon(testT); //'章动计算
    return L + (numoon - L2) / (rad * 3600); //'补章动与光行差
}

//===========================================================================================
// 计算合朔和节气
function getJQ(yy, mm) {
    var W = (mm + (yy - 1999) * 24) * 15 * pai / 180;
    var jd1 = earth_t(W - pai) * 365250 + 2451545;
    do {
        jd0 = jd1;
        stDegree = earth_L(jd0) - W;
        stDegreep = (earth_L(jd0 + 0.000005) - earth_L(jd0 - 0.000005)) / 0.00001;
        jd1 = jd0 - stDegree / stDegreep;
    } while(abs(jd1 - jd0) >= 0.0000001);
    var jd = jd1 + 8 / 24 - deltatT(yy) / 86400;
    return jd;
}
function getHS(yy, jda) {//计算合朔日
    var k0, jd1, W1, jd0, getjq_12a, getjq_12b, jd2, stDegree, stDegreep;
    k0 = Round((moon_L(jda) - earth_L(jda)) / (pai * 2));
    jd1 = jda;
    W1 = (k0 - 1) * pai * 2;
    do {
        jd0 = jd1;
        stDegree = moon_L(jd0) - earth_L(jd0) - W1;
        stDegreep = (moon_L(jd0 + 0.000005) - earth_L(jd0 + 0.000005) - moon_L(jd0 - 0.000005) + earth_L(jd0 - 0.000005)) /
            0.00001;
        jd1 = jd0 - stDegree / stDegreep;
    } while(abs(jd1 - jd0) >= 0.0000001);
    getjq_12a = jd1 + 8 / 24 - deltatT(yy) / 86400;
    jd2 = jda;
    W2 = k0 * pai * 2;
    do {
        jd0 = jd2;
        stDegree = moon_L(jd0) - earth_L(jd0) - W2;
        stDegreep = (moon_L(jd0 + 0.000005) - earth_L(jd0 + 0.000005) - moon_L(jd0 - 0.000005) + earth_L(jd0 - 0.000005)) /
            0.00001;
        jd2 = jd0 - stDegree / stDegreep;
    } while(abs(jd2 - jd0) >= 0.0000001);
    getjq_12b = jd2 + 8 / 24 - deltatT(yy) / 86400;
    let res = '';
    if(jda >= getjq_12b || Round(getjq_12b) == Round(jda)) {
        res = getjq_12b;
    } else if(jda >= getjq_12a || Round(getjq_12a) == Round(jda)) {
        res = getjq_12a;
    }
    //修正合朔:保证1900年至今数据与香港天文台农历一致
    if([2420455, 2420898, 2422640].includes(Round(res))) res -= 1;
    return res;
}

//'原子时与UT1的差'部分参考了美国国家航空航天局网站里的算法,www.nasa.gov.'2050以后的外推参考了skymap10.5,在skymap的星历表中分段找几个数据,再用最小二乘法拟合
function deltatT(y) { //计算世界时与原子时之差,传入年
    var dt_at = [
        -4000, 108371.7, -13036.80, 392.000, 0.0000,
        -500, 17201.0, -627.82, 16.170, -0.3413,
        -150, 12200.6, -346.41, 5.403, -0.1593,
        150, 9113.8, -328.13, -1.647, 0.0377,
        500, 5707.5, -391.41, 0.915, 0.3145,
        900, 2203.4, -283.45, 13.034, -0.1778,
        1300, 490.1, -57.35, 2.085, -0.0072,
        1600, 120.0, -9.81, -1.532, 0.1403,
        1700, 10.2, -0.91, 0.510, -0.0370,
        1800, 13.4, -0.72, 0.202, -0.0193,
        1830, 7.8, -1.81, 0.416, -0.0247,
        1860, 8.3, -0.13, -0.406, 0.0292,
        1880, -5.4, 0.32, -0.183, 0.0173,
        1900, -2.3, 2.06, 0.169, -0.0135,
        1920, 21.2, 1.69, -0.304, 0.0167,
        1940, 24.2, 1.22, -0.064, 0.0031,
        1960, 33.2, 0.51, 0.231, -0.0109,
        1980, 51.0, 1.29, -0.026, 0.0032,
        2000, 63.87, 0.1, 0, 0,
        2005, 64.7, 0.21, 0, 0,
        2012, 66.8, 0.22, 0, 0,
        2018, 69.0 + 4.6, 0.40, 0, 0,
        2021, 78.1, 0.44, 0, 0,
        2024, 83.1, 0.55, 0, 0,
        2028, 83.6 + 15
    ];
    var y0 = dt_at[dt_at.length - 2]; //表中最后一年
    var y1 = dt_at[dt_at.length - 1]; //表中最后一年的deltatT
    if(y >= y0) {
        var sjd = 32; //sjd是y1年之后的加速度估计。瑞士星历表sjd=31,NASA网站sjd=32,skmap的sjd=29
        if(y > y0 + 100) return dt_ext(y, sjd);
        var v = dt_ext(y, sjd);       //二次曲线外推
        var dv = dt_ext(y0, sjd) - y1;  //y1年的二次外推与te的差
        return v - dv * (y0 + 100 - y) / 100;
    }
    var i, d = dt_at;
    for(i = 0;i < d.length;i += 5) if(y < d[i + 5]) break;
    var t1 = (y - d[i]) / (d[i + 5] - d[i]) * 10, t2 = t1 * t1, t3 = t2 * t1;
    return d[i + 1] + d[i + 2] * t1 + d[i + 3] * t2 + d[i + 4] * t3;
}
function dt_ext(y, sjd) { var dy = (y - 1820) / 100; return -20 + sjd * dy * dy; } //二次曲线外推
function JD(y, m, d) { //公历转儒略日
    var n = 0,
        G = 0;
    if(y * 372 + m * 31 + int2(d) >= 588829) G = 1; //判断是否为格里高利历日1582*372+10*31+15
    if(m <= 2) m += 12, y--;
    if(G) n = int2(y / 100), n = 2 - n + int2(n / 4); //加百年闰
    return int2(365.25 * (y + 4716)) + int2(30.6001 * (m + 1)) + d + n - 1524.5;
}
function JD2GL(jd) {
    var r = new Object();
    var D = int2(jd + 0.5), F = jd + 0.5 - D, c; //取得日数的整数部份A及小数部分F
    if(D >= 2299161) c = int2((D - 1867216.25) / 36524.25), D += 1 + c - int2(c / 4);
    D += 1524;
    r.Y = int2((D - 122.1) / 365.25); //年数
    D -= int2(365.25 * r.Y);
    r.M = int2(D / 30.601); //月数
    D -= int2(30.601 * r.M);
    r.D = D; //日数
    if(r.M > 13) r.M -= 13, r.Y -= 4715;
    else r.M -= 1, r.Y -= 4716;
    // 计算时分秒 
    var totalSeconds = F * 24 * 60 * 60;
    r.h = parseInt(totalSeconds / 3600);
    totalSeconds %= 3600;
    r.m = parseInt(totalSeconds / 60);
    r.s = Math.round(totalSeconds % 60);
    // return [r.Y, r.M, r.D]; //.join("-")
    return r;
}
function getWeek(jd) {
    return int2(jd + 1.5 + 7000000) % 7;
}

//=========================================
//     let arr=[]
//     for(let i=1901;i<=2100;i++){
//             let jqb=getYearJQ(i).map(n=>JD2GL(n)).map(n=>n.Y+'-'+n.M+'-'+n.D)
//         arr=arr.concat(jqb)
//     }
//     let res=[...new Set(arr)]
// console.log(res.join(','))
function getYearHS1(y) {
    let jqb = getYearJQ(y).map(n => Round(n))
    let hsb0 = [], hsb1 = {};//hsb0仅记录朔jd，hsb1记录朔jd对应的节气
    let lmtotal = 0;//两个冬至之间的月数，判断闰年
    for(let i = 0;i < jqb.length;i++) {
        let _hs = getHS(y, jqb[i]);
        let _jd = Round(_hs);
        if(!hsb0.includes(_jd)) {
            hsb0.push(_jd);
            hsb1[_jd] = [jqb[i]];
            if(_jd >= Round(jqb[1]) && _jd <= Round(jqb[25])) {
                lmtotal++;
            }
        } else {
            hsb1[_jd].push(jqb[i]);
        }
    }
    let m = 11;
    let isLeap = false;
    let res = []
    for(let i = 0;i < lmtotal;i++) {
        let lm = m + i
        let ly = y - 1
        let hs = hsb0[i]
        let jq = hsb1[hs]
        let isleap = false;
        if(lmtotal == 13) {//13个朔日，
            if(jq.length == 1 && jqb.indexOf(jq[0]) % 2 == 0 && !isLeap) {
                lm = --m + i
                isleap = isLeap = true
            } else {
                isleap = false
            }
        }
        let dn=hsb0[i+1]-hsb0[i]
        if(lm > 12) ly++
        let ym = `${ly}-${lm % 12 || 12}`
        res.push({ ym, hs: hs, jq: jq, isleap,dn })
    }
    return res
}

let res = getYearHS1(2034)
console.log(res)