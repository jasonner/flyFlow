<script setup lang="ts">

import {defineExpose,ref} from "vue";
import {completeTask, resolveTask} from "../../../api/task";

const dialogVisible = ref(false);


const commentContent = ref({})

const frontJoinTask = ref(false);
const needSignature = ref(false);
const formValue = ref();
const dialogTitle = ref("");
const processInstanceId = ref("");
const taskId = ref("");

const handle = (pid, tid, formData, dt, dialogTitle1, needSignature1) => {
  dialogTitle.value = dialogTitle1;
  frontJoinTask.value = dt;
  needSignature.value = needSignature1;

  formValue.value = formData;

  processInstanceId.value = pid
  taskId.value = tid

  dialogVisible.value = true;
}

defineExpose({handle});
const emit = defineEmits(["taskSubmitEvent"]);

const loading=ref(false)

const submit = () => {
	loading.value=true;

  var param = {
    paramMap: formValue.value,
    approveResult: true,
    processInstanceId: processInstanceId.value,
    taskId: taskId.value

  };
  param = {...param, ...commentContent.value};

  if (frontJoinTask.value) {
    //前加签
    resolveTask(param).then(res => {
      dialogVisible.value = false;


      emit("taskSubmitEvent")
    }).finally(()=>{
			loading.value=false;

		})
  } else {
    completeTask(param).then(res => {
      dialogVisible.value = false;


      emit("taskSubmitEvent")
    }).finally(()=>{
			loading.value=false;

		})
  }

}
const dialogClosed = () => {
  commentContent.value = {}

}

import CommentHandle from './components/comment.vue'
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
        <el-button :loading="loading" type="primary" @click="submit">
          确定
        </el-button>
      </span>
      </template>
    </el-dialog>

  </div>
</template>

<style scoped lang="less">

</style>
