<template>
    <div v-if='config'>
        <el-form :model="config">
            <el-form-item label="激活标签">
                <el-select v-model="config.props.activeTab" placeholder="请选择">
                    <el-option v-for="(tab, index) in config.props.tabs" :key="index" :label="tab.label"
                        :value="tab.name" />
                </el-select>
            </el-form-item>

            <el-form-item label="标签页配置">
                <el-button @click="addTab" class='add-tab-btn' type="primary" icon="el-icon-plus">添加标签</el-button>
                <el-row v-for="(tab, index) in config.props.tabs" :key="index"
                    v-show='config.props.activeTab === tab.name'>
                    <el-col :span="20">
                        <el-form-item :label="'标签' + (index + 1)">
                            <el-input v-model="tab.label" placeholder="请输入标签名称" />
                        </el-form-item>
                        <el-form-item :label="'内容' + (index + 1)">
                            <el-input v-model="tab.content" placeholder="请输入标签内容" />
                        </el-form-item>
                    </el-col>
                    <el-col :span="4">
                        <span class='el-icon-close-circle-fill' @click='delTab(index)'> 删除 </span>
                    </el-col>
                </el-row>
            </el-form-item>
        </el-form>

    </div>

</template>

<script setup>
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

const addTab = () => {
    console.log("addTab", config.value);
    const newTabIndex = config.value.props.tabs.length + 1;
    config.value.props.tabs.push({
        name: `tab${newTabIndex}`,
        label: `Tab ${newTabIndex}`,
        content: `这是 Tab ${newTabIndex} 的内容`
    });
    config.value.props.value.activeTab = `tab${newTabIndex}`;  // 新标签页激活
};
const delTab = (index) => {
    console.log("delTab", index);
    config.value.props.tabs.splice(index, 1);
    if (config.value.props.tabs.length > 0) {
        config.value.props.value.activeTab = config.value.props.tabs[0].name;  // 第一个标签页激活
    } else {
        config.value.props.value.activeTab = "";  // 没有标签页激活
    }
};
</script>

<style scoped>
/* 可选：控制区样式 */
.el-icon-close-circle-fill{
    color: #f5222d;
    cursor: pointer;
    margin-left: 10px;
    margin-top: 20px;
}
.add-tab-btn{
    margin-bottom: 20px;

}
</style>