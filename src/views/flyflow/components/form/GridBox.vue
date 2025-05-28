<template>
	<div>
		<template v-if="mode === 'D'">
			<el-row :gutter="gutter" :justify="justify" :align="align" class="grid-box">
				<el-col v-for="(col, colIndex) in cols" :key="colIndex" :span="col.span" :style="{ padding: '8px' }">
					<!-- 遍历列中的子组件并渲染 -->
					<div class="grid-content">
						<div class='grid-box-empty' v-if='col.children.length === 0'>
							<div class='grid-box-empty-icon'>请点击左侧组件拖拽到此处下面</div>
						</div>
						<draggable v-model="col.children" style="min-height:30px;" item-key="element.id" :sort="true"
							effect="move" :group="{ name: 'dragFormList', pull: true, put: true }">
							<template #item="{ element, index }">
								<div class="okcomponent" :class="{ 'active-component': isCurrentForm(element.id) }"
									@click.stop="showCurrentPageConfigPanel(element)">
									<el-icon v-if="element.type != 'Empty'" class="deleteIcon"
										@click.stop="deleteForm(element.id)">
										<Close />
									</el-icon>
									<el-form-item :label="element.name"
										:style="{ marginBottom: (element.type === 'Empty' ? '0px' : '18px') }"
										:required="element.required">
										<component style="width: 100%" :index="index" :is="getFormWidget(element.type)"
											:id="element.id" :key="element.id" :form='element'
											v-model:form="element[index]" />
									</el-form-item>
								</div>
							</template>
						</draggable>
					</div>
				</el-col>
			</el-row>
		</template>
		<template v-else>
			<!-- 编辑模式下的渲染逻辑 -->
			<el-row :gutter="gutter" :justify="justify" :align="align" class="grid-box">
				<el-col v-for="(col, colIndex) in cols" :key="colIndex" :span="col.span">
					<div v-for="(child, index) in col.children" :key="index" class="grid-content">
						<component :is="getFormWidget(child.type)" :mode='"E"' :id="child.id" :form="child"
							v-model:form="child[index]" style="width: 100%" />
					</div>
				</el-col>
			</el-row>
		</template>
	</div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue'
import getFormName from "../../utils/getFormWidget";
import draggable from "vuedraggable";
import { defineProps } from 'vue'
import { useFlowStore } from "../../stores/flow";
import { Close } from "@element-plus/icons-vue";
let props = defineProps({
	mode: {
		type: String,
		default: 'D'
	},
	form: {
		type: Object, default: () => {

		}
	},
});
const gutter = computed(() => props.form.props.gutter || 20)
const justify = computed(() => props.form.props.justify || 'center')
const align = computed(() => props.form.props.align || 'center')
const cols = computed(() => props.form.props.cols || []);
const getFormWidget = (name: string) => {
	// 确保 name 对应的组件名称存在
	return getFormName[name] || null;
};

let flowStore = useFlowStore();
const currentForm = ref();
var currentFormCom = computed({
	get() {
		return flowStore.currentFormCom
	},
	set(v) {
		currentForm.value = v;
		flowStore.setCurrentFormCom(v);
	}
})
const showCurrentPageConfigPanel = (id) => {
	flowStore.setCurrentFormCom(id);
};
var isCurrentForm = (fid) => {
	if (!currentFormCom.value) {
		return false;
	}
	if (currentFormCom.value.id === fid) {
		return true;
	}
	return false;
}
const deleteForm = (id) => {
	let index = props.form.props.cols.findIndex((item) => item.children.findIndex((child) => child.id === id) !== -1);
	let childIndex = props.form.props.cols[index].children.findIndex((child) => child.id === id);
	props.form.props.cols[index].children.splice(childIndex, 1);
}; 
</script>

<style scoped lang="less">
.grid-box{
	margin-top: 20px;
	margin-bottom: 20px;
}
.grid-box-container {
	width: 100%;
	padding: 0 20px;
	box-sizing: border-box;
	background-color: aqua;
}

.grid-content {
	margin-bottom: 20px;
	padding: 0 5px;
	box-sizing: border-box;
}

.okcomponent {
	padding: 5px;
	border-radius: 0px;
	margin-bottom: 10px;
	background-color: white;
	border: 1px solid #e4e4e4;
	position: relative;
}

.active-component {
	border: 1px solid var(--el-color-primary);
}

.grid-box-empty-icon {
	color: var(--el-color-primary);
	text-align: center;
	border: 1px dashed var(--el-color-primary);
}

.deleteIcon {
	position: absolute;
	right: 20px;
	z-index: 20;
}

.deleteIcon:hover {
	cursor: pointer;
	color: palevioletred;
}
</style>