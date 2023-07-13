const crypto = require('crypto');
const moment = require('moment');
require('moment/locale/zh-cn');

//根据传入日期返回展示日期,YYYY-MM-DD HH:mm:ss
exports.getShowDate = function (date, value) {
    return moment(date).format(value ? value : "YYYY-MM-DD HH:mm:ss");
}

//系统加密规则
//params为一个对象
exports.sign = function (params, secret) {
    function sortKey(info) {
        var str = "";
        var keyArr = [];
        for (var key in info) {
            if (info[key] == "" || !info[key]) {
                continue;
            }
            keyArr.push(key);
        }
        keyArr.sort();
        for (var i = 0; i < keyArr.length; i++) {
            var value = typeof (info[keyArr[i]]) == "object" ? JSON.stringify(info[keyArr[i]]) : info[keyArr[i]];
            str += (keyArr[i] + value)
        }
        // console.log("params1:"+str);
        return encodeURIComponent(str);
    };

    var str = `${secret}${sortKey(params)}${secret}`;
    var md5sum = crypto.createHash("md5");
    md5sum.update(str, 'utf-8');
    str = md5sum.digest("hex");
    return str;
}

//获取uuid
exports.uuid = function () {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var time = new Date().getTime();
    var num = 16;//保证是2位数，16为 对3位数进行63整除，除数大于等于16
    //将毫秒值除于num，整数和余数组成新的str
    var str = parseInt(time / num) + '' + (time % num < 10 ? ('0' + time % num) : time % num);//整数+余数
    var len = str.length;
    var arr = [];
    var id = [];
    //将str按个数(3位)分配到数组中
    for (var i = 0; i < parseInt(len / 3); i++) {
        arr[i] = parseInt(str.substring(3 * i, 3 * i + 3));
    }
    if (len % 3) {
        arr.push(parseInt(str.substring(3 * arr.length)));
    }
    //对3位数进行63整除，除数大于等于16
    for (var i = 0; i < arr.length; i++) {
        //整数对应的值
        id.push(chars[parseInt(arr[i] / num)]);
        //余数对应的值
        id.push(chars[parseInt(arr[i] % num)]);
    }

    return id.join("");
};