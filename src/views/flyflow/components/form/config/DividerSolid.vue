<script setup lang="ts">
import { computed, defineExpose,ref } from "vue";

let props = defineProps({
  id: {
    type: String,
    default: "",
  },
});


import {getCurrentConfig} from "../../../utils/objutil";

var config = computed(() => {
	return getCurrentConfig(props.id);
});


//校验
const validate = () => {
  return true;
};
defineExpose({ validate });


</script>

<template>
	<div v-if="config">
      <div class='divider-solid-name'>
        线条粗细
      </div>
      <el-slider v-model="config.props.height" :min="1" :max="5" show-input />
      <div class='divider-solid-name'>
        分割线内容
      </div>
      <div>
        <el-input type="text" :model='config.props.height' v-model="config.props.text" />
      </div>
      <div class='divider-solid-name'>
        线条颜色
      </div>
      <div>
        <input style='width: 100px;height: 60px;' type="color" v-model="config.props.color" />
      </div>
      <el-form-item label="文字位置">
        <el-select v-model="config.props.textAlign">
          <el-option label="左边" value="left" />
          <el-option label="中间" value="center" />
          <el-option label="右边" value="right" />
        </el-select>
      </el-form-item>

      <el-form-item label="线条类型">
        <el-select v-model="config.props.style">
          <el-option label="实线" value="solid" />  
          <el-option label="虚线" value="dashed" />
          <el-option label="点状线" value="dotted" />
        </el-select>
      </el-form-item>
  </div>
</template>

<style scoped lang="less">
  .divider-solid-name{
    font-size: 14px;
    color: #666;
    margin-top: 30px;
  }
</style>
