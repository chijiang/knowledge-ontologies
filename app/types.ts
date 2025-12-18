export interface Attribute {
    name: string;
    type: string;
    required: boolean;
}

export interface Node {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    color: string;
    attributes: Attribute[];
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    label: string;
}

export type Mode = 'select' | 'connect';

export interface SelectedElement {
    type: 'node' | 'edge';
    id: string;
}
