import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

extend({ MeshLineGeometry, MeshLineMaterial })

export function Band({ cardRef }) {
    const band = useRef()
    const fixed = useRef()
    const j1 = useRef()
    const j2 = useRef()
    const j3 = useRef()

    const { width, height } = useThree((state) => state.size)
    const [curve] = useState(() => 
            new THREE.CatmullRomCurve3([new THREE.Vector3(), 
            new THREE.Vector3(), 
            new THREE.Vector3(), 
            new THREE.Vector3()
        ]))

    useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]) 
    useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]) 
    useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1])
    useSphericalJoint(j3, cardRef, [[0, 0, 0], [0, 1.45, 0]])
    
    useFrame(() => {
        curve.points[0].copy(j3.current.translation())
        curve.points[1].copy(j2.current.translation())
        curve.points[2].copy(j1.current.translation())
        curve.points[3].copy(fixed.current.translation())
        band.current.geometry.setPoints(curve.getPoints(32))
    })

    return (
        <>
            <RigidBody ref={fixed} type="fixed" />

            <RigidBody position={[0.5, 0, 0]} ref={j1}>
                <BallCollider args={[0.1]} />
            </RigidBody>
            
            <RigidBody position={[1, 0, 0]} ref={j2}>
                <BallCollider args={[0.1]} />
            </RigidBody >
            
            <RigidBody position={[1.5, 0, 0]} ref={j3}>
                <BallCollider args={[0.1]} />
            </RigidBody >
            
            <mesh ref={band}>
                <meshLineGeometry />
                <meshLineMaterial color="white" resolution={[width, height]} lineWidth={1} />
            </mesh>
        </>
    )
}