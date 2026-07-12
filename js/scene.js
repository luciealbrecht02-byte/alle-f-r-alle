import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const container = document.getElementById("scene-container");
const popupOverlay = document.getElementById("popup-overlay");
const popupTitle = document.getElementById("popup-title");
const popupText = document.getElementById("popup-text");
const popupClose = document.getElementById("popup-close");
const resetBtn = document.getElementById("reset-view");
const ceilingLabelEntries = [];

// TODO: Sobald ihr ein echtes 3D-Modell des Raums habt (z.B. .glb aus
// Blender/SketchUp), kann dieses per GLTFLoader eingebunden werden.
// Aktuell sind alle Formen unten Platzhalter, die eurer Handskizze
// ("ANKLICKBAR") nachempfunden sind.

const HOTSPOTS = {
  kreativ: {
    title: "Gemeinsam kreativ sein",
    text: "Basteln, kochen, tanzen: Hier geht's nicht um ein perfektes Ergebnis, sondern ums gemeinsame Machen. Genau dabei entstehen die entspanntesten Gespräche.",
  },
  anpacken: {
    title: "Gemeinsam anpacken",
    text: "Steuererklärung, Bewerbung, liegengebliebene To-Dos: Zusammen erledigt sich lästiger Alltagskram gleich viel leichter – und man lernt sich dabei ganz nebenbei kennen.",
  },
  wachsen: {
    title: "Gemeinsam wachsen",
    text: "Du kannst gut kochen, Excel oder Reisen planen? Teile dein Wissen – und lern im Gegenzug etwas von jemand anderem. Skillsharing auf Augenhöhe.",
  },
  weiterdenken: {
    title: "Gemeinsam weiterdenken",
    text: "Was bewegt die Uni gerade wirklich? Aktuelle Fragen landen auf Karten und werden in wechselnden Kleingruppen gemeinsam weitergedacht.",
  },
  inseln: {
    title: "Gesprächsinseln",
    text: "3 bis 6 Stühle, mal mit, mal ohne Tisch – die Gesprächsinseln lassen sich flexibel umbauen und stehen bewusst nah beieinander. So wechselst du unkompliziert von einer Runde in die nächste.",
  },
  irritationsobjekt: {
    title: "Irritationsobjekt",
    text: "Jede Woche steht etwas Neues und Ungewöhnliches im Raum – ein Hut, ein Kunstwerk, ein Seifenblasen-Set. Kein Vorwissen nötig, um mitzureden: Das Objekt ist der perfekte Einstieg ins Gespräch mit Fremden.",
  },
  wand: {
    title: "Wände als Kommunikationsfläche",
    text: "Die Wände sind keine Deko, sondern Mitmach-Fläche: Whiteboards nehmen Fragen und Ideen auf. Und weil der Raum alle vier Wochen umzieht, wandert die Dokumentationswand mit – Fotos und Zitate aus vorherigen Runden bleiben sichtbar.",
  },
  tuer: {
    title: "Wegweiser & Türposter",
    text: "Poster und Wegweiser an der Tür zeigen auf einen Blick, worum es hier geht – inklusive Raumplan und Guide für die Moderation.",
  },
  eisbrecher: {
    title: "Eisbrecherkarten",
    text: "Wähle deine Gesprächsinsel nicht nach Studiengang, sondern nach einem Satz, der zu dir passt. Von locker bis persönlich – die Karten sorgen für einen Einstieg, der nichts mit der eigenen Bubble zu tun hat.",
  },
  raum: {
    title: "Kompakter Raum",
    text: "Groß genug für Bewegungsfreiheit, klein genug, um sich nicht zu verlieren. Ohne Bühne und Stuhlreihen begegnen sich hier alle auf Augenhöhe – barrierefrei und mit variablen Sitzhöhen.",
  },
  kueche: {
    title: "Kaffee- & Teeküche",
    text: "Kaffee, Tee, Wasser – einfach so. Die kleine Küchenzeile lädt zum Bleiben ein, auch ohne konkreten Anlass. Oft entstehen gerade hier die unkompliziertesten Gespräche.",
  },
  moderation: {
    title: "Moderation",
    text: "Sie sorgt für einen guten Start: begrüßt, stellt kurz vor, bringt den Ball ins Rollen. Übernommen wird die Rolle am besten von jemandem, der in mehreren Bubbles zu Hause ist – und nach einer Weile gerne weitergegeben.",
  },
  starterpaket: {
    title: "Starterpaket",
    text: "Das „alle für alle“-Starterpaket liegt an der Tür bereit: Eisbrecherkarten auf vier Ebenen, ein Manifest mit den Grundprinzipien, ein Raumplan und ein Guide für die Moderation mit Ablauf, Zeitplan und Gesprächsregeln.",
  },
  wandernderraum: {
    title: "Ein wandernder Raum",
    text: "Der Raum bleibt nicht an einem Ort: Er wandert etwa alle vier Wochen zu einem anderen Standort der UdK weiter, damit keine Fakultät bevorzugt wird. Eine Dokumentationswand zieht mit um und macht sichtbar, was an früheren Standorten schon entstanden ist.",
  },
};

