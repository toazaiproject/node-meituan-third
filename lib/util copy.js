exports.changeUrl = function (url,value){
    // decode 解码
    if(value == 'encode'){
        url = url.replace(/:/g, "%3A");
        url = url.replace(/\//g, "%2F");
        url = url.replace(/\?/g, "%3F");
        url = url.replace(/=/g, "%3D");
        url = url.replace(/&/g, "%26");
    }else{
        //将编码后的url解码
        url = url.replace(/\%3A/g, ":");
        url = url.replace(/\%2F/g, "/");
        url = url.replace(/\%3F/g, "?");
        url = url.replace(/\%3D/g, "=");
        url = url.replace(/\%26/g, "&");
    }
    return url;
};