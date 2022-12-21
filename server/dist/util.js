export const randomChar = () => {
    //Getting a random char from using utf-16
    const min = 65;
    const max = 89;
    return String.fromCharCode(Math.floor(Math.random() * (max - min + 1) + min));
};
/**
 * @returns A random ID in the form of `'[A-Z][A-Z][A-Z][A-Z]'`
 */
export const randomId = () => `${randomChar()}${randomChar()}${randomChar()}${randomChar()}`;
/**
 *
 * @param id The id to set the mobile code too
 * @returns A random code in a string `'id[1-100]'`
 */
export const createMobileCode = (id) => `${id}${Math.floor(Math.random() * 100)}`;
/**
 * If the id is already taken,it wil generate a new one
 * @returns A random id consisting of 4 upper cased letters
 */
export const checkIdIsNotTaken = (sessions) => {
    const generatedId = randomId();
    return !sessions[generatedId] ? generatedId : checkIdIsNotTaken(sessions);
};
