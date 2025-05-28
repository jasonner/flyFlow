<template>
  <div>
    <div class="titlebar">
      <div class="f1">
        <el-text tag="b" size="large" line-clamp="1" type="primary">{{ flowName }}</el-text>
      </div>
      <div class="f2">


				<span class="center_t" effect="dark" :activeStep="activeStep==0" @click="activeStep=0">
							<span :activeStep="activeStep==0">1</span>
							<span>基础信息</span>
					</span>
        <span class="center_t" effect="dark" :activeStep="activeStep==1" @click="activeStep=1">
							<span :activeStep="activeStep==1">2</span>
							<span>表单设计</span>
					</span>
        <span class="center_t" effect="dark" :activeStep="activeStep==2" @click="activeStep=2">
							<span :activeStep="activeStep==2">3</span>
							<span>流程设计</span>
					</span>

      </div>
      <div class="f3">
                <el-button :icon="DocumentAdd" type="warning" @click="publish(false)">暂 存</el-button>
        <el-button :icon="Promotion" type="primary" @click="publish(true)">发 布</el-button>
      </div>
    </div>

    <div style="height: 5px;background-color: white;margin-bottom: 0px"></div>
    <step1 v-show="activeStep === 0" :groupId="paramGroupId" ref="step1Ref"/>
    <step2 v-show="activeStep === 1" ref="step2Ref"/>
    <step3 v-show="activeStep === 2" :nodeConfigObj="step3NodeConfig" ref="step3Ref"/>



    <!--			//验证每一步-->
    <el-dialog v-model="validateDialogShow" :show-close="true" title="流程检查"  >

      <el-steps :active="validateFlowStep" finish-status="success" simple style="margin-top: 0px">
        <el-step title="基础信息"/>
        <el-step title="表单设计"/>
        <el-step title="流程设计"/>

      </el-steps>

      <div style="text-align: center">
        <el-result v-if="validateFlowStep==3&&validateErrMsg.length==0"
                   icon="success"
                   title="检查成功"
                   sub-title="流程检查完成，现在提交？"
        >
          <template #extra>
            <el-button :icon="Select"  :loading="submitLoading" type="primary" @click="submitFlow">提交</el-button>
          </template>
        </el-result>


        <el-result title="检查中" sub-title="正在检查流程信息"
                   v-if="validateErrMsg.length==0&&validateDialogShow&&validatingShow&&validateFlowStep<3">
          <template #icon>
						<span v-loading="true"
                  style="display: inline-block;border:0px solid red;width: 100px;height: 100px;">

						</span>
          </template>

        </el-result>

        <el-result v-if="validateErrMsg.length>0"
                   icon="error"
                   title="检查失败"
        >
          <template #sub-title>
            <div v-for="item in validateErrMsg">
              <el-text type="danger">

                <el-icon>
                  <WarnTriangleFilled/>
                </el-icon>
                {{ item }}
              </el-text>
            </div>
          </template>
          <template #extra>
            <el-button type="primary" @click="gotoEdit">去修改</el-button>
          </template>
        </el-result>

      </div>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import {ref,computed, onMounted, provide} from "vue";
import {DocumentAdd, Promotion,WarnTriangleFilled,Select} from "@element-plus/icons-vue";
import {
  addFlow, getFlowDetail
} from "../../api/flow/index";


import * as util from "../../utils/objutil";


import Step1 from "../../components/flow/step1.vue";
import Step2 from "../../components/flow/step2.vue";
import Step3 from "../../components/flow/step3.vue";

import {LocationQuery, LocationQueryValue, onBeforeRouteLeave, useRoute, useRouter} from "vue-router";


import {useUserStore} from "../../stores/user";


//表示流程图可编辑
provide("readOnlyAtFlow",false);
// 监听路由离开
onBeforeRouteLeave((to, from, next) => {


  store.$reset();
  next()

})


const userStore = useUserStore();

import {useFlowStore} from "../../stores/flow";

let store = useFlowStore();
const step1Ref = ref();
const step2Ref = ref();
const step3Ref = ref();


const validateErrMsg = ref([])

const flowName = computed(() => {
  let name1 = store.step1.name;
  if (util.isBlank(name1)) {
    return '未命名表单'
  }
  return name1
})

const activeStep = ref(0);
const validateFlowStep = ref(0);
const validateDialogShow = ref(false);
const validatingShow = ref(false);

const gotoEdit = () => {
  activeStep.value = validateFlowStep.value;
  validateDialogShow.value = false
}
//直接发布还是保存
const directPublish=ref(true);


const publish = (p) => {

  directPublish.value=p;

  validateErrMsg.value = []

  validateFlowStep.value = 0
  validateDialogShow.value = true;
  validatingShow.value = true;


  setTimeout(function () {
    //1
    checkStep1();


  }, 500)


}

import {formGroupConfig} from "../../api/form/data";
import {assiginObj, getRandomId} from "../../utils/objutil";


