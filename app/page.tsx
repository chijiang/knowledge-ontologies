"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Save,
  Upload,
  Plus,
  Trash2,
  Settings,
  Share2,
  MousePointer2,
  Move,
  X,
  Type,
  Database
} from 'lucide-react';

interface Attribute {
  name: string;
  type: string;
  required: boolean;
}

interface Node {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  color: string;
  attributes: Attribute[];
}

interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
}

type Mode = 'select' | 'connect';

interface SelectedElement {
  type: 'node' | 'edge';
  id: string;
}

/**
 * 初始模拟数据 - 材料科学研发本体
 */
const INITIAL_DATA: { nodes: Node[]; edges: Edge[] } = {
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

const DATA_TYPES = ['String', 'Integer', 'Double', 'Boolean', 'Timestamp', 'Array', 'Object'];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export default function App() {
  // --- State ---
  const [nodes, setNodes] = useState<Node[]>(INITIAL_DATA.nodes);
  const [edges, setEdges] = useState<Edge[]>(INITIAL_DATA.edges);

  // 交互模式: 'select' (选择/拖拽), 'connect' (连线)
  const [mode, setMode] = useState<Mode>('select');
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null); // { type: 'node'|'edge', id: string }
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null); // 连线时的起始节点

  // 拖拽状态
  const [isDragging, setIsDragging] = useState(false);
  const dragItemRef = useRef<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // --- Helpers ---

  // 生成唯一ID
  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 获取鼠标在SVG中的相对坐标
  const getMousePos = (e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    };
  };

  // --- Handlers: JSON Import/Export ---

  const handleExport = () => {
    const dataStr = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ontology_schema.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        const json = JSON.parse(result);
        if (json.nodes && json.edges) {
          setNodes(json.nodes);
          setEdges(json.edges);
          setSelectedElement(null);
        } else {
          alert("JSON格式不正确: 缺少 nodes 或 edges 字段");
        }
      } catch (err) {
        alert("无法解析 JSON 文件");
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // --- Handlers: Node & Edge Operations ---

  const addNode = () => {
    const newNode: Node = {
      id: generateId('node'),
      type: 'NewEntity',
      label: '新实体',
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      attributes: []
    };
    setNodes([...nodes, newNode]);
    setSelectedElement({ type: 'node', id: newNode.id });
    setMode('select');
  };

  const deleteSelected = () => {
    if (!selectedElement) return;
    if (selectedElement.type === 'node') {
      setNodes(nodes.filter(n => n.id !== selectedElement.id));
      setEdges(edges.filter(e => e.source !== selectedElement.id && e.target !== selectedElement.id));
    } else if (selectedElement.type === 'edge') {
      setEdges(edges.filter(e => e.id !== selectedElement.id));
    }
    setSelectedElement(null);
  };

  // --- Handlers: Canvas Interaction ---

  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();

    if (mode === 'connect') {
      // 连线逻辑
      if (!connectSourceId) {
        setConnectSourceId(nodeId);
      } else {
        if (connectSourceId !== nodeId) {
          // 创建连线
          const newEdge: Edge = {
            id: generateId('edge'),
            source: connectSourceId,
            target: nodeId,
            label: '关系'
          };
          // 检查是否已存在
          const exists = edges.some(edge =>
            (edge.source === connectSourceId && edge.target === nodeId) ||
            (edge.source === nodeId && edge.target === connectSourceId)
          );

          if (!exists) {
            setEdges([...edges, newEdge]);
          }
        }
        setConnectSourceId(null);
      }
    } else {
      // 选中/拖拽逻辑
      setSelectedElement({ type: 'node', id: nodeId });
      setIsDragging(true);
      dragItemRef.current = nodeId;
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isDragging && dragItemRef.current && mode === 'select') {
      const pos = getMousePos(e);
      setNodes(nodes.map(n => {
        if (n.id === dragItemRef.current) {
          return { ...n, x: pos.x, y: pos.y };
        }
        return n;
      }));
    }
  };

  const handleMouseUpCanvas = () => {
    setIsDragging(false);
    dragItemRef.current = null;
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // 点击空白处取消选中，除非是点击了节点（事件冒泡已被阻止）
    if ((e.target as Element).tagName === 'svg') {
      setSelectedElement(null);
      if (mode === 'connect') {
        setConnectSourceId(null);
      }
    }
  };

  // --- Handlers: Property Editing ---

  const updateNode = (id: string, field: keyof Node, value: any) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, [field]: value } : n));
  };

  const addAttribute = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newAttr: Attribute = { name: 'new_attr', type: 'String', required: false };
    updateNode(nodeId, 'attributes', [...node.attributes, newAttr]);
  };

  const updateAttribute = (nodeId: string, index: number, field: keyof Attribute, value: any) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newAttrs = [...node.attributes];
    newAttrs[index] = { ...newAttrs[index], [field]: value };
    updateNode(nodeId, 'attributes', newAttrs);
  };

  const removeAttribute = (nodeId: string, index: number) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const newAttrs = node.attributes.filter((_, i) => i !== index);
    updateNode(nodeId, 'attributes', newAttrs);
  };

  const updateEdge = (id: string, label: string) => {
    setEdges(edges.map(e => e.id === id ? { ...e, label } : e));
  };

  // --- Rendering Helpers ---

  // 获取选中对象的数据
  const getSelectedData = () => {
    if (!selectedElement) return null;
    if (selectedElement.type === 'node') return nodes.find(n => n.id === selectedElement.id);
    if (selectedElement.type === 'edge') return edges.find(e => e.id === selectedElement.id);
    return null;
  };

  const selectedData = getSelectedData();
  const selectedNode = (selectedElement?.type === 'node' ? selectedData : null) as Node | null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">

      {/* 顶部工具栏 */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">知识图谱本体设计器 <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">v1.0</span></h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => { setMode('select'); setConnectSourceId(null); }}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'select' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <MousePointer2 className="w-4 h-4 mr-2" />
              选择/移动
            </button>
            <button
              onClick={() => setMode('connect')}
              className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${mode === 'connect' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <Move className="w-4 h-4 mr-2" />
              连线模式
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          <button onClick={addNode} className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" /> 添加实体
          </button>

          <button onClick={deleteSelected} disabled={!selectedElement} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedElement ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-gray-300 cursor-not-allowed'}`}>
            <Trash2 className="w-4 h-4 mr-2" /> 删除
          </button>

          <div className="h-6 w-px bg-gray-300 mx-2"></div>

          <label className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors text-sm font-medium">
            <Upload className="w-4 h-4 mr-2" />
            导入 JSON
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button onClick={handleExport} className="flex items-center px-3 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium shadow-sm">
            <Save className="w-4 h-4 mr-2" /> 导出 JSON
          </button>
        </div>
      </header>

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 左侧画布 */}
        <div className="flex-1 relative bg-slate-50 overflow-hidden cursor-crosshair">
          {/* 网格背景 */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}>
          </div>

          {/* 提示信息 */}
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-2 rounded-lg border border-gray-200 text-xs text-gray-500 pointer-events-none z-10 shadow-sm">
            {mode === 'connect'
              ? (connectSourceId ? '点击第二个节点完成连线' : '点击第一个节点开始连线')
              : '拖拽移动节点，点击编辑属性'}
          </div>

          <svg
            ref={svgRef}
            className="w-full h-full"
            onMouseMove={handleMouseMoveCanvas}
            onMouseUp={handleMouseUpCanvas}
            onClick={handleCanvasClick}
          >
            {/* 定义箭头标记 */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
              <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>

            {/* 绘制连线 */}
            {edges.map(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isSelected = selectedElement?.type === 'edge' && selectedElement.id === edge.id;

              // 计算连线中心点用于放置标签
              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;

              return (
                <g
                  key={edge.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedElement({ type: 'edge', id: edge.id }); }}
                  className="cursor-pointer group"
                >
                  {/* 透明的粗线，用于增大点击区域 */}
                  <line
                    x1={sourceNode.x} y1={sourceNode.y}
                    x2={targetNode.x} y2={targetNode.y}
                    stroke="transparent"
                    strokeWidth="15"
                  />
                  {/* 实际显示的线 */}
                  <line
                    x1={sourceNode.x} y1={sourceNode.y}
                    x2={targetNode.x} y2={targetNode.y}
                    stroke={isSelected ? "#3b82f6" : "#94a3b8"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                  />
                  {/* 关系标签背景 */}
                  <rect
                    x={midX - (edge.label.length * 4 + 10)}
                    y={midY - 10}
                    width={edge.label.length * 8 + 20}
                    height="20"
                    rx="4"
                    fill="white"
                    stroke={isSelected ? "#3b82f6" : "#cbd5e1"}
                    className="transition-colors"
                  />
                  {/* 关系标签文本 */}
                  <text
                    x={midX}
                    y={midY}
                    dy="4"
                    textAnchor="middle"
                    className={`text-[10px] select-none ${isSelected ? 'fill-blue-600 font-bold' : 'fill-gray-500'}`}
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* 连线过程中的临时线 */}
            {mode === 'connect' && connectSourceId && (() => {
              const sourceNode = nodes.find(n => n.id === connectSourceId);
              if (!sourceNode) return null;
              // 这里因为没有实时鼠标位置作为target，简化处理，不画动态线，
              // 或者可以用一个state存mousePos来画，但为了性能暂时只高亮起点。
              return (
                <circle cx={sourceNode.x} cy={sourceNode.y} r="35" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
              );
            })()}

            {/* 绘制节点 */}
            {nodes.map(node => {
              const isSelected = selectedElement?.type === 'node' && selectedElement.id === node.id;
              const isConnecting = connectSourceId === node.id;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                  className={`${mode === 'select' ? 'cursor-move' : 'cursor-crosshair'} transition-transform duration-75`}
                  style={{ opacity: (mode === 'connect' && connectSourceId && !isConnecting) ? 0.7 : 1 }}
                >
                  {/* 节点阴影 */}
                  <circle r="30" fill="black" fillOpacity="0.1" cy="2" />

                  {/* 节点主体 */}
                  <circle
                    r="30"
                    fill={isConnecting ? '#fff' : node.color}
                    stroke={isSelected || isConnecting ? '#2563eb' : 'white'}
                    strokeWidth={isSelected || isConnecting ? '3' : '2'}
                    className="transition-colors duration-200"
                  />

                  {/* 节点图标/文字缩写 */}
                  <text
                    textAnchor="middle"
                    dy="5"
                    fill={isConnecting ? '#2563eb' : 'white'}
                    className="text-sm font-bold pointer-events-none select-none"
                  >
                    {node.label.substring(0, 2)}
                  </text>

                  {/* 节点下方完整标签 */}
                  <foreignObject x="-60" y="35" width="120" height="40">
                    <div className="text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full border bg-white shadow-sm truncate inline-block max-w-full
                        ${isSelected ? 'text-blue-600 border-blue-200 font-medium' : 'text-gray-600 border-gray-200'}
                      `}>
                        {node.label}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
          {selectedData && selectedElement ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    {selectedElement.type === 'node' ? '实体配置' : '关系配置'}
                  </h2>
                  <button onClick={() => setSelectedElement(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-400">ID: {selectedData.id}</div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* 通用属性 */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">显示名称 (Label)</label>
                    <input
                      type="text"
                      value={selectedData.label}
                      onChange={(e) => selectedElement.type === 'node' ? updateNode(selectedData.id, 'label', e.target.value) : updateEdge(selectedData.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                    />
                  </div>

                  {selectedElement.type === 'node' && selectedNode && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">实体类型 (Type)</label>
                      <input
                        type="text"
                        value={selectedNode.type}
                        onChange={(e) => updateNode(selectedNode.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}

                  {selectedElement.type === 'node' && selectedNode && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-2">节点颜色</label>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => updateNode(selectedNode.id, 'color', c)}
                            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${selectedNode.color === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 节点属性列表 */}
                {selectedElement.type === 'node' && selectedNode && (
                  <div>
                    <div className="flex items-center justify-between mb-3 pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-bold text-gray-700 flex items-center">
                        <Database className="w-3.5 h-3.5 mr-2" />
                        属性定义
                      </h3>
                      <button onClick={() => addAttribute(selectedNode.id)} className="text-blue-600 hover:text-blue-700 text-xs font-medium flex items-center px-2 py-1 rounded bg-blue-50 hover:bg-blue-100">
                        <Plus className="w-3 h-3 mr-1" /> 添加
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedNode.attributes.length === 0 && (
                        <div className="text-center py-4 text-gray-400 text-xs bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          暂无属性，点击右上角添加
                        </div>
                      )}
                      {selectedNode.attributes.map((attr, idx) => (
                        <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm group hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 mr-2">
                              <input
                                type="text"
                                value={attr.name}
                                placeholder="属性名 (如: age)"
                                onChange={(e) => updateAttribute(selectedNode.id, idx, 'name', e.target.value)}
                                className="w-full text-sm font-medium text-gray-700 border-b border-transparent focus:border-blue-500 outline-none px-0 py-0.5 bg-transparent placeholder-gray-300"
                              />
                            </div>
                            <button onClick={() => removeAttribute(selectedNode.id, idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2">
                            <select
                              value={attr.type}
                              onChange={(e) => updateAttribute(selectedNode.id, idx, 'type', e.target.value)}
                              className="flex-1 text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 bg-gray-50 focus:bg-white outline-none"
                            >
                              {DATA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <label className="flex items-center space-x-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={attr.required}
                                onChange={(e) => updateAttribute(selectedNode.id, idx, 'required', e.target.checked)}
                                className="text-blue-600 rounded border-gray-300 focus:ring-blue-500 h-3 w-3"
                              />
                              <span className="text-[10px] text-gray-500">必填</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MousePointer2 className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">未选择对象</p>
              <p className="text-xs mt-2">点击画布上的节点或连线<br />进行编辑配置</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}