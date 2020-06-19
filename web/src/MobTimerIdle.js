import React, { useEffect, useState, useRef } from "react";
import * as Icon from "./icons";
import * as Mob from "./Mob";

const MobForm = ({ onSubmit, autoFocus }) => {
  const [name, setName] = useState("");
  const isValid = name.trim().length > 0;
  return (
    <div className="space-x-2 flex">
      <input
        autoFocus={autoFocus}
        className="flex-auto p-2 text-lg border-b-2 outline-none border-gray-500 focus:border-blue-700 rounded-sm"
        placeholder="Mobster Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter" && isValid) {
            onSubmit(name.trim());
            setName("");
          }
        }}
      />
      <button
        className="bg-blue-500 rounded-sm py-2 px-4 text-gray-100 text-lg"
        disabled={!isValid}
        onClick={() => {
          onSubmit(name.trim());
          setName("");
        }}
      >
        Add
      </button>
    </div>
  );
};

const MobsterListItem = ({ mobster, selected, onSelect, onRemove }) => (
  <div
    className="flex space-x-2 items-center hover:bg-gray-300 p-4 text-lg"
    onClick={onSelect}
  >
    <div className="outline-none flex cursor-pointer space-x-2 flex-auto">
      <div className="w-6 text-gray-500 flex items-center">
        {selected ? <Icon.ArrowRight /> : null}
      </div>
      <div className="break-all flex-auto">{mobster.name}</div>
    </div>
    <button
      className="text-gray-400 hover:text-gray-500"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove();
      }}
    >
      <Icon.Trash />
    </button>
  </div>
);

const MobTimerIdle = ({ mob, onChange, onStart }) => {
  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="flex justify-center items-center">
        <button
          className="p-2 border rounded-sm border-blue-500 text-blue-500"
          onClick={() => {
            onChange(Mob.setInterval(mob, mob.interval - 1));
          }}
        >
          <Icon.Minus />
        </button>
        <div className="text-6xl w-64 flex justify-center items-center">
          {mob.interval < 10 && "0"}
          {mob.interval}m
        </div>

        <button
          className="p-2 border rounded-sm border-blue-500 text-blue-500"
          onClick={() => {
            onChange(Mob.setInterval(mob, mob.interval + 1));
          }}
        >
          <Icon.Plus />
        </button>
      </div>

      <div className="flex justify-center">
        <button
          className="bg-blue-500 rounded-sm py-5 px-12 text-4xl text-gray-100"
          disabled={mob.mobsters.length < 2}
          onClick={onStart}
        >
          Go
        </button>
      </div>
      <div className="bg-gray-200 p-4 w-2/3 space-y-3">
        <h2 className="text-xl text-center text-gray-700">The Mobsters</h2>
        <MobForm
          autoFocus={Mob.count(mob) < 2}
          onSubmit={(name) => {
            onChange(Mob.addMobster(mob, name));
          }}
        />
        {!Mob.hasMobsters(mob) && (
          <div className="text-lg text-center text-gray-500 p-8">
            Add at least two mobsters to start the timer!
          </div>
        )}
        {Mob.hasMobsters(mob) && (
          <div className="">
            {Mob.getMobsters(mob).map((mobster) => {
              return (
                <MobsterListItem
                  key={mobster.id}
                  mobster={mobster}
                  selected={Mob.isSelectedMobster(mob, mobster)}
                  onRemove={() => {
                    onChange(Mob.removeMobster(mob, mobster));
                  }}
                  onSelect={() => {
                    onChange(Mob.setCurrentMobster(mob, mobster));
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobTimerIdle;
