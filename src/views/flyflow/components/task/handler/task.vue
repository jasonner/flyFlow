<script setup lang="ts">

import TaskUIHandle from "./taskUiPc.vue"
import taskUIPcPanelHandle from "./taskUiPcPanel.vue"

import {onMounted ,ref} from 'vue'

const props = defineProps({
	isPanel:{
		type:Boolean,
		default:false
	}
})
/**
 * 点击开始处理
 */
const deal = (row) => {



	  taskUiHandler.value.deal(row.taskId, row.processInstanceId,row.flowId,row.ccId,row.nodeId)


}




defineExpose({deal});

const taskSubmitEvent = () => {

	emit('taskSubmitEvent')
}



onMounted(() => {

});
const emit = defineEmits(["taskSubmitEvent"]);

const taskUiHandler=ref();

</script>

<template>
	<div >
			<taskUIPcPanelHandle  v-if="props.isPanel"  @taskSubmitEvent="taskSubmitEvent" ref="taskUiHandler"></taskUIPcPanelHandle>

			<task-u-i-handle v-else @taskSubmitEvent="taskSubmitEvent" ref="taskUiHandler"></task-u-i-handle>

	</div>
</template>
<style scoped lang="less">

</style>
