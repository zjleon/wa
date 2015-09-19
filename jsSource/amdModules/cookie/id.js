// This module return json type string

define([
	'cookie/cookie',
	'cookie/guid'
], function(cookie, guid){
	function setID(key, value){
		if(key === 't'){
			cookie.set('<%trackID_cookieName%>', value, '<%trackID_expires%>');
			return value;
		}
		if(key === 'm'){
			cookie.set('<%machineID_cookieName%>', value, '<%machineID_expires%>');
			return value;
		}
		if(key === 's'){
			cookie.set('<%sessionID_cookieName%>', value, '<%sessionID_expires%>');
			return value;
		}
	}
	
	function getID(){
		var tID,
				mID,
				sID,
				tmp1;
		tmp1 = [];
		tID = cookie.get('<%trackID_cookieName%>');
		if(!tID){
			tID = guid();
			setID('t', tID);
		}
		tmp1.push('"<%trackID_sendName%>":"'+tID+'"');
		
		mID = cookie.get('<%machineID_cookieName%>');
		if(!mID){
			mID = guid();
			setID('m', mID);
		}else{
			//keep cookie alive while user doing operation
			cookie.update('<%machineID_cookieName%>', '<%machineID_expires%>');
		}
		tmp1.push('"<%machineID_sendName%>":"'+mID+'"');
		
		sID = cookie.get('<%sessionID_cookieName%>');
		if(!sID){
			sID = guid();
			setID('s', sID);
		}else{
			//keep cookie alive while user doing operation
			cookie.update('<%sessionID_cookieName%>', '<%sessionID_expires%>');
		}
		tmp1.push('"<%sessionID_sendName%>":"'+sID+'"');
		
		if(!tmp1.length){
			tmp1 = '';
		}else if(tmp1.length === 1){
			tmp1 = tmp1[0];
		}else{
			tmp1 = tmp1.join(',');
		}
		return tmp1;
	}
	
	
	return getID;
});