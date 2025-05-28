import request from '@/views/flyflow/utils/request';
import { AxiosPromise } from 'axios';
import { CaptchaResult, LoginData, LoginResult } from './types';

/**
 * 登录API
 *
 * @param data {LoginData}
 * @returns
 */
export function loginApi(data: LoginData): AxiosPromise<LoginResult> {
  return request({
    url: '/login/login',
    method: 'post',
    data: data
  });
}

export function loginByTokenApi(token: string): AxiosPromise<LoginResult> {
  return request({
    url: '/login/loginByToken?token='+token,
    method: 'get'
  });
}

/**
 * 注销API
 */
export function logoutApi() {
  return request({
    url: '/login/logout',
    method: 'post'
  });
}



/**
 * 获取验证码
 */
export function getCaptchaApi(): AxiosPromise<CaptchaResult> {
  return request({
    url: '/login/captcha',
    method: 'get'
  });
}

/**
 * 获取登录地址
 */
export function getLoginUrl(): AxiosPromise<CaptchaResult> {
  return request({
    url: '/login/getLoginUrl',
    method: 'get'
  });
}


/**
 * 获取登录参数
 */
export function getLoginParam(d): AxiosPromise<CaptchaResult> {
  return request({
    url: '/login/getLoginParam',
    method: 'post',
	  data:d
  });
}
