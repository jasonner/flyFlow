<template>
    <template v-if="mode === 'D'">
        <div v-if='props' class="card-layout">
            <div class="card-header" v-if='props.form.props.title && props.form.props.title.trim() != ""'>
                <el-input
                    :input-style='{ border: "none", textAlign: props.form.props.textAlign, color: props.form.props.color, fontSize: props.form.props.fontSize, fontWeight: props.form.props.fontWeight }'
                    v-model="props.form.props.title" placeholder="请输入主标题" style="width: 100%;"></el-input>
            </div>
            <div class="card-body">
                <div class="grid-content">
                    <div v-if='props.form.props.sections.length === 0' class='grid-box-empty'>
                        <div class='grid-box-empty-icon'>请点击左侧组件拖拽到此处下面</div>
                    </div>
                    <draggable v-model="props.form.props.sections" style="min-height:30px;" item-key="element.id"
                        :sort="true" effect="move" :group="{ name: 'dragFormList', pull: true, put: true }">
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
                                    <component :is="getFormWidget(element.type)" id="element.id" :key="element.id"
                                        :form='element' v-model:form="element[index]" style="width: 100%" :index="index"
                                        @show-panel="showPanel" />
                                </el-form-item>
                            </div>
                        </template>
                    </draggable>
                </div>
            </div>
        </div>
    </template>
    <template v-else>
        <!-- 编辑模式下的渲染逻辑 -->
        <div v-if='props' class="card-layout">
            <div class="card-header" v-if='props.form.props.title && props.form.props.title.trim() != ""'>
                <el-input
                    :input-style='{border: "none", textAlign: props.form.props.textAlign, color: props.form.props.color, fontSize: props.form.props.fontSize, fontWeight: props.form.props.fontWeight }'
                    v-model="props.form.props.title" placeholder="请输入主标题" style="width: 100%;" readonly></el-input>
            </div>
            <div class="card-body">
                <div class="grid-content">
                    <div v-if='props.form.props.sections.length === 0' class='grid-box-empty'></div>
                    <div v-for="(child, index) in props.form.props.sections" :key="index" class="grid-content">
						<component :is="getFormWidget(child.type)" :mode='"E"' :id="child.id" :form="child"  v-model:form="child[index]"
							style="width: 100%" />
					</div>    
                </div>
            </div>
        </div>
    </template>
</template>

<script lang="ts" setup>
import draggable from "vuedraggable";
import { defineProps } from 'vue'
import getFormName from "../../utils/getFormWidget";
import { useFlowStore } from "../../stores/flow";
import { Close } from "@element-plus/icons-vue";
let props = defineProps({
    mode: {
        type: String,
        default: 'D'
    },
    form: {
        type: Object, default: () => { }
    },
});
const getFormWidget = (name: string) => {
    // 确保 name 对应的组件名称存在
    return getFormName[name] || null;
};
const showPanel = (form) => {
    currentFormCom.value = form;
}
const currentForm = ref();
let flowStore = useFlowStore();
var currentFormCom = computed({
    get() {
        return flowStore.currentFormCom
    },
    set(v) {
        currentForm.value = v;
        flowStore.setCurrentFormCom(v);
    }
})

var isCurrentForm = (fid) => {
    if (!currentFormCom.value) {
        return false;
    }
    if (currentFormCom.value.id === fid) {
        return true;
    }
    return false;
}
const showCurrentPageConfigPanel = (id) => {
    currentFormCom.value = id;
    flowStore.setCurrentFormCom(id);
};
const deleteForm = (id) => {
    let index = props.form.props.sections.findIndex((item) => item.id === id);
    props.form.props.sections.splice(index, 1);
};  
</script>

<style scoped>
.card-layout {
    margin: 20px;
    padding: 20px;
    border: 1px solid #ddd;
    width: 100%;
}

.card-header {
    margin-bottom: 20px;
}


.card-item {
    background-color: #f9f9f9;
    margin-bottom: 16px;
    border-radius: 5px;
}

.card-title {
    font-weight: bold;
    margin-bottom: 10px;
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
.grid-content{
    width: 100%;
}
</style>