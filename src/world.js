import * as THREE from 'three';

export function generateChunk(chunkX, chunkZ) {
  const chunk = new THREE.Group();
  const CHUNK_SIZE = 20;

  // Generate terrain (flat plane for simplicity)
  const terrainGeometry = new THREE.PlaneGeometry(CHUNK_SIZE, CHUNK_SIZE);
  const terrainMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
  const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
  terrain.rotation.x = Math.PI / 2;
  terrain.position.set(chunkX * CHUNK_SIZE, 0, chunkZ * CHUNK_SIZE);
  chunk.add(terrain);

  // Add trees (cylinders) randomly
  const treeCount = 5;
  for (let i = 0; i < treeCount; i++) {
    const tree = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 2, 8),
      new THREE.MeshBasicMaterial({ color: 0x8b4513 })
    );
    tree.position.set(
      chunkX * CHUNK_SIZE + (Math.random() - 0.5) * CHUNK_SIZE,
      1,
      chunkZ * CHUNK_SIZE + (Math.random() - 0.5) * CHUNK_SIZE
    );
    chunk.add(tree);
  }

  return chunk;
}