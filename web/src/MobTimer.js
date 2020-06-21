import React, { useEffect, useState, useRef } from "react";
import MobTimerIdle from "./MobTimerIdle";
import MobTimerRunning from "./MobTimerRunning";
import * as Mob from "./Mob";
import * as Icon from "./icons";

const MobTimer = ({ id, mob, onChange, onNotify, timeDelta }) => {
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    const vol = localStorage.getItem("audio-volume");
    if (vol) {
      setVolume(parseInt(vol, 10));
    }
  }, []);

  const changeVolume = (volume) => {
    setVolume(volume);
    localStorage.setItem("audio-volume", volume);
  };

  const canNotify = Notification.permission === "granted";
  return (
    <div className="flex flex-col h-screen">
      {!canNotify && (
        <div className="bg-yellow-300 text-xs flex p-1 cursor-pointer space-x-2 border-b border-gray-500">
          <Icon.AlertTriangle size={18} />
          <div>
            Notification permissions are not granted, so I cannot notify you
            when it's time to switch up.
          </div>
        </div>
      )}
      <div className="space-y-8">
        <div className="flex space-x-2 text-sm text-gray-600 bg-gray-400 items-center p-2 justify-end">
          <div>audio volume:</div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => changeVolume(parseInt(e.target.value, 10))}
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
    </div>
  );
};

export default MobTimer;
