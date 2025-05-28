<script setup lang="ts">

import TaskHandle from "../../components/task/handler/task.vue"

import {ref, reactive, onMounted} from 'vue'

import {
	getTask,
	queryMineTask,
	queryDetailByProcessInstanceId,
	queryAssignTask
} from "../../api/task";


import pagination from "../../components/pagination.vue";
import {Picture,DocumentCopy, Position} from "@element-plus/icons-vue";
import {copyToBoard, isNotBlank} from "../../utils/objutil";


const loading = ref(false);
const total = ref(0);




const copy =  (value) => {

  copyToBoard(value);


};

const queryParams = reactive({
	pageNum: 1,
	pageSize: 10,
});

const roleList = ref();


const taskHandler = ref();
/**
 * 点击开始处理
 * @param row
 */
const deal = async (row) => {

	const {data: { records } } = await queryMineTask({
		pageNum: 1,
		pageSize: 10,
		processInstanceId: row.taskId
	})
	const {data } = await queryDetailByProcessInstanceId(row.taskId)
	if (!data) {
		console.log("没有待办任务");
		return
	}
	var d={
			taskId: records[0]?.taskId,
			processInstanceId: data.processInstanceId,
			flowId: data.flowId
		}
			taskHandler.value.deal(d)
	// getTask(data.taskId).then(res=>{
	// 	var d={
	// 		taskId:data.taskId,
	// 		processInstanceId:data.processInstanceId,
	// 		flowId:data.flowId
	// 	}


	// 		taskHandler.value.deal(d)




	// })



}




//流程编码的表格宽度
const processInstanceBizCodeWidth = ref(200);



/**
 * 查询
 */
function handleQuery() {
	loading.value = true;
	queryMineTask(queryParams)
			.then(({data}) => {
				for (var itm of data.records) {
					let number = itm.processInstanceBizCode?.length * 12;
					if (number > processInstanceBizCodeWidth.value) {
						processInstanceBizCodeWidth.value = number;
					}
				}
				roleList.value = data.records;
				total.value = data.total;
			})
			.finally(() => {
				loading.value = false;
			});
}
import {LocationQuery, LocationQueryValue, useRoute,useRouter} from "vue-router";


const route = useRoute();

const refresh = () => {
	const query: LocationQuery = route.query;
	if(isNotBlank(query.taskId)){
				//跳转过来的
		deal({taskId:query.taskId})
	}
}

onMounted(() => {

	refresh()

});

</script>

<template>
	<!-- <div class="detail-container">
		


	</div> -->
	<task-handle ref="taskHandler" :isPanel="true" @taskSubmitEvent="refresh"></task-handle>
</template>
<style>
.detail-container {
	width: 100%;
	height: 100%;
}
</style>
