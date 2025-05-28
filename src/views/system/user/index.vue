<script setup lang="ts">/**
 * @see {@link https://vuejs.org/api/sfc-script-setup.html#defineoptions}
 */
import {DeptVO} from "@/api/dept/types";
import SingleUpload from "@/components/Upload/SingleUpload.vue";
import selectShow from "@/views/flyflow/components/orgselect/selectAndShow.vue";

defineOptions({
	name: "User",
	inheritAttrs: false,
});
import {UploadFile} from "element-plus";
import {
	getUserPage,
	getUserDetail,
	deleteUsers,
	addUser,
	updateUser,
	updateUserStatus,
	updateUserPassword,
	downloadTemplateApi,
	exportUser,
	importUser,
} from "@/api/user";
import {listDepts} from "@/api/dept";
import {allRoleList} from "@/api/role";

import {UserForm, UserQuery, UserPageVO} from "@/api/user/types";

const deptTreeRef = ref(); // 部门树
const queryFormRef = ref(ElForm); // 查询表单
const userFormRef = ref(ElForm); // 用户表单

const loading = ref(false);
const ids = ref([]);
const total = ref(0);
const dialog = reactive<DialogOption>({
	visible: false,
});

const queryParams = reactive<UserQuery>({
	pageNum: 1,
	pageSize: 10,
});
const userList = ref<UserPageVO[]>();

const formData = ref<UserForm>({
	status: 1,
});

const rules = reactive({
	name: [{required: true, message: "姓名不能为空", trigger: "blur"}],
	avatarUrl: [{required: true, message: "请上传头像", trigger: "blur"}],
	deptIdList: [{required: true, message: "所属部门不能为空", trigger: "blur"}],
	roleIds: [{required: true, message: "用户角色不能为空", trigger: "blur"}],
	phone: [
		{required: true, message: "手机号不能为空", trigger: "blur"},
		{
			pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
			message: "请输入正确的手机号码",
			trigger: "blur",
		},
	],
});

const searchDeptName = ref('');
const deptList = ref<DeptVO[]>();
const roleList = ref<OptionType[]>();
const importDialog = reactive<DialogOption>({
	title: "用户导入",
	visible: false,
});
const importDeptId = ref<number>(0);
const excelFile = ref<File>();
const excelFilelist = ref<File[]>([]);

watch(searchDeptName, (val) => {
	deptTreeRef.value!.filter(val)
})

//直属领导
var parentUser = computed({
	get() {
		let parentShow = formData.value.parentShow;
		if (parentShow && parentShow.length > 0) {
			return parentShow;
		}
		return undefined;
	},
	set(t) {
		formData.value.parentShow = t;
		formData.value.parentId = t[0].id;
	}
})

/**
 * 部门筛选
 */
function handleDeptFilter(value: string, data: any) {
	if (!value) {
		return true;
	}
	return data.name.indexOf(value) !== -1;
}

/**
 * 部门树节点
 */
function handleDeptNodeClick(data: { [key: string]: any }) {
	queryParams.deptId = data.id;
	handleQuery();
}

/**
 * 获取角色下拉列表
 */
async function getRoleOptions() {
	allRoleList().then((response) => {
		roleList.value = response.data;
	});
}

/**
 * 修改用户状态
 */
function handleStatusChange(row: { [key: string]: any }) {
	const text = row.status === 1 ? "启用" : "停用";
	ElMessageBox.confirm("确认要" + text + row.phone + "用户吗?", "警告", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	})
			.then(() => {
				return updateUserStatus(row.id, row.status);
			})
			.then(() => {
				ElMessage.success(text + "成功");
			})
			.catch(() => {
				row.status = row.status === 1 ? 0 : 1;
			});
}

/**
 * 查询
 */
function handleQuery() {
	loading.value = true;
	getUserPage(queryParams)
			.then(({data}) => {
				userList.value = data.records;
				total.value = data.total;
			})
			.finally(() => {
				loading.value = false;
			});
}

/**
 * 重置查询
 */
function resetQuery() {
	queryFormRef.value.resetFields();
	queryParams.pageNum = 1;
	queryParams.deptId = undefined;
	handleQuery();
}

/**
 * 行checkbox change事件
 */
function handleSelectionChange(selection: any) {
	ids.value = selection.map((item: any) => item.id);
}

/**
 * 重置密码
 */
function resetPassword(row: { [key: string]: any }) {
	ElMessageBox.prompt(
			"请输入用户「" + row.phone + "」的新密码",
			"重置密码",
			{
				confirmButtonText: "确定",
				cancelButtonText: "取消",
			}
	)
			.then(({value}) => {
				if (!value) {
					ElMessage.warning("请输入新密码");
					return false;
				}
				updateUserPassword(row.id, value).then(() => {
					ElMessage.success("密码重置成功，新密码是：" + value);
				});
			})
			.catch(() => {
			});
}

