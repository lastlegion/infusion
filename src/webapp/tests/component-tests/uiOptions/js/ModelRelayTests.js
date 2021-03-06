/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options 
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    /*******************************************************************************
     * Unit tests for fluid.uiOptions.modelRelay
     *******************************************************************************/

    var resultValue;
    
    fluid.defaults("fluid.tests.modelRelay", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            modelRelayWrapper: {
                type: "fluid.uiOptions.modelRelayWrapper"
            },
            modelRelayTester: {
                type: "fluid.tests.modelRelayTester"
            }
        }
    });

    fluid.defaults("fluid.uiOptions.modelRelayWrapper", {
        gradeNames: ["fluid.modelComponent", "fluid.eventedComponent", "autoInit"],
        model: {
            wrapperValue: null
        },
        components: {
            modelRelayImpl: {
                type: "fluid.uiOptions.modelRelay",
                options: {
                    sourceApplier: "{modelRelayWrapper}.applier",
                    rules: {
                        "wrapperValue": "value"
                    },
                    model: {
                        value: null
                    },
                    finalInit: "fluid.uiOptions.modelRelay.finalInit"
                }
            }
        }
    });

    fluid.uiOptions.modelRelay.finalInit = function (that) {
        that.applier.modelChanged.addListener("value", function (newModel) {
            resultValue = newModel.value;
        });
    };
    
    fluid.tests.checkResult = function (expectedValue) {
        return function () {
            jqUnit.assertEquals("The model change request on the modelRelay has been fired", expectedValue, resultValue);
        };
    };
    
    fluid.defaults("fluid.tests.modelRelayTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newValue1: "This is a test string 1.",
            newValue2: "This is a test string 2."
        },
        modules: [{
            name: "Test model relay component",
            tests: [{
                expect: 2,
                name: "The applier change request on the modelRelay wrapper triggers the request on the modelRelay itself",
                sequence: [{
                    func: "{modelRelayWrapper}.applier.requestChange",
                    args: ["wrapperValue", "{that}.options.testOptions.newValue1"]
                }, {
                    listenerMaker: "fluid.tests.checkResult",
                    makerArgs: ["{that}.options.testOptions.newValue1"],
                    spec: {path: "wrapperValue", priority: "last"},
                    changeEvent: "{modelRelayWrapper}.applier.modelChanged"
                }, {
                    func: "{modelRelayWrapper}.modelRelayImpl.applier.requestChange",
                    args: ["value", "{that}.options.testOptions.newValue2"]
                }, {
                    listenerMaker: "fluid.tests.checkResult",
                    makerArgs: ["{that}.options.testOptions.newValue2"],
                    spec: {path: "value", priority: "last"},
                    changeEvent: "{modelRelayWrapper}.modelRelayImpl.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.modelRelay"
        ]);
    });

})(jQuery);
