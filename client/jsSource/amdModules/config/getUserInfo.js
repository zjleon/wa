require([
	'config/info',
	'core/exports'
], function(info, exports){
	var d = exports.document, 
			//w = exports, 
			n = exports.navigator, 
			s = exports.screen, 
			l = d.location, 
			h = "https:" == l.protocol ? "https:" : "http:";
  function GetTimeZone(dateTimeFull, browserName) { 
  	var timezone;
      if (browserName == "Netscape") { 
          var firstPar = dateTimeFull.indexOf('('); 
          var lastPar = dateTimeFull.indexOf(')'); 
          timezone = dateTimeFull.substring(firstPar + 1, lastPar); 
      }
      if (browserName == "Microsoft Internet Explorer") { 
          var dateSplit = dateTimeFull.split(" "); 
          timezone = dateSplit[4]; 
      } 
      if (browserName == "Opera") { 
          var dateSplit = dateTimeFull.split(" ");
          timezone = dateSplit[5]; 
      } 
      return timezone;
  }
  var tmp1 = new Date();
  var path = l.pathname.split("\/");
  // use a object and pass it to info will cause object remain in memory
  info.user.page = path[path.length - 1];
  info.user.location = l.href;
  info.user.referrer = d.referrer || ""; 
  info.user.language = (n.systemLanguage || n.language).toLowerCase();
  info.user.browserName = n.appName; 
  info.user.userAgent = n.userAgent; 
  info.user.timezone = GetTimeZone(tmp1.toString(), info.user.browserName);
  info.user.offset = tmp1.getTimezoneOffset() / 60 * (-1);
  // return info;
});