import { useState } from 'react'
import './App.css'

import { Joystick } from 'react-joystick-component';
import { JoystickShape } from 'react-joystick-component';
import axios from 'axios';
import { useRef } from 'react';

import 'react-range-slider-input/dist/style.css';
import { useEffect } from 'react';

// const host = 'http://192.168.43.60:8878';
const defaultHost = 'http://192.168.1.145:8877';

const maxLeft = 40;
const maxRight = 140;

const KEY_W = 87
const KEY_A = 65
const KEY_S = 83
const KEY_D = 68
const KEY_UP = 38
const KEY_DOWN = 40
const KEY_SPACE = 32

function App() {
  const prevSpeed = useRef(0);
  const prevDeg = useRef(90);

  const [host, setHost] = useState(defaultHost);

  const [speeds, setSpeeds] = useState([35, 50, 75, 100]);

  const [invertTurn, setInvertTurn] = useState(false);
  const [invertMove, setInvertMove] = useState(false);
  const [spd, setSpd] = useState(4);

  const [rightJoystickState, setRightJoystickState] = useState({ x: 0, y: 0, direction: 'FORWARD', distance: 0 });
  const [leftJoystickState, setLeftJoystickState] = useState({ x: 0, y: 0, direction: 'LEFT', distance: 0 });

  const [speedNow, setSpeedNow] = useState(0)
  const [freq, setFreq] = useState(3500)

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)


    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    if (rightJoystickState.x === 0 && rightJoystickState.y === 0) {
      return handleStop()
    }
    handleMove(rightJoystickState)
  }, [rightJoystickState])

  useEffect(() => {
    if (leftJoystickState.x === 0 && leftJoystickState.y === 0) {
      //return handleStopTurn()
    }
    handleTurn(leftJoystickState)
  }, [leftJoystickState])

  const handleKeyDown = (e) => {
    switch (e.keyCode) {
      case KEY_W:
        console.log('maju');
        setRightJoystickState({ x: 0, y: 1, direction: 'FORWARD', distance: 100 });
        break;
      case KEY_S:
        console.log('mundur');
        setRightJoystickState({ x: 0, y: -1, direction: 'BACKWARD', distance: 100 });
        break;
      case KEY_A:
        console.log('kiri');
        setLeftJoystickState({ x: -1, y: 0, direction: 'LEFT', distance: 100 });
        break;
      case KEY_D:
        console.log('kanan');
        setLeftJoystickState({ x: 1, y: 0, direction: 'RIGHT', distance: 100 });
        break;
      case KEY_SPACE:
        console.log('stop');
        setLeftJoystickState({ x: 0, y: 0, direction: 'RIGHT', distance: 0 });
        setRightJoystickState({ x: 0, y: 0, direction: 'FORWARD', distance: 0 });
        handleStop()
        handleStopTurn()
        break;
    }


  }

  const handleKeyUp = (e) => {
    switch (e.keyCode) {
      case KEY_W:
        console.log('maju stop');
        setRightJoystickState({ x: 0, y: 0, direction: 'FORWARD', distance: 0 });
        break;
      case KEY_S:
        console.log('mundur stop');
        setRightJoystickState({ x: 0, y: 0, direction: 'BACKWARD', distance: 0 });
        break;
      case KEY_A:
        console.log('kiri stop');
        setLeftJoystickState({ x: 0, y: 0, direction: 'LEFT', distance: 0 });
        break;
      case KEY_D:
        console.log('kanan stop');
        setLeftJoystickState({ x: 0, y: 0, direction: 'RIGHT', distance: 0 });
        break;
    }

  }


  const handleMove = (e) => {
    const distance = parseInt(e.distance);

    let speed = speeds[spd];
    if (spd === 4) {
      speed = speeds.reduce(function (prev, curr) {
        return (Math.abs(curr - distance) < Math.abs(prev - distance) ? curr : prev);
      });

    }

    speed = e.direction === "FORWARD" ? speed : -speed;

    if (invertMove) {
      speed = -speed
    }

    if (speed === prevSpeed.current) {
      return
    }
    prevSpeed.current = speed;
    console.log(speed)

    axios.get(`${host}/move?speed=${speed / 100 * 255}`)
      .then(r => {
        setLogs(logs => [JSON.stringify(r.data), ...logs]);
        setSpeedNow(speed);
        console.log(r.data)
      })
      .catch(e => { setLogs(logs => ['connection error', ...logs]); console.log('device err') });
  }

  const handleStop = (e) => {
    prevSpeed.current = 0;
    axios.get(`${host}/move?speed=0`, { timeout: 500 })
      .then(r => {
        setLogs(logs => [JSON.stringify(r.data), ...logs]);
        setSpeedNow(0);
        console.log(r.data)
      })
      .catch(e => { setLogs(logs => ['connection error', ...logs]); console.log('device err') });
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

    let deg = 0;
    deg = distance < 40 ? degs[0] : degs[1];
    deg = distance < 70 ? deg : degs[2];
    deg = distance === 0 ? 90 : deg;

    if (deg === prevDeg.current) {
      return
    }
    prevDeg.current = deg;

    axios.get(`${host}/turn?d=${deg}`, { timeout: 500 })
      .then(r => { setLogs(logs => [JSON.stringify(r.data), ...logs]); console.log(r.data) })
      .catch(e => { setLogs(logs => ['connection error', ...logs]); console.log('device err') });
  }


  const handleStopTurn = (e) => {
    axios.get(`${host}/turn?d=90`, { timeout: 500 })
      .then(r => { setLogs(logs => [JSON.stringify(r.data), ...logs]); console.log(r.data) })
      .catch(e => { setLogs(logs => ['connection error', ...logs]); console.log('device err') });
  }

  const stop = () => {
    axios.get(`${host}/move?speed=0`, { timeout: 500 })
      .then(r => { setLogs(logs => [JSON.stringify(r.data), ...logs]); console.log(r.data) })
      .catch(e => { setLogs(logs => ['connection error', ...logs]); console.log('device err') });
  }

  const setPwm = (e) => {
    axios.get(`${host}/freq?f=${freq}`, { timeout: 500 })
      .then(r => { setLogs(logs => [JSON.stringify(r.data), ...logs]); console.log(r.data) })
      .catch(e => { setLogs(logs => ['connection error', ...logs]); console.log('device err') });

  }

  const [logs, setLogs] = useState([])

  const logText = logs.join('\n');

  return (
    <div className="" style={{ height: '80vh' }}>
      {/* <div className="" style={{ height: 300 }}>
        <RangeSlider
          value={[speed, 100]}
          onInput={e => {
            setSpeedNow(e[0])
            //console.log(e)
          }}
          onThumbDragEnd={e => setSpeedNow(50)}
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
        <input onChange={() => setSpd(3)} type="radio" name='spd' value={3} checked={spd === 3} /> 4{" "}
        <input onChange={() => setSpd(4)} type="radio" name='spd' value={4} checked={spd === 4} /> Auto{" "}
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
            pos={leftJoystickState}
            size={150}
            stickSize={100}
            sticky={false}
            baseColor="red"
            stickColor="blue"
            move={handleTurn}
            stop={handleStopTurn}
            minDistance={10}
            baseShape={JoystickShape.Square}
            stickShape={JoystickShape.Square}
            controlPlaneShape={JoystickShape.AxisX}
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
            <button onClick={stop} style={{ padding: 15 }}>STOP</button> <br />
            <span>{speeds.indexOf(Math.abs(speedNow)) + 1}</span>
          </div>
          <Joystick
            pos={rightJoystickState}
            size={150}
            stickSize={70}
            sticky={false}
            baseColor="red"
            stickColor="blue"
            move={handleMove}
            stop={handleStop}
            minDistance={10}
            style={{ height: 400 }}
            baseShape={JoystickShape.Square}
            stickShape={JoystickShape.Square}
            controlPlaneShape={JoystickShape.AxisY}
          >
          </Joystick>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <textarea rows="3" style={{ width: '100%' }} defaultValue={logText}></textarea>
      </div>
    </div>

  )
}

export default App
