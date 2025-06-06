<template>
	<div class="login-container">
		<el-form
				ref="loginFormRef"
				:model="loginData"
				:rules="loginRules"
				class="login-form"
		>
			<div class="flex text-white items-center py-4">
				<span class="text-2xl flex-1 text-center">{{ $t("login.title") }}</span>
				<!--				<lang-select class="text-white! cursor-pointer"/>-->
			</div>

			<el-form-item prop="phone">
				<div class="p-2 text-white">
					<svg-icon icon-class="user"/>
				</div>
				<el-input
						ref="phone"
						v-model="loginData.phone"
						class="flex-1"
						size="large"
						:placeholder="$t('login.phone')"
						name="phone"
				/>
			</el-form-item>

			<el-tooltip
					:disabled="isCapslock === false"
					content="Caps lock is On"
					placement="right"
			>
				<el-form-item prop="password">
          <span class="p-2 text-white">
            <svg-icon icon-class="password"/>
          </span>
					<el-input
							v-model="loginData.password"
							class="flex-1"
							placeholder="密码"
							:type="passwordVisible === false ? 'password' : 'input'"
							size="large"
							name="password"
							@keyup="checkCapslock"
							@keyup.enter="handleLogin"
					/>
					<span class="mr-2" @click="passwordVisible = !passwordVisible">
            <svg-icon
								:icon-class="passwordVisible === false ? 'eye' : 'eye-open'"
								class="text-white cursor-pointer"
						/>
          </span>
				</el-form-item>
			</el-tooltip>

			<!-- 租户 -->
			<el-form-item prop="tenantId">
  <span class="p-2 text-white">
            <svg-icon icon-class="guide"/>
          </span>
				<el-select class="flex-1" size="large" v-model="loginData.tenantId" placeholder="租户">
					<el-option
							v-for="item in tenantOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
					/>
				</el-select>
			</el-form-item>
			<!-- 验证码 -->
			<el-form-item prop="verifyCode" v-if="captcha==='true'">
        <span class="p-2 text-white">
          <svg-icon icon-class="verify_code"/>
        </span>
				<el-input
						v-model="loginData.verifyCode"
						auto-complete="off"
						:placeholder="$t('login.verifyCode')"
						class="w-[60%]"
						@keyup.enter="handleLogin"
				/>

				<div class="captcha">
					<img :src="captchaBase64" @click="getCaptcha"/>
				</div>
			</el-form-item>

			<el-button
					size="default"
					:loading="loading"
					type="primary"
					class="w-full"
					@click.prevent="handleLogin"
			>{{ $t("login.login") }}
			</el-button>

			<!-- 账号密码提示 -->
			<!--      <div class="mt-4 text-white text-sm">-->
			<!--        <span>{{ $t("login.phone") }}: admin</span>-->
			<!--        <span class="ml-4"> {{ $t("login.password") }}: 123456</span>-->
			<!--      </div>-->
		</el-form>
	</div>
</template>

<script setup lang="ts">
import router from "@/router";
import SvgIcon from "@/components/SvgIcon/index.vue";

//租户
const tenantOptions = [
	{
		value: '1',
		label: '租户1',
	},
	{
		value: '2',
		label: '租户2',
	},
	{
		value: '3',
		label: '租户3',
	}
]

// 状态管理依赖
import {useUserStore} from "@/views/flyflow/stores/user";

const userStore = useUserStore();

// API依赖
import {LocationQuery, LocationQueryValue, useRoute} from "vue-router";
import {getCaptchaApi} from "@/api/auth";
import {LoginData} from "@/api/auth/types";
import {getCurrentInstance} from "vue";
import {isBlank, isNotBlank} from "@/views/flyflow/utils/objutil";

const route = useRoute();

//是否显示验证码
const captcha = ref('false');
/**
 * 按钮loading
 */
const loading = ref(false);
/**
 * 是否大写锁定
 */
const isCapslock = ref(false);
/**
 * 密码是否可见
 */
const passwordVisible = ref(false);
/**
 * 验证码图片Base64字符串
 */
const captchaBase64 = ref();

/**
 * 登录表单引用
 */
const loginFormRef = ref(ElForm);

const loginData = ref<LoginData>({
	phone: "15584589856",
	password: "123456",
	tenantId: "1"
});

const loginRules = {
	phone: [{required: true, trigger: "blur"}],
	password: [{required: true, trigger: "blur", validator: passwordValidator}],
	verifyCode: [{required: true, trigger: "blur", message: '请输入验证码'}],
	tenantId: [{required: true, trigger: "blur", message: '请选择租户'}],
};

/**
 * 密码校验器
 */
function passwordValidator(rule: any, value: any, callback: any) {
	if (value.length < 6) {
		callback(new Error("The password can not be less than 6 digits"));
	} else {
		callback();
	}
}

