Folder intro:
pages	-	Should contain page files(html, css, scss, js), unitTest for this page, etc.
components	-	Should contain:
	1.components such as header, footer, list source files(html, scss, js, unitTest, documents)
	2.page template or framework .
	3.The site template, for example a html file that include the header, footer, and the body part is base on the parameters of the request URL(in express).
	There should be a resource config file in each folder, which indicate the path and name of the dependent resource. This file will be used by the 'header' component to indicate the component's css dependencies and by the 'footer' component to indicate the js dependencies.
lib	-	Should contain:
	1.js framework and it's plugins(including related css files).
	2.css framework(like bootstrap).
	Framework(including related css) should be put into one folder, recursively.
	Don't put non-complied framework into this folder.

outputs	-	Should contain final version files:
	pages(html file) that already complied with components, frameworks.

other folder		-	for framework like bootstrap or angular etc. named as the framework's name.