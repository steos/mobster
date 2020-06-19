import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import {
  Route,
  Switch,
  BrowserRouter as Router,
  useHistory,
} from "react-router-dom";
import shortid from "shortid";
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/functions";
import * as Icon from "./icons";
import * as Mob from "./Mob";

export const computeRemaining = (now, interval, start) => {
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

export const computeRemainingNow = (interval, start) =>
  computeRemaining(new Date().getTime(), interval, start);

const Home = ({ onCreate }) => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl text-gray-500 text-center m-8">
        Ready, Set, Mob!
      </h1>
      <div className="flex justify-center">
        <button
          className="bg-blue-500 rounded-sm py-5 px-12 text-xl text-gray-100"
          onClick={onCreate}
        >
          New Mob
        </button>
      </div>
      <div>
        <h2 className="text-center">Your Previous Mobs</h2>
        <p className="text-center">list here</p>
      </div>
    </div>
  );
};

const Loading = () => <div>loading</div>;

const NotFound = () => <div>not found</div>;

const Error = () => <div>error</div>;

const MobForm = ({ onSubmit }) => {
  const [name, setName] = useState("");
  return (
    <div>
      <h2>Add Mobster</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button
        className="btn"
        onClick={() => {
          onSubmit(name);
          setName("");
        }}
      >
        Add
      </button>
    </div>
  );
};

const MobsterListItem = ({ mobster, selected, onSelect, onRemove }) => (
  <div className="flex space-x-2">
    <div onClick={onSelect}>
      {selected ? <Icon.CheckCircle /> : <Icon.Circle />}
    </div>
    <div>{mobster.name}</div>
    <button
      className="btn"
      onClick={(e) => {
        e.preventDefault();
        onRemove();
      }}
    >
      <Icon.Trash />
    </button>
  </div>
);

const MobTimerIdle = ({ mob, onChange, onStart }) => {
  return (
    <div>
      <button
        className="btn"
        disabled={mob.mobsters.length < 2}
        onClick={onStart}
      >
        Start
      </button>
      <div>
        <label>
          Interval:
          <input
            type="number"
            value={mob.interval}
            onChange={(e) => {
              onChange({ ...mob, interval: parseInt(e.target.value, 10) });
            }}
          />
        </label>
        minutes
      </div>
      <MobForm
        onSubmit={(name) => {
          onChange(Mob.addMobster(mob, name));
        }}
      />
      {!Mob.hasMobsters(mob) && <div>Add your first mobster</div>}
      {Mob.hasMobsters(mob) && (
        <div>
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
  );
};

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

const MobTimer = ({ id, mob, onChange, onNotify, timeDelta }) => {
  const [volume, setVolume] = useState(50);
  return (
    <div>
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
      <div>
        Volume:
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value, 10))}
        />
      </div>
    </div>
  );
};

const RemoteData = {
  Loaded: (data) => ({ type: "loaded", data }),
  NotFound: { type: "notfound" },
  Error: (error) => ({ type: "error", error }),
  Loading: { type: "loading" },
};

const MobLoader = ({ id, timeDelta, onNotify, onClearNotification }) => {
  const [mob, setMob] = useState(RemoteData.Loading);
  const docRef = firebase.firestore().collection("mobs").doc(id);
  useEffect(() => {
    docRef.onSnapshot((doc) => {
      if (doc.exists) {
        setMob(RemoteData.Loaded(doc.data()));
      } else {
        setMob(RemoteData.NotFound);
      }
    });
  }, [id]);

  return {
    loading: () => <Loading />,
    error: () => <Error />,
    notfound: () => <NotFound />,
    loaded: ({ data }) => (
      <MobTimer
        id={id}
        mob={data}
        onNotify={onNotify}
        timeDelta={timeDelta}
        onChange={(mob) => {
          onClearNotification();
          docRef.set(mob);
        }}
      />
    ),
  }[mob.type](mob);
};

const loadAudio = (path) => {
  const audio = new Audio(path);
  return new Promise((resolve) => {
    audio.addEventListener("canplaythrough", function () {
      resolve(audio);
    });
  });
};

const App = ({ audio, timeDelta }) => {
  const history = useHistory();
  const [creating, setCreating] = useState(false);
  const audioRef = useRef(null);
  const notification = React.useRef(null);
  const clearNotification = () => {
    if (notification.current) {
      notification.current.close();
      notification.current = null;
    }
  };
  useEffect(() => {
    loadAudio(audio).then((audio) => {
      audioRef.current = audio;
    });
  }, [audio]);
  if (creating) {
    return <div>creating</div>;
  }
  return (
    <Switch>
      <Route path="/mob/:id">
        {({ match }) => (
          <MobLoader
            id={match.params.id}
            onClearNotification={clearNotification}
            timeDelta={timeDelta}
            onNotify={(mob, volume) => {
              if (window.captureScreen) {
                window.captureScreen(location.href);
              } else {
                if (audioRef.current) {
                  audioRef.current.volume = volume / 100;
                  audioRef.current.play();
                }
                notification.current = new Notification("Switch it up!", {
                  tag: "mobster-switch",
                  body: Mob.nextMobster(mob).name + ", it's your turn!",
                });
                notification.current.onclick = () => {
                  onChange(Mob.switchMobster(mob));
                };
              }
            }}
          />
        )}
      </Route>
      <Route path="/">
        <Home
          onCreate={async () => {
            setCreating(true);
            const id = shortid.generate();
            await firebase
              .firestore()
              .collection("mobs")
              .doc(id)
              .set(Mob.createEmpty());
            history.push("/mob/" + id);
            setCreating(false);
          }}
        />
      </Route>
    </Switch>
  );
};

const render = (timeDelta) =>
  ReactDOM.render(
    <Router>
      <App audio="/assets/bell.wav" timeDelta={timeDelta} />
    </Router>,
    document.getElementById("root")
  );

const isLocal = () => window.location.hostname === "localhost";

const initFirebase = () =>
  fetch("/__/firebase/init.json").then(async (response) => {
    const app = firebase.initializeApp(await response.json());
    // console.log("firebase initialized");
    if (isLocal()) {
      console.debug("localhost detected, using firestore emulator");
      app.firestore().settings({
        host: "localhost:8080",
        ssl: false,
      });
    }

    return app;
  });

const main = async () => {
  Notification.requestPermission(function (perm) {
    //handle denied
  });
  const app = await initFirebase();
  const fn = app.functions("europe-west3");
  if (isLocal()) {
    fn.useFunctionsEmulator("http://localhost:5001");
  }
  const getServerTime = fn.httpsCallable("now");
  const start = new Date().getTime();
  const { data } = await getServerTime({ now: start });
  const now = new Date().getTime();
  // const roundtrip = now - start;
  const delta = now - data.now;
  // console.log(data.delta, delta);
  // console.log({ data, now, roundtrip });
  const timeDelta = delta;
  console.debug("time delta", timeDelta);
  render(timeDelta);
};

main();