const ROOM_WIDTH = 9;
const ROOM_DEPTH = 7;
const ROOM_HEIGHT = 3.2;

const textureLoader = new THREE.TextureLoader();
const icebreakerCardTexture = textureLoader.load("Fotos/Icebreaker_Kartenpng-03.png");
icebreakerCardTexture.colorSpace = THREE.SRGBColorSpace;
const posterTexture = textureLoader.load("Poster.png");
posterTexture.colorSpace = THREE.SRGBColorSpace;

let scene, camera, renderer, controls, raycaster, pointer;
let defaultCameraPos, defaultTarget;
let pointerDownPos = null;
let hoveredRoot = null;
const CLICK_DRAG_THRESHOLD = 5;

// Wartet auf die Adobe-Fonts-Schrift "stolzl", damit die Canvas-Texte auf der
// Decke nicht schon mit der Fallback-Schrift gezeichnet werden.
Promise.all([
  document.fonts.load('500 60px "stolzl"'),
  document.fonts.load('700 76px "stolzl"'),
])
  .catch(() => {})
  .finally(() => {
    init();
    animate();
  });

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  const width = container.clientWidth;
  const height = container.clientHeight;

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  defaultCameraPos = new THREE.Vector3(7.5, 6.5, 9.5);
  defaultTarget = new THREE.Vector3(0, 1.2, 0);
  camera.position.copy(defaultCameraPos);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(defaultTarget);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 5;
  controls.maxDistance = 20;
  controls.zoomSpeed = 2.5;
  controls.minPolarAngle = 0.2;
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  // Auf der Scroll-Variante der Startseite würde Scrollen über der Szene mit
  // dem Seiten-Scrollen kollidieren – dort ist Zoomen daher deaktiviert.
  controls.enableZoom = !document.body.classList.contains("scroll-home");
  controls.update();

  addLights();
  buildRoom();

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();

  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("resize", onResize);

  popupClose.addEventListener("click", closePopup);
  popupOverlay.addEventListener("click", (e) => {
    if (e.target === popupOverlay) closePopup();
  });
  resetBtn.addEventListener("click", () => {
    camera.position.copy(defaultCameraPos);
    controls.target.copy(defaultTarget);
    controls.update();
  });

  document.querySelectorAll(".legend span[data-hotspot]").forEach((chip) => {
    chip.addEventListener("click", () => openPopup(chip.dataset.hotspot));
  });

  // Hinweis blendet nach ein paar Sekunden aus, damit er die Sicht von oben
  // auf den Raum nicht dauerhaft stört.
  const viewerHint = document.querySelector(".viewer-hint");
  if (viewerHint) {
    setTimeout(() => viewerHint.classList.add("hint-hidden"), 4000);
  }
}

