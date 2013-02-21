// Generated by CoffeeScript 1.4.0
/*
Copyright (c) 2012 [DeftJS Framework Contributors](http://deftjs.org)
Open source under the [MIT License](http://en.wikipedia.org/wiki/MIT_License).
*/

/**
* A mixin that creates and attaches the specified view controller(s) to the target view. Used in conjunction with Deft.mvc.ViewController.
* @deprecated 0.8 ViewController attachemnt is now done automatically using class preprocessors.
*/

Ext.define('Deft.mixin.Controllable', {
  requires: ['Ext.Component', 'Deft.core.Class', 'Deft.log.Logger'],
  /**
  @private
  */

  onClassMixedIn: function(targetClass) {
    Deft.Logger.deprecate('Deft.mixin.Controllable has been deprecated and can now be omitted - simply use the \'controller\' class annotation on its own.');
  }
}, function() {
  var callParentMethod, createControllerInterceptor;
  createControllerInterceptor = function(method) {
    return function(config) {
      var controller;
      if (config == null) {
        config = {};
      }
      if (this.$controlled) {
        return this[method](arguments);
      }
      if (!(this instanceof Ext.ClassManager.get('Ext.Component'))) {
        Ext.Error.raise({
          msg: 'Error constructing ViewController: the configured \'view\' is not an Ext.Component.'
        });
      }
      try {
        controller = Ext.create(this.controller, config.controllerConfig || this.controllerConfig || {});
      } catch (error) {
        Deft.Logger.warn("Error initializing view controller: an error occurred while creating an instance of the specified controller: '" + this.controller + "'.");
        throw error;
      }
      if (this.getController === void 0) {
        this.getController = function() {
          return controller;
        };
      }
      this.$controlled = true;
      this[method](arguments);
      controller.controlView(this);
      return this;
    };
  };
  if (Ext.getVersion('extjs') && Ext.getVersion('core').isLessThan('4.1.0')) {
    callParentMethod = 'callOverridden';
  } else {
    callParentMethod = 'callParent';
  }
  Deft.Class.registerPreprocessor('controller', function(Class, data, hooks, callback) {
    var self;
    Deft.Class.hookOnClassCreated(hooks, function(Class) {
      Class.override({
        constructor: createControllerInterceptor(callParentMethod)
      });
    });
    Deft.Class.hookOnClassExtended(data, function(Class, data, hooks) {
      Deft.Class.hookOnClassCreated(hooks, function(Class) {
        Class.override({
          constructor: createControllerInterceptor(callParentMethod)
        });
      });
    });
    self = this;
    Ext.require([data.controller], function() {
      if (callback != null) {
        callback.call(self, Class, data, hooks);
      }
    });
    return false;
  }, 'before', 'extend');
});