/**
 * 打开弹窗
 *
 * @param userId 用户ID
 */
async function openDialog(userId?: number) {
	await getDeptOptions();
	await getRoleOptions();

	formData.value = {
		status: 1
	}

	if (userId) {
		dialog.title = "修改用户(默认密码：123456)";
		getUserDetail(userId).then(({data}) => {

			Object.assign(formData.value, data);

			dialog.visible = true;

		});
	} else {


			dialog.title = "新增用户(默认密码：123456)";
			dialog.visible = true;

	}
}

/**
 * 关闭用户弹窗
 */
function closeDialog() {
	dialog.visible = false;
	resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
	userFormRef.value.resetFields();
	userFormRef.value.clearValidate();

	formData.value.id = undefined;
	formData.value.status = 1;
}


/**
 * 表单提交
 */
const handleSubmit = useThrottleFn(() => {
	userFormRef.value.validate((valid: any) => {
		if (valid) {
			const userId = formData.value.id;


			formData.value.fieldData = deepCopy(formData.value)
			loading.value = true;
			if (userId) {
				updateUser(userId, formData.value)
						.then(() => {
							ElMessage.success("修改用户成功");
							closeDialog();
							handleQuery();
						})
						.finally(() => (loading.value = false));
			} else {
				addUser(formData.value)
						.then(() => {
							ElMessage.success("新增用户成功");
							closeDialog();
							resetQuery();
						})
						.finally(() => (loading.value = false));
			}
		}
	});
}, 3000);

/**
 * 删除用户
 */
function handleDelete(id?: number) {
	const userIds = [id || ids.value].join(",");
	if (!userIds) {
		ElMessage.warning("请勾选删除项");
		return;
	}

	ElMessageBox.confirm("确认删除用户?", "警告", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning",
	}).then(function () {
		deleteUsers(userIds).then(() => {
			ElMessage.success("删除成功");
			resetQuery();
		});
	});
}

/**
 * 获取部门下拉项
 */
async function getDeptOptions() {
	listDepts().then((response) => {
		deptList.value = response.data;
	});
}


import {computed} from "vue";

const formatGenderShow = computed(() => {
	return function (index) {

		if (index == 1) {
			return '男'
		}
		if (index == 2) {
			return '女'
		}

		return ''
	}
})

/**
 * 下载导入模板
 */
function downloadTemplate() {
	downloadTemplateApi().then((response: any) => {
		const blob = new Blob([response.data], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
		});
		const a = document.createElement("a");
		const href = window.URL.createObjectURL(blob); // 下载链接
		a.href = href;
		a.download = decodeURI(
				response.headers["content-disposition"].split(";")[1].split("=")[1]
		); // 获取后台设置的文件名称
		document.body.appendChild(a);
		a.click(); // 点击下载
		document.body.removeChild(a); // 下载完成移除元素
		window.URL.revokeObjectURL(href); // 释放掉blob对象
	});
}

/**
 * 导入弹窗
 */
async function openImportDialog() {
	await getDeptOptions();
	await getRoleOptions();
	importDialog.visible = true;
}

/**
 * Excel文件change事件
 *
 * @param file
 */
function handleExcelChange(file: UploadFile) {
	if (!/\.(xlsx|xls|XLSX|XLS)$/.test(file.name)) {
		ElMessage.warning("上传Excel只能为xlsx、xls格式");
		excelFile.value = undefined;
		excelFilelist.value = [];
		return false;
	}
	excelFile.value = file.raw;
}

/**
 * 导入用户
 */
function handleUserImport() {
	if (importDeptId.value) {
		if (!excelFile.value) {
			ElMessage.warning("上传Excel文件不能为空");
			return false;
		}
		importUser(importDeptId.value, excelFile.value).then((response) => {
			ElMessage.success(response.data);
			closeImportDialog();
			resetQuery();
		});
	}
}

/**
 * 关闭导入弹窗
 */
function closeImportDialog() {
	importDialog.visible = false;
	excelFile.value = undefined;
	excelFilelist.value = [];
}


/**
 * 导出用户
 */
function handleUserExport() {
	exportUser(queryParams).then((response: any) => {
		const blob = new Blob([response.data], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8",
		});
		const a = document.createElement("a");
		const href = window.URL.createObjectURL(blob); // 下载的链接
		a.href = href;
		a.download = decodeURI(
				response.headers["content-disposition"].split(";")[1].split("=")[1]
		); // 获取后台设置的文件名称
		document.body.appendChild(a);
		a.click(); // 点击导出
		document.body.removeChild(a); // 下载完成移除元素
		window.URL.revokeObjectURL(href); // 释放掉blob对象
	});
}

