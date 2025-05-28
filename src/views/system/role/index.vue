<script setup lang="ts">
defineOptions({
	name: "Role",
	inheritAttrs: false,
});

import {
	allRoleList,
	updateRole,
	getRoleForm,
	addRole,
	deleteRoles,
	getRoleMenuIds,
	updateRoleMenus,
} from "@/api/role";
import {listMenuOptions} from "@/api/menu";

import {RolePageVO, RoleForm, RoleQuery} from "@/api/role/types";

const queryFormRef = ref(ElForm);
const roleFormRef = ref(ElForm);
const menuRef = ref(ElTree);

const loading = ref(false);
const ids = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<RoleQuery>({
	pageNum: 1,
	pageSize: 10,
});

const roleList = ref<RolePageVO[]>();

const dialog = reactive<DialogOption>({
	visible: false,
});

const formData = reactive<RoleForm>({
	sort: 1,
	status: 1,
	id: "",
	name: "",
});

const rules = reactive({
	name: [{required: true, message: "请输入角色名称", trigger: "blur"}],
	id: [{required: true, message: "请输入角色编码", trigger: "blur"}],
	dataScope: [{required: true, message: "请选择数据权限", trigger: "blur"}],
	status: [{required: true, message: "请选择状态", trigger: "blur"}],
});

const menuDialogVisible = ref(false);

const menuList = ref<OptionType[]>([]);
import {computed} from "vue";

const formatDataScopeShow = computed(() => {
	return function (index) {
		if (index == 0) {
			return '全部数据'
		}
		if (index == 1) {
			return '部门以及子部门数据'
		}
		if (index == 2) {
			return '本部门数据'
		}
		if (index == 3) {
			return '本人数据'
		}
		return ''
	}
})

interface CheckedRole {
	id?: number;
	name?: string;
}

let checkedRole: CheckedRole = reactive({});

/**
 * 查询
 */
function handleQuery() {
	loading.value = true;
	allRoleList(queryParams)
			.then(({data}) => {
				roleList.value = data;
			})
			.finally(() => {
				loading.value = false;
			});
}

/**
 * 重置查询
 */
function resetQuery() {
	queryParams.pageNum = 1;
	handleQuery();
}

/**
 * 行checkbox change事件
 */
function handleSelectionChange(selection: any) {
	ids.value = selection.map((item: any) => item.id);
}

/**
 * 打开角色表单弹窗
 *
 * @param roleId
 */
function openDialog(row?: Object) {
	dialog.visible = true;
	formData.edit=false;

	if (row.id) {
		dialog.title = "修改角色";
		formData.edit=true;
		Object.assign(formData, row);
	} else {
		dialog.title = "新增角色";
		Object.assign(formData, {
			id:'',
			status:1,
			name:''
		});

	}
}

/**
 * 角色表单提交
 */
function handleSubmit() {
	loading.value = true;
	roleFormRef.value.validate((valid: any) => {
		if (valid) {
			if (formData.edit) {
				updateRole( formData)
						.then(() => {
							ElMessage.success("修改成功");
							closeDialog();
							resetQuery();
						})
						.finally(() => (loading.value = false));
			} else {
				addRole(formData)
						.then(() => {
							ElMessage.success("新增成功");
							closeDialog();
							resetQuery();
						})
						.finally(() => (loading.value = false));
			}
		}
	});
}

/**
 * 关闭弹窗
 */
function closeDialog() {
	dialog.visible = false;
	resetForm();
}

/**
 * 重置表单
 */
function resetForm() {

	formData.id = undefined;
	formData.sort = 1;
	formData.status = 1;
}

/**
 * 删除
 */
function handleDelete(roleId?: number) {
	const roleIds = [roleId || ids.value].join(",");
	if (!roleIds) {
		ElMessage.warning("请勾选删除项");
		return;
	}

	ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(() => {
		loading.value = true;
		deleteRoles(roleIds)
				.then(() => {
					ElMessage.success("删除成功");
					resetQuery();
				})
				.finally(() => (loading.value = false));
	});
}

/**
 * 打开分配菜单弹窗
 */
function openMenuDialog(row: RolePageVO) {
	const roleId = row.id;
	if (roleId) {
		checkedRole = {
			id: roleId,
			name: row.name,
		};
		menuDialogVisible.value = true;
		loading.value = true;

		// 获取所有的菜单
		listMenuOptions().then((response) => {
			menuList.value = response.data;
			// 回显角色已拥有的菜单
			getRoleMenuIds(roleId)
					.then(({data}) => {
						const checkedMenuIds = data;
						checkedMenuIds.forEach((menuId) =>
								menuRef.value.setChecked(menuId, true, false)
						);
					})
					.finally(() => {
						loading.value = false;
					});
		});
	}
}

/**
 * 角色分配菜单提交
 */
function handleRoleMenuSubmit() {
	const roleId = checkedRole.id;

	console.log(checkedRole)

	if (roleId) {
		const checkedMenuIds: number[] = menuRef.value
				.getCheckedNodes(false, true)
				.map((node: any) => node.id);

		loading.value = true;
		updateRoleMenus(roleId, checkedMenuIds)
				.then((res) => {
					ElMessage.success("分配权限成功");
					menuDialogVisible.value = false;
					resetQuery();
				})
				.finally(() => {
					loading.value = false;
				});
	}
}