const route = useRoute();
onMounted(() => {
  const query: LocationQuery = route.query;

  const groupId = (query.groupId as LocationQueryValue) ?? "";
  const flowId = (query.flowId as LocationQueryValue) ?? "";
  const id = (query.id as LocationQueryValue) ?? "";
  const cp = (query.cp as LocationQueryValue) ?? "";

	//保存到store
	provide("currentFlowId", flowId);


	if(util.isNotBlank(id)){
		store.step1.uniqueId = id
	}else{
		store.step1.uniqueId = getRandomId()

	}


  if (util.isNotBlank(groupId)) {
    paramGroupId.value = (groupId);
  }
  if (util.isNotBlank(flowId)) {

    getFlowDetail(flowId).then(res => {
      var {data} = res;

      store.step1.admin = JSON.parse(data.admin)
      store.step1.rangeList = (data.rangeList)
      store.step1.name = data.name
      store.step1.logo = data.logo
      if (!cp || !(parseInt(cp) === 1)) {
        //复制
        store.step1.flowId = flowId


      }
      store.step1.remark = data.remark;
      store.step1.groupId = data.groupId;

			let formItemList = JSON.parse(data.formItemsPc);
			//处理默认新增字段
			{
				var arr=[];

				for(var n of formItemList){

					for(var item of formGroupConfig){
						for(var f of item.formList){
							if(f.type===n.type){
								let v = assiginObj(util.deepCopy(f),util.deepCopy(n));
								arr.push(v)
								break
							}
						}
					}
				}

				store.setStep2Form(arr)

			}

      step3NodeConfig.value = JSON.parse(data.process)
    })
  } else {
    //新增
    let userId = userStore.userId;
    let name = userStore.nickname;
    let avatar = userStore.avatar;
	  step3NodeConfig.value=[];
    store.step1.admin = [{
      "id": userId,
      name: name,
      avatar: avatar,
      type: 'user'
    }]

  }


})
const step3NodeConfig = ref()

var paramGroupId = ref('');


const checkStep1 = () => {
  step1Ref.value.validate(function (valid, arr) {
    if (valid) {
      validateFlowStep.value = 1

      console.log("step-1", new Date().getTime())
      setTimeout(function () {
        checkStep2();
      }, 100)

    } else {
      validatingShow.value = false;
      //错误信息
      validateErrMsg.value = arr;
    }
  });
}
const checkStep2 = () => {
  // step2Ref.value.validate(function (valid, arr) {
  //       if (valid) {
  //         console.log("step-2", new Date().getTime())

  //         setTimeout(function () {
  //           validateFlowStep.value = 2
  //           checkStep3();
  //         }, 100)
  //       } else {
  //         validatingShow.value = false;
  //         //错误信息
  //         validateErrMsg.value = arr;
  //       }
  //     }
  // );
  if(store.step2.widgetList && store.step2.widgetList.length>0){
    validateFlowStep.value = 2;
    checkStep3();
  }else{
    validateErrMsg.value.push("请设计表单后点保存");
    validatingShow.value = false;
  }
}


const checkStep3 = () => {
  setTimeout(function () {


    step3Ref.value.validate(function (valid, arr) {
      if (valid) {
        console.log("step-3", new Date().getTime())

        setTimeout(function () {
          validateFlowStep.value = 3

        }, 100)

      } else {
        validatingShow.value = false;
        //错误信息
        validateErrMsg.value = arr;
      }
    })
  })
}


const router = useRouter();

const submitLoading=ref(false)

const submitFlow = () => {
	submitLoading.value=true;
  step3Ref.value.getProcessData().then(res => {
    let step1 = store.step1;
    let step2 = store.step2;


    let flow = util.deepCopy(step1);
    flow.formItems = JSON.stringify(step2);
    flow.formItemsPc = JSON.stringify(store.step2Form);
    flow.process = JSON.stringify(res);
    flow.admin = JSON.stringify(step1.admin);

    flow.publish=directPublish.value

    addFlow(flow).then(res => {
      validateDialogShow.value = false;
      //TODO 修改返回地址
      router.push("/flow/group")
    }).finally(()=>{
			submitLoading.value=false;

		})


  })
}

</script>
<style scoped lang="less">
@f2_width: 800px;
.titlebar {
  padding-top: 10px;
  padding-bottom: 10px;
  height: 60px;
  display: flex;
  flex-direction: row;
  //margin-bottom: 40px;

  .f1 {
    width: calc(100% / 2 - @f2_width / 2);
    line-height: 46px;
    padding-left: 20px;
  }

  .f2 {
    width: @f2_width;
    text-align: center;
  }

  .f3 {
    width: calc(100% / 2 - @f2_width / 2);

    text-align: right;
    line-height: 46px;
    height: 46px;
    padding-right: 20px;
  }
}

.center_t {
  cursor: pointer;
  padding: 10px 10px;
  margin: 0px 5px;


  display: inline-block;


  span:first-child {
    margin-right: 6px;
    font-size: 14px;
    font-weight: 400;
    text-align: center;
    line-height: 22px;
    border: 1px solid;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: inline-block
  }

  span:first-child[activeStep=true] {
    color: white;
    background-color: var(--el-color-primary);
  }

  span:last-child {
    font-weight: 500;
    font-size: 14px;
  }


}

.center_t[activeStep=true] {
  border-bottom: 2px solid var(--el-color-primary);
  color: var(--el-color-primary);

}
</style>
