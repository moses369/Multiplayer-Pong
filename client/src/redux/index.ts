import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "./features/socket-slice";
import menuReducer from "./features/menu-slice";
import gameReducer from "./features/game-slice";
import serverListReducer from "./features/serverList-slice";

export const store = configureStore({
  reducer: {
    socket: socketReducer,
    menu: menuReducer,
    game: gameReducer,
    serverList: serverListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
