<script setup lang="ts">
import { computed, defineExpose, ref } from "vue";

let props = defineProps({
    id: {
        type: String,
        default: "",
    },
});


import { getCurrentConfig } from "../../../utils/objutil";

var config = computed(() => {
    return getCurrentConfig(props.id);
});


//校验
const validate = () => {
    return true;
};
defineExpose({ validate });

const addCol = () => {
    config.value.props.cols.push({
        span: 12,
        children: [],
    });
}
const delCol = (col) => {
    let index = config.value.props.cols.indexOf(col);
    if (index !== -1) {
        config.value.props.cols.splice(index, 1);
    }
};
const delChild = (col) => {
    let index = col.children.length - 1;
    if (index !== -1) {
        col.children.splice(index, 1);
    }
};
const addChild = (col) => {
    col.children.push({});
};

</script>

<template>
    <div v-if="config">
        <template v-if="config.type === 'GridBox'">
            <el-form-item label="">
                <!-- 添加新列按钮 -->
                <el-button style='margin-left: 10px;' type="success" size="small" @click="addCol">新增一列</el-button>
            </el-form-item>

            <el-form-item label="列配置">
                <div class='grid-box-container'>
                    <div v-for="(col, colIndex) in config.props.cols" :key="colIndex"
                        style="margin-bottom: 10px; border: 1px dashed #ccc; padding: 10px;">
                        <el-form-item>
                            <div style='margin-right: 30px;'>第{{ colIndex + 1 }}列</div>
                            <el-input-number v-model="col.span" :min="1" :max="24" />
                        </el-form-item>
                        <!-- 可加按钮：添加子元素 -->
                        <el-button type="danger" size="small" @click="delCol(col)">删除此列</el-button>
                    </div>
                </div>
            </el-form-item>
        </template>
    </div>
</template>

<style scoped lang="less">
.divider-solid-name {
    font-size: 14px;
    color: #666;
    margin-top: 30px;
}
.grid-box-container{
    width: 100%;
    height: 200px;
    overflow-y: scroll;
}
</style>
