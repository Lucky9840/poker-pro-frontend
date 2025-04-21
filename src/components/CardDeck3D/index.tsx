import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Card } from '../../types';

interface CardDeck3DProps {
  onCardSelect: (card: Card) => void;
}

const CARD_WIDTH = 0.7;
const CARD_HEIGHT = 1;
const CARD_SPACING = 0.2;
const DECK_RADIUS = 3;

export const CardDeck3D: React.FC<CardDeck3DProps> = ({ onCardSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cardsRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());

  useEffect(() => {
    if (!containerRef.current) return;

    // Configuration de base
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Éclairage
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 1);
    spotLight.position.set(0, 10, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

    // Création du deck
    createDeck();

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Gestion des événements
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      checkCardHover();
    };

    const handleClick = () => {
      if (!sceneRef.current || !cameraRef.current) return;
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(cardsRef.current);

      if (intersects.length > 0) {
        const card = intersects[0].object.userData.card;
        if (card) {
          onCardSelect(card);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [onCardSelect]);

  const createDeck = () => {
    if (!sceneRef.current) return;

    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
    let cardIndex = 0;

    suits.forEach((suit, suitIndex) => {
      ranks.forEach((rank, rankIndex) => {
        const angle = (cardIndex * Math.PI * 2) / (suits.length * ranks.length);
        const radius = DECK_RADIUS;
        const x = radius * Math.cos(angle);
        const z = radius * Math.sin(angle);

        const card = createCard({ rank, suit, id: `${rank}${suit}` });
        card.position.set(x, 0.1, z);
        card.rotation.y = angle + Math.PI / 2;
        
        sceneRef.current?.add(card);
        cardsRef.current.push(card);
        cardIndex++;
      });
    });
  };

  const createCard = (cardData: Card) => {
    const geometry = new THREE.BoxGeometry(CARD_WIDTH, CARD_HEIGHT, 0.01);
    
    // Création de la texture de la carte
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 180;
    const ctx = canvas.getContext('2d')!;
    
    // Fond blanc
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 180);
    
    // Bordure
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 124, 176);
    
    // Texte de la carte
    ctx.fillStyle = ['♥', '♦'].includes(cardData.suit) ? '#ff0000' : '#000000';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(cardData.rank + cardData.suit, 64, 90);

    const texture = new THREE.CanvasTexture(canvas);
    
    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Droite
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Gauche
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Haut
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Bas
      new THREE.MeshPhongMaterial({ map: texture }), // Devant
      new THREE.MeshPhongMaterial({ color: 0x0000ff }), // Derrière
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.card = cardData;

    return mesh;
  };

  const checkCardHover = () => {
    if (!sceneRef.current || !cameraRef.current) return;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(cardsRef.current);

    cardsRef.current.forEach((card) => {
      const materials = card.material as THREE.MeshPhongMaterial[];
      materials[0].color.setHex(0x0000ff);
    });

    if (intersects.length > 0) {
      const materials = intersects[0].object.material as THREE.MeshPhongMaterial[];
      materials[0].color.setHex(0x00ff00);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};

export default CardDeck3D;
