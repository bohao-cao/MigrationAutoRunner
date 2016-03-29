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
node-inspector -d 5858 -p 5000
(This will start the debug port on 5858, and listen to the node server on 5000)

3.database.
(On Windows machine)
a.cd D:\MongoDB\Server\3.2\bin
mongod --dbpath D:\MongoDB\db
b. Open a new cmd prompt
mongo


======PRODUCTION=======
1. Use forever to host the backend on my machine;
2. Deliver frontend to the user, modify server's address.
3. Create instructions for installation.