import { Node, Edge } from './types';

export const INITIAL_DATA: { nodes: Node[]; edges: Edge[] } = {
    nodes: [
        // --- 1. 核心研发域 ---
        {
            id: 'node-material',
            type: 'Material',
            label: '材料实体 (Material)',
            x: 400,
            y: 150,
            color: '#3b82f6',
            attributes: [
                { name: '材料ID', type: 'String', required: true },
                { name: '名称', type: 'String', required: true },
                { name: '批次号', type: 'String', required: true },
                { name: '制备人', type: 'String', required: false }
            ]
        },
        {
            id: 'node-composition',
            type: 'Composition',
            label: '成分/配方 (Composition)',
            x: 150,
            y: 150,
            color: '#64748b',
            attributes: [
                { name: '元素列表', type: 'Array', required: true },
                { name: '化学式', type: 'String', required: false },
                { name: '添加剂比例', type: 'Double', required: false },
                { name: '纯度', type: 'Double', required: false }
            ]
        },
        {
            id: 'node-process',
            type: 'Process',
            label: '工艺过程 (Process)',
            x: 400,
            y: 300,
            color: '#8b5cf6',
            attributes: [
                { name: '工艺ID', type: 'String', required: true },
                { name: '工艺类型', type: 'String', required: true },
                { name: '操作员', type: 'String', required: false },
                { name: '日期', type: 'Timestamp', required: true }
            ]
        },
        {
            id: 'node-parameter',
            type: 'Parameter',
            label: '工艺参数 (Parameter)',
            x: 250,
            y: 400,
            color: '#f59e0b',
            attributes: [
                { name: '设定温度', type: 'Double', required: false },
                { name: '实际压力', type: 'Double', required: false },
                { name: '保温时间', type: 'Integer', required: false },
                { name: '气氛', type: 'String', required: false }
            ]
        },
        {
            id: 'node-equipment',
            type: 'Equipment',
            label: '设备/工装 (Equipment)',
            x: 550,
            y: 400,
            color: '#d97706',
            attributes: [
                { name: '设备编号', type: 'String', required: true },
                { name: '校准日期', type: 'Timestamp', required: false },
                { name: '运行状态', type: 'String', required: false }
            ]
        },
        {
            id: 'node-structure',
            type: 'Microstructure',
            label: '微观结构 (Microstructure)',
            x: 650,
            y: 150,
            color: '#10b981',
            attributes: [
                { name: '晶粒尺寸', type: 'Double', required: false },
                { name: '相组成', type: 'String', required: false },
                { name: '孔隙分布', type: 'String', required: false }
            ]
        },
        {
            id: 'node-property',
            type: 'Property',
            label: '宏观性能 (Property)',
            x: 800,
            y: 300,
            color: '#ef4444',
            attributes: [
                { name: '抗拉强度', type: 'Double', required: false },
                { name: '导电率', type: 'Double', required: false },
                { name: '失效载荷', type: 'Double', required: false }
            ]
        },
        {
            id: 'node-characterization',
            type: 'Characterization',
            label: '表征/测试 (Characterization)',
            x: 650,
            y: 450,
            color: '#8b5cf6',
            attributes: [
                { name: '测试标准', type: 'String', required: true },
                { name: '采样位置', type: 'String', required: false },
                { name: '环境温度', type: 'Double', required: false }
            ]
        },
        {
            id: 'node-application',
            type: 'Application',
            label: '应用场景 (Application)',
            x: 950,
            y: 150,
            color: '#14b8a6',
            attributes: [
                { name: '客户', type: 'String', required: false },
                { name: '服役寿命', type: 'Integer', required: false },
                { name: '工况要求', type: 'String', required: false }
            ]
        },
        // --- 2. 合规与知识产权域 ---
        {
            id: 'node-standard',
            type: 'Standard',
            label: '法规/标准 (Standard)',
            x: 150,
            y: 50,
            color: '#059669',
            attributes: [
                { name: '标准号', type: 'String', required: true },
                { name: '阈值要求', type: 'String', required: false },
                { name: '生效日期', type: 'Timestamp', required: false }
            ]
        },
        {
            id: 'node-patent',
            type: 'Patent',
            label: '专利 (Patent)',
            x: 250,
            y: 250,
            color: '#7c3aed',
            attributes: [
                { name: '专利号', type: 'String', required: true },
                { name: '权利要求', type: 'String', required: false },
                { name: '保护期', type: 'Integer', required: false },
                { name: '持有者', type: 'String', required: false }
            ]
        },
        // --- 3. 质量与根因分析域 ---
        {
            id: 'node-anomaly',
            type: 'Anomaly',
            label: '过程异常 (Anomaly)',
            x: 400,
            y: 500,
            color: '#f97316',
            attributes: [
                { name: '异常代码', type: 'String', required: true },
                { name: '发生时刻', type: 'Timestamp', required: true },
                { name: '偏离幅度', type: 'Double', required: false },
                { name: '处置措施', type: 'String', required: false }
            ]
        },
        {
            id: 'node-defect',
            type: 'Defect',
            label: '缺陷/失效 (Defect)',
            x: 650,
            y: 300,
            color: '#dc2626',
            attributes: [
                { name: '缺陷类型', type: 'String', required: true },
                { name: '尺寸/数量', type: 'String', required: false },
                { name: '位置', type: 'String', required: false },
                { name: '严重等级', type: 'Integer', required: false }
            ]
        }
    ],
    edges: [
        // 核心流
        { id: 'edge-1', source: 'node-material', target: 'node-composition', label: '包含成分' },
        { id: 'edge-2', source: 'node-material', target: 'node-process', label: '经过工艺' },
        { id: 'edge-3', source: 'node-process', target: 'node-material', label: '产出材料' },
        { id: 'edge-4', source: 'node-process', target: 'node-parameter', label: '受控于' },
        { id: 'edge-5', source: 'node-process', target: 'node-equipment', label: '使用设备' },
        { id: 'edge-6', source: 'node-material', target: 'node-structure', label: '具有结构' },
        { id: 'edge-7', source: 'node-process', target: 'node-structure', label: '决定结构' },
        { id: 'edge-8', source: 'node-structure', target: 'node-property', label: '决定性能' },
        { id: 'edge-9', source: 'node-material', target: 'node-property', label: '表现性能' },
        { id: 'edge-10', source: 'node-material', target: 'node-characterization', label: '被测试' },
        { id: 'edge-11', source: 'node-characterization', target: 'node-structure', label: '观测结构' },
        { id: 'edge-12', source: 'node-characterization', target: 'node-property', label: '验证性能' },
        { id: 'edge-13', source: 'node-material', target: 'node-application', label: '应用于' },
        { id: 'edge-14', source: 'node-application', target: 'node-property', label: '提出需求' },

        // 合规性关联
        { id: 'edge-15', source: 'node-material', target: 'node-standard', label: '须符合' },
        { id: 'edge-16', source: 'node-composition', target: 'node-standard', label: '受限于' },
        { id: 'edge-17', source: 'node-composition', target: 'node-patent', label: '涉及/规避' },
        { id: 'edge-18', source: 'node-process', target: 'node-patent', label: '涉及/规避' },

        // 根因分析关联 (RCA Path)
        { id: 'edge-19', source: 'node-process', target: 'node-anomaly', label: '发生异常' },
        { id: 'edge-20', source: 'node-equipment', target: 'node-anomaly', label: '引发异常' },
        { id: 'edge-21', source: 'node-parameter', target: 'node-anomaly', label: '偏离导致' },
        { id: 'edge-22', source: 'node-anomaly', target: 'node-defect', label: '诱发缺陷' },
        { id: 'edge-23', source: 'node-structure', target: 'node-defect', label: '包含缺陷' },
        { id: 'edge-24', source: 'node-defect', target: 'node-property', label: '恶化性能' },
        { id: 'edge-25', source: 'node-characterization', target: 'node-defect', label: '检出缺陷' }
    ]
};

export const DATA_TYPES = ['String', 'Integer', 'Double', 'Boolean', 'Timestamp', 'Array', 'Object'];
export const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
