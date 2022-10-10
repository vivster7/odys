## Big picture(s)
<img here>


## Request Lifecycle #1: Initial Request
When you first hit https://whiteboard.systems/, the node.js server (in `server/`) starts up and serves the client/public/index.html + the bundled JS (in `client/`).
The JS router redirects the browser to a new **Room** at `/<uuid>`. Creating the room has two effects:
1. A socket connection is made to the server. The server stores an in-memory mapping of Rooms to Users and will publish changes for a given Room to all connected Users.
2. A POST request is made to the API server (in `postgrest/`) to create a new Room in the database. 

## Request Lifecycle #2: Drawing a Rectangle
A User can draw a new Rectangle with Cmd + Click on the **Canvas**.

When the user presses the Cmd key, the `keyboard/keydown` Redux action fires with a `KeyEvent` object. The action triggers the `keyboardReducer#keydownPendingFn` function which updates the global state `state.metaKey = true`. This data is not synced to either the node.js socket server or the postgrest API server.

A **Ghost** of the new rectangle will be rendered while the Cmd key is held.

When the user pushes down with their mouse, the `onPointerDown` event fires from the **Canvas**. Because the `state.metaKey = true`, the `startNewRect` action fires. This triggers the `draw/startNewRect` function which updates the global state value at `state.newRect`

So far, so good. But this is where its gets more complicated.

When the user releases the mouse button, the `onPointerUp` event fires from the **Canvas**. The `draw/endNewRectByClick` action fires. This triggers a series of events:
1. First, we schedule an async function that will dispatch a `save(id)` action for the new rectangle. Although the new rectangle does not exist in the global state yet, the async action will not execute until the event loop finishes the current task.
2. So synchronously and before the event loop tick, we update the global state with the new values:
```
  state.newRect = null;
  state.shapes[rect.id] = rect;
  reorder([rect], state);
  applySelect(state, [rect]);
```
3. We also synchronously add an `{undo, redo}` pair to `state.timetravel.undos`. This helps us implement undo/redo functionality.
4. Finally, the event loop ticks and the scheduled `save(id)` function is executed. `save(id)` looks up the new rectanglg in the global state and sends the data as a POST request to `/shape` url hosted by the postgrest API server.

If the API server successfully saves the new rectangle to the database, the `saveReducer#saveFulfilled` promise will execute. This sets the `isSavedInDB = true` on the new rectangle. Note that this `isSavedInDB` attribute only exists on the client and is not persisted to the database.

If the API server fails to save the rectangle to the database, the `saveReducer#saveRejected` promise will execute. This sets `isSavedInDB = false` and the next re-render will draw the new rectangle with some transparency to indicate that it has not been saved to the database.

We're almost done. The last thing to talk about is syncing the new rectangle to other **Players** in the **Room**.

At step #3 above, we finish computing the new global state that contains the new rectangle. Before Redux replaces the old state with the new state, the `syncEnhancer` runs. It computes a diff between the old state and new state and if there is a difference, emits an `updatedState` socket event to the server along with the diff as a payload. Other **Players** in the same **Room** will be listening for this event. The `updatedState` socket event triggers the `global/syncState` action for these other **Players**. This action triggers an anonymous reducer in `drawReducer` to apply the diff payload to the global state.

Finally, we are done. We have drawn a rectangle, added it to the global state, saved it to the database, and synced it to other **Players** in the **Room**.

## Data Model