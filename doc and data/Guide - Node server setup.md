The nodeServer/modules include backend service for web analytic.
The nodeServer/ITG is for the testSite of web analytic release by fis3.

node module required:
	sudo npm install express --save
	sudo npm install nodemon -g

the code of backend of tracking should be deploy to node folder
	fis3 release -d ./node/static


start node server:
	nodemon index.js



Build test server:
	build bootstrap:
		1.Goto testSte/boostrap
		2.grunt dist
