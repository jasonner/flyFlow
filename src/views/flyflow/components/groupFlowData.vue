<script setup lang="ts">

import {isNotBlank} from "../utils/objutil";
import {CircleCloseFilled, Delete, DocumentCopy, Edit, Hide, Histogram, Menu} from "@element-plus/icons-vue";
import {disableFlow, enableFlow} from "../api/flow";
import {ref} from "vue";
import {clearProcess, deleteProcessMain} from "../api/group";
import {useRouter} from "vue-router";
import ProcessVersionPopup from "../components/ProcessVersionPopup.vue";

const props = defineProps({
	flow: {
		type: Object,
		default: ()=>{}
	},
});

const  emit=defineEmits(['handleQuery'])

const router = useRouter()


function toEditFlow(flow) {
	//TODO
	let to = "/flow/create?id="+flow.uniqueId+"&flowId=" + flow.flowId;

	router.push(to)

}


function toCopyFlow(flow) {
	//TODO
	let to = "/flow/create?cp=1&flowId=" + flow.flowId;

	router.push(to)

}

function showDisableConfirm(flow) {
	ElMessageBox.confirm(
			'确定要停用该流程吗?',
			'提示',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}
	)
			.then(() => {
				disableFlow(flow.flowId).then(res => {
					emit("handleQuery");
				})
			})
}


//显示版本管理
const processVersionRef=ref()
function showVersionManage(flow){

	processVersionRef.value.show(flow.uniqueId)
}

//删除流程
function showDeleteConfirm(flow) {
	ElMessageBox.confirm(
			'确定要删除该流程吗?',
			'提示',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}
	)
			.then(() => {
				deleteProcessMain(flow.uniqueId).then(res => {
					emit("handleQuery");

				})
			})
}

//清理流程
function showClearProcessConfirm(flow) {
	ElMessageBox.confirm(
			'本次操作会删除流程所有数据，包括进行中的和已完成的，确定继续吗?',
			'提示',
			{
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
			}
	)
			.then(() => {
				clearProcess(flow.uniqueId).then(res => {
					emit("handleQuery");

				})
			})
}

function handleQuery(){
	emit("handleQuery");

}
</script>

<template>

	<div>
		<process-version-popup @close-dialog-event="handleQuery" ref="processVersionRef"></process-version-popup>

		<div   class="item"  >
			<div style="position: relative">
				<el-avatar shape="square" :size="50"
									 :src="flow.logo"/>


			</div>
			<div style="margin-left: 20px;width: 300px;" v-if="isNotBlank(flow.remark)">
				<div style="width: 300px;">
					<el-tooltip
							class="box-item"
							effect="dark"
							:content="flow.name"
							placement="top-start"
					>
						<el-text truncated   >{{ flow.name }}</el-text>
					</el-tooltip>
				</div>
				<div>
					<el-tooltip
							class="box-item"
							effect="dark"
							:content="flow.remark"
							placement="top-start"
					>
						<el-text truncated type="info" >{{ flow.remark }}</el-text>
					</el-tooltip>
				</div>
			</div>
			<div style="margin-left: 20px;width: 300px;" v-else>
				<div style="height: 60px;line-height: 60px;width: 300px">
					<el-tooltip
							class="box-item"
							effect="dark"
							:content="flow.name"
							placement="top-start"
					><el-text truncated  >{{ flow.name }}</el-text>
					</el-tooltip>
				</div>
			</div>

			<div
					style="margin-left: 50px;height: 60px;line-height: 60px;width: 200px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis;">
				<template v-if="flow.rangeShow && flow.rangeShow.length > 0">
					<el-tooltip
							class="box-item"
							effect="dark"
							:content="flow.rangeShow"
							placement="top-start"
					>
						{{flow.rangeShow}}
					</el-tooltip>
				</template>
				<template v-else>所有人</template>
			</div>
			<div style="height: 60px;line-height: 60px;">
				<el-tag v-if="!flow.stop" type="success">激活</el-tag>
				<el-tag v-else type="danger">挂起</el-tag>
			</div>
			<div class="last">
				<el-tooltip
						class="box-item"
						effect="dark"
						content="编辑"
						placement="top"
				>
					<el-button text @click="toEditFlow(flow)" :icon="Edit" circle/>
				</el-tooltip>
				<el-tooltip
						class="box-item"
						effect="dark"
						content="复制"
						placement="top"
				>
					<el-button text @click="toCopyFlow(flow)" :icon="DocumentCopy" circle/>
				</el-tooltip>



				<el-tooltip v-if="!flow.stop"
										class="box-item"
										effect="dark"
										content="停用"
										placement="top"
				>
					<el-button @click="showDisableConfirm(flow)" text :icon="Hide" circle/>
				</el-tooltip>



				<el-tooltip
						class="box-item"
						effect="dark"
						content="版本管理"
						placement="top"
				>
					<el-button @click="showVersionManage(flow)" text :icon="Menu" circle/>
				</el-tooltip>


				<el-tooltip
						class="box-item"
						effect="dark"
						content="清理流程"
						placement="top"
				>
					<el-button text @click="showClearProcessConfirm(flow)" :icon="CircleCloseFilled" circle/>
				</el-tooltip>

				<el-tooltip
						class="box-item"
						effect="dark"
						content="删除"
						placement="top"
				>
					<el-button text @click="showDeleteConfirm(flow)" :icon="Delete" circle/>
				</el-tooltip>

			</div>
		</div>

	</div>

</template>

<style scoped lang="less">

.item {
	display: flex;
	flex-direction: row;
	height: 60px;
	padding-top: 5px;
	margin-bottom: 10px;


	div:nth-child(2) div:first-child {
		font-size: 15px;
		height: 30px;
		font-weight: bolder;
		line-height: 30px;
	}

	div:nth-child(2) div:last-child {
		font-size: 12px;
		height: 20px;
		line-height: 20px;

	}

	.last {
		width: calc(100% - 70px - 200px - 200px - 50px);
		height: 60px;
		line-height: 60px;
		text-align: right;

	}
}
</style>