function addLights() {
  // Gleichmäßigere, weichere Ausleuchtung für einen ruhigeren, moderneren Look
  const ambient = new THREE.AmbientLight(0xffffff, 0.9);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
  dirLight.position.set(6, 10, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.radius = 4;
  scene.add(dirLight);

  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(-6, 5, -4);
  scene.add(fill);
}

function tagHotspot(object, key) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.userData.hotspot = key;
      child.userData.hotspotRoot = object;
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material && child.material.emissive) {
        // Ursprünglichen Leucht-Zustand merken, damit er beim Verlassen des Hovers exakt wiederhergestellt wird.
        child.userData.baseEmissive = child.material.emissive.getHex();
        child.userData.baseEmissiveIntensity = child.material.emissiveIntensity;
      }
    }
  });
}

const HIGHLIGHT_INTENSITY = 0.35;

function setHighlight(root, isHighlighted) {
  if (!root) return;
  root.traverse((child) => {
    if (child.isMesh && child.material && child.material.emissive) {
      if (isHighlighted) {
        // Leuchtet in der eigenen Farbe des Materials etwas heller auf statt in einem Fremdton.
        child.material.emissive.copy(child.material.color);
        child.material.emissiveIntensity = HIGHLIGHT_INTENSITY;
      } else {
        child.material.emissive.setHex(child.userData.baseEmissive ?? 0x000000);
        child.material.emissiveIntensity = child.userData.baseEmissiveIntensity ?? 1;
      }
    }
  });
}

function createCeilingLabel(line1, line2, textColor, hAlign, vAlign) {
  // Liegt flach auf der Decke (echtes 3D-Objekt, dreht sich mit dem Raum mit).
  // Durch FrontSide-Material + nach oben zeigende Normale ist der Text nur von
  // oben lesbar; von innen im Raum nach oben blickend zeigt sich die
  // unbedruckte Rückseite (unsichtbar), siehe Aufruf mit rotation.x weiter unten.
  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 640;
  const ctx = canvas.getContext("2d");
  ctx.textAlign = hAlign;
  ctx.textBaseline = "middle";
  const x = hAlign === "left" ? 40 : canvas.width - 40;
  const [y1, y2] = vAlign === "top" ? [canvas.height * 0.24, canvas.height * 0.46] : [canvas.height * 0.56, canvas.height * 0.78];

  ctx.font = '500 116px "stolzl", sans-serif';
  ctx.fillStyle = textColor;
  ctx.fillText(line1, x, y1);

  ctx.font = '700 148px "stolzl", sans-serif';
  ctx.fillStyle = textColor;
  ctx.fillText(line2, x, y2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Mipmaps verfälschen die Farbe bei kleinerer Darstellung – deaktiviert,
  // damit sie in jeder Entfernung von der Kamera identisch bleibt.
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.FrontSide,
    depthWrite: false,
    depthTest: false,
  });
  return new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.95), material);
}

function createWallOutline(width, height) {
  const edges = new THREE.EdgesGeometry(new THREE.PlaneGeometry(width, height));
  const material = new THREE.LineBasicMaterial({ color: 0xaab8d1, transparent: true, opacity: 0.8 });
  return new THREE.LineSegments(edges, material);
}

