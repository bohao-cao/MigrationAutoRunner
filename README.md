# Migration Auto Runner

0.First time running
npm install
npm typings install -g
1.Client side
npm start
Will start the on localhost:3000

2.server side.
cd to backend folder;
debug: npm install -g node-inspector;
On one terminal: 
nodemon --debug index.js
Will start on localhost:5000
On another terminal:
node-inspector index.js -d 5858 -p 5000
(This will start the debug port on 5858, and listen to the node server on 5000)
