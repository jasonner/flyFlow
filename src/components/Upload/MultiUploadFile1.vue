
<template>
  <el-upload
    v-model:file-list="fileList"
    :before-upload="handleBeforeUpload"
    :http-request="handleUpload"
    :on-remove="handleRemove"
    :on-preview="previewImg"
    :limit="props.limit"
    :disabled="disabled"
  >
    <el-button type="primary">选择文件</el-button>
  </el-upload>

  <el-dialog v-model="dialogVisible">
    <img w-full :src="previewImgUrl" alt="Preview Image" />
  </el-dialog>
</template>

<script setup lang="ts">
import {
  UploadRawFile,
  UploadRequestOptions,
  UploadUserFile,
  UploadFile,
  UploadProps,
} from "element-plus";
import { uploadFileApi, deleteFileApi } from "@/api/file";
import * as process from "process";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 文件路径集合
   */
  modelValue: {
    type: Array<Object>,
    default: [] as Array<Object>,
  },
  /**
   * 文件上传数量限制
   */
  limit: {
    type: Number,
    default: 10,
  },
	/**
	 * 文件上传大小限制
	 */
	maxSize: {
		type: Number,
		default: 10,
	},
});

const previewImgUrl = ref("");
const dialogVisible = ref(false);

const fileList = ref([] as UploadUserFile[]);
watch(
  () => props.modelValue,
  (newVal: string[]) => {
    const filePaths = fileList.value.map((file) => file.url);
    // 监听modelValue文件集合值未变化时，跳过赋值
    if (
      filePaths.length > 0 &&
      filePaths.length === newVal.length &&
      filePaths.every((x) => newVal.some((y) => y === x)) &&
      newVal.every((y) => filePaths.some((x) => x === y))
    ) {
      return;
    }

    fileList.value = newVal.map((filePath) => {
      return { url: filePath.url,name:filePath.name } as UploadUserFile;
    });
  },
  { immediate: true }
);

/**
 * 自定义图片上传
 *
 * @param params
 */
async function handleUpload(options: UploadRequestOptions): Promise<any> {
	console.log(options)
  // 上传API调用
  const { data: fileInfo } = await uploadFileApi(options.file);

  // 上传成功需手动替换文件路径为远程URL，否则图片地址为预览地址 blob:http://
  const fileIndex = fileList.value.findIndex(
    (file) => file.uid == (options.file as any).uid
  );

  fileList.value.splice(fileIndex, 1, {
    name: options.file.name,
    url: fileInfo,
  } as UploadUserFile);

  emit(
    "update:modelValue",
    fileList.value.map((file) => {
		return {
			url:file.url,name:file.name
		}
		})
  );
}

/**
 * 删除图片
 */
function handleRemove(removeFile: UploadFile) {
  const filePath = removeFile.url;

  if (filePath) {
    deleteFileApi(filePath).then(() => {
      // 删除成功回调
      emit(
        "update:modelValue",
        fileList.value.map((file) => {
			return {
		  url:file.url,name:file.name

			}
				})
      );
    });
  }
}

/**
 * 限制用户上传文件的格式和大小
 */
function handleBeforeUpload(file: UploadRawFile) {
  if (file.size > props.maxSize * 1048 * 1048) {
    ElMessage.warning("上传文件不能大于"+props.maxSize+"M");
    return false;
  }
  return true;
}

/**
 * 预览图片
 */
const previewImg: UploadProps["onPreview"] = (uploadFile) => {
	console.log("==========1=========")
	
  previewImgUrl.value = uploadFile.url!;
  dialogVisible.value = true;
};
</script>