onMounted(() => {
	getDeptOptions(); // 初始化部门
	handleQuery(); // 初始化用户列表数据
});

import {deepCopy} from "@/views/flyflow/utils/objutil";


</script>

<template>
	<div class="app-container">
		<el-row :gutter="20">
			<!-- 部门树 -->
			<el-col :lg="4" :xs="24" class="mb-[12px]">
				<el-card shadow="never">
					<el-input v-model="searchDeptName" placeholder="部门名称" clearable>
						<template #prefix>
							<i-ep-search/>
						</template>
					</el-input>

					<el-tree
							ref="deptTreeRef"
							class="mt-2"
							:data="deptList"
							:props="{ children: 'children',value:'id', label: 'name', disabled: '' }"
							:expand-on-click-node="false"
							:filter-node-method="handleDeptFilter"
							default-expand-all
							@node-click="handleDeptNodeClick"
					></el-tree>
				</el-card>
			</el-col>

			<el-col :lg="20" :xs="24">
				<div class="search">
					<el-form ref="queryFormRef" :model="queryParams" :inline="true">
						<el-form-item label="关键字" prop="keywords">
							<el-input
									v-model="queryParams.keywords"
									placeholder="姓名/手机号"
									clearable
									style="width: 200px"
									@keyup.enter="handleQuery"
							/>
						</el-form-item>

						<el-form-item label="状态" prop="status">
							<el-select
									v-model="queryParams.status"
									placeholder="全部"
									clearable
									style="width: 200px"
							>
								<el-option label="启用" value="1"/>
								<el-option label="禁用" value="0"/>
							</el-select>
						</el-form-item>

						<el-form-item>
							<el-button type="primary" @click="handleQuery"
							>
								<i-ep-search/>
								搜索
							</el-button
							>
							<el-button @click="resetQuery">
								<i-ep-refresh/>
								重置
							</el-button
							>
						</el-form-item>
					</el-form>
				</div>

				<el-card shadow="never">
					<template #header>
						<div class="flex justify-between">
							<div>
								<el-button
										v-hasPerm="['sys:user:add']"
										type="success"
										@click="openDialog()"
								>
									<i-ep-plus/>
									新增
								</el-button
								>
								<!--                <el-button-->
								<!--                  v-hasPerm="['sys:user:delete']"-->
								<!--                  type="danger"-->
								<!--                  :disabled="ids.length === 0"-->
								<!--                  @click="handleDelete()"-->
								<!--                  ><i-ep-delete />删除</el-button-->
								<!--                >-->
							</div>
							<!--              <div>-->
							<!--                <el-dropdown split-button>-->
							<!--                  导入-->
							<!--                  <template #dropdown>-->
							<!--                    <el-dropdown-menu>-->
							<!--                      <el-dropdown-item @click="downloadTemplate">-->
							<!--                        <i-ep-download />下载模板</el-dropdown-item-->
							<!--                      >-->
							<!--                      <el-dropdown-item @click="openImportDialog">-->
							<!--                        <i-ep-top />导入数据</el-dropdown-item-->
							<!--                      >-->
							<!--                    </el-dropdown-menu>-->
							<!--                  </template>-->
							<!--                </el-dropdown>-->
							<!--                <el-button class="ml-3" @click="handleUserExport"-->
							<!--                  ><template #icon><i-ep-download /></template>导出</el-button-->
							<!--                >-->
							<!--              </div>-->
						</div>
					</template>

					<el-table
							v-loading="loading"
							:data="userList"
							@selection-change="handleSelectionChange"
					>
						<el-table-column type="selection" width="50" align="center"/>
						<!--						<el-table-column-->
						<!--								key="id"-->
						<!--								label="编号"-->
						<!--								align="center"-->
						<!--								prop="id"-->
						<!--								width="60"-->
						<!--						/>-->
						<el-table-column label="头像" width="180">
							<template #default="scope">
								<el-avatar v-if="scope.row.avatarUrl&&scope.row.avatarUrl.length>0" shape="square" :size="40"
													 :src="scope.row.avatarUrl"/>
								<el-avatar shape="square" :size="40" v-else>
									{{ scope.row.name.length > 2 ? scope.row.name.substring(0, 2) : scope.row.name }}
								</el-avatar>
							</template>
						</el-table-column>
						<el-table-column
								key="phone"
								label="手机号"
								align="center"
								width="180"

								prop="phone"
						/>
						<el-table-column
								label="姓名"
								min-width="120"
								align="center"
								prop="name"
						/>

						<!--						<el-table-column-->
						<!--								label="性别"-->
						<!--								width="100"-->
						<!--								align="center"-->
						<!--								prop="gender"-->
						<!--						>-->

						<!--							<template #default="scope">-->

						<!--								{{ formatGenderShow(scope.row.gender) }}-->
						<!--							</template>-->
						<!--						</el-table-column>-->

						<el-table-column
								label="部门"
								min-width="120"
								align="center"
								prop="deptName"
						/>

						<el-table-column label="状态"

														 width="180"

														 align="center" prop="status">
							<template #default="scope">
								<el-switch
										v-model="scope.row.status"
										:inactive-value="0"
										:active-value="1"
										@change="handleStatusChange(scope.row)"
								/>
							</template>
						</el-table-column>
						<!--						<el-table-column-->
						<!--								label="创建时间"-->
						<!--								align="center"-->
						<!--								prop="createTime"-->
						<!--								width="180"-->
						<!--						></el-table-column>-->
						<el-table-column label="操作" fixed="right" width="220">
							<template #default="scope">
								<el-button
										v-hasPerm="['sys:user:reset_pwd']"
										type="primary"
										size="small"
										link
										@click="resetPassword(scope.row)"
								>
									<i-ep-refresh-left/>
									重置密码
								</el-button
								>
								<el-button
										v-hasPerm="['sys:user:edit']"
										type="primary"
										link
										size="small"
										@click="openDialog(scope.row.id)"
								>
									<i-ep-edit/>
									编辑
								</el-button
								>
								<el-button
										v-hasPerm="['sys:user:delete']"
										type="primary"
										link
										size="small"
										@click="handleDelete(scope.row.id)"
								>
									<i-ep-delete/>
									删除
								</el-button
								>
							</template>
						</el-table-column>
					</el-table>

					<pagination
							v-if="total > 0"
							v-model:total="total"
							v-model:page="queryParams.pageNum"
							v-model:limit="queryParams.pageSize"
							@pagination="handleQuery"
					/>
				</el-card>
			</el-col>
		</el-row>

		<!-- 表单弹窗 -->
		<el-dialog
				v-model="dialog.visible"
				:title="dialog.title"
				width="600px"
				append-to-body
				destroy-on-close
				@close="closeDialog"
		>
			<el-form
					ref="userFormRef"
					:model="formData"
					:rules="rules"
					label-width="80px"
			>
				<el-form-item label="头像" prop="avatarUrl">
					<single-upload v-model="formData.avatarUrl"/>

				</el-form-item>
				<el-form-item label="手机号" prop="phone">
					<el-input
							v-model="formData.phone"
							placeholder="请输入手机号"
					/>
				</el-form-item>

				<el-form-item label="姓名" prop="name">
					<el-input v-model="formData.name" placeholder="请输入姓名"/>
				</el-form-item>
				<el-form-item label="直属领导" prop="leader">
					<!--					<el-input @click="startSelectUser" readonly v-model="formData.leaderName" placeholder="请选择部门负责人"/>-->
					<select-show
							:disabled="false" v-model:orgList="parentUser" type="user" :multiple="false">

					</select-show>
				</el-form-item>


				<el-form-item label="所属部门" prop="deptIdList">
					<el-tree-select
							v-model="formData.deptIdList"
							placeholder="请选择所属部门"
							:data="deptList"
							filterable
							style="width: 100%"
							multiple
							:props="{label:'name',value:'id'}"
							check-strictly
							:render-after-expand="false"
					/>
				</el-form-item>


				<el-form-item label="角色" prop="roleIds">
					<el-select v-model="formData.roleIds" multiple
										 style="width: 100%"
										 placeholder="请选择">
						<el-option
								v-for="item in roleList"
								:key="item.id"
								:label="item.name"
								:value="item.id"
						/>
					</el-select>
				</el-form-item>


				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="formData.status">
						<el-radio :label="1">正常</el-radio>
						<el-radio :label="0">禁用</el-radio>
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

		<!-- 导入弹窗 -->
		<el-dialog
				v-model="importDialog.visible"
				:title="importDialog.title"
				width="600px"
				append-to-body
				@close="closeImportDialog"
		>
			<el-form label-width="80px">
				<el-form-item label="部门">
					<el-tree-select
							v-model="importDeptId"
							placeholder="请选择部门"
							:data="deptList"
							filterable
							check-strictly
					/>
				</el-form-item>

				<el-form-item label="Excel">
					<el-upload
							class="upload-demo"
							action=""
							drag
							:auto-upload="false"
							accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
							:file-list="excelFilelist"
							:on-change="handleExcelChange"
							:limit="1"
					>
						<el-icon class="el-icon--upload">
							<i-ep-upload-filled/>
						</el-icon>
						<div class="el-upload__text">
							将文件拖到此处，或
							<em>点击上传</em>
						</div>
						<template #tip>
							<div class="el-upload__tip">xls/xlsx files</div>
						</template>
					</el-upload>
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button type="primary" @click="handleUserImport">确 定</el-button>
					<el-button @click="closeImportDialog">取 消</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>
