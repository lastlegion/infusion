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
    
    function edit(text, editContainer, editField, invitationStyle, paddings) {
		editField.val(text.text());
		editField.width(Math.max(text.width() + paddings.add, paddings.minimum));
        text.removeClass(invitationStyle);
        text.hide();
        editContainer.show();

        // Work around for FLUID-726
        // Without 'setTimeout' the finish handler gets called with the event and the edit field is inactivated.       
        setTimeout(function () {
            editField.focus();    
        }, 0);
        
    }
    
    function finish(editContainer, editField, text, finishedFn) {
        finishedFn(edit);
        text.text(editField.val());
        editContainer.hide();
        text.show();
        text.focus();
    }
    
    function editHandler(text, editContainer, editField, invitationStyle, paddings) {
        return function () {
            edit(text, editContainer, editField, invitationStyle, paddings);
            return false;
        }; 
    }
    
    function hoverHandlers(text, invitationStyle) {
        return {
            over: function (evt) {
                text.addClass(invitationStyle);
            },
            out: function (evt) {
                text.removeClass(invitationStyle);
            }
        };
    }
    
    function mouse(text, editContainer, editField, styles, paddings, finishFn) {
         // Hover over for an invitation to click.
        var textHover = hoverHandlers(text, styles.invitation);
        text.hover(textHover.over, textHover.out);
        
        // Handle a click.
        text.click(editHandler(text, editContainer, editField, styles.invitation, paddings));
    }
    
    function bindKeyHighlight(text, focusStyle) {
        var focusOn = function () {
            text.addClass(focusStyle);    
        };
        var focusOff = function () {
            text.removeClass(focusStyle);    
        };
        
        text.focus(focusOn);
        text.blur(focusOff);
    }
    
    function keyNav(text, editContainer, editField, styles, paddings) {
        text.tabbable();
        bindKeyHighlight(text, styles.focus);
        text.activatable(editHandler(text, editContainer, editField, styles.invitation, paddings));
    } 
    
    function bindEditFinish(editContainer, editField, text, finishedFn) {
        var finishHandler = function (evt) {
            // Fix for handling arrow key presses see FLUID-760
            var code = (evt.keyCode ? evt.keyCode : (evt.which ? evt.which : 0));
            if (code !== $.a11y.keys.ENTER) {
                return true;
            }
            
            finish(editContainer, editField, text, finishedFn);
            return false;
        };
        
        editContainer.blur(finishHandler);
        editContainer.keypress(finishHandler);
    }
    
    function aria(text, editContainer) {
        // Need to add ARIA roles and states.
    }
    
    fluid.InlineEdit = function (componentContainerId, options) {
        // Mix in the user's configuration options.
        options = options || {};
        var selectors = $.extend({}, this.defaults.selectors, options.selectors);
        this.styles = $.extend({}, this.defaults.styles, options.styles);
        this.paddings = $.extend({}, this.defaults.paddings, options.paddings);
		this.finishedEditing = options.finishedEditing || function () {};
        
        // Bind to the DOM.
        this.container = fluid.utils.jById(componentContainerId);
        this.text = $(selectors.text, this.container);
        this.editContainer = $(selectors.editContainer, this.container);
        this.editField = $(selectors.edit, this.editContainer);
        
        // Add event handlers.
        mouse(this.text, this.editContainer, this.editField, this.styles, this.paddings, this.finishedEditing);
        keyNav(this.text, this.editContainer, this.editField, this.styles, this.paddings);
        bindEditFinish(this.editContainer, this.editField, this.text, this.finishedEditing);
        
        // Add ARIA support.
        aria(this.text, this.editContainer);
        
        // Hide the edit container to start
        this.editContainer.hide();
    };
    
    fluid.InlineEdit.prototype.edit = function () {
        edit(this.text, this.editContainer, this.editField, this.styles.invitation, this.paddings);
    };
    
    fluid.InlineEdit.prototype.finish = function () {
        finish(this.editContainer, this.editField, this.text, this.finishedEditing);
    };
    
    fluid.InlineEdit.prototype.defaults = {
        selectors: {
            text: ".text",
            editContainer: ".editContainer",
            edit: ".edit"
        },
        
        styles: {
            invitation: "invitation",
            focus: "focus"
        },
		
		paddings: {
			add: 10,
			minimum: 80
		}
    };
        
})(jQuery, fluid);
