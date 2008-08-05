/*
Copyright 2008 University of Toronto

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://source.fluidproject.org/svn/LICENSE.txt
*/

/*global jQuery*/

/*global fluid*/
fluid = fluid || {};

(function ($, fluid) {
    
  // The three states of the undo component
    var STATE_INITIAL = "state_initial", 
        STATE_CHANGED = "state_changed",
        STATE_REVERTED = "state_reverted";
  
    function defaultRenderer(that, targetContainer) {
        var markup = "<span class='fluid-undo'>" + 
          "<span class='undoContainer'>[<a href='#' class='undoControl'>undo</a>]</span>" + 
          "<span class='redoContainer'>[<a href='#' class='redoControl'>redo</a>]</span>" + 
        "</span>";
        var markupNode = $(markup);
        targetContainer.append(markupNode);
        return markupNode;
    }
  
    function render(that) {
        if (that.state === STATE_INITIAL) {
          that.select("undoContainer").hide();
          that.select("redoContainer").hide();
        }
        else if (that.state === STATE_CHANGED) {
          that.select("undoContainer").show();
          that.select("redoContainer").hide();
        }
        else if (that.state === STATE_REVERTED) {
          that.select("undoContainer").hide();
          that.select("redoContainer").show();          
        }
    }
    
    function bindHandlers(that) {
      that.component.modelFirer.addListener(
        function() {
          that.state = STATE_CHANGED;
          render(that);
        });
      
      that.select("undoControl").click( 
        function() {
          fluid.model.copyModel(that.extremalModel, that.component.model);
          fluid.model.copyModel(that.component.model, that.initialModel);
          that.component.render();
          that.state = STATE_REVERTED;
          render(that);
        });
      that.select("redoControl").click( 
        function() {
          fluid.model.copyModel(that.component.model, that.extremalModel);
          that.component.render();
          that.state = STATE_CHANGED;
          render(that);
        });
    }
    /**
     * Decorates a target component with the function of "undoability"
     * 
     * @param {Object} component a "model-bearing" standard Fluid component to receive the "undo" functionality
     * @param {Object} options a collection of options settings
     */
    fluid.infuseUndoability = function (component, userOptions) {
        var that = fluid.initialiseThat("undo", null, userOptions);
        that.container = that.options.renderer(that, component.container);
        
        that.component = component;
        that.initialModel = {};
        that.extremalModel = {};
        fluid.model.copyModel(that.initialModel, component.model);
        
        that.state = STATE_INITIAL;
        
        render(that);
        bindHandlers(that);
        return that;
    }
  
    fluid.defaults("undo", {  
        selectors: {
            undoContainer: ".undoContainer",
            undoControl: ".undoControl",
            redoContainer: ".redoContainer",
            redoControl: ".redoControl"
            },
                    
        renderer: defaultRenderer,
        }
      );
        
})(jQuery, fluid);