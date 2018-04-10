'use strict';

angular.module('insight.qtumcorelib').factory('QtumCoreLib',
    function() {
        var QtumCoreLib = require('vipstarcoin-lib');
        return QtumCoreLib;
    });

