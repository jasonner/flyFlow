<script setup lang="ts">

import {useRouter} from "vue-router";
import {loadRemoteData} from '../../views/flyflow/api/base/index'



const router = useRouter();


onMounted(() => {

})

const goto=()=>{
	loadRemoteData().then(res=>{
			ElMessage.success('同步成功')
	})
}

</script>

<template>
	<div @click="goto" style="cursor: pointer">

			<svg-icon icon-class="download"/>

	</div>

</template>
