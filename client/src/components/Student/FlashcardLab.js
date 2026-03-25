import React, { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import './FlashcardLab.css';

// Individual Flashcard Component
function Flashcard({ 
  question, 
  index, 
  isAnswered, 
  selectedAnswer,
  onClick,
  onAnswerSelect,
  totalQuestions,
  clusterMode,
  gravityPulse,
  allAnswers 
}) {
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef(new THREE.Vector3());
  const dragLastPos = useRef(new THREE.Vector3());
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const rotationVelocity = useRef(new THREE.Vector3(0, 0, 0));

  // Calculate base position based on index and cluster mode
  const basePosition = useMemo(() => {
    if (clusterMode === 'status') {
      // Helper function to check if an answer is actually answered
      const isQuestionAnswered = (idx) => {
        const ans = allAnswers && allAnswers[idx];
        return !!(ans && ans.toString().trim() !== '');
      };
      
      // Cluster by status: answered on left, unanswered on right
      if (isAnswered) {
        // Cluster answered cards on the left
        const answeredIndices = Array.from({ length: totalQuestions }, (_, i) => i)
          .filter(i => isQuestionAnswered(i));
        const clusterIndex = answeredIndices.indexOf(index);
        if (clusterIndex !== -1) {
          const cols = 3;
          const row = Math.floor(clusterIndex / cols);
          const col = clusterIndex % cols;
          return new THREE.Vector3(
            -8 + col * 2.5,
            row * 2.5 - 2,
            0
          );
        }
      } else {
        // Cluster unanswered cards on the right
        const unansweredIndices = Array.from({ length: totalQuestions }, (_, i) => i)
          .filter(i => !isQuestionAnswered(i));
        const clusterIndex = unansweredIndices.indexOf(index);
        if (clusterIndex !== -1) {
          const cols = 3;
          const row = Math.floor(clusterIndex / cols);
          const col = clusterIndex % cols;
          return new THREE.Vector3(
            8 - col * 2.5,
            row * 2.5 - 2,
            0
          );
        }
      }
    }
    
    // Normal circular arrangement
    const angle = (index / totalQuestions) * Math.PI * 2;
    const radius = 8;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      (index % 3 - 1) * 3,
      Math.sin(angle) * radius
    );
  }, [index, totalQuestions, clusterMode, isAnswered, allAnswers]);

  const targetPosition = useRef(new THREE.Vector3().copy(basePosition));

  // Update target position when base position or cluster mode changes
  React.useEffect(() => {
    // Always update target position when cluster mode changes
    targetPosition.current.copy(basePosition);
    // Reset velocity when position changes so cards smoothly transition
    velocity.current.set(0, 0, 0);
  }, [basePosition, clusterMode]);

  // Physics simulation
  useFrame((state, delta) => {
    if (!meshRef.current || !groupRef.current) return;

    const mesh = groupRef.current;

    if (!isDragging) {
      // Return to target position with spring physics
      const direction = new THREE.Vector3()
        .subVectors(targetPosition.current, mesh.position);
      
      const springForce = direction.multiplyScalar(0.15);
      velocity.current.add(springForce);
      
      // Damping
      velocity.current.multiplyScalar(0.85);
      
      // Apply velocity
      mesh.position.add(velocity.current.clone().multiplyScalar(delta * 10));
      
      // Gentle floating rotation
      if (!hovered) {
        rotationVelocity.current.x += (Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.02 - rotationVelocity.current.x) * 0.1;
        rotationVelocity.current.y += (Math.cos(state.clock.elapsedTime * 0.5 + index) * 0.02 - rotationVelocity.current.y) * 0.1;
      }
      
      mesh.rotation.x += rotationVelocity.current.x * delta;
      mesh.rotation.y += rotationVelocity.current.y * delta;
      mesh.rotation.z += rotationVelocity.current.z * delta * 0.5;
    }

    // Hover effect - slight lift
    if (hovered && !isDragging) {
      mesh.position.y += (basePosition.y + 0.5 - mesh.position.y) * 0.1;
    }

    // Gravity pulse effect
    if (gravityPulse && mesh.position) {
      const pulseDirection = new THREE.Vector3(0, 0, 0).sub(mesh.position);
      const distance = pulseDirection.length();
      if (distance > 0.01) {
        pulseDirection.normalize();
        const pulseForce = pulseDirection.multiplyScalar(0.5);
        velocity.current.add(pulseForce);
      }
    }

    // Answered state - glow effect
    if (isAnswered && meshRef.current && meshRef.current.material) {
      const glowIntensity = Math.sin(state.clock.elapsedTime * 2) * 0.15 + 0.85;
      if (meshRef.current.material.emissiveIntensity !== undefined) {
        meshRef.current.material.emissiveIntensity = glowIntensity * 0.4;
      }
    }
  });

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartPos.current.copy(e.point);
    dragLastPos.current.copy(e.point);
    onClick(index);
    velocity.current.set(0, 0, 0);
  }, [index, onClick]);

  const handlePointerMove = useCallback((e) => {
    if (isDragging && groupRef.current) {
      const delta = new THREE.Vector3().subVectors(e.point, dragLastPos.current);
      groupRef.current.position.add(delta);
      dragLastPos.current.copy(e.point);
    }
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Calculate flick velocity based on drag speed
      const dragDistance = new THREE.Vector3().subVectors(dragLastPos.current, dragStartPos.current);
      velocity.current.copy(dragDistance.multiplyScalar(3));
      
      // Add upward component for natural flick
      velocity.current.y += 0.5;
      
      // Gradually return to base position
      setTimeout(() => {
        targetPosition.current.copy(basePosition);
      }, 100);
    }
  }, [isDragging, basePosition]);

  const cardColor = isAnswered ? '#4CAF50' : '#2196F3';
  const textColor = '#FFFFFF';

  // Truncate question text for display
  const displayText = question.question_text.length > 50 
    ? question.question_text.substring(0, 50) + '...' 
    : question.question_text;

  return (
    <group
      ref={groupRef}
      position={basePosition}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card Mesh */}
      <mesh ref={meshRef} receiveShadow castShadow>
        <boxGeometry args={[2.8, 3.8, 0.15]} />
        <meshStandardMaterial
          color={cardColor}
          emissive={cardColor}
          emissiveIntensity={isAnswered ? 0.4 : 0.15}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Card Border Glow */}
      <mesh position={[0, 0, -0.08]} visible={hovered || isDragging}>
        <boxGeometry args={[2.9, 3.9, 0.02]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.3} />
      </mesh>

      {/* Question Text */}
      <Text
        position={[0, 0.8, 0.08]}
        fontSize={0.12}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.4}
      >
        {displayText}
      </Text>

      {/* Question Number Badge */}
      <mesh position={[-1.2, 1.6, 0.08]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#FF9800" />
      </mesh>
      <Text
        position={[-1.2, 1.6, 0.09]}
        fontSize={0.1}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {index + 1}
      </Text>

      {/* Marks indicator */}
      <Text
        position={[1.2, 1.6, 0.08]}
        fontSize={0.09}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {question.marks}pts
      </Text>

      {/* Status indicator */}
      {isAnswered ? (
        <mesh position={[0, -1.4, 0.08]}>
          <circleGeometry args={[0.25, 16]} />
          <meshBasicMaterial color="#4CAF50" />
        </mesh>
      ) : (
        <mesh position={[0, -1.4, 0.08]}>
          <circleGeometry args={[0.2, 16]} />
          <meshBasicMaterial color="#FFC107" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Particle System
function Particles({ count = 100 }) {
  const points = useRef();
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      );
    }
    return new Float32Array(temp);
  }, [count]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#64B5F6" transparent opacity={0.6} />
    </points>
  );
}

