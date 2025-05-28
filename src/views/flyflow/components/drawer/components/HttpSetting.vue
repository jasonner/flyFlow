<template>
    <el-form :model="form" :rules="formRules" ref="formRef" label-width="120px" @submit.native.prevent
        label-position="top">

        <!-- 启用/禁用开关 -->
        <el-form-item label="是否启用" prop="enable">
            <el-switch v-model="form.enable" active-text="启用" inactive-text="禁用" />
        </el-form-item>

        <!-- 请求地址 -->
        <el-form-item label="请求地址" prop="url" required v-if='form.enable'>
            <el-input v-model="form.url" placeholder="请输入请求地址" />
        </el-form-item>

        <!-- 请求头 -->
        <el-form-item style='margin-left: 0;' label="请求头" prop="header" required v-if='form.enable'>
            <el-button @click="addRequestHeader" type="primary" :icon="CirclePlus">添加一行</el-button>
            <el-table :data="form.header" style="width: 100%; margin-top: 10px">
                <el-table-column prop="field" label="字段" width='160px'>
                    <template #default="scope">
                        <el-input v-model="scope.row.field" placeholder="请输入字段名" :disabled='!scope.row.valueMode'
                            :rules="[{ required: true, message: '字段不能为空', trigger: 'blur' }]" />
                    </template>
                </el-table-column>
                <el-table-column label="固定内容" width='100px'>
                    <template #default="scope">
                        <el-switch v-model="scope.row.valueMode" active-text="是" inactive-text="否" />
                    </template>
                </el-table-column>
                <el-table-column prop="value" label="值" width='140px'>
                    <template #default="scope">
                        <el-input v-model="scope.row.value" placeholder="请输入字段值" v-if='scope.row.valueMode'
                            :rules="[{ required: true, message: '值不能为空', trigger: 'blur' }]" />
                        <el-select v-model="scope.row.field" value-key="id" placeholder="请选择字段" v-else>
                            <el-option v-for="item in selectData" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="danger" @click="removeRequestHeader(scope.$index)" :icon="DeleteFilled"
                            circle />
                    </template>
                </el-table-column>
            </el-table>
        </el-form-item>

        <!-- 请求体 -->
        <el-form-item label="请求体" prop="body" required v-if='form.enable'>
            <el-button @click="addRequestBody" type="primary" :icon="CirclePlus">添加一行</el-button>
            <el-table :data="form.body" style="width: 100%; margin-top: 10px">
                <el-table-column prop="field" label="字段" width='160px'>
                    <template #default="scope">
                        <el-input v-model="scope.row.field" placeholder="请输入字段名" :disabled='!scope.row.valueMode'
                            :rules="[{ required: true, message: '字段不能为空', trigger: 'blur' }]" />
                    </template>
                </el-table-column>
                <el-table-column label="固定内容" width='100px'>
                    <template #default="scope">
                        <el-switch v-model="scope.row.valueMode" active-text="是" inactive-text="否" />
                    </template>
                </el-table-column>
                <el-table-column prop="value" label="值" width='140px'>
                    <template #default="scope">
                        <el-input v-model="scope.row.value" placeholder="请输入字段值" v-if='scope.row.valueMode'
                            :rules="[{ required: true, message: '值不能为空', trigger: 'blur' }]" />
                        <el-select v-model="scope.row.field" value-key="id" placeholder="请选择字段" v-else>
                            <el-option v-for="item in selectData" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="danger" @click="removeRequestBody(scope.$index)" :icon="DeleteFilled" circle />
                    </template>
                </el-table-column>
            </el-table>
        </el-form-item>

        <!-- 返回字段 -->
        <el-form-item prop="result" required label='返回字段' v-if='form.enable'>
            <el-button @click="addResultField" type="primary" :icon="CirclePlus">添加一行</el-button>
            <el-table :data="form.result" style="width: 100%; margin-top: 10px">
                <el-table-column prop="field" label="字段" width='160px'>
                    <template #default="scope">
                        <el-select v-model="scope.row.field" value-key="id" placeholder="请选择字段">
                            <el-option v-for="item in selectData" :key="item.value" :label="item.label"
                                :value="item.value" />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- <el-table-column label="内容配置">
                    <template #default="scope">
                        <el-input v-model="scope.row.contentConfig" placeholder="请输入内容配置" />
                    </template>
                </el-table-column> -->
                <el-table-column prop="value" label="值" width='240px'>
                    <template #default="scope">
                        <el-input v-model="scope.row.value" placeholder="请输入字段值"
                            :rules="[{ required: true, message: '值不能为空', trigger: 'blur' }]" />
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <template #default="scope">
                        <el-button type="danger" @click="removeResultField(scope.$index)" :icon="DeleteFilled" circle />
                    </template>
                </el-table-column>
            </el-table>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { DeleteFilled, CirclePlus } from "@element-plus/icons-vue";
