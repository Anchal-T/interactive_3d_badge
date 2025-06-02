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

    // const [lerpedJ1] = useState(() => new THREE.Vector3())
    // const [lerpedJ2] = useState(() => new THREE.Vector3())

    const segmentProps = {
        type: 'dynamic',
        canSleep: true,
        colliders: false,
        angularDamping: 2,
        linearDamping: 2
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

    useFrame((state, delta) => {

        // if (cardRef.current && fixed.current && j3.current && band.current) {
            // ;[j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp())
        if(fixed.current){

            ;[j1, j2].forEach((ref) => {
                if (!ref.current.lerped) {
                    ref.current.lerped = new THREE.Vector3().copy(ref.current.translation())
                }

                const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())))

                const adaptiveSpeed = 10 + clampedDistance * (50 - 10)

                ref.current.lerped.lerp(ref.current.translation(), delta * adaptiveSpeed)
            })

            // lerpedJ1.lerp(j1.current.translation(), lerpFactor)
            // lerpedJ2.lerp(j2.current.translation(), lerpFactor)

            curve.points[0].copy(j3.current.translation())
            curve.points[1].copy(j2.current.lerped)
            curve.points[2].copy(j1.current.lerped)
            curve.points[3].copy(fixed.current.translation())
            band.current.geometry.setPoints(curve.getPoints(32))

            // ang.copy(cardRef.current.angvel())
            // rot.copy(cardRef.current.rotation())
            // cardRef.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z })
        }
    })

    curve.curveType = 'chordal'

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
                <meshLineMaterial color={'#222222'} resolution={[width, height]} lineWidth={0.35} />
            </mesh>
        </>
    )
}   