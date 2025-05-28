<!--  线 + 柱混合图 -->
<template>
  <el-card>
    <template #header> 今日任务分布 </template>
    <div :id="id" :class="className" :style="{ height, width }" />
  </el-card>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';

const props = defineProps({
  id: {
    type: String,
    default: 'barChart'
  },
  className: {
    type: String,
    default: ''
  },
  width: {
    type: String,
    default: '200px',
    required: true
  },
  height: {
    type: String,
    default: '200px',
    required: true
  }
});

const options = {
	xAxis: {
		type: 'category',
		data: ['发起任务', '待办任务', '已办任务', '抄送任务']
	},
	yAxis: {
		type: 'value'
	},
	series: [
		{
			data: [120, 200, 150, 80],
			type: 'bar'
		}
	]
};

onMounted(() => {
  // 图表初始化
  const chart = echarts.init(
    document.getElementById(props.id) as HTMLDivElement
  );
  chart.setOption(options);

  // 大小自适应
  window.addEventListener('resize', () => {
    chart.resize();
  });
});
</script>
