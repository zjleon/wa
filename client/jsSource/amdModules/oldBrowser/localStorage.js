// the localStorage will be add to window object,
// This module will return null.

define([
	'core/exports'
], function(exports){
	// module will be run if it loaded by requirejs,
	// so need to prevent this action in modern browser
	if(exports.localStorage){
		return exports.localStorage;
	}

	// globalStorage
	// non-standard: Firefox 2+
	// https://developer.mozilla.org/en/dom/storage#globalStorage
	if ( exports.globalStorage ) {
		// try/catch for file protocol in Firefox
		// try {
			// exports.localStorage = exports.globalStorage;
		// } catch( e ) {}
		return exports.globalStorage;
	}

	// userData
	// non-standard: IE 5+
	// http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
	var div = exports.document.createElement( "div" ),
			attrKey = "localStorage";
	div.style.display = "none";
	exports.document.getElementsByTagName( "head" )[ 0 ].appendChild( div );
	// if ( div.addBehavior ) {
		div.addBehavior( "#default#userdata" );
		//div.style.behavior = "url('#default#userData')";

		var localStorage = {
			"length":0,
			"setItem":function( key , value ){
				div.load( attrKey );
				key = cleanKey(key );

				if( !div.getAttribute( key ) ){
					this.length++;
				}
				div.setAttribute( key , value );

				div.save( attrKey );
			},
			"getItem":function( key ){
				div.load( attrKey );
				key = cleanKey(key );
				return div.getAttribute( key );

			},
			"removeItem":function( key ){
				div.load( attrKey );
				key = cleanKey(key );
				div.removeAttribute( key );

				div.save( attrKey );
				this.length--;
				if( this.length < 0){
					this.length=0;
				}
			},

			"clear":function(){
				div.load( attrKey );
				var i = 0;
				while ( attr = div.XMLDocument.documentElement.attributes[ i++ ] ) {
					div.removeAttribute( attr.name );
				}
				div.save( attrKey );
				this.length=0;
			}, 

			"key":function( key ){
				var n;
				div.load( attrKey );
				n = div.XMLDocument.documentElement.attributes[ key ];
				// n will be null if key is not exsit,
				// and will be an object if key is exsit and have an attribute 'name'
				return n ? n.name : n;
			}

		};

		// convert invalid characters to dashes
		// http://www.w3.org/TR/REC-xml/#NT-Name
		// simplified to assume the starting character is valid
		var cleanKey = function( key ){
			return key.replace( /[^-._0-9A-Za-z\xb7\xc0-\xd6\xd8-\xf6\xf8-\u037d\u37f-\u1fff\u200c-\u200d\u203f\u2040\u2070-\u218f]/g, "-" );
		};

		div.load( attrKey );
		localStorage["length"] = div.XMLDocument.documentElement.attributes.length;
		
		// XXX:Set the localStorage object will cause error 'member not found' in IE8, weird
		// window.localStorage = localStorage;
	// }
	return localStorage;
});