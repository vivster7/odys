import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'App';
import { instanceOfArrow, Arrow } from 'modules/draw/arrow/arrow.reducer';
import {
  DrawActionRejected,
  DrawActionFulfilled,
  getDrawings,
} from 'modules/draw/draw.reducer';
import { instanceOfShape, Shape } from 'modules/draw/shape/shape.reducer';
import odysClient from 'global/odysClient';
import { OdysArrow, OdysShape } from 'generated';

// Saveable is a mixin related to saving an object in a database.
export interface Saveable {
  id: string;
  isSavedInDB: boolean;
}

export const save = createAsyncThunk('draw/save', applySave);

export const saveRejected: DrawActionRejected<string[]> = (state, action) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids);
  drawings.forEach((d) => (d.isSavedInDB = false));
  // TODO: schedule a future job to try and save?
};

export const saveFulfilled: DrawActionFulfilled<string[]> = (state, action) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids);
  drawings.forEach((d) => (d.isSavedInDB = true));
};

// saveDelete action will remove drawings from state on successful save
// this lets us keep using diffs to keep clients in sync. also better perf locally.
export const saveDelete = createAsyncThunk('draw/saveDelete', applySave);

export const saveDeleteRejected: DrawActionRejected<string[]> = (
  state,
  action
) => {
  const ids = action.meta.arg;
  const drawings = getDrawings(state, ids);
  drawings.forEach((d) => (d.isSavedInDB = false));
  // TODO: schedule a future job to try and save?
};

export const saveDeleteFulfilled: DrawActionFulfilled<string[]> = (
  state,
  action
) => {
  const ids = action.meta.arg;
  ids.forEach((id) => {
    if (state.arrows[id]) delete state.arrows[id];
    if (state.shapes[id]) delete state.shapes[id];
  });
};

async function applySave(ids: string[], thunkAPI: any) {
  const state = thunkAPI.getState() as RootState;
  const drawings = getDrawings(state.draw, ids);

  const arrows = drawings.filter((d) => instanceOfArrow(d)) as Arrow[];
  const shapes = drawings.filter((d) => instanceOfShape(d)) as Shape[];

  let p1: Promise<OdysShape[]>;
  if (shapes.length) {
    p1 = odysClient.request('POST', 'OdysShape', {
      headerOpts: { mergeDuplicates: true },
      body: shapes,
    });
  } else {
    p1 = Promise.resolve([]);
  }

  // save shapes before arrows
  await p1;

  let p2: Promise<OdysArrow[]>;
  if (arrows.length) {
    p2 = odysClient.request('POST', 'OdysArrow', {
      headerOpts: { mergeDuplicates: true },
      body: arrows,
    });
  } else {
    p2 = Promise.resolve([]);
  }

  await p2;
}
