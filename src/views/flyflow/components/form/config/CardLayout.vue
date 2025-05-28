<template>
    <el-form :model="config">
        <el-form-item label="主标题">
            <el-input v-model="config.props.title" placeholder="请输入卡片主标题"></el-input>
        </el-form-item>
        <el-form-item label="标题颜色">
            <el-color-picker v-model="config.props.color"></el-color-picker>
        </el-form-item>
        <el-form-item label="标题字体大小">
            <el-input v-model="config.props.fontSize" placeholder="请输入标题字体大小"></el-input>
        </el-form-item>
        <el-form-item label="标题字体粗细">
            <el-select v-model="config.props.fontWeight" placeholder="请选择字体粗细">
                <el-option label="正常" value="normal"></el-option>
                <el-option label="加粗" value="bold"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="标题位置">
            <el-select v-model="config.props.textAlign">
                <el-option label="居左" value="left"></el-option>
                <el-option label="居中" value="center"></el-option>
                <el-option label="居右" value="right"></el-option>
            </el-select>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

</script>

<style scoped>
/* 可选：控制区样式 */
</style>
