# Live Demo

http://gitopia.netlify.app

# About
## Inspiration

We wanted to create a fun and engaging way to teach developers Git—a tool that's essential but often intimidating to beginners. By combining learning with a space-themed 2D game, we aimed to make Git feel less like a chore and more like an adventure.

## What it does

Gitopia is a 2D space exploration game where players are stranded in space and must use Git commands to find their way home. As they navigate different planets and fix their ship, they learn how to use commits, branches, merges, and other Git fundamentals through interactive puzzles and terminal-based gameplay.

## How we built it

We built the frontend using Vite + React.js for the UI and game interface, Phaser.js for 2D game mechanics, and CSS for styling. The terminal UI was implemented using React and HTML. On the backend, we used Express.js (Node.js) to manage game state and expose an API for the leaderboard and player progress. MongoDB stores player data and scores. The frontend is hosted on Netlify, and the backend and database are hosted on Render.

## Challenges we ran into

- Integrating Phaser.js with React while maintaining clean component structure
- Designing Git-based gameplay that’s both educational and entertaining
- Creating a responsive terminal-like input system that felt intuitive
- Ensuring real-time updates to player progress without overcomplicating the backend

## Accomplishments that we're proud of

- Seamlessly blending game mechanics with real Git concepts
- Making Git approachable through an interactive, story-driven experience
- Building a full-stack app with a clean UI, game logic, and persistent player progress
- Designing an educational experience that’s genuinely fun

## What we learned

- How to integrate game engines like Phaser with modern frontend frameworks like React
- Best practices for managing state and reactivity in interactive games
- Ways to teach technical concepts through gameplay and storytelling
- Deployment workflows using Netlify and Render

## What's next for Gitopia

- Adding multiplayer missions and challenges
- Expanding the storyline with new planets and advanced Git topics (e.g., rebasing, conflict resolution)
- Adding achievements and badges to track learning progress
- Publishing Gitopia as a free learning tool for coding bootcamps and schools


# Installation

```
cd client
npm install
npm install phaser
npm install @vitejs/plugin-react
```

```
cd server
npm install express mongoose cors dotenv
npm install --save-dev nodemon
```

# Getting Started

Open two separate terminals. 
```
cd server
npm run dev
```

``` 
cd client
npm run dev
```

# Preview

![Welcome to Gitopia](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/350/519/datas/gallery.jpg)\
*Welcome to Gitopia!*


![Branch 1: Space](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/350/526/datas/gallery.jpg)\
*Branch 1: Space*


![Branch 2: Gitopia](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/350/709/datas/gallery.jpg)\
*Branch 2: Gitopia*

![Branch 3: The Mine](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/350/554/datas/gallery.jpg)\
*Branch 3: The Mine*


![Branch 4: The Base](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/350/568/datas/gallery.jpg)\
*Branch 4: The Base*


![Branch 5: Victory](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/350/576/datas/gallery.jpg)\
*Branch 5: Victory*

# Assets
- https://deep-fold.itch.io/space-background-generator
- https://frostwindz.itch.io/pixel-art-fantasy-animated-portal
- https://brullov.itch.io/fire-animation
- https://ragnapixel.itch.io/particle-fx
- https://norma-2d.itch.io/space-backgrounds-pack
- https://beast-pixels.itch.io/crafting-materials
- https://szadiart.itch.io/rpg-worlds-ca
- https://trevor-pupkin.itch.io/tech-dungeon-roguelite
- https://norma-2d.itch.io/celestial-objects-pixel-art-pack?download
- https://deep-fold.itch.io/pixel-planet-generator
- https://dizabanik.itch.io/pixelastronaut
