
export type PlayerChoices = "player1" | "player2";
export type Role = "host" | "guest" | PlayerChoices;
/**
 * Interface for the Player object for session info
 */
export interface Player {
  mobile: Connected;
  mobileCode: string;
  ready: boolean;
}
/**
 * Function interface to check the info for a player
 */
export interface CheckPlayer {
  (player: PlayerChoices): any;
}

/**
 * The object carrying the info for each session
 */
export interface Sessions {
  [key: string]: {
    player1: Player;
    player2: Player;
    host: Connected;
    guest: Connected;
    local: boolean;
  };
}
export interface Connected {
  connected: boolean;
  socketId: string;
}
export const randomChar = () => {
  //Getting a random char from using utf-16
  const min = 65;
  const max = 89;
  return String.fromCharCode(Math.floor(Math.random() * (max - min + 1) + min));
};
/**
 * @returns A random ID in the form of `'[A-Z][A-Z][A-Z][A-Z]'`
 */
export const randomId = () =>
  `${randomChar()}${randomChar()}${randomChar()}${randomChar()}`;
/**
 *
 * @param id The id to set the mobile code too
 * @returns A random code in a string `'id[1-100]'`
 */
export const createMobileCode = (id: string) =>
  `${id}${Math.floor(Math.random() * 100)}`;
/**
 * If the id is already taken,it wil generate a new one
 * @returns A random id consisting of 4 upper cased letters
 */
export const checkIdIsNotTaken = (sessions: Sessions): string => {
  const generatedId = randomId();
  return !sessions[generatedId] ? generatedId : checkIdIsNotTaken(sessions);
};