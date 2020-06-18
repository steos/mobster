import React, { useEffect, useState } from "react";
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

const omit = (key, obj) => {
  const copy = Object.assign({}, obj);
  delete copy[key];
  return copy;
};

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

const findMobsterIndexById = (mob, id) =>
  mob.mobsters.findIndex((mobster) => mobster.id === id);

const nextMobster = (mob) => {
  const index = findMobsterIndexById(mob, mob.currentMobster);
  return mob.mobsters[(index + 1) % mob.mobsters.length];
};

const currentMobster = (mob) =>
  mob.mobsters[findMobsterIndexById(mob, mob.currentMobster)];

const switchMobster = (mob) => ({
  ...mob,
  currentMobster: nextMobster(mob).id,
  start: new Date().getTime(),
});

const stopTimer = (mob) => ({ ...mob, state: "idle", start: null });

const startTimer = (mob) => ({
  ...mob,
  state: "running",
  currentMobster: mob.currentMobster ?? mob.mobsters[0].id,
  start: new Date().getTime(),
});

const Home = ({ onCreate }) => {
  return (
    <div>
      <button onClick={onCreate}>New Mob</button>
      <h2>Your Previous Mobs</h2>
      <p>list here</p>
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

const MobsterListItem = ({ mobster }) => <div>{mobster.name}</div>;

const MobTimerIdle = ({ mob, onChange, onStart }) => {
  return (
    <div>
      <button disabled={mob.mobsters.length < 2} onClick={onStart}>
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
          onChange({
            ...mob,
            mobsters: [{ id: shortid.generate(), name }].concat(mob.mobsters),
          });
        }}
      />
      {mob.mobsters.length < 1 && <div>Add your first mobster</div>}
      {mob.mobsters.length > 0 && (
        <div>
          {mob.mobsters.map((mobster) => {
            return <MobsterListItem key={mobster.id} mobster={mobster} />;
          })}
        </div>
      )}
    </div>
  );
};

const NextUp = ({ mob, onSwitch, onStop }) => (
  <div>
    <div>{nextMobster(mob).name}, it's your turn!</div>
    <button onClick={onSwitch}>Switch</button>
    <button onClick={onStop}>Stop</button>
  </div>
);

const CountdownTimer = ({ time }) => {
  return <div>T-{time} sec</div>;
};

const Countdown = ({ current, next, time, onStop }) => {
  return (
    <div>
      <CountdownTimer time={time} />
      <button onClick={onStop}>Stop</button>
      <div>Current Mobster: {current.name}</div>
      <div>Up next: {next.name}</div>
    </div>
  );
};

const MobTimerRunning = ({ mob, onSwitch, onStop }) => {
  const { remainingSecs } = computeRemainingNow(mob.interval, mob.start);
  const [time, setTime] = useState(remainingSecs);
  useEffect(() => {
    let raf = null;
    const update = () => {
      const { remainingSecs } = computeRemainingNow(mob.interval, mob.start);
      if (remainingSecs >= 0) {
        setTime(remainingSecs);
        raf = requestAnimationFrame(update);
      }
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [mob]);

  if (time > 0) {
    return (
      <Countdown
        time={time}
        current={currentMobster(mob)}
        next={nextMobster(mob)}
        onStop={onStop}
      />
    );
  } else {
    return <NextUp mob={mob} onSwitch={onSwitch} onStop={onStop} />;
  }
};

const MobTimer = ({ id, mob, onChange }) => {
  if (mob.state === "idle") {
    return (
      <MobTimerIdle
        mob={mob}
        onChange={onChange}
        onStart={() => {
          // console.log("onstart");
          if (mob.mobsters.length < 0) {
            return;
          }
          onChange(startTimer(mob));
        }}
      />
    );
  } else if (mob.state === "running") {
    return (
      <MobTimerRunning
        mob={mob}
        onSwitch={() => {
          onChange(switchMobster(mob));
        }}
        onStop={() => {
          onChange(stopTimer(mob));
        }}
      />
    );
  }
  return <Error />;
};

const RemoteData = {
  Loaded: (data) => ({ type: "loaded", data }),
  NotFound: { type: "notfound" },
  Error: (error) => ({ type: "error", error }),
  Loading: { type: "loading" },
};

const MobLoader = ({ id }) => {
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
        onChange={(mob) => {
          docRef.set(mob);
        }}
      />
    ),
  }[mob.type](mob);
};

const App = () => {
  const history = useHistory();
  return (
    <Switch>
      <Route path="/mob/:id">
        {({ match }) => <MobLoader id={match.params.id} />}
      </Route>
      <Route path="/">
        <Home
          onCreate={async () => {
            const id = shortid.generate();
            await firebase.firestore().collection("mobs").doc(id).set({
              mobsters: [],
              interval: 10,
              currentMobster: null,
              state: "idle",
              start: null,
            });
            history.push("/mob/" + id);
          }}
        />
      </Route>
    </Switch>
  );
};

const render = () =>
  ReactDOM.render(
    <Router>
      <App />
    </Router>,
    document.getElementById("root")
  );

const initFirebase = () =>
  fetch("/__/firebase/init.json").then(async (response) => {
    const app = firebase.initializeApp(await response.json());
    // console.log("firebase initialized");
    if (window.location.hostname === "localhost") {
      console.debug("localhost detected, using firestore emulator");
      firebase.firestore().settings({
        host: "localhost:8080",
        ssl: false,
      });
    }

    return app;
  });

const main = async () => {
  const app = await initFirebase();
  render(app);
};

main();
