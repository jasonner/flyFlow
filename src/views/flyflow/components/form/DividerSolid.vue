<template>
	<div>
		<el-divider :content-position='props.form.props.textAlign' 
			:style="{
				borderColor:props.form.props.color,
				borderTopWidth:props.form.props.height+'px',
				width:props.form.props.borderWidth+'%',
			}" 
			:border-style='props.form.props.style'
		>{{ props.form.props.text }}</el-divider>
	</div>
</template>
<script lang="ts" setup>
let props = defineProps({
	mode: {
		type: String,
		default: 'D'
	},
	form: {
		type: Object, default: () => {

		}
	}

});

onMounted(() => {
	console.log("DividerSolid mounted", props)
})

</script>
<style scoped lang="less">
</style>
