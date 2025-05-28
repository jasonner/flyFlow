<script setup lang="ts">

import FlowNodeFormat from "./FlowNodeFormatData.vue";
import {ref} from "vue";
import {DocumentAdd, Promotion,Close,Select} from "@element-plus/icons-vue";


import FormUI from '../task/handler/formUIPc.vue'
import {getFormDetail} from "../../api/form";
import * as util from "../../utils/objutil";

const dialogTableVisible = ref<Boolean>(false);
const formUIRef = ref();
const loading=ref(false)
const submitProcess = () => {
	loading.value=true;

	let validate = flowNodeFormatRef.value.validate('pass');
	loading.value=validate;

	if (!validate) {

		return;
	}

	let param = flowNodeFormatRef.value.formatSelectNodeUser();


	formUIRef.value.validate(function (valid, fv) {

		if (valid) {
			var data = {
				flowId: flowId.value,
				uniqueId: uniqueId.value,
				paramMap: {...param, ...fv}
			}
			emit('complete', data);
			loading.value=false;

		}else{
			loading.value=false;

		}
	})


}
const emit = defineEmits(["complete"])

const complete = () => {
	dialogTableVisible.value = false
}
const flowId = ref('');
const uniqueId = ref('');
const taskId = ref('');
const processInstanceId = ref('');
//发起人的部门
const startUserDeptList = ref([]);
const handle = (fId, tId, pId,uniId) => {


	uniqueId.value = uniId
	flowId.value = fId
	taskId.value = tId
	processInstanceId.value = pId

	getFormDetail({
		flowId: fId,
		processInstanceId: pId,
		taskId: tId,
		from: 'start'
	}, true).then(res => {
		let data = res.data;
		formUIRef.value.loadData(data.formList, flowId.value, undefined,undefined,undefined,undefined,data.dynamic)
		startUserDeptList.value=data.startUserDeptList
		startUserMainDeptId.value=data.startUserDeptList[0].id
	})

	dialogTableVisible.value = true

}

defineExpose({handle, complete});


const formValueChange = (v) => {

	v['startUserMainDeptId']=startUserMainDeptId.value;
	flowNodeFormatRef.value.queryData(v, flowId.value, processInstanceId.value, taskId.value,'start')

}

//发起的主部门id
const startUserMainDeptId=ref();
//发起人主部门id变化了
function startUserMainDeptChangeEvent(e){
	let formValue = formUIRef.value.getFormValue();


	formValue['startUserMainDeptId']=e;
	flowNodeFormatRef.value.queryData(formValue, flowId.value, processInstanceId.value, taskId.value,'start')
}


const flowNodeFormatRef = ref();


</script>

<template>
	<div>
		<el-dialog v-model="dialogTableVisible" title="发起流程" width="1200px" destroy-on-close>
			<el-row :gutter="10">
				<el-col :span="16">
					<el-scrollbar  style="padding-right: 0px;height: 55vh">

						<div style="height: 50vh;">

							<template v-if="startUserDeptList.length>1">

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

              <form-u-i @formValueChange="formValueChange" ref="formUIRef"></form-u-i>

						</div>

            </el-scrollbar>


          <div style="text-align: center;margin-top: 10px;">
            <el-button :icon="Close" type="danger" @click="dialogTableVisible = false">取消</el-button>
            <el-button :icon="Select" :loading="loading" type="primary" @click="submitProcess">
              提交
            </el-button>
          </div>
				</el-col>
				<el-col :span="8">
          <el-scrollbar height="60vh">
					<flow-node-format
							ref="flowNodeFormatRef"></flow-node-format>
          </el-scrollbar>
				</el-col>
			</el-row>

		</el-dialog>

	</div>
</template>

<style scoped lang="less">

</style>
