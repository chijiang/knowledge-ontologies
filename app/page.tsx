"use client";

import React, { useState, useRef } from 'react';
import Header from './components/Header';
import Canvas from './components/Canvas';
import PropertyPanel from './components/PropertyPanel';
import { Node, Edge, Mode, SelectedElement, Attribute } from './types';
import { INITIAL_DATA, COLORS } from './constants';

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
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 }); // 记录拖拽时的偏移量
  const rafIdRef = useRef<number | null>(null); // requestAnimationFrame ID
  const svgRef = useRef<SVGSVGElement | null>(null);
  const ctmRef = useRef<DOMMatrix | null>(null); // 缓存CTM矩阵，避免拖拽时重复计算
  const mousePosRef = useRef<{ x: number; y: number } | null>(null); // 存储最新的鼠标位置

  // --- Helpers ---

  // 生成唯一ID
  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // 获取鼠标在SVG中的相对坐标
  const getMousePos = (e: React.MouseEvent | MouseEvent, ctm: DOMMatrix | null = null) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = ctm || svgRef.current.getScreenCTM();
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

      // 缓存CTM
      if (svgRef.current) {
        ctmRef.current = svgRef.current.getScreenCTM();
      }

      // 计算鼠标相对于节点中心的偏移量
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        // 使用刚刚缓存的CTM
        const mousePos = getMousePos(e, ctmRef.current);
        dragOffsetRef.current = {
          x: mousePos.x - node.x,
          y: mousePos.y - node.y
        };
      }
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isDragging && dragItemRef.current && mode === 'select') {
      e.preventDefault();

      // 使用缓存的CTM计算位置 (避免 Layout Thrashing)
      const pos = getMousePos(e, ctmRef.current);
      const newX = pos.x - dragOffsetRef.current.x;
      const newY = pos.y - dragOffsetRef.current.y;

      // 将最新位置存入ref
      mousePosRef.current = { x: newX, y: newY };

      // 使用 requestAnimationFrame 节流更新
      // 优化策略: 不取消前一次的一帧，而是如果已经在等待帧，就不再请求。
      // 在回调中读取 mousePosRef.current 获取最新位置。
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          const latestPos = mousePosRef.current;
          const draggedNodeId = dragItemRef.current;
          if (latestPos && draggedNodeId) {
            setNodes(prevNodes => {
              // 找到被拖拽的节点索引，避免每次都遍历整个数组
              const nodeIndex = prevNodes.findIndex(n => n.id === draggedNodeId);
              if (nodeIndex === -1) return prevNodes;

              // 创建新数组，只更新被拖拽的节点
              const newNodes = [...prevNodes];
              newNodes[nodeIndex] = { ...newNodes[nodeIndex], x: latestPos.x, y: latestPos.y };
              return newNodes;
            });
          }
          rafIdRef.current = null;
        });
      }
    }
  };

  const handleMouseUpCanvas = () => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    setIsDragging(false);
    dragItemRef.current = null;
    ctmRef.current = null; // 清除缓存
    mousePosRef.current = null;
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

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      <Header
        mode={mode}
        setMode={setMode}
        setConnectSourceId={setConnectSourceId}
        addNode={addNode}
        deleteSelected={deleteSelected}
        selectedElement={selectedElement}
        handleExport={handleExport}
        handleImport={handleImport}
      />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        <Canvas
          nodes={nodes}
          edges={edges}
          mode={mode}
          selectedElement={selectedElement}
          connectSourceId={connectSourceId}
          isDragging={isDragging}
          handleMouseDownNode={handleMouseDownNode}
          handleMouseMoveCanvas={handleMouseMoveCanvas}
          handleMouseUpCanvas={handleMouseUpCanvas}
          handleCanvasClick={handleCanvasClick}
          setSelectedElement={setSelectedElement}
          svgRef={svgRef}
        />

        <PropertyPanel
          selectedElement={selectedElement}
          selectedData={selectedData}
          setSelectedElement={setSelectedElement}
          updateNode={updateNode}
          updateEdge={updateEdge}
          addAttribute={addAttribute}
          updateAttribute={updateAttribute}
          removeAttribute={removeAttribute}
        />
      </div>
    </div>
  );
}