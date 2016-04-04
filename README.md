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



//PRODUCTION
1. Install MongoDB as a service(Start the service);
	1a. on windows machine, the service configuration sits in D:\MongoDB\Server\3.2\bin
	1b. Configuration source page can be found in http://blog.ajduke.in/2013/04/10/install-setup-and-start-mongodb-on-windows/
2. Use Forever to start the backend (3a.PRODstartbackend.bat)
	2a. the logs sits in C:\Users\bcao\.forever\

3. Execute 5.startfrontend.bat