onMounted(() => {
	handleQuery();
});
</script>

<template>
	<div class="app-container">
		<!--    <div class="search">-->
		<!--      <el-form ref="queryFormRef" :model="queryParams" :inline="true">-->
		<!--        <el-form-item prop="keywords" label="关键字">-->
		<!--          <el-input-->
		<!--            v-model="queryParams.keywords"-->
		<!--            placeholder="角色名称"-->
		<!--            clearable-->
		<!--            @keyup.enter="handleQuery"-->
		<!--          />-->
		<!--        </el-form-item>-->

		<!--        <el-form-item>-->
		<!--          <el-button type="primary" @click="handleQuery"-->
		<!--            ><i-ep-search />搜索</el-button-->
		<!--          >-->
		<!--          <el-button @click="resetQuery"><i-ep-refresh />重置</el-button>-->
		<!--        </el-form-item>-->
		<!--      </el-form>-->
		<!--    </div>-->

		<el-card shadow="never">
			<template #header>
				<el-button
						v-hasPerm="['sys:role:add']"

						type="success" @click="openDialog({})"
				>
					<i-ep-plus/>
					新增
				</el-button
				>
				<!--        <el-button-->
				<!--          type="danger"-->
				<!--          :disabled="ids.length === 0"-->
				<!--          @click="handleDelete()"-->
				<!--          ><i-ep-delete />删除</el-button-->
				<!--        >-->
			</template>

			<el-table
					ref="dataTableRef"
					v-loading="loading"
					:data="roleList"
					highlight-current-row
					border
					@selection-change="handleSelectionChange"
			>
				<!--        <el-table-column type="selection" width="55" align="center" />-->
				<el-table-column label="角色名称" prop="name" min-width="100"/>
				<el-table-column label="角色编码" prop="id" width="150"/>
				<!--					<el-table-column label="数据权限" prop="dataScope" width="250" >-->
				<!--			  <template #default="scope">-->
				<!--	{{formatDataScopeShow(scope.row.dataScope)}}-->

				<!--			  </template>-->
				<!--					</el-table-column>-->

				<el-table-column label="状态" align="center" width="100">
					<template #default="scope">
						<el-tag v-if="scope.row.status === 1" type="success">正常</el-tag>
						<el-tag v-else type="info">禁用</el-tag>
					</template>
				</el-table-column>

				<!--        <el-table-column label="排序" align="center" width="80" prop="sort" />-->

				<el-table-column fixed="right" label="操作" width="220">
					<template #default="scope">
						<el-button
								type="primary"
								size="small"
								link
								v-hasPerm="['sys:role:perm']"

								@click="openMenuDialog(scope.row)"
						>
							<i-ep-position/>
							分配权限
						</el-button>
						<el-button
								type="primary"
								size="small"
								link
								v-hasPerm="['sys:role:edit']"

								@click="openDialog(scope.row)"
						>
							<i-ep-edit/>
							编辑
						</el-button>
						<el-button
								type="primary"
								size="small"
								link
								v-hasPerm="['sys:role:delete']"

								@click="handleDelete(scope.row.id)"
						>
							<i-ep-delete/>
							删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>

			<!--      <pagination-->
			<!--        v-if="total > 0"-->
			<!--        v-model:total="total"-->
			<!--        v-model:page="queryParams.pageNum"-->
			<!--        v-model:limit="queryParams.pageSize"-->
			<!--        @pagination="handleQuery"-->
			<!--      />-->
		</el-card>

		<!-- 角色表单弹窗 -->
		<el-dialog
				v-model="dialog.visible"
				:title="dialog.title"
				width="500px"
				@close="closeDialog"
		>
			<el-form
					ref="roleFormRef"
					:model="formData"
					:rules="rules"
					label-width="100px"
			>
				<el-form-item label="角色名称" prop="name">
					<el-input v-model="formData.name" placeholder="请输入角色名称"/>
				</el-form-item>

				<el-form-item label="角色编码" prop="id">
					<el-input :disabled="formData.edit" v-model="formData.id" placeholder="请输入角色编码"/>
				</el-form-item>



				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="formData.status">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="0">停用</el-radio>
					</el-radio-group>
				</el-form-item>

			</el-form>

			<template #footer>
				<div class="dialog-footer">
					<el-button type="primary" @click="handleSubmit">确 定</el-button>
					<el-button @click="closeDialog">取 消</el-button>
				</div>
			</template>
		</el-dialog>

		<!-- 分配菜单弹窗  -->
		<el-dialog
				v-model="menuDialogVisible"
				:title="'【' + checkedRole.name + '】权限分配'"
				width="800px"
		>
			<el-scrollbar v-loading="loading" max-height="600px">
				<el-tree
						ref="menuRef"
						node-key="id"
						show-checkbox
						:data="menuList"
						:default-expand-all="true"
				>
					<template #default="{ data }">
						{{ data.name }}
					</template>
				</el-tree>
			</el-scrollbar>

			<template #footer>
				<div class="dialog-footer">
					<el-button type="primary" @click="handleRoleMenuSubmit"
					>确 定
					</el-button
					>
					<el-button @click="menuDialogVisible = false">取 消</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>
