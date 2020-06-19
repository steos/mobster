import React, { useEffect, useState, useRef } from "react";
import MobTimerIdle from "./MobTimerIdle";
import MobTimerRunning from "./MobTimerRunning";
import * as Mob from "./Mob";

const MobTimer = ({ id, mob, onChange, onNotify, timeDelta }) => {
  const [volume, setVolume] = useState(50);
  return (
    <div className="flex flex-col h-screen">
      <div className="flex space-x-2 text-sm text-gray-700 items-center p-2 justify-end">
        <div>Volume:</div>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value, 10))}
        />
      </div>
      {{
        idle: () => (
          <MobTimerIdle
            mob={mob}
            onChange={onChange}
            onStart={() => {
              if (mob.mobsters.length < 0) {
                return;
              }
              onChange(Mob.startTimer(mob, timeDelta));
            }}
          />
        ),
        running: () => (
          <MobTimerRunning
            mob={mob}
            onZero={() => onNotify(mob, volume)}
            onSwitch={() => {
              // clearNotification();
              onChange(Mob.switchMobster(mob));
            }}
            onStop={() => {
              // clearNotification();
              onChange(Mob.stopTimer(mob));
            }}
          />
        ),
      }[mob.state]()}
    </div>
  );
};

export default MobTimer;
