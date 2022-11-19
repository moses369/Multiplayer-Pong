import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

function randomChar() {
    //Getting a random char from using utf-16
    const min = 65
    const max = 89
    return String.fromCharCode(Math.floor(Math.random() * (max - min + 1) + min)); 
  }
export interface MenuState {
  host: boolean;
  sessionPassword: string;
  player: null | 1 | 2;
  inSession:boolean
}

const initialState: MenuState = {
 host:false,
 sessionPassword:'',
 player:null,
 inSession:false
};

export const menuSlice = createSlice({
  name: "menu-slice",
  initialState,
  reducers: {
    createSession(state){
        state.host= true
        state.sessionPassword = `${randomChar()}${randomChar()}${randomChar()}${randomChar()}`
        state.inSession = true
    },

    joinSession(state,action:PayloadAction<string>){
        state.sessionPassword = action.payload
        state.inSession = true
       
    },
    leaveSession(state){
        state.sessionPassword = ''
        state.inSession = false
        state.host = false
        state.player = null
    },
    setPlayer(state,action:PayloadAction<1|2>){
        state.player = action.payload
    }
    
  },
   
});

// Action creators are generated for each case reducer function
export const {createSession,joinSession,leaveSession,setPlayer} = menuSlice.actions;

export default menuSlice.reducer;
