# [Synth-Pong](https://synth-pong.netlify.app)
## Tech Stack
<p>
<img src="https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=ffffff&style=for-the-badge" height=30>
<img src="https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black&style=for-the-badge" height=30>
<img src="https://img.shields.io/badge/-React%20Router-CA4245?logo=react-router&logoColor=white&style=for-the-badge" height=30>
<img src="https://img.shields.io/badge/-Redux-764ABC?logo=redux&logoColor=white&style=for-the-badge" height=30>
<img src="https://img.shields.io/badge/-CSS3-1572B6?logo=css3&logoColor=white&style=for-the-badge" height=30>
</p>
<p>
<img src="https://img.shields.io/badge/-Socket.io-E5E4E7?logo=socket.io&logoColor=010101&style=for-the-badge" height=30>
<img src="https://img.shields.io/badge/-NodeJs-339933?logo=node.js&logoColor=white&style=for-the-badge" height=30>
<img src="https://img.shields.io/badge/-Express-black?logo=express&logoColor=white&style=for-the-badge" height=30>
<img src="https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=yellow&style=for-the-badge" height=30>
<img src="https://img.shields.io/badge/-Git-F05032?logo=git&logoColor=white&style=for-the-badge" height=30>
</p>

## Table of Contents
- [Project Overview](#project-overview)
- [Installation & Setup](#installation--setup)
- [Components](#components)


## Project Overview
A multiplayer Pong game, where players can play wwith a friend locally, or with someone online. This was my first game ever made, and I decided to make it multiplayer as I found it to be intersting in a browser setting. I used websockets to accomplish the multiplayer aspect of the game. This was also my first project using TypeScript and was an amazing experience to better understand it. 
## Installation & Setup

### Cloning the repo
```
$ git clone https://github.com/moses369/synth-pong.git
$ cd synth-pong/
```
### Frontend setup
In the first terminal
```
$ cd client/
$ npm i
$ npm run dev
```
### Backend Setup
Open a new terminal and run the following commands
```
$ cd server/
$ npm i
$ npm run dev
```
### Open in browser
Open http://localhost:5173/

## Components
- [Main Menu](#main-menu)
- [Lobby](#lobby)
- [Game](#game)

### Main Menu 
![Main menu demo](./images/menu.gif)
> The server list uses websockets to listen to any other players when they create, leave, join a session, allowing for live updates
>
> Players are able to join the game either through the search bar, or through the server list, where they will be connected to that sessions room


### Lobby 
![Lobby Demo](./images/lobby.gif)
>  When creating a room the host is able to change the game from local to online
>> Local play allows for local co=op and the game can be started whenever
>>
>> Online play requires both players to ready up, before starting the game
>
> Host's are notified when a player leaves and joins through the Joined notification obove their indicator. 
>
> Controls
>> Keyboard - controls are enabled at all times 
>>
>> Mouse - can be used in online play, as you can't have two mice when playing locally
>>
>> Mobile - the player has to touch their paddle and slide their finger up and down to move their paddle
>>
>> Mobile controller - players can join the session using their mobile code on their phones, allowing them to control their paddle through their phone.

### Game
![Game Demo](./images/endgame.gif)
> I utilized divs to create the game and animations
>
> The game is responsive, and will stay in sync on multiple screen sizes when playing multiplayer
>
> At the end of the round players are given the choice to leave, restart, or go back to the lobby







