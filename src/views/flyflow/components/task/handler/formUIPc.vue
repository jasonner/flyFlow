<script setup lang="ts">

import FormRender from "../../form/render/FormRender.vue";
import * as util from "../../../utils/objutil";
import $func from "../../../utils";
import {dynamicFormList} from '../../../api/form'


import {ref, defineExpose, watch, computed} from 'vue'
import {getRandomId, sameJson} from "../../../utils/objutil";


const formList = ref([])


const formUniqueId = ref();
const flowId = ref();
const processInstanceId = ref();
const taskId = ref();
const ccId = ref();
const nodeId = ref();
const loadSuccess = ref(false)
const containDynamic = ref(true)

function loadData(d, fid, nId, pId, tId, cId, cd, fValChange) {


	formUniqueId.value = util.getRandomId();
	formList.value = d;
	flowId.value = fid;
	nodeId.value = nId;
	processInstanceId.value = pId;
	taskId.value = tId;
	ccId.value = cId;
	containDynamic.value = cd;
}




const formRenderRef = ref()


//验证表单参数
const validate = (f) => {
	formRenderRef.value.handleFormRule(formList.value);
	formRenderRef.value.validate(function (valid) {

		f(valid, formValue.value)
	})
}


const formValue = computed(() => {

	let formValueObj = formRenderRef.value?.getFormValueObj(formList.value);
	return formValueObj;
})


function getFormValue() {
	let value = formValue.value;
	return value;
}


defineExpose({validate, loadData, getFormValue});
const emits = defineEmits(["formValueChange"]);

//判断是否触发表单变化
const triggerChange = ref(true)
//随机字符串
const randomId = ref('')
onMounted(() => {
	randomId.value = getRandomId();
})

///监控表单变化
watch(() => formValue.value, (v) => {


	$func.debounce(async () => {
		if (!triggerChange.value) {
			triggerChange.value = true;
			return;
		}

		if (!containDynamic.value) {
			loadSuccess.value = true

			emits('formValueChange', v)
			return
		}





	})()

})

</script>

<template>

	<el-form label-position="top">

		<form-render v-show="loadSuccess" v-if="formList&&formList.length>0"
								 ref="formRenderRef"
								 :form-list="formList"></form-render>

	</el-form>

</template>

<style scoped lang="less">

</style>
