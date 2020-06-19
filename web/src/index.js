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

import Home from "./Home";
import MobTimer from "./MobTimer";

import * as Mob from "./Mob";

const Loading = () => <div>loading</div>;

const NotFound = () => <div>not found</div>;

const Error = () => <div>error</div>;

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
