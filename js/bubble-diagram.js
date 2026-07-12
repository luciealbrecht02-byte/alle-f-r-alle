import * as THREE from "three";

const NODE_COLOR = 0x204f9e;
const HOLE_COLOR = 0x111111;
const EDGE_COLOR = 0x334155;
const LIGHT_BLUE = 0x9bb8e6;

// Knoten-Layout, angelehnt an die Skizze: mehrere Mikroblasen-Cluster
// innerhalb einer gemeinsamen Makroblase, verbunden über einzelne
// Brücken-Knoten ("Structural Holes").
const nodes = {
  // Cluster oben
  n1: [-1.2, 2.6, 0.3],
  n2: [0.2, 3.0, 0],
  n3: [1.6, 2.7, -0.2],
  n4: [0.3, 1.7, 0.2],
  // Cluster links (Quadrat)
  n5: [-3.4, 1.6, 0],
  n6: [-2.2, 1.9, 0.2],
  n7: [-3.4, 0.4, -0.2],
  n8: [-2.2, 0.5, 0],
  // Verbindungsknoten Mitte
  n9: [-0.9, 0.8, 0.1],
  n10: [0.4, 0.6, -0.1],
  // Cluster rechts (Netz)
  n11: [2.0, 1.9, 0.2],
  n12: [3.1, 2.1, 0],
  n13: [3.6, 1.0, -0.2],
  n14: [2.6, 0.7, 0.1],
  holeRight: [4.3, 0.3, 0],
  // Cluster unten links
  holeLeft: [-3.0, -1.2, 0],
  n15: [-1.9, -0.9, 0.2],
  n16: [-2.0, -2.1, -0.1],
  n17: [-3.1, -2.3, 0.1],
  // Cluster unten (grün)
  n18: [-0.6, -1.5, 0],
  n19: [0.4, -1.8, 0.2],
  n20: [1.3, -1.3, -0.1],
  n21: [2.4, -1.8, 0],
};

const holeIds = ["holeLeft", "holeRight"];

const edges = [
  ["n1", "n2"], ["n2", "n3"], ["n1", "n4"], ["n2", "n4"], ["n3", "n4"],
  ["n5", "n6"], ["n5", "n7"], ["n6", "n8"], ["n7", "n8"], ["n6", "n7"],
  ["n4", "n6"], ["n6", "n9"], ["n9", "n10"],
  ["n9", "n15"], ["n15", "holeLeft"], ["n16", "holeLeft"], ["n17", "holeLeft"],
  ["n15", "n16"], ["n16", "n17"],
  ["n10", "n11"], ["n4", "n11"],
  ["n11", "n12"], ["n11", "n13"], ["n11", "n14"], ["n12", "n13"], ["n13", "n14"],
  ["n13", "holeRight"], ["n14", "holeRight"],
  ["n10", "n18"], ["n18", "n19"], ["n19", "n20"], ["n18", "n20"],
  ["n20", "n21"], ["n21", "holeRight"],
];

const clusters = [
  { color: 0x9bb8e6, cx: -0.2, cy: 0.3, rx: 6.2, ry: 4.4, z: -0.9 }, // Makroblase-Hintergrund
  { color: 0xf08b88, cx: 0.2, cy: 2.5, rx: 1.9, ry: 1.5, z: -0.5 },
  { color: 0x8fb0e8, cx: -2.8, cy: 1.1, rx: 1.7, ry: 1.6, z: -0.5 },
  { color: 0xc79bd6, cx: 2.8, cy: 1.4, rx: 2.1, ry: 1.7, z: -0.5 },
  { color: 0xc79bd6, cx: -2.4, cy: -1.6, rx: 1.7, ry: 1.7, z: -0.5 },
  { color: 0x8fd6a8, cx: 0.3, cy: -1.6, rx: 1.5, ry: 1.1, z: -0.5 },
];

// Vereinfachte Ansicht für Screen 1: drei einfarbige blaue Bubbles ohne
// Knoten/Kanten, angelehnt an die Handskizze (eine große links, zwei
// kleinere rechts übereinander).
const simpleBubbles = [
  { cx: -3.0, cy: 0.0, rx: 4.8, ry: 3.4 },
  { cx: 3.8, cy: 1.8, rx: 1.1, ry: 1.0 },
  { cx: 3.6, cy: -1.0, rx: 1.5, ry: 1.3 },
];

function createRenderer(container) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.3, 13);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  container.appendChild(renderer.domElement);

  function render() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.render(scene, camera);
  }

  window.addEventListener("resize", render);

  return { scene, render };
}

function initSimpleBubbleDiagram(container) {
  const { scene, render } = createRenderer(container);

  simpleBubbles.forEach(({ cx, cy, rx, ry }) => {
    const geometry = new THREE.CircleGeometry(1, 48);
    geometry.scale(rx, ry, 1);
    const material = new THREE.MeshBasicMaterial({
      color: LIGHT_BLUE,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cx, cy, 0);
    scene.add(mesh);
  });

  render();
}

function initBubbleDiagram(container) {
  const { scene, render } = createRenderer(container);

  // Makroblase- und Mikroblasen-Flächen als weiche, flache Kreise.
  clusters.forEach(({ color, cx, cy, rx, ry, z }) => {
    const geometry = new THREE.CircleGeometry(1, 40);
    geometry.scale(rx, ry, 1);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(cx, cy, z);
    scene.add(mesh);
  });

  // Kanten zwischen den Knoten.
  const edgePositions = [];
  edges.forEach(([a, b]) => {
    edgePositions.push(...nodes[a], ...nodes[b]);
  });
  const edgeGeometry = new THREE.BufferGeometry();
  edgeGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(edgePositions, 3)
  );
  const edgeMaterial = new THREE.LineBasicMaterial({ color: EDGE_COLOR });
  scene.add(new THREE.LineSegments(edgeGeometry, edgeMaterial));

  // Knoten – Structural Holes als schwarze Kugeln mit weißem Kern.
  Object.entries(nodes).forEach(([id, pos]) => {
    const isHole = holeIds.includes(id);
    const radius = isHole ? 0.24 : 0.15;
    const geometry = new THREE.SphereGeometry(radius, 20, 20);
    const material = new THREE.MeshBasicMaterial({
      color: isHole ? HOLE_COLOR : NODE_COLOR,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(...pos);
    scene.add(sphere);

    if (isHole) {
      const coreGeometry = new THREE.SphereGeometry(radius * 0.4, 16, 16);
      const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      core.position.set(pos[0], pos[1], pos[2] + radius * 0.7);
      scene.add(core);
    }
  });

  render();
}

document.querySelectorAll(".bubble-diagram").forEach((container) => {
  if (container.id === "bubble-diagram") {
    initSimpleBubbleDiagram(container);
  } else {
    initBubbleDiagram(container);
  }
});
