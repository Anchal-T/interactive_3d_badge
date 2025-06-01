import * as THREE from 'three'
import { useRef, useState } from 'react'
import { Canvas, extend, useThree, useFrame } from '@react-three/fiber'
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier'
import { MeshLineGeometry, MeshLineMaterial } from 'meshline'

function Band(){
    const band = useRef()
    const fixed = useRef()
    const j1 = useRef()
    const j2 = useRef()
    const j3 = useRef()

    const {width, height} = useThree((state) => state.size)
    const [curve] = useState(() => new THREE.CatmullRomCurve3([
        new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
    ]))
}