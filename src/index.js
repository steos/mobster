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

const MobTimer = ({ id, mob, onChange }) => {
  console.log(mob);
  return (
    <div>
      <button>Start</button>
      <div>
        <label>
          Interval:
          <input type="number" defaultValue={mob.interval} />
        </label>
        minutes
      </div>
      <MobForm
        onSubmit={(name) => {
          //TODO
        }}
      />
      {mob.mobsters.length < 1 && <div>Add your first mobster</div>}
      {mob.mobsters.length > 0 && (
        <div>
          {mob.mobsters.map((mobster) => {
            return <MobsterListItem mobster={mobster} />;
          })}
        </div>
      )}
    </div>
  );
};

const RemoteData = {
  Loaded: (data) => ({ type: "loaded", data }),
  NotFound: { type: "notfound" },
  Error: (error) => ({ type: "error", error }),
  Loading: { type: "loading" },
};

const MobLoader = ({ id }) => {
  const [mob, setMob] = useState(RemoteData.Loading);

  useEffect(() => {
    firebase
      .firestore()
      .collection("mobs")
      .doc(id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          console.log("mob loaded", doc.data());
          setMob(RemoteData.Loaded(doc.data()));
        } else {
          setMob(RemoteData.NotFound);
        }
      })
      .catch((err) => {
        setMob(RemoteData.Error(err));
      });
  }, [id]);

  const dispatch = {
    loading: () => <Loading />,
    error: () => <Error />,
    notfound: () => <NotFound />,
    loaded: ({ data }) => <MobTimer id={id} mob={data} />,
  };

  const f = dispatch[mob.type];
  if (f == null) throw new Error();
  return f(mob);
};

const App = () => {
  //TODO
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
