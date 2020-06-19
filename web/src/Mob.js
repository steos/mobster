import shortid from "shortid";

const findMobsterIndexById = (mob, id) =>
  mob.mobsters.findIndex((mobster) => mobster.id === id);

export const nextMobster = (mob) => {
  const index = findMobsterIndexById(mob, mob.currentMobster);
  return mob.mobsters[(index + 1) % mob.mobsters.length];
};

export const currentMobster = (mob) =>
  mob.mobsters[findMobsterIndexById(mob, mob.currentMobster)];

export const isSelectedMobster = (mob, mobster) =>
  mob.currentMobster === mobster.id;

export const switchMobster = (mob) => ({
  ...mob,
  currentMobster: nextMobster(mob).id,
  start: new Date().getTime(),
});

export const stopTimer = (mob) => ({ ...mob, state: "idle", start: null });

export const startTimer = (mob) => ({
  ...mob,
  state: "running",
  currentMobster: mob.currentMobster || mob.mobsters[0].id,
  start: new Date().getTime(),
});

export const addMobster = (mob, name) => ({
  ...mob,
  mobsters: [{ id: shortid.generate(), name }].concat(mob.mobsters),
});

export const getMobsters = (mob) => mob.mobsters;

export const hasMobsters = (mob) => mob.mobsters.length > 0;

export const createEmpty = () => ({
  mobsters: [],
  interval: 10,
  currentMobster: null,
  state: "idle",
  start: null,
});

export const setCurrentMobster = (mob, mobster) => ({
  ...mob,
  currentMobster: mobster.id,
});

export const removeMobster = (mob, mobster) => ({
  ...mob,
  mobsters: mob.mobsters.filter((x) => x.id !== mobster.id),
});
