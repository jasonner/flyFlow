<script setup lang="ts">
import FormRender from "../../components/form/render/FormRender.vue";

import FlowNodeFormat from "../../components/flow/FlowNodeFormatData.vue";
import pagination from "../../components/pagination.vue";


import {
	queryMineCC
} from "../../api/processInstance";

import {RoleQuery} from "../../api/role/types";
import TaskHandle from "../../components/task/handler/task.vue";
import {ref,reactive,computed ,onMounted} from 'vue'
import {DocumentCopy, Picture, Position} from "@element-plus/icons-vue";
import {copyToBoard} from "../../utils/objutil";

const rightDrawerVisible = ref(false)

const loading = ref(false);
const total = ref(0);

const queryParams = reactive<RoleQuery>({
	pageNum: 1,
	pageSize: 10,
});

const roleList = ref();


const currentData = ref();

const taskHandler = ref();
//流程编码的表格宽度
const processInstanceBizCodeWidth = ref(200);

/**
 * 点击开始处理
 * @param row
 */
const deal = (row) => {

	currentData.value = row;
  taskHandler.value.deal({
    ccId:row.id,
    flowId:row.flowId,
    processInstanceId:row.processInstanceId
  })


}
const currentDetailData = ref();




/**
 * 查询
 */
function handleQuery() {
	loading.value = true;
	queryMineCC(queryParams)
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

const taskSubmitEvent=()=>{
	rightDrawerVisible.value=false;
	handleQuery();
}

const copy=(value)=>{
  copyToBoard(value)
}

onMounted(() => {
	handleQuery();
});

const formValue = computed(() => {
	var obj = {}

	for (var item of currentDetailData.value.formItems) {
		obj[item.id] = item.props.value
	}
	return obj;
})

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
				<el-table-column label="发起人" prop="startUserName" width="150"/>
				<el-table-column label="发起时间" prop="startTime" width="180"/>
				<el-table-column label="节点" prop="nodeName" width="200"/>
				<el-table-column label="抄送时间" prop="nodeTime" width="180"/>


				<el-table-column width="100" fixed="right" label="操作">
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
		<!--			右侧抽屉-->
		<el-drawer v-model="rightDrawerVisible" direction="rtl" size="400px">
		<template #header>
			<el-text size="large" tag="b" type="info">流程详情</el-text>
		</template>
			<template #default>
		  <el-card style="margin-bottom: 20px">

		  <div style="position: relative">

			  <div style="display: flex;flex-direction: row">
				  <div class="f11">
					  <el-avatar shape="square" :size="50" :src="currentDetailData.starterAvatarUrl" >{{currentDetailData.starterName.substring(0,1)}}</el-avatar>
				  </div>
				  <div class="f22">
					  <div><el-text tag="b" size="large" type="primary">{{ currentDetailData?.processName }}</el-text> </div>
					  <div><el-text size="small">{{ currentDetailData.startTime }}</el-text></div>
				  </div>
			  </div>
		  <img v-if="currentDetailData.processInstanceResult==1" class="iconclass" src="../../assets/images/pass.png"/>
		  <img v-if="currentDetailData.processInstanceResult==2" class="iconclass" src="../../assets/images/refuse.png"/>
		  <img v-if="currentDetailData.processInstanceResult==3" class="iconclass" src="../../assets/images/canceled.png"/>
	  </div>
		  </el-card>


				<el-card class="box-card">
					<form-render ref="formRenderRef" :form-list="currentDetailData.formItems"></form-render>

				</el-card>
				<flow-node-format :disableSelect="true" :formData="formValue" :processInstanceId="currentData.processInstanceId"  :flow-id="currentData.flowId"
								  ref="flowNodeFormatRef"></flow-node-format>


			</template>

		</el-drawer>
    <task-handle ref="taskHandler"  @taskSubmitEvent="handleQuery" ></task-handle>


	</div>
</template>
<style scoped>
.iconclass {
	width: 64px;
	height: 64px;
	position: absolute;
	top: 0px;
	right: 10px;
}
.f11{
	width: 70px;
}
.f22{
	width: calc(100% - 70px);
}
</style>
