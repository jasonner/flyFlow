<template>
	<div>
		<div class="container-div">
			<el-card class="box-card" style="padding-right: 10%; padding-left: 10%;margin-top: 20px">
				<el-form
						ref="ruleForm"
						:model="form"
						:rules="rules"
						label-position="top"
						status-icon
						label-width="120px"
						@submit.prevent
				>
					<el-form-item label="图标" prop="logo">
						<single-upload v-model="form.logo"/>
					</el-form-item>
					<el-form-item label="名称" prop="name">
						<el-input maxlength="20" v-model="form.name"/>
					</el-form-item>
					<el-form-item label="说明" prop="remark">
						<el-input maxlength="40" v-model="form.remark"/>
					</el-form-item>
					<el-form-item label="流程id" prop="uniqueId" >
						<el-input disabled placeholder="流程唯一值，根据通过该字段发起流程" maxlength="40" v-model="form.uniqueId">
							<template #append>
								<el-button @click="copyUniqueId" :icon="DocumentCopy" />
							</template>
						</el-input>
					</el-form-item>
					<el-form-item label="分组" prop="groupId">
						<el-select style="width: 100%;" v-model="form.groupId" placeholder="请选择流程组">
							<el-option
									v-for="item in groupList"
									:key="item.id+''"
									:label="item.groupName"
									:value="item.id+''"
							/>
						</el-select>
					</el-form-item>
					<el-form-item label="谁可以发起该流程（默认全员）" prop="rangeList">

			  <select-show
						    v-model:orgList="form.rangeList" type="org" :disable-select-children-dept="false" :multiple="true"></select-show>

					</el-form-item>

					<el-form-item label="管理员" prop="admin">

			  <select-show
						    v-model:orgList="form.admin" type="user" :multiple="false"></select-show>

					</el-form-item>
				</el-form>
			</el-card>
		</div>

	</div>
</template>

<script lang="ts" setup>
import {ref, onMounted,computed,watch,reactive} from "vue";

import {queryGroupList} from "../../api/group";
import SingleUpload from "../Upload/SingleUpload.vue";

import type {FormInstance, FormRules} from "element-plus";
import selectShow from "../orgselect/selectAndShow.vue";



import {GroupVO} from "../../api/group/types";


import {useFlowStore} from "../../stores/flow";
import {DocumentCopy,FirstAidKit} from "@element-plus/icons-vue";
import {copyToBoard, getRandomId, isBlank} from "../../utils/objutil";



const ruleForm=ref();

const validate = (f) => {
	 ruleForm.value.validate((valid, fields) => {
		var arr = [];
		if (!valid) {
			for (var err in fields) {
				arr.push(fields[err][0].message)
			}
		}


		f(valid, arr);
	});
};

// 暴露方法和属性给父组件
defineExpose({validate});
const rules = reactive<FormRules>({
	name: [
		{required: true, message: "请填写名称", trigger: "blur"},
		{min: 2, max: 20, message: "流程名称：2-20个字符", trigger: "blur"},
	],
	uniqueId: [
		{required: true, message: "请填写流程id", trigger: "blur"},
		{min: 10, max: 50, message: "流程id：10-50个字符", trigger: "blur"},
	],
	remark: [
		{required: false, message: "请填写描述", trigger: "blur"},
		{min: 2, max: 40, message: "描述：2-40个字符", trigger: "blur"},
	],
	groupId: [
		{
			required: true,
			message: "请选择分组",
			trigger: "change",
		},
	],
	logo: [
		{
			required: true,
			message: "请上传图标",
			trigger: "change",
		},
	],
	admin: [
		{
			required: true,
			message: "请选择管理员",
			trigger: "change",
		},
	],
});




const groupList = ref<GroupVO[]>([]);

onMounted(() => {
	queryGroupList().then(({data}) => {
		groupList.value = data;
	});
});



let props = defineProps({
	groupId: {
		type: String,
		default: undefined,
	},


});

watch(() => props.groupId, (val) => {
	if (!!val) {
		form.value.groupId = (val);
	}

})

let flowStore = useFlowStore();

var form = computed(() => {
	return flowStore.step1;
});
//复制唯一id
function copyUniqueId(){
	copyToBoard(form.value.uniqueId)
}
//生成新的唯一id
function produceNewUniqueId(){
	form.value.uniqueId=getRandomId();
}

</script>
<style scoped lang="less">
.container-div {
	width: 800px;
 	margin-left: calc(50% - 400px);
	text-align: center
}

</style>
