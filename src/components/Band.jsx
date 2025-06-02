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

    // const vec = new THREE.Vector3()
    const rot = new THREE.Vector3()
    const ang = new THREE.Vector3()
    // const dir = new THREE.Vector3()

    const segmentProps = {
        type : 'dynamic',
        canSleep : true,
        colliders : false,
        angularDamping : 2,
        linearDamping : 2
    }


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
    
    useFrame((state) => {
        // if(dragged){
        //     vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera)
        //     dir.copy(vec).sub(state.camera.position).normalize()
        //     vec.add(dir.multiplyScalar(state.camera.position.length()))
        //     cardRef.current.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z })
        // }

        curve.points[0].copy(j3.current.translation())
        curve.points[1].copy(j2.current.translation())
        curve.points[2].copy(j1.current.translation())
        curve.points[3].copy(fixed.current.translation())
        band.current.geometry.setPoints(curve.getPoints(32))
        
        ang.copy(cardRef.current.angvel())
        rot.copy(cardRef.current.rotation())
        cardRef.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
    })

    return (
        <>
          <group position={[0, 4, 0]}>
            <RigidBody ref={fixed} type="fixed" />

            <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
                <BallCollider args={[0.1]} />
            </RigidBody>
            
            <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
                <BallCollider args={[0.1]} />
            </RigidBody >
            
            <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
                <BallCollider args={[0.1]} />
            </RigidBody >
          </group>
            
            <mesh ref={band}>
                <meshLineGeometry />
                <meshLineMaterial color="white" resolution={[width, height]} lineWidth={0.25} />
            </mesh>
        </>
    )
}