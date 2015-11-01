The nodeServer/modules include backend service for web analytic.
The nodeServer/ITG is for the testSite of web analytic release by fis3.

node module required:
	sudo npm install express --save
	sudo npm install nodemon -g

the code of backend of tracking should be deploy to node folder
	fis3 release -d ./node/static


start node server:
	nodemon index.js

using taobao imagination
	npm config set registry https://registry.npm.taobao.org
switch back
	npm config set registry  https://registry.npmjs.org/

Build test server:
	build bootstrap:
		1.Goto testSte/boostrap
		2.grunt dist
