import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";


export interface Server {
  id: string;
  connectedPlayers: number;
}

export interface ServerListState {
  servers: Server[];
}

const initialState: ServerListState = {
  servers: [],
};

export const serverListSlice = createSlice({
  name: "serverList-slice",
  initialState,
  reducers: {
    fillServerList(state, action: PayloadAction<Server[]>) {
      state.servers = action.payload;
    },
    addServer(state, action: PayloadAction<Server>) {
      const newServer = action.payload;
      state.servers.push(newServer);
    },
    updateServer(state, action: PayloadAction<Server>) {
      const newServer = action.payload;
      for (let i = 0; i < state.servers.length; i++) {
        const server = state.servers[i];
        server.id === newServer.id && (state.servers[i] = newServer);
      }
    },
    deleteServer(state, action: PayloadAction<string>) {
      const id = action.payload;
      let shift = false;
      if (state.servers[state.servers.length - 1].id !== id) {
        for (let i = 0; i < state.servers.length; i++) {
          if (!state.servers[i + 1]) break;
          const nextServer = state.servers[i + 1];
          const server = state.servers[i];
          if (server.id === id) shift = true;
          if (shift) {
            state.servers[i] = nextServer;
          }
        }
      }
      state.servers.pop();
    },
  },
});

// Action creators are generated for each case reducer function
export const { addServer, updateServer, deleteServer, fillServerList } =
  serverListSlice.actions;

export default serverListSlice.reducer;
