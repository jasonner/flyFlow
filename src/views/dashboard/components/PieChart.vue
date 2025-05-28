<!-- 饼图 -->
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
    default: 'pieChart'
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
  grid: {
    left: '2%',
    right: '2%',
    bottom: '10%',
    containLabel: true
  },
  legend: {
    top: 'bottom',
    textStyle: {
      color: '#999'
    }
  },
  series: [
    {
      name: 'Nightingale Chart',
      type: 'pie',
      radius: [50, 130],
      center: ['50%', '50%'],
      roseType: 'area',
      itemStyle: {
        borderRadius: 1,
        color: function (params: any) {
          //自定义颜色
          const colorList = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'];
          return colorList[params.dataIndex];
        }
      },
      data: [
        { value: 26, name: '待办任务' },
        { value: 27, name: '已办任务' },
        { value: 24, name: '发起任务' },
        { value: 23, name: '抄送任务' }
      ]
    }
  ]
};

onMounted(() => {
  const chart = echarts.init(
    document.getElementById(props.id) as HTMLDivElement
  );
  chart.setOption(options);
  window.addEventListener('resize', () => {
    chart.resize();
  });
});
</script>
