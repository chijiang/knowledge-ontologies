"use client";

import React, { } from 'react';
import { Node, Edge, Mode, SelectedElement } from '../types';

interface CanvasProps {
    nodes: Node[];
    edges: Edge[];
    mode: Mode;
    selectedElement: SelectedElement | null;
    connectSourceId: string | null;
    isDragging: boolean;
    handleMouseDownNode: (e: React.MouseEvent, nodeId: string) => void;
    handleMouseMoveCanvas: (e: React.MouseEvent) => void;
    handleMouseUpCanvas: () => void;
    handleCanvasClick: (e: React.MouseEvent) => void;
    setSelectedElement: (element: SelectedElement | null) => void;
    svgRef: React.RefObject<SVGSVGElement | null>;
}

export default function Canvas({
    nodes,
    edges,
    mode,
    selectedElement,
    connectSourceId,
    isDragging,
    handleMouseDownNode,
    handleMouseMoveCanvas,
    handleMouseUpCanvas,
    handleCanvasClick,
    setSelectedElement,
    svgRef
}: CanvasProps) {
    return (
        <div className={`flex-1 relative bg-slate-50 overflow-hidden ${mode === 'select' ? 'cursor-move' : 'cursor-crosshair'}`}
             style={{ touchAction: 'none' }}>
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
                style={{ touchAction: 'none' }}
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
                            data-node-id={node.id}
                            transform={`translate(${node.x},${node.y})`}
                            onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                            className={`${mode === 'select' ? 'cursor-move' : 'cursor-crosshair'} ${isDragging && selectedElement?.type === 'node' && selectedElement.id === node.id ? '' : 'transition-transform duration-75'}`}
                            style={{
                                opacity: (mode === 'connect' && connectSourceId && !isConnecting) ? 0.7 : 1,
                                willChange: (isDragging && selectedElement?.type === 'node' && selectedElement.id === node.id) ? 'transform' : 'auto'
                            }}
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
    );
}