function buildRoom() {
  const halfW = ROOM_WIDTH / 2;
  const halfD = ROOM_DEPTH / 2;

  // Boden – "Kompakter Raum"
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM_WIDTH, ROOM_DEPTH),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5,
      roughness: 0.9,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = false;
  tagHotspot(floor, "raum");
  scene.add(floor);

  // Dünne Umrisslinie um den Boden, im gleichen Stil wie die Wand-Umrisse.
  const floorOutline = createWallOutline(ROOM_WIDTH, ROOM_DEPTH);
  floorOutline.rotation.x = -Math.PI / 2;
  floorOutline.position.y = 0.01;
  scene.add(floorOutline);

  // Rückwand mit Fenster/Whiteboard – "Wände als Kommunikationsfläche"
  // Wände sind nur als Umriss dargestellt, keine geschlossene Fläche.
  const backWallGroup = new THREE.Group();
  const backWallOutline = createWallOutline(ROOM_WIDTH, ROOM_HEIGHT);
  backWallOutline.position.set(0, ROOM_HEIGHT / 2, -halfD);
  const pinboardGroup = new THREE.Group();
  pinboardGroup.position.set(-1.5, 1.9, -halfD + 0.02);
  const whiteboard = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 1.5),
    new THREE.MeshStandardMaterial({
      color: 0x2e7fd0,
      roughness: 0.6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
  );
  pinboardGroup.add(whiteboard, createPinboardContent());
  backWallGroup.add(backWallOutline, pinboardGroup);
  tagHotspot(pinboardGroup, "wand");
  scene.add(backWallGroup);

  // Seitenwand mit Tür & Eisbrecherkarten
  const sideWallOutline = createWallOutline(ROOM_DEPTH, ROOM_HEIGHT);
  sideWallOutline.rotation.y = Math.PI / 2;
  sideWallOutline.position.set(-halfW, ROOM_HEIGHT / 2, 0);
  scene.add(sideWallOutline);

  const doorGroup = new THREE.Group();
  const door = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 2.2),
    new THREE.MeshStandardMaterial({
      color: 0xaba69e,
      roughness: 0.6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    })
  );
  door.rotation.y = Math.PI / 2;
  door.position.set(-halfW + 0.02, 1.1, 2.2);
  doorGroup.add(door);
  tagHotspot(doorGroup, "tuer");
  scene.add(doorGroup);

  // Poster – "Starterpaket", hängt an derselben Wand direkt neben der Tür
  const posterHeight = 0.85;
  const posterWidth = posterHeight * (1655 / 2340);
  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(posterWidth, posterHeight),
    new THREE.MeshStandardMaterial({ map: posterTexture, roughness: 0.5, side: THREE.DoubleSide })
  );
  poster.rotation.y = Math.PI / 2;
  poster.position.set(-halfW + 0.02, 1.5, 1.3);
  tagHotspot(poster, "starterpaket");
  scene.add(poster);

  // Umzugskarton – "Ein wandernder Raum", steht ganz außen rechts, zwischen
  // der Gesprächsinsel (5 Stühle) und der Sessel-Insel.
  const boxGroup = new THREE.Group();
  const cardboardMaterial = new THREE.MeshStandardMaterial({ color: 0xb5793a, roughness: 0.85 });
  const tapeMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3a1e, roughness: 0.6 });
  const movingBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.55), cardboardMaterial);
  movingBox.position.y = 0.25;
  movingBox.castShadow = true;
  movingBox.receiveShadow = true;
  boxGroup.add(movingBox);
  const tapeStripTop = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.57), tapeMaterial);
  tapeStripTop.position.y = 0.5;
  boxGroup.add(tapeStripTop);
  const tapeStripFront = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.02), tapeMaterial);
  tapeStripFront.position.set(0, 0.25, 0.285);
  boxGroup.add(tapeStripFront);
  boxGroup.position.set(3.2, 0, 0.2);
  tagHotspot(boxGroup, "wandernderraum");
  scene.add(boxGroup);

  // Decke – 4 Formate: kreativ / anpacken / wachsen / weiterdenken
  const ceilingY = ROOM_HEIGHT;
  const zoneW = ROOM_WIDTH / 2;
  const zoneD = ROOM_DEPTH / 2;
  // Farben passend zum Markenblau (#204f9e) & Koralle (#f08b88), im Wechsel.
  // Textfarbe ist jeweils umgekehrt: Orange auf Blau, Blau auf Koralle.
  const ceilingZones = [
    { key: "kreativ", color: 0x204f9e, textColor: "#f08b88", label: "kreativ", x: -zoneW / 2, z: -zoneD / 2 },
    { key: "wachsen", color: 0xf08b88, textColor: "#204f9e", label: "wachsen", x: zoneW / 2, z: -zoneD / 2 },
    { key: "anpacken", color: 0xf08b88, textColor: "#204f9e", label: "anpacken", x: -zoneW / 2, z: zoneD / 2 },
    { key: "weiterdenken", color: 0x204f9e, textColor: "#f08b88", label: "weiterdenken", x: zoneW / 2, z: zoneD / 2 },
  ];
  // Referenz-Tiefe (nicht die reine 3D-Distanz!) von der Standard-Kamera zur
  // Raummitte der Decke, entlang der Standard-Blickrichtung gemessen. Reine
  // Euklidische Distanz überschätzt die nötige Korrektur bei Punkten, die
  // seitlich von der Blickachse liegen (wie unsere 4 Eck-Zonen) – das war die
  // Ursache dafür, dass entferntere Flächen trotz Skalierung noch abgedunkelt
  // wirkten.
  const defaultForward = new THREE.Vector3().subVectors(defaultTarget, defaultCameraPos).normalize();
  const refDistance = new THREE.Vector3(0, ceilingY, 0).sub(defaultCameraPos).dot(defaultForward);
  ceilingZones.forEach((zone) => {
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(zoneW - 0.04, zoneD - 0.04),
      new THREE.MeshStandardMaterial({
        color: zone.color,
        roughness: 0.9,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      })
    );
    panel.rotation.x = Math.PI / 2;
    panel.position.set(zone.x, ceilingY, zone.z);
    panel.renderOrder = 1;
    tagHotspot(panel, zone.key);
    scene.add(panel);

    // Beschriftung liegt flach auf der Decke – durch Backface-Culling nur von
    // oben sichtbar, von innen im Raum nach oben blickend unsichtbar. Die
    // Rotationsrichtung ist umgekehrt zum Panel, damit die Vorderseite
    // (lesbar, nicht gespiegelt) nach oben zeigt statt nach unten in den Raum.
    // Position wandert in die jeweils äußere Ecke der Zone (weg von der
    // Raummitte) – Windmühlen-Muster wie im Referenzlayout.
    const hAlign = zone.x < 0 ? "left" : "right";
    const vAlign = zone.z < 0 ? "top" : "bottom";
    const label = createCeilingLabel("gemeinsam", zone.label, zone.textColor, hAlign, vAlign);
    label.rotation.x = -Math.PI / 2;
    // Explizite Render-Reihenfolge (statt automatischer Distanz-Sortierung für
    // transparente Objekte), damit der Text bei jeder Kamera-Distanz zuverlässig
    // NACH der Fläche gezeichnet wird und nicht von ihr leicht überblendet wird.
    label.renderOrder = 2;
    scene.add(label);
    // Größe UND Rand-Abstand zur Kante werden in updateCeilingLabelScale()
    // jeden Frame gemeinsam anhand der tatsächlichen (nicht nur der
    // Standard-)Kameraposition neu berechnet – so bleiben Textgröße und
    // Abstand zum Rand bei jedem Zoom/Blickwinkel synchron und einheitlich.
    ceilingLabelEntries.push({
      mesh: label,
      zonePosition: new THREE.Vector3(zone.x, ceilingY, zone.z),
      refDistance,
      baseX: zone.x,
      baseZ: zone.z,
      signX: Math.sign(zone.x),
      signZ: Math.sign(zone.z),
      halfW: zoneW / 2,
      halfD: zoneD / 2,
      ceilingY,
    });
  });

  // Gesprächsinseln – mehrere Sitzgruppen im Raum
  const islandPositions = [
    { x: -2.4, z: 1.6, count: 4 },
    { x: 1.8, z: -1.6, count: 5 },
    { x: 2.3, z: 2.0, lounge: true },
  ];
  islandPositions.forEach((island) => {
    const group = island.lounge ? createLoungeIsland(3) : createSeatingIsland(island.count);
    group.position.set(island.x, 0, island.z);
    tagHotspot(group, "inseln");

    // Eisbrecherkarten liegen auf den Tischen (die Sessel-Ecke hat keinen)
    if (!island.lounge) {
      const cards = createIcebreakerCards();
      tagHotspot(cards, "eisbrecher");
      group.add(cards);
    }

    scene.add(group);
  });

  // Irritationsobjekt – schlichtes Podest, auf dem wöchentlich ein neues
  // Objekt platziert wird
  const irritationGroup = new THREE.Group();
  const podest = new THREE.Mesh(
    new RoundedBoxGeometry(0.5, 0.38, 0.5, 3, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xaba69e, roughness: 0.5 })
  );
  podest.position.y = 0.19;
  irritationGroup.add(podest);

  // Platzhalter für das wöchentlich wechselnde Objekt (z. B. ein Hut oder ein
  // Kunstwerk) – bewusst abstrakt und neutral gehalten.
  const displayObject = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x4a5a6b, roughness: 0.4 })
  );
  displayObject.position.y = 0.38 + 0.15;
  irritationGroup.add(displayObject);
  irritationGroup.position.set(-0.3, 0, -0.2);
  tagHotspot(irritationGroup, "irritationsobjekt");
  scene.add(irritationGroup);

  // Kaffee- & Teeküche
  const kitchen = createKitchenette();
  kitchen.position.set(3.1, 0, -halfD + 0.42);
  tagHotspot(kitchen, "kueche");
  scene.add(kitchen);

  // Person repräsentiert die Moderation, steht links neben Pinnwand & Tür,
  // Blick zu den Gesprächsinseln (Tische) hin ausgerichtet
  const person = createPerson();
  person.position.set(-3.6, 0, -2.4);
  person.rotation.y = 0.94;
  tagHotspot(person, "moderation");
  scene.add(person);
}

