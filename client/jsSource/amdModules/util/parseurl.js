define(function(){
	return function(url) {
    if (typeof url === "object") {
        return url;
    }
    var matches = /^(((([^:\/#\?]+:)?(?:\/\/((?:(([^:@\/#\?]+)(?:\:([^:@\/#\?]+))?)@)?(([^:\/#\?]+)(?:\:([0-9]+))?))?)?)?((\/?(?:[^\/\?#]+\/+)*)([^\?#]*)))?(\?[^#]+)?)(#.*)?/.exec(url);
    var data = matches ? {
        href: matches[0] || "",
        hrefNoHash: matches[1] || "",
        hrefNoSearch: matches[2] || "",
        domain: matches[3] || "",
        protocol: matches[4] || "",
        authority: matches[5] || "",
        username: matches[7] || "",
        password: matches[8] || "",
        host: matches[9] || "",
        hostname: matches[10] || "",
        port: matches[11] || "",
        pathname: matches[12] || "",
        directory: matches[13] || "",
        filename: matches[14] || "",
        search: matches[15] || "",
        hash: matches[16] || ""
    } : {};
    if(data.port == ""){
        if(data.protocol == "http:") 
            data.port = "80";
        if(data.protocol == "https:")
            data.port = "443";
    }
    return {
			domain: data.domain,
      origin: data.protocol + '//' + data.hostname + ':' + data.port
    };
  };
});
