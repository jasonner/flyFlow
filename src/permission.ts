import router from "@/router";
import {useUserStoreHook} from "@/views/flyflow/stores/user";
import {usePermissionStoreHook} from "@/store/modules/permission";

import NProgress from "nprogress";
import "nprogress/nprogress.css";
import {isFeishu, isWxCp} from "./views/flyflow/utils/appversion";

NProgress.configure({showSpinner: false}); // 进度条

const permissionStore = usePermissionStoreHook();

// 白名单路由
const whiteList = ["/login", "/aplogin", "/ddlogin", "/wxcplogin", "/fslogin"];

router.beforeEach(async (to, from, next) => {
	NProgress.start();
	console.log("to.path", to);
	
	const hasToken = localStorage.getItem("accessToken");
	if (to.path.indexOf("/redirectlogin")>=0) {
		next();
	} else if (hasToken) {
		if (whiteList.indexOf(to.path) !== -1) {
			// 如果已登录，跳转首页
			//如果是企微里 有token了  也要重新登录下 、
			if(isWxCp()||isFeishu()){
				next();
			}
			// else if(to.path.indexOf("/login")>=0){
			// 	console.log(111);
			// 	next({path: '/login'});
			// } 
			else {
				next();
			}

			NProgress.done();
		} else {

			const userStore = useUserStoreHook();
			const hasRoles = userStore.roles && userStore.roles.length > 0;
			if (hasRoles) {
				// 未匹配到任何路由，跳转404
				if (to.matched.length === 0) {
					from.name ? next({name: from.name}) : next("/404");
				} else {

					next();


				}
			} else {
				try {
					const {roles} = await userStore.getInfo();
					const accessRoutes = await permissionStore.generateRoutes(roles);
					accessRoutes.forEach((route) => {
						router.addRoute(route);
					});
					next({...to, replace: true});
				} catch (error) {
					// 移除 token 并跳转登录页
					await userStore.resetToken();
					next(`/login?redirect=${to.path}`);
					NProgress.done();
				}
			}
		}
	} else {
		// 未登录可以访问白名单页面
		if (whiteList.indexOf(to.path) !== -1) {
			next();
		} else {
			next(`/login?redirect=${to.path}`);
			NProgress.done();
		}
	}
});

router.afterEach(() => {
	NProgress.done();
});