function createPinboardContent() {
  const group = new THREE.Group();

  const noteGeometry = new THREE.PlaneGeometry(0.16, 0.16);
  const notes = [
    { x: -0.95, y: 0.35, color: 0xffe066, rotation: 0.06 },
    { x: -0.58, y: 0.52, color: 0xff9fc7, rotation: -0.08 },
    { x: 0.28, y: 0.55, color: 0x9fe0a0, rotation: 0.09 },
    { x: -0.75, y: -0.18, color: 0x9fc7f0, rotation: -0.05 },
    { x: 0.32, y: -0.12, color: 0xffe066, rotation: -0.07 },
    { x: 0.78, y: -0.28, color: 0xff9fc7, rotation: 0.05 },
  ];
  notes.forEach((note) => {
    const mesh = new THREE.Mesh(
      noteGeometry,
      new THREE.MeshStandardMaterial({ color: note.color, roughness: 0.8, side: THREE.DoubleSide })
    );
    mesh.position.set(note.x, note.y, 0.01);
    mesh.rotation.z = note.rotation;
    group.add(mesh);
  });

  const photos = [
    { x: -0.15, y: 0.4, rotation: 0.03 },
    { x: 0.72, y: 0.32, rotation: -0.04 },
    { x: -0.2, y: -0.22, rotation: 0.05 },
  ];
  photos.forEach((photo) => {
    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(0.26, 0.19),
      new THREE.MeshStandardMaterial({ color: 0x33363d, roughness: 0.7, side: THREE.DoubleSide })
    );
    frame.position.set(photo.x, photo.y, 0.008);
    frame.rotation.z = photo.rotation;
    const picture = new THREE.Mesh(
      new THREE.PlaneGeometry(0.21, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xf3ede2, roughness: 0.6, side: THREE.DoubleSide })
    );
    picture.position.set(photo.x, photo.y, 0.012);
    picture.rotation.z = photo.rotation;
    group.add(frame, picture);
  });

  return group;
}

