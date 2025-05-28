import request from '@/views/flyflow/utils/request';
import { AxiosPromise } from 'axios';
import http from "@/views/flow/workflow/utils/axios";


/**
 * 获取未读数量
 */
export function getMessageUnreadNum() {
	return request({
		url: '/message/unreadNum',
		method: 'get'
	});
}

/**
 * 查询消息列表
 */
export function queryMessageList(p) {
	return request({
		url: '/message/queryList',
		method: 'post',
		data:p
	});
}
/**
 * 删除消息
 */
export function deleteMsg(id) {
	return request({
		url: '/message/delete',
		method: 'delete',
		data:{id:id}
	});
}

/**
 * 消息已读
 */
export function readMsg(id) {
	return request({
		url: '/message/read',
		method: 'post',
		data:{id:id}
	});
}

