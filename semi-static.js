var url = require('url'),
    fs = require('fs'),
    _ = require('underscore'),
    path = require('path');


module.exports = function (conf) {
    var config = conf || {};
    _.defaults(config, {
        folderPath: path.dirname(require.main.filename) + '/views/static',
        fileExt: 'jade',
        root: '',
        keepExt: false
    });
    return function (req, res, next) {
        var pathName = (config.root && req.url.indexOf(config.root) === 0) ? req.url.slice(config.root.length) : req.url,
            fullPath;

        // trim off ? and #
        pathName = pathName.split('?')[0].split('#')[0];

        if (req.url === config.root || req.url === (config.root + '/')) {
            fullPath = config.folderPath + '/index.' + config.fileExt;
        } else {
            fullPath = config.folderPath + pathName;
            if(!config.keepExt) fullPath += '.' + config.fileExt;
        }

        fs.exists(fullPath, function (exists) {
            if (exists && !config.context) {
                res.render(fullPath, {pageName: _.last(req.url.split('/'))});
            } else if (exists && typeof config.context === "function") {
		config.context(req, function(err, context){
		if(err) return next(err);
                else res.render(fullPath, context);
		});		
            } else if (exists && config.context) {
                res.render(fullPath, config.context);		
            } else {
		next();
            }
        });
    };
};
