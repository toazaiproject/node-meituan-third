const request = require('request');
const _ = require('loadsh');
const util = require("./util");

let appkey = ""; // 美团应用的Appkey
let secret = ""; // 美团应用的Secret
const apiUrl = {
	getAuthorizerAccessTokenUrl: "https://openapi.dianping.com/router/oauth/token", // session换取接口
	routerOauthSessionScopeUrl: "https://openapi.dianping.com/router/oauth/session/scope", // 适用店铺查询接口
	tuangouReceiptPrepareUrl: "https://openapi.dianping.com/router/tuangou/receipt/prepare", // 输码验券校验接口
	tuangouReceiptScanprepareUrl: "https://openapi.dianping.com/router/tuangou/receipt/scanprepare", // 扫码验券校验接口
	tuangouReceiptConsumeUrl: "https://openapi.dianping.com/router/tuangou/receipt/consume", // 验券接口
	tuangouReceiptReverseconsumeUrl: "https://openapi.dianping.com/router/tuangou/receipt/reverseconsume", // 撤销验券接口
	tuangouReceiptGetconsumedUrl: "https://openapi.dianping.com/router/tuangou/receipt/getconsumed", // 查询已验券信息接口
};//请求接口

//获取授权链接
/**
 * 
 * @param {String} state [用于保持请求和回调的状态，在回调时，会回传该参数，开发者可以用这个参数验证请求有效性，也可以记录用户请求授权页前的位置，可防止CSRF攻击]
 * @param {String} redirect_url [用以接收授权码auth_code的回调地址,]
 * @param {String} scope [需要授权的模块英文名称列表,附查询地址：http://open.dianping.com/document/v2?docId=6000263&rootDocId=1000]
*/
const getAuthUrl = function(state, redirect_url, scope){
	return new Promise(function(reslove,reject){
		if(!state){
			return reslove({code:409,message:'请填写自定义参数'});
		}
		if(!redirect_url){
			return reslove({code:409,message:'请填写授权回调地址'});
		}
		redirect_url = util.changeUrl(redirect_url,'encode');
		
		let url = `https://e.dianping.com/dz-open/merchant/auth?app_key=${appkey}&redirect_url=${redirect_url}$state=${state}`;
		if(scope){
			url += `&scope=${JSON.stringify(scope)}`
		}

		return reslove({
			code:200,
			result:{
				url:url
			}
		});
	});
}

