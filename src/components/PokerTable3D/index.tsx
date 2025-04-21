import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card, GameState } from '../../types';

interface PokerTable3DProps {
  gameState: GameState;
  onCardClick: (card: Card) => void;
  onPositionClick: (position: string) => void;
}

const TABLE_RADIUS = 5;
const TABLE_HEIGHT = 0.2;
const CARD_WIDTH = 0.7;
const CARD_HEIGHT = 1;
const CARD_DEPTH = 0.01;

export const PokerTable3D: React.FC<PokerTable3DProps> = ({
  gameState,
  onCardClick,
  onPositionClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const cardsRef = useRef<{ [key: string]: THREE.Mesh }>({});

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialisation de la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a472a); // Vert poker
    sceneRef.current = scene;

    // Caméra
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 8, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    // Éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Table de poker
    createPokerTable();

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Nettoyage
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Création de la table
  const createPokerTable = () => {
    if (!sceneRef.current) return;

    // Géométrie de la table
    const tableGeometry = new THREE.CylinderGeometry(
      TABLE_RADIUS,
      TABLE_RADIUS,
      TABLE_HEIGHT,
      32
    );
    const tableMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a472a,
      shininess: 100,
    });
    const table = new THREE.Mesh(tableGeometry, tableMaterial);
    table.receiveShadow = true;
    sceneRef.current.add(table);

    // Bordure de la table
    const railGeometry = new THREE.TorusGeometry(TABLE_RADIUS, 0.2, 16, 100);
    const railMaterial = new THREE.MeshPhongMaterial({
      color: 0x4a2810,
      shininess: 100,
    });
    const rail = new THREE.Mesh(railGeometry, railMaterial);
    rail.position.y = 0.1;
    rail.castShadow = true;
    rail.receiveShadow = true;
    sceneRef.current.add(rail);

    // Positions des joueurs
    const positions = calculatePlayerPositions(gameState.numPlayers || 6);
    positions.forEach((pos, index) => {
      createPlayerPosition(pos.x, pos.z, `Position ${index + 1}`);
    });
  };

  // Création d'une position de joueur
  const createPlayerPosition = (x: number, z: number, label: string) => {
    if (!sceneRef.current) return;

    const posGeometry = new THREE.CircleGeometry(0.5, 32);
    const posMaterial = new THREE.MeshPhongMaterial({
      color: 0x2c3e50,
      transparent: true,
      opacity: 0.8,
    });
    const position = new THREE.Mesh(posGeometry, posMaterial);
    position.position.set(x, 0.11, z);
    position.rotation.x = -Math.PI / 2;
    sceneRef.current.add(position);
  };

  // Calcul des positions des joueurs
  const calculatePlayerPositions = (numPlayers: number) => {
    const positions = [];
    const radius = TABLE_RADIUS - 1;
    for (let i = 0; i < numPlayers; i++) {
      const angle = (i * 2 * Math.PI) / numPlayers - Math.PI / 2;
      positions.push({
        x: radius * Math.cos(angle),
        z: radius * Math.sin(angle),
      });
    }
    return positions;
  };

  // Mise à jour des cartes
  useEffect(() => {
    updateCards();
  }, [gameState.selectedCards, gameState.communityCards]);

  // Création et mise à jour des cartes
  const updateCards = () => {
    if (!sceneRef.current) return;

    // Nettoyer les cartes existantes
    Object.values(cardsRef.current).forEach((card) => {
      sceneRef.current?.remove(card);
    });
    cardsRef.current = {};

    // Créer les nouvelles cartes
    gameState.selectedCards.forEach((card, index) => {
      const cardMesh = createCard(card);
      const angle = -Math.PI / 4 + index * Math.PI / 2;
      cardMesh.position.set(
        4 * Math.cos(angle),
        0.2,
        4 * Math.sin(angle)
      );
      cardMesh.rotation.y = angle;
      sceneRef.current?.add(cardMesh);
      cardsRef.current[card.id] = cardMesh;
    });

    // Cartes communes
    gameState.communityCards.forEach((card, index) => {
      const cardMesh = createCard(card);
      cardMesh.position.set(
        -1.5 + index * 0.8,
        0.2,
        0
      );
      sceneRef.current?.add(cardMesh);
      cardsRef.current[card.id] = cardMesh;
    });
  };

  // Création d'une carte
  const createCard = (card: Card) => {
    const cardGeometry = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH);
    
    // Créer les textures pour la carte
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;
    
    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 180);
    
    // Texte de la carte
    ctx.fillStyle = ['♥', '♦'].includes(card.suit) ? '#ff0000' : '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(card.rank + card.suit, 64, 90);

    const texture = new THREE.CanvasTexture(canvas);
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Droite
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Gauche
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Haut
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Bas
      new THREE.MeshPhongMaterial({ map: texture }), // Devant
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Derrière
    ];

    const cardMesh = new THREE.Mesh(cardGeometry, materials);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;

    return cardMesh;
  };

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default PokerTable3D;
