import { FormGroupVO, FormConfigBorderVO } from "./types";

const formGroupConfig: FormGroupVO[] = [
  {
    name: "文本",
    formList: [
      {
        name: "单行文本",
        type: "Input",
        typeName: "单行文本",
        icon: "EditPen",
        placeholder: "请填写",
        required: false,
        printable: true,
        props: {
          value: "",
          regex: "",
          regexDesc: "",
          minLength: undefined,
          maxLength: undefined,
        },
      },
      {
        name: "多行文本",
        icon: "More",
        type: "Textarea",
        typeName: "多行文本",
        placeholder: "请填写",
        required: false,
        printable: true,
        props: {
          value: "",
        },
      },
      {
        name: "说明",
        icon: "ChatLineSquare",
        type: "Description",
        typeName: "说明",
        placeholder: "请填写",
        required: false,
        printable: true,
        props: {
          value: "",
        },
      },
    ],
  },
  {
    name: "数值",
    formList: [
      {
        name: "数字",
        type: "Number",
        icon: "Edit",

        typeName: "数字",
        placeholder: "请填写",
        required: false,
        printable: true,
        props: {
          radixNum: 0,
          sum: false,
        },
      },
      {
        name: "金额",
        type: "Money",
        icon: "Money",

        typeName: "金额",
        placeholder: "请填写",
        required: false,
        printable: true,
        props: {
          radixNum: 0,
          sum: false, //统计总数
        },
      },
    ],
  },
  {
    name: "日期-时间",
    formList: [
      {
        name: "日期",
        type: "Date",
        icon: "Calendar",

        typeName: "日期",
        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          defaultRoot: false,

          radixNum: 0,
          value: "",
        },
      },
      {
        name: "日期时间",
        type: "DateTime",
        icon: "AlarmClock",

        typeName: "日期时间",
        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          defaultRoot: false,

          radixNum: 0,
          value: "",
        },
      },
      {
        name: "时间",
        type: "Time",
        icon: "Timer",

        typeName: "时间",
        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          defaultRoot: false,

          radixNum: 0,
          value: "",
        },
      },
    ],
  },
  {
    name: "选项",
    formList: [
      {
        name: "单选",
        icon: "Select",
        type: "SingleSelect",
        typeName: "单选",
        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          privateVal: false, //是否是私有的变量值，如果是私有的 则存储到task的本地变量里
          value: [],
          remoteConfig: {
            enable: false,
            url: "http://127.0.0.1:26859/test/getTestSelectOptions",

            header: [],
            body: [],
          },
          dataFrom: 1, //1手动添加2外部
          options: [
            {
              key: "",
              value: "",
            },
          ],
        },
      },
      {
        name: "多选",
        type: "MultiSelect",
        typeName: "多选",
        icon: "Finished",
        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          remoteConfig: {
            enable: false,
            url: "http://127.0.0.1:26859/test/getTestSelectOptions",

            header: [],
            body: [],
          },
          dataFrom: 1, //1手动添加2外部
          value: [],
          options: [
            {
              key: "",
              value: "",
            },
          ],
        },
      },
    ],
  },
  {
    name: "组织架构",
    formList: [
      {
        name: "单用户",
        type: "SelectUser",
        typeName: "单用户",
        placeholder: "请选择",
        icon: "User",

        required: false,
        printable: true,
        props: {
          defaultRoot: false,
          multi: false,
          self: true,
          value: [],
        },
      },
      {
        name: "多用户",
        type: "SelectMultiUser",
        typeName: "多用户",
        placeholder: "请选择",
        icon: "User",

        required: false,
        printable: true,
        props: {
          defaultRoot: false,
          multi: true,
          self: true,
          value: [],
        },
      },
      {
        name: "单部门",
        icon: "OfficeBuilding",
        type: "SelectDept",
        typeName: "单部门",
        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          defaultRoot: false,
          multi: false,
          self: true,
          value: [],
        },
      },
      {
        name: "多部门",
        icon: "OfficeBuilding",
        type: "SelectMultiDept",
        typeName: "多部门",
        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          defaultRoot: false,
          multi: true,
          self: true,
          value: [],
        },
      },
    ],
  },
  {
    name: "布局",
    formList: [
      {
        name: "栅格布局",
        type: "GridBox",
        typeName: "栅格布局",
        icon: "Grid",
        required: false,
        printable: true,
        props: {
          gutter: 20,
          justify: "center",
          align: "center",
          cols: [
            {
              span: 12,
              children: [],
            },
            {
              span: 12,
              children: [],
            },
          ],
        },
        dynamicForm: [
          { id: "gutter", name: "栅格间距" },
          { id: "justify", name: "主轴对齐方式" },
          { id: "align", name: "交叉轴对齐方式" },
        ],
      },
      {
        name: "标签页布局",
        type: "TabsLayout",
        icon: "CollectionTag",
        typeName: "标签页布局",
        props: {
          tabs: [
            {
              label: "Tab 1",
              name: "tab1",
              content: "这是 Tab 1 的内容",
            },
            {
              label: "Tab 2",
              name: "tab2",
              content: "这是 Tab 2 的内容",
            },
          ],
          activeTab: "tab1",
        },
      },
      {
        name: "卡片布局",
        type: "CardLayout",
        icon: "Postcard",
        typeName: "卡片布局",
        props: {
          title: "我的卡片布局", // 主标题
          sections: [],
          textAlign: "center", // 标题位置
          color: "#333", // 标题颜色
          fontSize: "16px", // 标题字体大小
          fontWeight: "normal", // 标题字体粗细
        },
      },
      {
        name: "分割线",
        icon: "SemiSelect",
        type: "DividerSolid",
        typeName: "分割线",
        required: false,
        printable: true,
        props: {
          height: 1,
          borderWidth: "100%",
          color: "#000000",
          style: "dashed",
          text: "分割线内容",
          textAlign: "center",
          mode: "horizontal",
        },
      },
    ],
  },
  {
    name: "其他",
    formList: [
      {
        name: "图片",
        type: "UploadImage",
        typeName: "图片",
        icon: "Picture",

        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          value: [],
          min: 1,
          max: 10,
          maxSize: 10,
        },
      },

      {
        name: "文件",
        type: "UploadFile",
        typeName: "文件",
        icon: "Upload",
        placeholder: "请选择",
        required: false,
        printable: true,
        props: {
          value: [],
          min: 1,
          max: 10,
          maxSize: 10,
          suffixArray: [],
        },
      },
    ],
  },
];

export { formGroupConfig };