import { useFlowStore } from '../../../stores/flow'
let flowStore = useFlowStore();
const form = ref({
    enable: false,
    url: '',
    header: [

    ],
    body: [

    ],
    result: [

    ]
});
const selectData = ref([]);
onMounted(() => {
    let step2 = formList.value;
    let arr = [];
    for (let item of step2) {
        arr.push({ label: item.name, value: item.id });
    }
    selectData.value = arr;
});
watch(() => form.value, (val) => {
    flowStore.setHttpComponent(val);
})
var formList = computed(() => {
    let arr = [];
    let findChildren = (children) => {
        for (let item of children) {
            if (item.type != 'Description' && item.type != 'GridBox' && item.type != 'TabsLayout' && item.type != 'DividerSolid' && item.type != 'CardLayout') {
                arr.push(item);
            }
            if (item.type == 'GridBox') {
                if (item.props.cols && item.props.cols.length > 0) {
                    item.props.cols.forEach(element => {
                        if(element.children && element.children.length > 0){
                            findChildren(element.children);
                        }
                    });
                }
            }
            if(item.type == 'CardLayout'){
                if(item.props.sections && item.props.sections.length > 0){
                    findChildren(item.props.sections);
                }
            }
            if (item.children && item.children.length > 0) {
                findChildren(item.children);
            }
        }
    }
    findChildren(flowStore.step2);
    return arr;
});
// 表单校验规则
const formRules = {
    url: [{ required: true, message: '请求地址不能为空', trigger: 'blur' }],
    enable: [{ required: true, message: '启用状态不能为空', trigger: 'change' }],
    'header.field': [{ required: true, message: '字段名不能为空', trigger: 'blur' }],
    'header.value': [{ required: true, message: '字段值不能为空', trigger: 'blur' }],
    'body.field': [{ required: true, message: '字段名不能为空', trigger: 'blur' }],
    'body.value': [{ required: true, message: '字段值不能为空', trigger: 'blur' }],
    'result.field': [{ required: true, message: '字段名不能为空', trigger: 'blur' }],
    'result.value': [{ required: true, message: '字段值不能为空', trigger: 'blur' }]
};

// 添加请求头
const addRequestHeader = () => {
    form.value.header.push({ field: '', value: '', valueMode: true });
};

// 删除请求头
const removeRequestHeader = (index) => {
    form.value.header.splice(index, 1);
};

// 添加请求体
const addRequestBody = () => {
    form.value.body.push({ field: '', value: '', valueMode: true });
};

// 删除请求体
const removeRequestBody = (index) => {
    form.value.body.splice(index, 1);
};

// 添加返回字段
const addResultField = () => {
    form.value.result.push({ field: '', value: '', contentConfig: 'value' });
};

// 删除返回字段
const removeResultField = (index) => {
    form.value.result.splice(index, 1);
};
const formRef = ref(null);

</script>

<style scoped>
.dialog-footer {
    text-align: right;
}

::v-deep .el-form-item__content {
    margin-left: 0 !important;
}
</style>