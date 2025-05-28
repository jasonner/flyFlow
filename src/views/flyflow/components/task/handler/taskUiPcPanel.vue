<script setup lang="ts">

import FlowNodeFormat from "../../flow/FlowNodeFormatData.vue";

import FormUI from "./formUIPc.vue";


import HeaderUI from "../show/header.vue";

import OperUI from "../show/oper.vue";
import {
  queryHeaderShow
} from "../../../api/base";


import {getFormDetail} from '../../../api/form'


const rightDrawerVisible = ref(false)
const headerUIRef = ref();


/**
 * 点击开始处理
 */
const deal = (tId, pId, fId, ccId, nId) => {

  taskId.value = tId
  flowId.value = fId
  processInstanceId.value = pId
  copyId.value = ccId


  //////////////////////////////////////////////////////////////////



  queryHeaderShow({
    processInstanceId: pId,
    taskId: tId,
    flowId: fId,
    ccId: ccId
  }).then(res => {
    headerUIRef.value.loadData(res.data);


  });


	getFormDetail({
    flowId: fId,
    processInstanceId: pId,
    taskId: tId,
    ccId: ccId
  }, true).then(res => {
    let data = res.data;


		startUserDeptList.value=data.startUserDeptList

		selectStartDept.value=data.selectStartDept;
		if(data.selectStartDept){//是否发起人需要选择部门
			startUserMainDeptId.value=data.startUserDeptList[0].id
		}

    formUIRef.value.loadData(data.formList, fId, nId, pId, tId, ccId,data.dynamic,data.formChangeRecord)

    operUIRef.value.handle(tId);
  })

  rightDrawerVisible.value = true;


  // }


}


import {ref,onMounted } from "vue";
import * as util from "../../../utils/objutil";


defineExpose({deal});

const taskSubmitEvent = () => {
  rightDrawerVisible.value = false;

  emit('taskSubmitEvent')
}

//验证表单
function validateForm(op,f) {

  let validate = flowNodeFormatRef.value.validate(op);
  if (!validate) {
    f(false)
    return
  }
  let param = flowNodeFormatRef.value.formatSelectNodeUser();


  formUIRef.value.validate(function (a, b) {

    if (param) {
      f(a, {...b, ...param});

    } else {
      f(a, b);

    }
  })
}

const formUIRef = ref();

onMounted(() => {

});
const emit = defineEmits(["taskSubmitEvent"]);




const formValueChange = (v) => {
	v['startUserMainDeptId']=startUserMainDeptId.value;


  flowNodeFormatRef.value.queryData(v, flowId.value, processInstanceId.value, taskId.value)

}
const flowNodeFormatRef = ref();
const operUIRef = ref();
const flowId = ref('');
const taskId = ref('');
const copyId = ref();

const processInstanceId = ref('');





//发起人的部门
const startUserDeptList = ref([]);
import {Delete, Edit, Search, Share, Upload} from '@element-plus/icons-vue'


//发起的主部门id
const startUserMainDeptId=ref();
//是否需要选择发起人部门
const selectStartDept=ref(false);
//发起人主部门id变化了
function startUserMainDeptChangeEvent(e){
	let formValue = formUIRef.value.getFormValue();


	formValue['startUserMainDeptId']=e;
	flowNodeFormatRef.value.queryData(formValue, flowId.value, processInstanceId.value, taskId.value,'start')
}

</script>

<template>
  <div>

		<div v-if="rightDrawerVisible" width="1200px">
			<!-- <template #header="{ close, titleId, titleClass }">
				
			</template> -->
			<el-card style="margin-bottom: 20px">
				<header-u-i ref="headerUIRef"></header-u-i>
			</el-card>
    <!--			右侧抽屉-->

			<el-row>
				<el-col v-show="false" :span="16">
					<el-scrollbar  style="padding-right: 0px;height: calc(100vh - 180px)">

					<div style="height: calc(100vh - 180px)">

						<template v-if="selectStartDept&&startUserDeptList.length>1">

							<h4>请选择您当前所在部门</h4>
							<el-select @change="startUserMainDeptChangeEvent" v-model="startUserMainDeptId" placeholder="请选择您当前所在部门" style="width: 100%">
								<el-option
										v-for="item in startUserDeptList"
										:key="item.id"
										:label="item.name"
										:value="item.id"
								/>
							</el-select>

							<el-divider></el-divider>
						</template>

						<form-u-i
								@formValueChange="formValueChange" ref="formUIRef"></form-u-i>

					</div>

					</el-scrollbar>

					<div style="display: flex;justify-content: space-between;padding-top: 10px;background-color: white;">

						<div>
							<oper-u-i ref="operUIRef" @taskSubmitEvent="taskSubmitEvent" @validateForm="validateForm" :flow-id="flowId"
												:task-id="taskId"
												:process-instance-id="processInstanceId"></oper-u-i>
						</div>
					</div>
				</el-col>
				<el-col :span="24">
					<el-scrollbar  style="height: calc(100vh - 180px)">

					<flow-node-format
							ref="flowNodeFormatRef"></flow-node-format>
					</el-scrollbar>
					<div style="display: flex;justify-content: space-between;padding-top: 10px;background-color: white;">

						<div>
							<oper-u-i ref="operUIRef" @taskSubmitEvent="taskSubmitEvent" @validateForm="validateForm" :flow-id="flowId"
												:task-id="taskId"
												:process-instance-id="processInstanceId"></oper-u-i>
						</div>
					</div>
				</el-col>
			</el-row>




		</div>

  </div>
</template>
<style scoped lang="less">

</style>
