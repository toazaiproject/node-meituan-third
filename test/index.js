const appkey = "xxx"; // 美团应用的Appkey
const secret = "xxxxx"; // 美团应用的Secret

/**
 * 初始化工具客户端
 * @param    {[String]}                 appId [开发者第三方平台APPID]
 * @param    {[String]}                 appsecret [第三方平台appsecret]
 * @param    {[String]}                 encodingAESKey [开发者在第一步填写服务器配置的encodingAESKey]
 * @param    {[String]}                 classificationSecret [开发者在第一步填写服务器配置的token]
 */
const meituanClient = require('../index').initClient({
    appkey: appkey,
    secret: secret,
})

const session = "";
const refresh_session = "";
const open_shop_uuid = "";

// meituanClient.getAuthUrl("xxx", "https://dev.hulasports.com/api/xxx",["tuangou","xx"])
// .then(function (result){
//     console.log(result);
// });

// meituanClient.getAuthorizerAccessToken("xxx")
// .then(function (result){
//     console.log(result);
// });

// meituanClient.refreshAuthorizerAccessToken(refresh_session)
// .then(function (result){
//     console.log(result);
// });

// meituanClient.tuangouReceiptPrepare(session, {receipt_code:"2642910921",open_shop_uuid:open_shop_uuid})
// .then(function (result){
//     console.log(result);
// });

// meituanClient.tuangouReceiptScanprepare(session, {qr_code:"4163565997",open_shop_uuid:open_shop_uuid})
// .then(function (result){
//     console.log(result.result.data);
// });

// meituanClient.tuangouReceiptConsume(session, {receipt_code:"4387915353",count:2,open_shop_uuid:open_shop_uuid,app_shop_account:"xx",app_shop_accountname:"xx"})
// .then(function (result){
//     console.log(result,result.result.data);
// });

// meituanClient.tuangouReceiptReverseconsume(session, {receipt_code:"4163565997",app_deal_id:"993507556",open_shop_uuid:open_shop_uuid,app_shop_account:"xx",app_shop_accountname:"xx"})
// .then(function (result){
//     console.log(result);
// });

// meituanClient.tuangouReceiptGetconsumed(session, {receipt_code:"2642910921",open_shop_uuid:open_shop_uuid})
// .then(function (result){
//     console.log(result);
// });