<template>
	<div class="login-container">

	</div>
</template>

<script setup lang="ts">

import {getLoginUrl} from "@/api/auth";
import {LocationQuery, LocationQueryValue, useRoute} from "vue-router";
import router from "@/router";

import {useUserStore} from "@/views/flyflow/stores/user";
import {isBlank, isNotBlank, parseUrlParams,assiginObj} from "@/views/flyflow/utils/objutil";
import {isMobile, isWxCp} from "@/views/flyflow/utils/appversion";
import { useAppStore } from "@/store/modules/app";

const userStore = useUserStore();
const route = useRoute();


const appStore = useAppStore();

function handleLogin() {
	getLoginUrl().then(res => {

		let params = getParams();




		let data = res.data;
		let captcha = data.captcha;
		if (data.innerUrl) {
			router.push({path: data.url, query:assiginObj( params.params,{redirect:params.redirect,captcha:captcha})});

		} else {
			window.location.href = data.url
		}


	})
}


//获取所有的参数
function getParams() {
	const query = route.query;
	let params = route.params;
	var redirect = (query.redirect) ?? "/dashboard";

	const otherQueryParams = Object.keys(query).reduce(
			(acc: any, cur: string) => {
				if (cur !== "redirect") {
					acc[cur] = query[cur];
				}
				return acc;
			},
			{}
	);
	if (params) {
		let r = params.r;//跳转地址
		let pname = params.pname;//参数key
		let pval = params.pval;//参数值
		if (isNotBlank(r)) {
			redirect = '/' + r;
			otherQueryParams[pname] = pval;
		}
	}

	const paramsString = window.location.search.substring(1);
	let urlParamMap = parseUrlParams(paramsString);
	var token = (query.token as LocationQueryValue) ?? urlParamMap['token'];
	otherQueryParams.token = token;


	if (isBlank(redirect)) {
		redirect = '/dashboard'
	}

	return {
		redirect: decodeURIComponent(redirect),
		params: otherQueryParams
	}
}


onMounted(() => {

	let params = getParams();

console.log(111);


	// 获取参数字符串（去除问号）

	const redirect = params.redirect
	var token = params.params.token;
	const authCode = params.params.authCode;

	appStore.closeSideBar(true);

	if (isBlank(token)) {
		token = authCode;
	}


	if (isNotBlank(token)) {
		if (isWxCp() && isMobile()) {
			//说明是手机端 微信跳转回来的
			//企微 并且是手机
			let params = route.params;
			let r = params.r;//跳转地址

			let q = params.pval;//参数值
			let pname = params.pname;//参数key

			let href = `http://qwh5.flyflow.cc/#/redirectlogin/${r}/${pname}/${q}?token=` + token;

			window.location.href = href;
			return
		}
		userStore
				.loginByToken(token)
				.then(() => {
	
					router.push({path: redirect, query: params.params});
				});
	} else {
		handleLogin();

	}


})

</script>

<style lang="less" scoped>
.login-container {
	text-align: center;
	padding-top: 20vh;
}

</style>
