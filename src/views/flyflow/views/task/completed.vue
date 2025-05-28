<script setup lang="ts">

import {ref,reactive,onMounted} from 'vue'

import {
	queryMineEndTask
} from "../../api/task";


import {RoleQuery} from "../../api/role/types";
import TaskHandle from "../../components/task/handler/task.vue";

import pagination from "../../components/pagination.vue";

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<RoleQuery>({
	pageNum: 1,
	pageSize: 10,
});

import {Picture, Position, DocumentCopy,RefreshLeft} from "@element-plus/icons-vue";
import {copyToBoard} from "../../utils/objutil";


const roleList = ref();


const taskHandler = ref();
/**
 * 点击开始处理
 * @param row
 */
const deal = (row) => {

	taskHandler.value.deal(row)


}


//流程编码表格宽度
const processInstanceBizCodeWidth=ref(200);
/**
 * 查询
 */
function handleQuery() {
	loading.value = true;
	queryMineEndTask(queryParams)
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


onMounted(() => {
	handleQuery();
});


const copy =  (value) => {

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
				<el-table-column label="任务名称" prop="taskName" width="200"/>
				<el-table-column label="任务开始时间" prop="taskCreateTime" width="180"/>
				<el-table-column label="任务结束时间" prop="taskEndTime" width="180"/>


				<el-table-column fixed="right" label="操作" width="100">
					<template #default="scope">
						<el-button
								type="primary"
								size="small"
								link
								@click="deal(scope.row)"
						>
              <el-icon ><Position/></el-icon>

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

		<task-handle ref="taskHandler"></task-handle>



	</div>
</template>
