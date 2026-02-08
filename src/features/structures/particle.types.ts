import type { Vector3Tuple } from 'three';

export type NodeId = string;

export interface ParticleNode {
    id: NodeId;
    position: Vector3Tuple;
    createdAt: number; // Transport time or performance.now()
}

export type NodeMap = Map<NodeId, ParticleNode>;