// Gravity Pulse Effect
function GravityPulse({ active }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const startTime = useRef(null);
  
  useFrame((state) => {
    if (active && groupRef.current && meshRef.current) {
      if (!startTime.current) {
        startTime.current = state.clock.elapsedTime;
      }
      const elapsed = state.clock.elapsedTime - startTime.current;
      if (elapsed < 1) {
        const scale = 1 + Math.sin(elapsed * 20) * 0.3;
        groupRef.current.scale.setScalar(scale);
        // Access material through the mesh, not the group
        if (meshRef.current.material) {
          meshRef.current.material.opacity = 0.15 * (1 - elapsed);
        }
      } else {
        startTime.current = null;
      }
    } else {
      startTime.current = null;
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
    </group>
  );
}

// Main FlashcardLab Component
const FlashcardLab = ({ questions, answers, onAnswerSelect, onCardClick, currentQuestionIndex }) => {
  const [gravityPulse, setGravityPulse] = useState(false);
  const [clusterMode, setClusterMode] = useState(null); // 'answered', 'unanswered', or null

  const handleGravityPulse = () => {
    setGravityPulse(true);
    setTimeout(() => {
      setGravityPulse(false);
    }, 1000);
  };

  const clusterByStatus = () => {
    if (clusterMode === null) {
      // Activate clustering
      setClusterMode('status');
      handleGravityPulse();
    } else {
      // Reset to normal arrangement
      setClusterMode(null);
      handleGravityPulse();
    }
  };

  return (
    <div className="flashcard-lab-container">
      <div className="flashcard-lab-controls">
        <button 
          className="lab-btn pulse-btn"
          onClick={handleGravityPulse}
          disabled={gravityPulse}
        >
          ⚡ Gravity Pulse
        </button>
        <button 
          className="lab-btn cluster-btn"
          onClick={clusterByStatus}
        >
          {clusterMode === 'status' ? '🔄 Reset Layout' : '📊 Cluster by Status'}
        </button>
        <div className="lab-stats">
          <span>Answered: {Object.keys(answers).filter(k => answers[k]).length}</span>
          <span>Total: {questions.length}</span>
        </div>
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 5, 15], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #1a1a2e, #16213e, #0f3460)' }}
      >
        <PerspectiveCamera makeDefault position={[0, 5, 15]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#64B5F6" />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#FF6B6B" />

        {/* Environment */}
        <Stars radius={100} depth={50} count={1000} factor={4} fade speed={1} />
        <Environment preset="night" />

        {/* Particles */}
        <Particles count={200} />

        {/* Gravity Pulse Effect */}
        <GravityPulse active={gravityPulse} />

        {/* Flashcards */}
        {questions.map((question, index) => {
          // Consistent check: answered means the answer exists and is not empty
          const answerValue = answers[index];
          const isCardAnswered = !!(answerValue && answerValue.toString().trim() !== '');
          return (
            <Flashcard
              key={`card-${index}`}
              question={question}
              index={index}
              isAnswered={isCardAnswered}
              selectedAnswer={answers[index]}
              onClick={onCardClick}
              onAnswerSelect={onAnswerSelect}
              totalQuestions={questions.length}
              clusterMode={clusterMode}
              gravityPulse={gravityPulse}
              allAnswers={answers}
            />
          );
        })}

        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
};

export default FlashcardLab;