function createPerson() {
  const group = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: 0xd9a374, roughness: 0.6 });
  const top = new THREE.MeshStandardMaterial({ color: 0x204f9e, roughness: 0.6 });
  const pants = new THREE.MeshStandardMaterial({ color: 0x4a5a6b, roughness: 0.6 });

  const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.85, 12);
  [-0.09, 0.09].forEach((x) => {
    const leg = new THREE.Mesh(legGeo, pants);
    leg.position.set(x, 0.425, 0);
    group.add(leg);
  });

  const torso = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.55, 0.22, 3, 0.08), top);
  torso.position.y = 1.13;
  group.add(torso);

  const armGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.5, 12);
  [-0.24, 0.24].forEach((x) => {
    const arm = new THREE.Mesh(armGeo, skin);
    arm.position.set(x, 1.13, 0);
    group.add(arm);
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 20, 20), skin);
  head.position.y = 1.53;
  group.add(head);

  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return group;
}

function createIcebreakerCards() {
  // Liegen locker verteilt auf der Tischplatte einer Gesprächsinsel (Tischoberkante bei y=0.59)
  const group = new THREE.Group();
  const cardGeometry = new THREE.PlaneGeometry(0.22, 0.32);
  const cardPlacements = [
    { x: -0.15, z: 0.1, rotation: -0.25 },
    { x: 0.12, z: -0.08, rotation: 0.35 },
  ];
  cardPlacements.forEach((placement) => {
    const card = new THREE.Mesh(
      cardGeometry,
      new THREE.MeshStandardMaterial({ map: icebreakerCardTexture, roughness: 0.5 })
    );
    card.rotation.x = -Math.PI / 2;
    card.rotation.z = placement.rotation;
    card.position.set(placement.x, 0.595, placement.z);
    group.add(card);
  });

  return group;
}

