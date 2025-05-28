<script setup lang="ts">
import {defineProps} from 'vue'
import {Calendar} from "@element-plus/icons-vue";
import {isNotBlank} from "../../../utils/objutil";

let props = defineProps({



	icon: {
		type: Object, default: () => {

		}
	},
	form: {
		type: Object, default: () => {

		}
	},
	height:{
		type:Number,default:34
	}


});
</script>

<template>
<div style="border: 2px solid #EEEEEE;border-radius: var(--el-border-radius-base);background-color: #f5f7fa;color: #ababb2;padding-left: 10px;"
:style="{height:height+'px'}"
>

	<template v-if="isNotBlank(icon)">
	  <el-button size="small" text  :icon="$icon[icon]"
		>
<!--			{{ element.name }}-->
				{{!form?'':form.placeholder}}
                  </el-button>



	</template>
	<template v-else>
		{{!form?'':form.placeholder}}
	</template>
</div>
</template>

<style scoped lang="less">

</style>
