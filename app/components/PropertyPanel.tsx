"use client";

import React from 'react';
import { Settings, X, Database, Plus } from 'lucide-react';
import { Node, Attribute, SelectedElement, Edge } from '../types';
import { COLORS } from '../constants';

interface PropertyPanelProps {
    selectedElement: SelectedElement | null;
    selectedData: Node | Edge | null | undefined; // Simplify handling of possibly undefined result
    setSelectedElement: (element: SelectedElement | null) => void;
    updateNode: (id: string, field: keyof Node, value: any) => void;
    updateEdge: (id: string, label: string) => void;
    addAttribute: (nodeId: string) => void;
    updateAttribute: (nodeId: string, index: number, field: keyof Attribute, value: any) => void;
    removeAttribute: (nodeId: string, index: number) => void;
}

export default function PropertyPanel({
    selectedElement,
    selectedData,
    setSelectedElement,
    updateNode,
    updateEdge,
    addAttribute,
    updateAttribute,
    removeAttribute
}: PropertyPanelProps) {

    const selectedNode = (selectedElement?.type === 'node' ? selectedData : null) as Node | null;

    if (!selectedData || !selectedElement) return null;

    return (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl z-20">
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
                                onChange={(e) => selectedElement.type === 'node'
                                    ? updateNode(selectedData.id, 'label', e.target.value)
                                    : updateEdge(selectedData.id, e.target.value)}
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
                                                    onChange={(e) => updateAttribute(selectedNode.id, idx, 'name', e.target.value)}
                                                    placeholder="属性名"
                                                    className="w-full px-2 py-1 border border-transparent hover:border-gray-200 focus:border-blue-300 rounded text-sm font-medium outline-none"
                                                />
                                            </div>
                                            <button onClick={() => removeAttribute(selectedNode.id, idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <select
                                                value={attr.type}
                                                onChange={(e) => updateAttribute(selectedNode.id, idx, 'type', e.target.value)}
                                                className="flex-1 px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded outline-none focus:border-blue-300"
                                            >
                                                {/* DATA_TYPES import handled implicitly via prop or we can import it? 
                                Actually let's import DATA_TYPES from constants since it's static */}
                                                {['String', 'Integer', 'Double', 'Boolean', 'Timestamp', 'Array', 'Object'].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                            <label className="flex items-center space-x-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={attr.required}
                                                    onChange={(e) => updateAttribute(selectedNode.id, idx, 'required', e.target.checked)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-0 w-3 h-3"
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
        </div>
    );
}
