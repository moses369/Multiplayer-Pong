import { configureStore } from "@reduxjs/toolkit";
import socketReducer from "./features/socket-slice";
import menuReducer from "./features/menu-slice";
export const store = configureStore({
  reducer: { socket: socketReducer, menu: menuReducer },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
