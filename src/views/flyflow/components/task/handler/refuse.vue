<script setup lang="ts">

import {ref} from 'vue'
import {completeTask} from "../../../api/task";

const dialogVisible = ref(false);


const formValue = ref();
const  dialogTitle=ref("");
const processInstanceId = ref("");
const taskId = ref("");
const needSignature = ref(false);

const handle = (pid, tid, formData,dialogTitle1,needSignature1) => {
	dialogTitle.value=dialogTitle1;
	needSignature.value = needSignature1;

	processInstanceId.value = pid
	taskId.value = tid

	formValue.value = formData;

	dialogVisible.value = true;
}

defineExpose({handle});
const emit = defineEmits(["taskSubmitEvent"]);

const loading=ref(false)

const submit = () => {
	loading.value=true;


	var param = {
		paramMap: formValue.value,
		approveResult:false,
		processInstanceId:processInstanceId.value,
		taskId: taskId.value


	};
	param={...param,...commentContent.value};

	completeTask(param).then(res => {
		dialogVisible.value = false;


		emit("taskSubmitEvent")
	}).finally(()=>{
		loading.value=false;

	})
}
const dialogClosed=()=>{
	commentContent.value={}
}
const  commentContent=ref({})

import  CommentHandle from './components/comment.vue'
import {isBlank} from "../../../utils/objutil";


</script>

<template>
	<div>
		<el-dialog
				v-model="dialogVisible"
				:title="dialogTitle"
				width="400px"
				destroy-on-close
				@closed="dialogClosed"
		>
			<template #header="{ close, titleId, titleClass }">
				<div style="text-align: left;font-size: 20px;font-weight: bold">
					{{ dialogTitle }}
				</div>
			</template>
			<comment-handle :content="commentContent"></comment-handle>

			<template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="submit">
          确定
        </el-button>
      </span>
			</template>
		</el-dialog>
	</div>
</template>

<style scoped lang="less">

</style>
