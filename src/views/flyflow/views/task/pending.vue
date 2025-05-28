<script setup lang="ts">

import TaskHandle from "../../components/task/handler/task.vue"

import {ref, reactive, onMounted} from 'vue'

import {
	getTask,
	queryMineTask
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
const deal = (row) => {



	getTask(row.taskId).then(res=>{
		var d={
			taskId:row.taskId,
			processInstanceId:row.processInstanceId,
			flowId:row.flowId
		}


			taskHandler.value.deal(d)




	})



}


const toDetail = (row) => {
	const params = row.paramMap;
	const host = window.location.host.indexOf('localhost') > -1 || window.location.host == '39.106.136.185'? 'http://39.106.136.185' : `https://${window.location.host}`
	window.open(`${host}/settlement/pre_declaration/detail?id=${params['flyflow_347525604053']}&permission=inspect&role=`);
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


onMounted(() => {
	handleQuery();

	const query: LocationQuery = route.query;


	if(isNotBlank(query.taskId)){
				//跳转过来的
		deal({taskId:query.taskId})
	}

});
</script>

<template>
	<div class="app-container">

		<el-card shadow="never">


			<el-table
					ref="dataTableRef"
					v-loading="loading"
					:data="roleList"
					highlight-current-row
					border
			>
				<el-table-column label="分组" prop="groupName" min-width="100"/>
				<el-table-column label="流程" prop="processName" min-width="200"/>
        <el-table-column label="编码" prop="processInstanceBizCode" :width="processInstanceBizCodeWidth">
          <template #default="scope">
            <el-text>
              <el-icon @click="copy(scope.row.processInstanceBizCode)">
                <DocumentCopy />
              </el-icon>
              {{scope.row.processInstanceBizCode}}
            </el-text>
          </template>
        </el-table-column>
				<el-table-column label="发起人" prop="rootUserName" width="150"/>
				<el-table-column label="发起时间" prop="startTime" width="180"/>
				<el-table-column label="当前节点" prop="taskName" width="150"/>
				<el-table-column label="任务时间" prop="taskCreateTime" width="180"/>


				<el-table-column fixed="right" width="150" label="操作">
					<template #default="scope">
						<el-button
								type="primary"
								size="small"
								link
								@click="deal(scope.row)"
						>
							<el-icon>
								<Position/>
							</el-icon>
							开始处理
						</el-button>
						<el-button
							type="primary"
							size="small"
							link
							@click="toDetail(scope.row)"
						>
							<el-icon>
								<!-- <Position/> -->
							</el-icon>
							详情
						</el-button>
					</template>
				</el-table-column>
			</el-table>

			<pagination
					v-if="total > 0"
					v-model:total="total"
					v-model:page="queryParams.pageNum"
					v-model:limit="queryParams.pageSize"
					@pagination="handleQuery"
			/>
		</el-card>
		<task-handle ref="taskHandler" @taskSubmitEvent="handleQuery"></task-handle>


	</div>
</template>
