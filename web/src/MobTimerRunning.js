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
  return <div>T-{time} sec</div>;
};

const Countdown = ({ current, next, time, onStop }) => {
  return (
    <div>
      <CountdownTimer time={time} />
      <button className="btn" onClick={onStop}>
        Stop
      </button>
      <div>Current Mobster: {current.name}</div>
      <div>Up next: {next.name}</div>
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