//使用授权码获取授权信息
/**
 * 
 * @param {String} auth_code [获取session的授权码]
*/
const getAuthorizerAccessToken = function(auth_code, redirect_url){
	return new Promise(function(reslove,reject){
		if(!auth_code){
			return reslove({code:409,message:'请填写授权码'});
		}
		var options = {
			url:apiUrl.getAuthorizerAccessTokenUrl,
			method:"post",
			headers:{"Content-Type":"application/json"},
			form:{
				"app_key": appkey,
				"app_secret":  secret,
				"auth_code": auth_code,
				"grant_type": "authorization_code"
			},
			json:true
		};
		if(redirect_url){
			options.form.redirect_url = redirect_url;
		}
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.msg});
			}
			if(body.code != 200){
				return reslove({code:409,message:body.msg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

//获取/刷新接口调用令牌
/**
 * 
 * @param {String} refresh_token [用来刷新授权的的refresh_token值]
*/
const refreshAuthorizerAccessToken = function(refresh_token){
	return new Promise(function(reslove,reject){
		if(!refresh_token){
			return reslove({code:409,message:'请填写刷新令牌'});
		}
		var options = {
			url:apiUrl.getAuthorizerAccessTokenUrl,
			method:"post",
			headers:{"Content-Type":"application/json"},
			form:{
				"app_key": appkey,
				"app_secret":  secret,
				"refresh_token": refresh_token,
				"grant_type": "refresh_token"
			},
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.msg});
			}
			if(body.code != 200){
				return reslove({code:409,message:body.msg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

/**
 * 适用店铺查询
 * @param {String} session [商家授权成功后，北极星到综开放平台颁发给应用的授权信息]
 * @param {String} params [其他参数]
 * @param {String} params.bid [客户的唯一标识，通过session换取/刷新接口]
*/
const routerOauthSessionScope = function(session, params){
	return new Promise(function(reslove,reject){
		if(!session){
			return reslove({code:409,message:'请填写授权session'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.bid){
			return reslove({code:409,message:'请填写客户的唯一标识'});
		}
		params = _.merge(params, {
			app_key: appkey,
			timestamp: util.getShowDate(new Date(), "YYYY-MM-DD HH:mm:ss"),
			session:session,
			format:"json",
			v:"1",
			sign_method:"MD5"
		});
		params.sign = util.sign(params, secret);
		var options = {
			url:`${apiUrl.routerOauthSessionScopeUrl}?${Object.keys(params).map((key) => key + '=' + params[key]).join('&')}`,
			method:"GET",
			headers:{"Content-Type":"application/x-www-form-urlencoded"},
			form:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

/**
 * 输码验券校验接口
 * @param {String} session [商家授权成功后，北极星到综开放平台颁发给应用的授权信息]
 * @param {String} params [其他参数]
 * @param {String} params.receipt_code [团购券码，必须未验证]
 * @param {String} params.open_shop_uuid [美团点评店铺id，必须是团购的适用门店]
*/
const tuangouReceiptPrepare = function(session, params){
	return new Promise(function(reslove,reject){
		if(!session){
			return reslove({code:409,message:'请填写授权session'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.receipt_code){
			return reslove({code:409,message:'请填写团购券码，必须未验证'});
		}
		if(!params.open_shop_uuid){
			return reslove({code:409,message:'请填写美团点评店铺id，必须是团购的适用门店'});
		}
		params = _.merge(params, {
			app_key: appkey,
			timestamp: util.getShowDate(new Date(), "YYYYMMDDHHmmss"), // 此处美团文档要求必须为YYYY-MM-DD HH:mm:ss,但是一直无法通过验签，改成此模式可通过，不知道为啥
			session:session,
			format:"json",
			v:"1",
			sign_method:"MD5"
		});
		params.sign = util.sign(params, secret);
		var options = {
			url:apiUrl.tuangouReceiptPrepareUrl,
			method:"post",
			headers:{"Content-Type":"application/x-www-form-urlencoded"},
			form:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

/**
 * 扫码验券校验接口
 * @param {String} session [商家授权成功后，北极星到综开放平台颁发给应用的授权信息]
 * @param {String} params [其他参数]
 * @param {String} params.qr_code [二维码对应code]
 * @param {String} params.open_shop_uuid [美团点评店铺id，必须是团购的适用门店]
*/
const tuangouReceiptScanprepare = function(session, params){
	return new Promise(function(reslove,reject){
		if(!session){
			return reslove({code:409,message:'请填写授权session'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.qr_code){
			return reslove({code:409,message:'请填写二维码对应code'});
		}
		if(!params.open_shop_uuid){
			return reslove({code:409,message:'请填写美团点评店铺id，必须是团购的适用门店'});
		}
		params = _.merge(params, {
			app_key: appkey,
			timestamp: util.getShowDate(new Date(), "YYYYMMDDHHmmss"), // 此处美团文档要求必须为YYYY-MM-DD HH:mm:ss,但是一直无法通过验签，改成此模式可通过，不知道为啥
			session:session,
			format:"json",
			v:"1",
			sign_method:"MD5"
		});
		params.sign = util.sign(params, secret);
		var options = {
			url:apiUrl.tuangouReceiptScanprepareUrl,
			method:"post",
			headers:{"Content-Type":"application/x-www-form-urlencoded"},
			form:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

/**
 * 扫码验券校验接口
 * @param {String} session [商家授权成功后，北极星到综开放平台颁发给应用的授权信息]
 * @param {String} params [其他参数]
 * @param {String} params.receipt_code [团购券码，必须未验证]
 * @param {String} params.count [验券数量, 不可多于100个]
 * @param {String} params.open_shop_uuid [美团点评店铺id，必须是团购的适用门店]
 * @param {String} params.app_shop_account [商家在自研系统或第三方服务商系统内登录的帐号，仅用于记录验券者的信息，该字段不参与任何验券校验逻辑]
 * @param {String} params.app_shop_accountname [商家在自研系统或第三方服务商系统内登陆的用户名，仅用于记录验券者的信息，该字段不参与任何验券校验逻辑]
*/
const tuangouReceiptConsume = function(session, params){
	return new Promise(function(reslove,reject){
		if(!session){
			return reslove({code:409,message:'请填写授权session'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.receipt_code){
			return reslove({code:409,message:'请填写团购券码，必须未验证'});
		}
		if(!params.count){
			return reslove({code:409,message:'请填写验券数量，不可多于100个'});
		}
		if(!params.open_shop_uuid){
			return reslove({code:409,message:'请填写美团点评店铺id，必须是团购的适用门店'});
		}
		if(!params.app_shop_account){
			return reslove({code:409,message:'请填写商家在自研系统或第三方服务商系统内登录的帐号，仅用于记录验券者的信息，该字段不参与任何验券校验逻辑'});
		}
		if(!params.app_shop_accountname){
			return reslove({code:409,message:'请填写商家在自研系统或第三方服务商系统内登陆的用户名，仅用于记录验券者的信息，该字段不参与任何验券校验逻辑'});
		}
		params = _.merge(params, {
			requestid: util.uuid(),
			app_key: appkey,
			timestamp: util.getShowDate(new Date(), "YYYYMMDDHHmmss"), // 此处美团文档要求必须为YYYY-MM-DD HH:mm:ss,但是一直无法通过验签，改成此模式可通过，不知道为啥
			session:session,
			format:"json",
			v:"1",
			sign_method:"MD5"
		});
		params.sign = util.sign(params, secret);
		var options = {
			url:apiUrl.tuangouReceiptConsumeUrl,
			method:"post",
			headers:{"Content-Type":"application/x-www-form-urlencoded"},
			form:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

/**
 * 撤销验券接口
 * @param {String} session [商家授权成功后，北极星到综开放平台颁发给应用的授权信息]
 * @param {String} params [其他参数]
 * @param {String} params.app_deal_id [套餐id]
 * @param {String} params.receipt_code [团购券码，必须未验证]
 * @param {String} params.open_shop_uuid [美团点评店铺id，必须是团购的适用门店]
 * @param {String} params.app_shop_account [商家在自研系统或第三方服务商系统内登录的帐号，仅用于记录验券者的信息，该字段不参与任何验券校验逻辑]
 * @param {String} params.app_shop_accountname [商家在自研系统或第三方服务商系统内登陆的用户名，仅用于记录验券者的信息，该字段不参与任何验券校验逻辑]
*/
const tuangouReceiptReverseconsume = function(session, params){
	return new Promise(function(reslove,reject){
		if(!session){
			return reslove({code:409,message:'请填写授权session'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.app_deal_id){
			return reslove({code:409,message:'请填写套餐id'});
		}
		if(!params.receipt_code){
			return reslove({code:409,message:'请填写团购券码，必须未验证'});
		}
		if(!params.open_shop_uuid){
			return reslove({code:409,message:'请填写美团点评店铺id，必须是团购的适用门店'});
		}
		if(!params.app_shop_account){
			return reslove({code:409,message:'请填写商家在自研系统或第三方服务商系统内登录的帐号，仅用于记录验券者的信息，该字段不参与任何验券校验逻辑'});
		}
		if(!params.app_shop_accountname){
			return reslove({code:409,message:'请填写商家在自研系统或第三方服务商系统内登陆的用户名，仅用于记录验券者的信息，该字段不参与任何验券校验逻辑'});
		}
		params = _.merge(params, {
			requestid: util.uuid(),
			app_key: appkey,
			timestamp: util.getShowDate(new Date(), "YYYYMMDDHHmmss"), // 此处美团文档要求必须为YYYY-MM-DD HH:mm:ss,但是一直无法通过验签，改成此模式可通过，不知道为啥
			session:session,
			format:"json",
			v:"1",
			sign_method:"MD5"
		});
		params.sign = util.sign(params, secret);
		var options = {
			url:apiUrl.tuangouReceiptReverseconsumeUrl,
			method:"post",
			headers:{"Content-Type":"application/x-www-form-urlencoded"},
			form:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

/**
 * 查询已验券信息接口
 * @param {String} session [商家授权成功后，北极星到综开放平台颁发给应用的授权信息]
 * @param {String} params [其他参数]
 * @param {String} params.receipt_code [团购券码，必须未验证]
 * @param {String} params.open_shop_uuid [美团点评店铺id，必须是团购的适用门店]
*/
const tuangouReceiptGetconsumed = function(session, params){
	return new Promise(function(reslove,reject){
		if(!session){
			return reslove({code:409,message:'请填写授权session'});
		}
		if(!params){
			return reslove({code:409,message:'请填写其他参数'});
		}
		if(!params.receipt_code){
			return reslove({code:409,message:'请填写团购券码，必须未验证'});
		}
		if(!params.open_shop_uuid){
			return reslove({code:409,message:'请填写美团点评店铺id，必须是团购的适用门店'});
		}
		params = _.merge(params, {
			requestid: util.uuid(),
			app_key: appkey,
			timestamp: util.getShowDate(new Date(), "YYYYMMDDHHmmss"), // 此处美团文档要求必须为YYYY-MM-DD HH:mm:ss,但是一直无法通过验签，改成此模式可通过，不知道为啥
			session:session,
			format:"json",
			v:"1",
			sign_method:"MD5"
		});
		params.sign = util.sign(params, secret);
		var options = {
			url:apiUrl.tuangouReceiptGetconsumedUrl,
			method:"post",
			headers:{"Content-Type":"application/x-www-form-urlencoded"},
			form:params,
			json:true
		};
		request(options,function(error, response, body){
			if(error){
				return reslove({code:409,message:error.errmsg});
			}
			if(body.errcode){
				return reslove({code:409,message:body.errmsg});
			}else{
				return reslove({code:200,result:body});
			}
		});
	});
}

/**
 * 初始化工具客户端
 * @author xutao
 * @param    {[String]}                 appkey [美团应用的Appkey]
 * @param    {[String]}                 secret [美团应用的Secret]
 */
exports.initClient = function (params){
	if(!params){
		return ;
	}
	if(!params.appkey){
		return ;
	}
	if(!params.secret){
		return ;
	}

	appkey = params.appkey;
	secret = params.secret;

	return {
		getAuthUrl:getAuthUrl,//获取授权链接
		getAuthorizerAccessToken:getAuthorizerAccessToken,//使用授权码获取授权信息
		refreshAuthorizerAccessToken:refreshAuthorizerAccessToken,//获取/刷新接口调用令牌
		routerOauthSessionScope:routerOauthSessionScope,//适用店铺查询接口
		tuangouReceiptPrepare:tuangouReceiptPrepare,//输码验券校验接口
		tuangouReceiptScanprepare:tuangouReceiptScanprepare,//扫码验券校验接口
		tuangouReceiptConsume:tuangouReceiptConsume,//验券接口
		tuangouReceiptReverseconsume:tuangouReceiptReverseconsume,//撤销验券接口
		tuangouReceiptGetconsumed:tuangouReceiptGetconsumed,//查询已验券信息接口
	};
};