function createKitchenette() {
  const group = new THREE.Group();

  const counter = new THREE.Mesh(
    new RoundedBoxGeometry(1.8, 0.85, 0.55, 3, 0.04),
    new THREE.MeshStandardMaterial({ color: 0xf5efe3, roughness: 0.6 })
  );
  counter.position.y = 0.425;
  group.add(counter);

  const countertop = new THREE.Mesh(
    new RoundedBoxGeometry(1.9, 0.05, 0.6, 3, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  );
  countertop.position.y = 0.875;
  group.add(countertop);

  const upperCabinet = new THREE.Mesh(
    new RoundedBoxGeometry(1.6, 0.5, 0.32, 3, 0.03),
    new THREE.MeshStandardMaterial({ color: 0xcfe8db, roughness: 0.6 })
  );
  upperCabinet.position.set(0, 1.85, -0.1);
  group.add(upperCabinet);

  const machineBody = new THREE.Mesh(
    new RoundedBoxGeometry(0.28, 0.32, 0.24, 3, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x6f7d92, roughness: 0.3 })
  );
  machineBody.position.set(-0.55, 1.06, 0.05);
  group.add(machineBody);

  const kettle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: 0xf7c94c, roughness: 0.4 })
  );
  kettle.position.set(0.1, 1.01, 0.05);
  group.add(kettle);

  const mugColors = [0xf28b82, 0x8fd4c1, 0xffd479];
  mugColors.forEach((color, i) => {
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.09, 12),
      new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
    );
    mug.position.set(0.5 + i * 0.16, 0.945, 0.05);
    group.add(mug);
  });

  return group;
}

function createSeatingIsland(chairCount) {
  const group = new THREE.Group();

  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.05, 32),
    new THREE.MeshStandardMaterial({ color: 0xdcb989, roughness: 0.5 })
  );
  tableTop.position.y = 0.55;
  const tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.05, 0.5, 16),
    new THREE.MeshStandardMaterial({ color: 0xc4a06f, roughness: 0.6 })
  );
  tableLeg.position.y = 0.28;
  group.add(tableTop, tableLeg);

  const radius = 0.95;
  for (let i = 0; i < chairCount; i++) {
    const angle = (i / chairCount) * Math.PI * 2;
    const chair = createChair();
    chair.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    chair.rotation.y = angle + Math.PI;
    group.add(chair);
  }

  return group;
}

function createLoungeIsland(chairCount) {
  // Gesprächsinsel ohne Tisch – stattdessen ein paar Sessel um einen freien
  // Mittelpunkt, für eine lockerere Gesprächsdynamik.
  const group = new THREE.Group();
  const radius = 0.75;
  for (let i = 0; i < chairCount; i++) {
    const angle = (i / chairCount) * Math.PI * 2;
    const armchair = createArmchair();
    armchair.position.set(Math.sin(angle) * radius, 0, Math.cos(angle) * radius);
    armchair.rotation.y = angle + Math.PI;
    group.add(armchair);
  }
  return group;
}

function createArmchair() {
  // Moderner, schlanker Lounge-Sessel: dünnes Polster auf schlanken Beinen
  // statt bodenschwerer Polster-Box.
  const group = new THREE.Group();
  const upholstery = new THREE.MeshStandardMaterial({ color: 0xc9704f, roughness: 0.6 });
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.5 });

  const legGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.38, 12);
  [
    [0.22, -0.2],
    [-0.22, -0.2],
    [0.22, 0.18],
    [-0.22, 0.18],
  ].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMaterial);
    leg.position.set(x, 0.19, z);
    group.add(leg);
  });

  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.12, 0.52, 3, 0.05), upholstery);
  seat.position.y = 0.42;
  group.add(seat);

  const back = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.48, 0.1, 3, 0.04), upholstery);
  back.position.set(0, 0.68, -0.2);
  back.rotation.x = -0.12;
  group.add(back);

  const armGeo = new RoundedBoxGeometry(0.07, 0.05, 0.46, 2, 0.02);
  [-0.27, 0.27].forEach((x) => {
    const arm = new THREE.Mesh(armGeo, upholstery);
    arm.position.set(x, 0.55, -0.02);
    group.add(arm);
  });

  return group;
}