/**
 * 检查输入大小写状态
 */
function checkCapslock(e: any) {
	const {key} = e;
	isCapslock.value = key && key.length === 1 && key >= "A" && key <= "Z";
}

/**
 * 获取验证码
 */
function getCaptcha() {
	getCaptchaApi().then(({data}) => {
		const {verifyCodeBase64, verifyCodeKey} = data;
		loginData.value.verifyCodeKey = verifyCodeKey;
		captchaBase64.value = verifyCodeBase64;
	});
}

const {proxy} = getCurrentInstance();

onMounted(() => {
	const query: LocationQuery = route.query;

	captcha.value = (query.captcha as LocationQueryValue) ?? 'true';
	const redirect = (query.redirect as LocationQueryValue) ?? "/";
	var token = (query.token as LocationQueryValue) ?? "";
	const authCode = (query.authCode as LocationQueryValue) ?? "";

	if(captcha.value==='true'){
		getCaptcha();
	}

	if (isBlank(token)) {
		token = authCode;
	}


	if (isNotBlank(token)) {


		loading.value = true;
		userStore
				.loginByToken(token)
				.then(() => {


					const otherQueryParams = Object.keys(query).reduce(
							(acc: any, cur: string) => {
								if (cur !== "redirect") {
									acc[cur] = query[cur];
								}
								return acc;
							},
							{}
					);


					router.push({path: redirect, query: otherQueryParams});
				})
				.catch(() => {
					// 验证失败，重新生成验证码
					if(captcha.value==='true'){
						getCaptcha();
					}
				})
				.finally(() => {
					loading.value = false;
				});
	}

})

/**
 * 登录
 */
function handleLogin() {
	loginFormRef.value.validate((valid: boolean) => {
		if (valid) {
			loading.value = true;
			userStore
					.login(loginData.value)
					.then(() => {
						const query: LocationQuery = route.query;

						const redirect = (query.redirect as LocationQueryValue) ?? "/";

						const otherQueryParams = Object.keys(query).reduce(
								(acc: any, cur: string) => {
									if (cur !== "redirect") {
										acc[cur] = query[cur];
									}
									return acc;
								},
								{}
						);


						router.push({path: redirect, query: otherQueryParams});
					})
					.catch(() => {
						// 验证失败，重新生成验证码
						if(captcha.value==='true'){
							getCaptcha();
						}
					})
					.finally(() => {
						loading.value = false;
					});
		}
	});
}


</script>

<style lang="scss" scoped>
.login-container {
	width: 100%;
	min-height: 100%;
	overflow: hidden;
	background-color: #2d3a4b;
	background-image: url("@/assets/bg.svg");
	background-size: 100vw 100vh;


	.login-form {
		width: 520px;
		max-width: 100%;
		padding: 160px 35px 0;
		margin: 0 auto;
		overflow: hidden;

		.captcha {
			position: absolute;
			top: 0;
			right: 0;

			img {
				width: 120px;
				height: 48px;
				cursor: pointer;
			}
		}
	}
}

.el-form-item {
	background: rgb(0 0 0 / 10%);
	border: 1px solid rgb(255 255 255 / 10%);
	border-radius: 5px;
}

.el-select {

	background: transparent;

	// 子组件 scoped 无效，使用 :deep
	:deep(.el-input__wrapper) {
		padding: 0;
		background: transparent;
		box-shadow: none;

		.el-input__inner {
			color: #fff;
			background: transparent;
			border: 0;
			border-radius: 0;
			caret-color: #fff;

			&:-webkit-autofill {
				box-shadow: 0 0 0 1000px transparent inset !important;
				-webkit-text-fill-color: #fff !important;
			}

			// 设置输入框自动填充的延迟属性
			&:-webkit-autofill,
			&:-webkit-autofill:hover,
			&:-webkit-autofill:focus,
			&:-webkit-autofill:active {
				transition: color 99999s ease-out, background-color 99999s ease-out;
				transition-delay: 99999s;
			}
		}
	}

}

.el-input {
	background: transparent;

	// 子组件 scoped 无效，使用 :deep
	:deep(.el-input__wrapper) {
		padding: 0;
		background: transparent;
		box-shadow: none;

		.el-input__inner {
			color: #fff;
			background: transparent;
			border: 0;
			border-radius: 0;
			caret-color: #fff;

			&:-webkit-autofill {
				box-shadow: 0 0 0 1000px transparent inset !important;
				-webkit-text-fill-color: #fff !important;
			}

			// 设置输入框自动填充的延迟属性
			&:-webkit-autofill,
			&:-webkit-autofill:hover,
			&:-webkit-autofill:focus,
			&:-webkit-autofill:active {
				transition: color 99999s ease-out, background-color 99999s ease-out;
				transition-delay: 99999s;
			}
		}
	}
}
</style>
