<script setup lang="ts">
import {ref, reactive, onMounted} from 'vue'

import {
	queryMineStarted
} from "../../api/task";
import {
	stopProcessInstance
} from "../../api/processInstance";


import pagination from "../../components/pagination.vue";

function stop({processInstanceId}) {
	stopProcessInstance(
			processInstanceId
	).then(res => {
		handleQuery();
	})
}


import {RoleQuery} from "../../api/role/types";
import TaskHandle from "../../components/task/handler/task.vue";
import {copyToBoard, isBlank} from "../../utils/objutil";


const loading = ref(false);
const total = ref(0);

const queryParams = reactive<RoleQuery>({
	pageNum: 1,
	pageSize: 10,
});

const roleList = ref();


const currentData = ref();
/**
 * 点击开始处理
 * @param row
 */
const deal = (row) => {


	currentData.value = row;

	taskHandler.value.deal(row)


}






/**
 * 查询
 */
function handleQuery() {
	loading.value = true;
	queryMineStarted(queryParams)
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


const taskHandler = ref();
onMounted(() => {
	handleQuery();
});


import {Bell, Lock, Picture, Position, Refresh, DocumentCopy, Share} from "@element-plus/icons-vue";

//流程编码的表格宽度
const processInstanceBizCodeWidth = ref(200);
const copy = (value) => {

	copyToBoard(value);


};

const toDetail = (row) => {
	const params = row.paramMap;
	const host = window.location.host.indexOf('localhost') > -1 || window.location.host == '39.106.136.185'? 'http://39.106.136.185' : `https://${window.location.host}`
	window.open(`${host}/settlement/pre_declaration/detail?id=${params['flyflow_347525604053']}&permission=inspect&role=`);
}


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
				<el-table-column label="流程" prop="name" min-width="200"/>
				<el-table-column label="编码" prop="processInstanceBizCode" :width="processInstanceBizCodeWidth">
					<template #default="scope">
						<el-text>
							<el-icon @click="copy(scope.row.processInstanceBizCode)">
								<DocumentCopy/>
							</el-icon>
							{{ scope.row.processInstanceBizCode }}
						</el-text>
					</template>
				</el-table-column>

				<el-table-column label="发起时间" prop="createTime" width="180"/>
				<el-table-column label="结束时间" prop="endTime" width="180"/>
				<el-table-column label="状态" prop="taskCreateTime" width="100">
					<template #default="scope">
						<el-tag v-if="scope.row.status == 1" type="success">进行中</el-tag>
						<el-tag v-else-if="scope.row.status == 3" type="danger">已撤销</el-tag>
						<el-tag v-else>已结束</el-tag>

					</template>
				</el-table-column>
				<el-table-column label="审批结果" prop="taskCreateTime" width="100">
					<template #default="scope">
						<el-tag v-if="scope.row.result == 1" type="success">同意</el-tag>
						<el-tag v-else-if="scope.row.result == 2" type="danger">拒绝</el-tag>
						<el-tag v-else-if="scope.row.result == 3" type="warning">撤销</el-tag>


					</template>
				</el-table-column>


				<el-table-column width="140" fixed="right" label="操作">
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

							查看
						</el-button>
						<!-- <el-button
							type="primary"
							size="small"
							link
							@click="toDetail(scope.row)"
						>
							<el-icon>
							</el-icon>
							详情
						</el-button> -->



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

		<!--			查看流程图-->
		<view-process-instance-image ref="viewImageRef"/>

	</div>
</template>
<style scoped>
.f11 {
	width: 70px;
}

.f22 {
	width: calc(100% - 70px);
}

.iconclass {
	width: 80px;
	height: 64px;
	position: absolute;
	top: 0px;
	right: 10px;
}
</style>
