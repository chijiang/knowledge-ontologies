"use client";

import React from 'react';
import {
    Save,
    Upload,
    Plus,
    Trash2,
    Share2,
    MousePointer2,
    Move
} from 'lucide-react';
import { Mode, SelectedElement } from '../types';

interface HeaderProps {
    mode: Mode;
    setMode: (mode: Mode) => void;
    setConnectSourceId: (id: string | null) => void;
    addNode: () => void;
    deleteSelected: () => void;
    selectedElement: SelectedElement | null;
    handleExport: () => void;
    handleImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Header({
    mode,
    setMode,
    setConnectSourceId,
    addNode,
    deleteSelected,
    selectedElement,
    handleExport,
    handleImport
}: HeaderProps) {
    return (
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
    );
}
