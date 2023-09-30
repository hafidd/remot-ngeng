import { useState } from 'react'
import './App.css'

import { Joystick } from 'react-joystick-component';
import axios from 'axios';
import { useRef } from 'react';

import RangeSlider from 'react-range-slider-input'
import 'react-range-slider-input/dist/style.css';
import { useEffect } from 'react';

// const host = 'http://192.168.43.60:8878';
const defaultHost = 'http://192.168.1.145:8877';

const maxLeft = 40;
const maxRight = 140;

function App() {
  const prevSpeed = useRef(0);
  const prevDeg = useRef(90);

  const [host, setHost] = useState(defaultHost);

  const [speeds, setSpeeds] = useState([50, 80,]);

  const [invertTurn, setInvertTurn] = useState(false);
  const [invertMove, setInvertMove] = useState(false);
  const [spd, setSpd] = useState(3);

  const handleMove = (e) => {
    // console.log(e)
    const distance = parseInt(e.distance);
    const speeds = [80, 120, 255];

    let speed = speeds[spd];
    if (spd === 3) {
      speed = (distance < 40 && distance > 15) ? speeds[0] : speeds[1];
      speed = distance < 70 ? speed : speeds[2];
    }
    speed = e.direction === "FORWARD" ? speed : -speed;

    if (invertMove) {
      speed = -speed
    }

    console.log(spd, speed)

    if (speed === prevSpeed.current) {
      return
    }
    prevSpeed.current = speed;

    axios.get(`${host}/move?speed=${speed}`)
      .then(r => console.log(r))
      .catch(e => console.log('device err'));
  }

  const handleStop = (e) => {
    axios.get(`${host}/move?speed=0`)
      .then(r => console.log(r))
      .catch(e => console.log('device err'));
  }

  const handleTurn = (e) => {
    // console.log(e)
    const distance = parseInt(e.distance);
    const direction = e.direction.toLowerCase();
    const degRight = [70, 55, 40];
    const degLeft = [110, 125, 140];

    let degs = degLeft
    if (direction === 'right') {
      degs = degRight
    }

    if (invertTurn) {
      degs = degRight
      if (direction === 'right') {
        degs = degLeft
      }
    }

    let deg = 90;
    deg = (distance < 40 && distance > 15) ? degs[0] : degs[1];
    deg = distance < 70 ? deg : degs[2];

    if (deg === prevDeg.current) {
      return
    }
    prevDeg.current = deg;

    axios.get(`${host}/turn?d=${deg}`)
      .then(r => console.log(r))
      .catch(e => console.log('device err'));
  }


  const handleStopTurn = (e) => {
    axios.get(`${host}/turn?d=90`)
      .then(r => console.log(r))
      .catch(e => console.log('device err'));
  }

  const stop = () => {
    axios.get(`${host}/move?speed=0`)
      .then(r => console.log(r))
      .catch(e => console.log('device err'));
  }

  const [speed, setSpeed] = useState(50)
  const [freq, setFreq] = useState(3500)

  const setPwm = (e) => {
    axios.get(`${host}/freq?f=${freq}`)
      .then(r => console.log(r))
      .catch(e => console.log('device err'));

  }

  return (
    <div className="" style={{ height: '80vh' }}>
      {/* <div className="" style={{ height: 300 }}>
        <RangeSlider
          value={[speed, 100]}
          onInput={e => {
            setSpeed(e[0])
            //console.log(e)
          }}
          onThumbDragEnd={e => setSpeed(50)}
        />
      </div> */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setInvertTurn(prev => !prev)}>INVERT {invertTurn ? 'ON' : 'OFF'}</button>
        <button onClick={() => setInvertMove(prev => !prev)}>INVERT {invertMove ? 'ON' : 'OFF'}</button>
      </div>

      <div className="">
        <span>Speed</span>
        <input onChange={() => setSpd(0)} type="radio" name='spd' value={0} checked={spd === 0} /> 1{" "}
        <input onChange={() => setSpd(1)} type="radio" name='spd' value={1} checked={spd === 1} /> 2{" "}
        <input onChange={() => setSpd(2)} type="radio" name='spd' value={2} checked={spd === 2} /> 3{" "}
        <input onChange={() => setSpd(3)} type="radio" name='spd' value={3} checked={spd === 3} /> Auto{" "}
        <br />
        <span>PWM freq: <input type="text" size={5} value={freq} onChange={(e) => setFreq(e.target.value)} /></span>
        <button onClick={setPwm}>SET</button>
      </div>

      <div style={{
        display: 'flex', width: '100%', justifyContent: "space-between",
        height: '70vh', alignItems: "end",
      }}>
        <div className="" style={{ display: 'flex', alignItems: 'start' }}>
          <Joystick
            size={100}
            sticky={false}
            baseColor="red"
            stickColor="blue"
            move={handleTurn}
            stop={handleStopTurn}
          >
          </Joystick>
          <div className="" style={{ marginLeft: 50, marginTop: 20 }}>
            <button
              onClick={handleStopTurn}
              style={{ padding: 15 }}>&raquo;&laquo;</button>
          </div>

        </div>
        <div className="" style={{ display: 'flex' }}>
          <div className="" style={{ marginRight: 50, marginTop: 20 }}>
            <button onClick={stop} style={{ padding: 15 }}>STOP</button>
          </div>
          <Joystick
            size={100}
            sticky={false}
            baseColor="red"
            stickColor="blue"
            move={handleMove}
            stop={handleStop}
          >
          </Joystick>
        </div>
      </div>
    </div>

  )
}

export default App
