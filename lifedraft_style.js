/*
 * # lifedraft_style
 * jQuery plugin for dynamic manipulating CSS Files and Style tags.
 * http://lifedraft.de/
 *
 * Copyright (c) 2009 Stanislav Müller
 * Licensed under the MIT license.
 * http://lifedraft.de
 *
 */

(function($) {

  $.lifedraft_style = new (function() {
    this.cache = {};
    var IE = "\v" == "v",
    
    objectToCSSString = function(obj) {
      var tmp = "";
      for(var prop in obj) {
        tmp += prop+":"+obj[prop]+";";
      }
      return tmp;
    },

    camelCaseCache = {},
    toCamelCase = function(str) {
      if(str in camelCaseCache) return camelCaseCache[str];
      
      if(str.indexOf("-") != -1) {
        /* Strongly inspired by Prototype's camelize function */
        var parts = str.split('-'), len = parts.length;
        if (len == 1) return parts[0];

        var camelized = str.charAt(0) == '-'
          ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
          : parts[0];

        for (var i = 1; i < len; i++)
          camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

        return camelCaseCache[str] = camelized;
      }
      
      return str;
    };
    
    this.createTag = function(media, id) {
      var media = media || "screen";
      var id = id || media+"_lifedraft_style_"+((new Date()).getTime());
      
      var styleTag = document.createElement("style");
      styleTag.type = "text/css";
      styleTag.media = media;
      styleTag.id = id;
      document.getElementsByTagName("head")[0].appendChild(styleTag);
      
      this.cache[id] = {
        styleTag: (IE) ? document.styleSheets[id] : styleTag
      };
      
      this.lastUsed = id;
      return id;
    };
    
    this.set = function(selector, properties, styleTag) {
      if(!styleTag && !this.lastUsed) {
        this.createTag();
      } else if (styleTag) {
        this.cacheStyleTag(styleTag);
        if(!this.lastUsed) return false;
      }

      var cache = this.cache[this.lastUsed],
      styleTag = cache.styleTag,
      rules = "", rule, index, prop;

      if(!(selector in cache)) {
        
        rules = objectToCSSString(properties);
        
        if(IE) {
          index = styleTag.rules.length;
          styleTag.addRule(selector, rules, index);
          rule = styleTag.rules[index].style;
        } else {
          index = styleTag.sheet.cssRules.length;          
          styleTag.sheet.insertRule(selector+"{"+rules+"}", index);
          rule = styleTag.sheet.cssRules[index].style;
        }

        cache[selector] = rule;

      } else {
        rule = cache[selector];
        for(prop in properties) rule[toCamelCase(prop)] = properties[prop];
      }

      return rule;
    };
    
    this.get = function(selectorText, property) {
      var selector = this.cache[this.lastUsed][selectorText];
      if(!selector) return;
      
      return property ? selector[toCamelCase(property)] : selector;
    };
    
    this.cacheStyleTag = function(styleSheetId) {
      if(this.cache[styleSheetId]) {
        this.lastUsed = styleSheetId;
        return true;
      }
            
      var styleTag = (IE) ? document.styleSheets[styleSheetId] : document.getElementById(styleSheetId);
      if(!styleTag) return false;

      var cache = this.cache[styleSheetId] = this.cache[styleSheetId] || {};

      cache.styleTag = styleTag;
      this.lastUsed = styleSheetId;

      return styleSheetId;
    };
    
    this.toString = function(styleSheetId) {
      var rules, rulesLength, rule, styleTag, tmp = [];
      
      this.cacheStyleTag(styleSheetId);
      
      styleTag = this.cache[this.lastUsed].styleTag;
      rules = IE ? styleTag.rules : styleTag.sheet.cssRules;
      rulesLength = rules.length;
      
      /* IE is doing some crazy uppercase things with selectors and properties.
       * Attention!
       */
      for (var i=0; i < rulesLength; i++) {
        tmp.push(rules[i].selectorText+" {\n" +
        "  "+(rules[i].style.cssText).split("; ").join(";\n  ") + "\n}");
      };
     
      return tmp.join("\n\n");
    };


    if(typeof $.jQuery != undefined) {
      
      $.jQuery.fn.lifedraft_style_set = function(properties, styleTag) {
        $.lifedraft_style.set(this.selector, properties, styleTag);
        return this;
      };
      
      $.jQuery.fn.lifedraft_style_get = function(property) {
        return $.lifedraft_style.get(this.selector, property);
      };
      
    }

  });

})(window);