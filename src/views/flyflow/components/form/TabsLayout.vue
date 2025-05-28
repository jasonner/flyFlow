<template>
    <el-tabs v-model="activeTab" type="card">
        <el-tab-pane v-for="(tab, index) in tabs" :key="tab.name" :label="tab.label" :name="tab.name">
            <div v-html="tab.content"></div>
        </el-tab-pane>
    </el-tabs>
</template>

<script setup>
import { computed } from 'vue';
let props = defineProps({
    mode: {
        type: String,
        default: 'D'
    },
    form: {
        type: Object, default: () => {}
    },
});

const tabs = computed(() => props.form.props.tabs || []);
const activeTab = computed({
  get: () => props.form.props.activeTab,
  set: (val) => {
    props.form.props.activeTab = val;
  }
});
</script>

<style scoped>
/* 可选样式 */
</style>