function createChair() {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0xe8c9a0, roughness: 0.5 });
  const legMaterial = new THREE.MeshStandardMaterial({ color: 0xc9a877, roughness: 0.5 });

  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.05, 0.42, 3, 0.06), material);
  seat.position.y = 0.42;
  group.add(seat);

  const back = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.38, 0.04, 3, 0.05), material);
  back.position.set(0, 0.64, -0.19);
  group.add(back);

  // Schlankere Beine für eine leichtere, modernere Silhouette
  const legGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.42, 12);
  const offsets = [
    [0.17, -0.17],
    [-0.17, -0.17],
    [0.17, 0.17],
    [-0.17, 0.17],
  ];
  offsets.forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMaterial);
    leg.position.set(x, 0.21, z);
    group.add(leg);
  });

  return group;
}

function onPointerMove(event) {
  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const hit = intersects.find((i) => i.object.userData.hotspot);
  renderer.domElement.style.cursor = hit ? "pointer" : "grab";

  const newRoot = hit ? hit.object.userData.hotspotRoot : null;
  if (newRoot !== hoveredRoot) {
    setHighlight(hoveredRoot, false);
    setHighlight(newRoot, true);
    hoveredRoot = newRoot;
  }
}

function onPointerLeave() {
  setHighlight(hoveredRoot, false);
  hoveredRoot = null;
}

function onPointerDown(event) {
  pointerDownPos = { x: event.clientX, y: event.clientY };
}

function onPointerUp(event) {
  if (!pointerDownPos) return;
  const dx = event.clientX - pointerDownPos.x;
  const dy = event.clientY - pointerDownPos.y;
  const dragDistance = Math.sqrt(dx * dx + dy * dy);
  pointerDownPos = null;
  if (dragDistance > CLICK_DRAG_THRESHOLD) return; // war eine Dreh-/Zoom-Geste, kein Klick

  updatePointer(event);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const hit = intersects.find((i) => i.object.userData.hotspot);
  if (hit) {
    openPopup(hit.object.userData.hotspot);
  }
}

function updatePointer(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function openPopup(key) {
  const data = HOTSPOTS[key];
  if (!data) return;
  popupTitle.textContent = data.title;
  popupText.textContent = data.text;
  popupOverlay.classList.add("active");
}

function closePopup() {
  popupOverlay.classList.remove("active");
}

function onResize() {
  const width = container.clientWidth;
  const height = container.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

const _forward = new THREE.Vector3();
const _offset = new THREE.Vector3();

function updateCeilingLabelScale() {
  // Kompensiert Zoom UND Blickrichtung: Skalierung UND Rand-Abstand basieren
  // auf der Tiefe entlang der aktuellen Blickrichtung (nicht der reinen 3D-
  // Distanz), damit alle vier Flächen unabhängig von Kamera-Position und
  // Zoomlevel exakt gleich groß und gleich kräftig wirken.
  camera.getWorldDirection(_forward);
  ceilingLabelEntries.forEach((entry) => {
    _offset.copy(entry.zonePosition).sub(camera.position);
    const scaleFactor = _offset.dot(_forward) / entry.refDistance;
    entry.mesh.scale.setScalar(scaleFactor);
    entry.mesh.position.set(
      entry.baseX + entry.signX * (entry.halfW - 1.1 * scaleFactor),
      entry.ceilingY + 0.01,
      entry.baseZ + entry.signZ * (entry.halfD - 0.625 * scaleFactor)
    );
  });
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  updateCeilingLabelScale();
  renderer.render(scene, camera);
}
