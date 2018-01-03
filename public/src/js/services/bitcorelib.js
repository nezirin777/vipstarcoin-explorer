'use strict';

angular.module('insight.qtumcorelib').factory('QtumCoreLib',
    function() {
        var QtumCoreLib = require('htmlcoin-lib');
        return QtumCoreLib;
    });

