/**
 * Player Types
 */
export interface PlayerOptions<T> {
  player1: T;
  player2: T;
}
export type PlayerChoices = "player1" | "player2";
export const players: { one: "player1"; two: "player2" } = {
  one: "player1",
  two: "player2",
};


/**
 * Direction Types
 */
export type DirectionChoices = "up" | "down";


/**
 * Device Types
 */
export interface Devices {
  mobile: "mobile";
  keys: "keyboard";
}
export const devices: Devices = { mobile: "mobile", keys: "keyboard" };