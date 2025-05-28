<script setup lang="ts">
import {getMessageUnreadNum} from "@/views/flyflow/api/message/index";
import {useRouter} from "vue-router";


const unreadNum = ref(0);

function handleQuery() {
	getMessageUnreadNum({lastId:localStorage.getItem("msgMaxId")}).then(res => {
		const {data} = res;
		unreadNum.value = data.num;
		let maxId = data.maxId;



		if(maxId){
			let title = data.title;
			ElNotification({
				title: '流程通知',
				message: title,
				type: 'info',
			})
			//判断大小 如果大了 提示消息
				localStorage.setItem("msgMaxId",maxId);
		}
	})
}

const router = useRouter();

const interval = ref()


onMounted(() => {
	interval.value = setInterval(() => {
		handleQuery()
	}, 5000);
})
onBeforeUnmount(() => {
		clearInterval(interval.value)
})

const goto = () => {
	router.push("/system/message")
}

</script>

<template>
	<div @click="goto" style="cursor: pointer">
		<el-badge :value="unreadNum">
			<svg-icon icon-class="message"/>
		</el-badge>
	</div>

</template>
