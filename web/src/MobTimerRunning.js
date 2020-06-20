import React, { useEffect, useState, useRef } from "react";
import * as Mob from "./Mob";

const computeRemaining = (now, interval, start) => {
  const elapsed = now - start;
  const target = interval * 60000;
  const remainingMillis = target - elapsed;
  const remainingSecs = Math.floor(remainingMillis / 1000);
  return {
    now,
    elapsed,
    target,
    remainingMillis,
    remainingSecs,
  };
};

const computeRemainingNow = (interval, start) =>
  computeRemaining(new Date().getTime(), interval, start);

const NextUp = ({ mob, onSwitch, onStop }) => (
  <div>
    <h2>Switch it up!</h2>
    <div>{Mob.nextMobster(mob).name}, it's your turn!</div>
    <button className="btn" onClick={onSwitch}>
      Switch
    </button>
    <button className="btn" onClick={onStop}>
      Stop
    </button>
  </div>
);

const CountdownTimer = ({ time }) => {
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;

  return (
    <div className="text-6xl text-gray-700 flex items-center">
      {minutes < 10 && "0"}
      {minutes}:{seconds < 10 && "0"}
      {seconds}
    </div>
  );
};

const Countdown = ({ current, next, time, onStop }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-col items-center bg-gray-100 w-5/6 md:w-2/3 p-4 space-y-8">
        <CountdownTimer time={time} />
        <button
          className="bg-red-500 rounded-sm py-2 px-4 text-gray-100"
          onClick={onStop}
        >
          Stop
        </button>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center">
            <h2 className="text text-gray-500">Current Mobster</h2>
            <div className="text-3xl text-gray-600">{current.name}</div>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text text-gray-500">Up next</h2>
            <div className="text-3xl text-gray-600">{next.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MobTimerRunning = ({ mob, onSwitch, onStop, onZero }) => {
  const { remainingSecs } = computeRemainingNow(mob.interval, mob.start);
  const [time, setTime] = useState(remainingSecs);
  useEffect(() => {
    // let raf = null;
    let interval = null;
    const update = () => {
      const { remainingSecs } = computeRemainingNow(mob.interval, mob.start);
      if (remainingSecs >= 0) {
        setTime(remainingSecs);
        // raf = requestAnimationFrame(update);
      } else {
        onZero();
        clearInterval(interval);
      }
    };
    interval = setInterval(update, 100);
    // raf = requestAnimationFrame(update);
    // return () => cancelAnimationFrame(raf);
    return () => clearInterval(interval);
  }, [mob]);

  if (time > 0) {
    return (
      <Countdown
        time={time}
        current={Mob.currentMobster(mob)}
        next={Mob.nextMobster(mob)}
        onStop={onStop}
      />
    );
  } else {
    return <NextUp mob={mob} onSwitch={onSwitch} onStop={onStop} />;
  }
};

export default MobTimerRunning;
