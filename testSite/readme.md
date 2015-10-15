Folder intro:
pages	-	Should contain page files(html, css, scss, js), unitTest, etc.
components	-	Should contain:
	1.components such as header, footer, list source files(html, scss, js, unitTest, documents)
	2.page template or framework .
	There should be a resource config file in each folder, which indicate the path and name of the dependent resource.
lib	-	Should contain:
	1.js framework and it's plugins(including related css files).
	2.css framework(like bootstrap).
	Framework(including related css) should be put into one folder, recursively.
	Don't put non-complied framework into this folder.

outputs	-	Should contain final version files:
	pages(html file) that already complied with components, frameworks.

