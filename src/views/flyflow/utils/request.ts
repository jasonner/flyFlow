import axios, {InternalAxiosRequestConfig, AxiosResponse} from 'axios';
import {useUserStoreHook} from '../stores/user';
import {ElLoading, ElMessage, ElMessageBox} from 'element-plus'

import {encodeSearchParams, getUrlParamsToJSON} from "../utils/objutil";

// 创建 axios 实例
const service = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API,
	timeout: 60000,
	headers: {'Content-Type': 'application/json;charset=utf-8', 'FlyflowVersion': import.meta.env.VITE_APP_VERSION},
	transformResponse: [data => {
		try {
			// Check if data is already an object (axios might have parsed it)
			if (typeof data === 'object') {
				return data;
			}
			
			// Check if data is a string and looks like JSON
			if (typeof data === 'string') {
				const trimmedData = data.trim();
				
				// Check if it starts with JSON-like characters
				if (trimmedData.startsWith('{') || trimmedData.startsWith('[')) {
					return JSON.parse(data);
				}
				
				// If it looks like HTML (common error response)
				if (trimmedData.startsWith('<!DOCTYPE') || trimmedData.startsWith('<html')) {
					console.error('Received HTML response instead of JSON:', trimmedData.substring(0, 200) + '...');
					throw new Error('服务器返回了HTML页面而不是JSON数据，请检查服务器状态');
				}
				
				// For other string responses
				console.warn('Received non-JSON string response:', trimmedData.substring(0, 100));
				return { data: trimmedData };
			}
			
			// For other data types, return as is
			return data;
		} catch (error: any) {
			console.error('Failed to parse response:', error);
			if (error?.message?.includes('HTML页面')) {
				throw error; // Re-throw our custom error
			}
			throw new Error('响应数据格式错误: ' + (error?.message || 'Unknown error'));
		}
	}]
});

var unloadingUrlList=[
	'message/unreadNum',
	'form/dynamicFormList',
	"org/tree",
	"base/queryTaskOperData",
	"base/queryHeaderShow",
	"base/formatStartNodeShow",
	"form/getFormList",
	"task/queryContractImg",
	"file/pdfToImgList"
]

let loadingFlag: any = undefined;

// 请求拦截器
service.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		//debugger
		let url = config.url || '';

		var matchUrl=false;

		//判断是否需要显示loading页面
		for(var murl of unloadingUrlList){
			if(url.indexOf(murl)>=0){
				matchUrl=true;
				break
			}
		}
		if (!loadingFlag&&!matchUrl) {
			loadingFlag = ElLoading.service({
				lock: true,
				text: '加载中',
				background: 'rgba(0, 0, 0, 0.7)',
			})

		}


		const userStore = useUserStoreHook();
		if (userStore.token) {
			config.headers.Authorization = userStore.token;
		}
		if (userStore.tenantId) {
			config.headers['Flyflow-Tenant-Id'] = userStore.tenantId;
		}else{
			config.headers['Flyflow-Tenant-Id'] = 1;
		}
		return config;
	},
	(error: any) => {
		if(loadingFlag){
			loadingFlag.close();
			loadingFlag=undefined;
		}
		return Promise.reject(error);
	}
);

// 响应拦截器
service.interceptors.response.use(
	(response: AxiosResponse) => {

		let url = response.config.url || '';

		var matchUrl=false;

		//判断是否需要显示loading页面
		for(var murl of unloadingUrlList){
			if(url.indexOf(murl)>=0){
				matchUrl=true;
				break
			}
		}

		if(loadingFlag&&!matchUrl){
			loadingFlag.close();
			loadingFlag=undefined;

		}

		let data = response.data;


		const {code, msg, ok} = data;
		if (ok === true) {
			return data;
		}
		// 响应数据为二进制流处理(Excel导出)
		if (data instanceof ArrayBuffer) {
			return response;
		}

		// token 过期,重新登录
		if (code === 402) {
			const userStore = useUserStoreHook();
			userStore.resetToken()

			ElMessageBox.alert('当前页面已失效，请重新登录', '提示', {
				confirmButtonText: '确定',
				type: 'warning'
			}).then(() => {



				if(window.location.href.indexOf("login")<0){
					let href = window.location.href;
					let urlParamsToJSON: any = getUrlParamsToJSON(href);

					let idx1 = href.lastIndexOf("/#/")+2;
					let idx2 = href.lastIndexOf("?");
					if(idx2>=0){
						urlParamsToJSON.redirect=href.substring(idx1,idx2)

					}else{
						urlParamsToJSON.redirect=href.substring(idx1,href.length)

					}

					let s = encodeSearchParams(urlParamsToJSON);
					window.location.href="/#/login?"+s
				}


			});
		} else {
			ElMessage.error(msg || '系统出错');
		}


		return Promise.reject(new Error(msg || 'Error'));
	},
	(error: any) => {

		if(loadingFlag){
			loadingFlag.close();
			loadingFlag=undefined;

		}


		return Promise.reject(error.message);
	}
);

// 导出 axios 实例
export default service;
