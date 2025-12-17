# 知识图谱本体设计器

一个基于 Next.js 和 React 的通用可视化知识图谱本体设计工具，支持任意领域的本体建模。

![Version](https://img.shields.io/badge/version-1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.10-black)
![React](https://img.shields.io/badge/React-19.2.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ 功能特性

### 🎨 可视化设计
- **交互式画布**：拖拽式节点布局，直观的图形化界面
- **双模式操作**：
  - 选择/移动模式：拖拽节点调整位置
  - 连线模式：快速建立实体间关系
- **实时预览**：所见即所得的本体结构展示

### 🔧 实体管理
- **节点创建**：快速添加新实体类型
- **属性定义**：为每个实体配置丰富的属性
  - 支持多种数据类型：String、Integer、Double、Boolean、Timestamp、Array、Object
  - 必填/可选字段标记
  - 动态增删属性
- **自定义样式**：7 种预设颜色方案，支持自由切换

### 🔗 关系建模
- **可视化连线**：直观展示实体间的关系
- **关系标签**：为每条边添加语义化描述
- **双向关联**：自动检测重复关系，避免冗余

### 📊 数据管理
- **JSON 导入/导出**：
  - 导出完整的本体结构为 JSON 文件
  - 支持导入已有的本体设计
- **实时编辑**：所有修改即时生效
- **数据持久化**：支持保存和加载设计方案

### 🎯 示例数据
内置材料科学研发本体作为演示示例，包含：

#### 核心研发域
- 材料实体 (Material)
- 成分/配方 (Composition)
- 工艺过程 (Process)
- 工艺参数 (Parameter)
- 设备/工装 (Equipment)
- 微观结构 (Microstructure)
- 宏观性能 (Property)
- 表征/测试 (Characterization)
- 应用场景 (Application)

#### 合规与知识产权域
- 法规/标准 (Standard)
- 专利 (Patent)

#### 质量与根因分析域
- 过程异常 (Anomaly)
- 缺陷/失效 (Defect)

## 🚀 快速开始

### 环境要求
- Node.js 20+
- pnpm (推荐) / npm / yarn

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 📖 使用指南

### 1. 添加实体
点击顶部工具栏的 **"添加实体"** 按钮，在画布上创建新节点。

### 2. 编辑实体属性
- 点击节点选中
- 在右侧属性面板中配置：
  - 显示名称 (Label)
  - 实体类型 (Type)
  - 节点颜色
  - 属性定义（名称、数据类型、是否必填）

### 3. 建立关系
1. 切换到 **"连线模式"**
2. 点击第一个节点（起点）
3. 点击第二个节点（终点）
4. 系统自动创建关系边
5. 点击边可编辑关系标签

### 4. 移动节点
- 切换到 **"选择/移动模式"**
- 拖拽节点到目标位置

### 5. 删除元素
- 选中节点或边
- 点击顶部工具栏的 **"删除"** 按钮

### 6. 导入/导出
- **导出**：点击 **"导出 JSON"** 保存当前设计
- **导入**：点击 **"导入 JSON"** 加载已有设计

## 🛠️ 技术栈

- **框架**：Next.js 16 (App Router)
- **UI 库**：React 19
- **语言**：TypeScript 5
- **样式**：Tailwind CSS 4
- **图标**：Lucide React
- **图形渲染**：SVG

## 📁 项目结构

```
ontology-design/
├── app/
│   ├── page.tsx          # 主应用组件
│   ├── layout.tsx        # 布局组件
│   └── globals.css       # 全局样式
├── public/               # 静态资源
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── next.config.ts        # Next.js 配置
└── README.md            # 项目文档
```

## 🎨 界面预览

应用界面包含三个主要区域：

1. **顶部工具栏**：模式切换、实体管理、导入/导出
2. **中央画布**：可视化本体设计区域，带网格背景
3. **右侧面板**：属性编辑器，支持详细配置

## 🔄 数据格式

### 导出的 JSON 结构

```json
{
  "nodes": [
    {
      "id": "node-xxx",
      "type": "Material",
      "label": "材料实体",
      "x": 400,
      "y": 150,
      "color": "#3b82f6",
      "attributes": [
        {
          "name": "材料ID",
          "type": "String",
          "required": true
        }
      ]
    }
  ],
  "edges": [
    {
      "id": "edge-xxx",
      "source": "node-xxx",
      "target": "node-yyy",
      "label": "包含成分"
    }
  ]
}
```

## 📄 许可证

MIT License

## 🔗 相关资源

- [Next.js 文档](https://nextjs.org/docs)
- [React 文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

---

**开发者**: chijiang.duan  
**版本**: v1.0  
**最后更新**: 2025-12-17
