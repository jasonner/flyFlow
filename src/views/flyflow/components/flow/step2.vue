<template>
	<div>
		<el-container>
			<el-aside width="280px">
				<el-scrollbar :min-size="1" :height="util.getPageSize().pageHeight - 120">
					<div effect="dark" style="background-color: white;margin-top: 0px;padding-top: 20px">
						<h4 style="text-align: center">组件库</h4>
						<template v-for="(item, index) in oriFormList">
							<h5 style="padding-left: 20px">{{ item.name }}</h5>
							<draggable v-model="item.formList" disabled ghost-class="ghost" :force-fallback="true"
								item-key="index" :sort="false" class="leftItem" :animation="300"
								:group="{ name: 'dragFormList', pull: 'clone', put: false }" :clone='cloneFunc'
								@end="dragEnd" @start="drag = true">

								<template #item="{ element }">
									<div class="zj">
										<el-button size="large" style="width: 100%"
											:icon="$icon[element.icon]">{{ element.name }}
										</el-button>
									</div>
								</template>
							</draggable>
						</template>


					</div>

				</el-scrollbar>

			</el-aside>
			<el-main style="padding: 0px;">
				<div style="display: flex;flex-direction: row">
					<div class="f11">
						<pc></pc>
					</div>
					<div v-if="currentForm" class="f22">
						<el-card class="box-card">
							<template #header>
								<div>
									<el-button type="text" @click="activeConfigTab = 'base'">基础配置</el-button>
								</div>
							</template>
							<div class='card-name'>{{ currentForm.name }}</div>
							<el-form label-width="120px" label-position="top">
								<el-form-item label="表单ID">
									<el-input v-model="currentForm.id" disabled maxlength="50">
										<template #append>
											<el-button :icon="DocumentCopy" @click="copyFormId(currentForm.id)" />
										</template>
									</el-input>
								</el-form-item>
								<el-form-item required label="标题">
									<el-input v-model="currentForm.name" maxlength="10" />
								</el-form-item>

								<el-form-item label="提示" :required="currentForm.type === 'Description'">
									<el-input v-model="currentForm.placeholder" maxlength="50" />
								</el-form-item>
								<component :is="getFormConfigWidget(currentForm.type)" :id="currentForm.id"
									ref="currentFormConfigRef"></component>
								<el-form-item label="其他">
									<el-checkbox v-model="currentForm.required" label="必填" />
								</el-form-item>
							</el-form>
						</el-card>
					</div>
				</div>
			</el-main>
		</el-container>
	</div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";

import { formValidateDict } from '../../utils/formValidate'
import { DocumentCopy } from "@element-plus/icons-vue";
import { useFlowStore } from "../../stores/flow";
//要注意导入
import getFormConfigName from "../../utils/getFormConfigWidget";
import draggable from "vuedraggable";
import { FormGroupVO } from "../../api/form/types";
import { formGroupConfig } from "../../api/form/data";
import * as util from "../../utils/objutil";

import Pc from "./components/design/pc.vue";

const activeConfigTab = ref('base');
const drag = ref(false);

let flowStore = useFlowStore();
var step2List = computed(() => {
	let step2 = flowStore.step2;
	return step2;
});
var step2FormList = computed(() => {

	if (!flowStore) {
		return undefined;
	}
	let step2 = flowStore.step2Form;
	return step2;
});
//监听表单变化 渲染手机端和pc端
watch(() => step2FormList?.value, (v) => {
	flowStore.setStep2Pc(v);
	var arr = [];
	for (var item of v) {
		{
			arr.push(item);
		}
	}
	flowStore.setStep2(arr);
}, { deep: true })

var currentForm = computed({
	get() {
		return flowStore.currentFormCom;
	},
	set(v) {
		currentForm.value = v;
		flowStore.setCurrentFormCom(v);
	}
})

const cloneFunc = (el) => {
	el.id = util.getRandomId();
	return el;
}

const getFormConfigWidget = (name: string) => {
	//写的时候，组件的起名一定要与dragList中的element名字一模一样，不然会映射不上
	return getFormConfigName[name];
};


const dragEnd = (a) => {
	drag.value = false;
	oriFormList.value = util.deepCopy(oriFormList.value)

}
//复制表单idid
function copyFormId(id) {
	util.copyToBoard(id)
}

let oriFormList = ref<FormGroupVO[]>(formGroupConfig);


const validate = (f) => {
	var err = []
	let formList = step2List.value;
	if (formList.length == 0) {
		err.push("表单不能为空")
	}

	var cIndex = 0;
	var indexObj = {};
	for (var form of formList) {
		indexObj[form.id] = cIndex
		cIndex++;
	}
	for (var form of formList) {
		let formValidateDictElement = formValidateDict[form.type];
		if (formValidateDictElement) {
			let result = formValidateDictElement(form);
			if (!result.valid) {
				err.push(result.msg)
			}
		}
		//计算每个表单的顺序
		//检查动态表单配置
		{
			let dynamicFormConfig = form.dynamicFormConfig;
			if (!dynamicFormConfig) {
				dynamicFormConfig = [];
			}
			for (var it of dynamicFormConfig) {
				let list = it.list;
				let conditionList = it?.condition?.conditionList;
				if (conditionList?.length > 0) {
					//判断条件里的顺序
					for (var c of conditionList) {
						console.log(c)
						for (var t of c.conditionList) {
							let key = t.key;
							let indexObjElement = indexObj[key];
							if (indexObjElement) {
								if (indexObjElement >= indexObj[form.id]) {
									err.push("请检查表单[" + form.name + "]的动态表单条件中引用的条件顺序不能在当前表单之下")
								}
							}
						}
					}

					//有条件
					if (list?.length < 1) {
						err.push("请设置表单[" + form.name + "]的动态表单值")
					} else {
						for (var l of list) {
							if (util.isBlank(l.value) || util.isBlank(l.contentConfig)) {
								err.push("请完善表单[" + form.name + "]的动态表单值")
							}
						}
						let arr = list.map(r => r.contentConfig);
						if (util.distinct(arr).length != arr.length) {
							err.push("表单[" + form.name + "]的动态表单不能重复配置")
						}
					}
				}
			}
		}
	}

	//表单唯一名字集合
	let uniqueFormNameList = Array.from(new Set(formList.map(res => res.name)))
	if (uniqueFormNameList.length < formList.length) {
		for (var formName of uniqueFormNameList) {
			let length = formList.filter(res => res.name === formName).length;
			if (length > 1) {
				err.push("表单名称【" + formName + "】不能重复");
			}
		}
	}
	f(err.length == 0, err);
};

defineExpose({ validate });
</script>
<style scoped lang="less">
.leftItem {
	padding-left: 0px;
}

.zj {
	display: inline-block;
	width: 120px;
	margin: 5px 10px 5px 10px;
}

@f22_width: 500px;

@center_width: 360px;


.f11 {
	width: calc(100% - @f22_width);

}

.f22 {
	width: @f22_width;

}

.card-name {
	margin-bottom: 20px;
}

.dialog-footer {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}
.example-input{
	margin-top: 20px;
}
</style>
