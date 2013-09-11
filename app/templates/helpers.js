var fs = require('fs');
var _s = require ('underscore.string');
var marked = require('marked');
marked.setOptions({
  gfm: true,
  langPrefix: 'language-',
  tables: true,
  breaks: true,
  smartLists: true,
  smartypants: true
});

module.exports = {
  'image-url': function(src) {
    return this.options.assets + '/' + this.options.userConfig.assets.imagesDir + '/' + src;
  },
  'script-url': function(src) {
    return this.options.assets + '/' + this.options.userConfig.assets.jsDir + '/' + src;
  },
  'style-url': function(href) {
    return this.options.assets + '/' + this.options.userConfig.assets.cssDir + '/' + href;
  },
  'component-url': function(src) {
    return this.options.assets + '/' + this.options.userConfig.assets.componentsDir + '/' + src;
  },
  'style-ext': function(href, component) {
    var path = this.options.assets;

    if (component.data === undefined) {
      path += '/' + this.options.userConfig.assets.componentsDir + '/';
    }
    else {
      path += '/' + this.options.userConfig.assets.cssDir + '/';
    }

    return '<link rel="stylesheet" href="' + path + href + '">';
  },
  'script-ext': function(src, component) {
    var path = this.options.assets;

    if (component.data === undefined) {
      path += '/' + this.options.userConfig.assets.componentsDir + '/';
    }
    else {
      path += '/' + this.options.userConfig.assets.jsDir + '/';
    }

    return '<script src="' + path + src + '"></script>';
  },
  'page-title': function() {
    if (this.page.title) {
      return this.page.title + ' | ' + this.options.userConfig.client.name + ' Style Prototype';
    }
    else {
      return this.options.userConfig.client.name + ' Style Prototype';
    }
  },
  'classify': function(list) {
    return list.toString().replace(/,/g , ' ');
  },
  'show-example': function() {
    return this.page.examples;
  },
  'markdown': function(md) {
    return marked(md.fn(1));
  },
  'for': function(from, to, incr, block) {
    var accum = '';
    for (var i = from; i < to; i += incr) {
      accum += block.fn(i);
    }
    return accum;
  },
  'possible-pattern': function(index, src, context) {
    var output = "<li class='pattern-" + index + "'><img src='";

    var ext = src.match('^(http|https):\/\/');

    if (ext) {
      output += src;
    }
    else {
      output += context.options.assets + '/' + context.options.userConfig.assets.imagesDir + '/' + src;
    }

    output += "' alt='Patten " + index + "'></li>";

    return output;
  },
  'create-example-html': function(type, component) {
    var name = component;
    if (typeof(component) === 'object') {
      name = Object.keys(component)[0];
    }
    name = _s.slugify(name);

    var path = 'partials/components/' + type + '/' + type + '--' + name + '.html';
    var code = fs.readFileSync('templates/code.html').toString('utf-8');
    code = code.replace('{{summary}}', 'HTML Source');
    code = code.replace('{{language}}', 'markup');

    var file = fs.readFileSync(path).toString('utf-8');
    file = file.replace(new RegExp('<', 'g'), '&lt;');
    file = file.replace(new RegExp('>', 'g'), '&gt;');

    code = code.replace('{{code}}', file);

    return code;
  },
  'create-example-scss': function(type, component, support) {
    var name = component;
    if (typeof(component) === 'object') {
      name = Object.keys(component)[0];
    }
    name = _s.slugify(name);

    if (typeof(support) === 'object') {
      support = false;
    }

    if (support) {
      var mixins = 'sass/components/' + type + '/_mixins.scss';
      var extend = 'sass/components/' + type + '/_extends.scss';

      var mixinFile = '';
      var extendFile = '';

      var code = fs.readFileSync('templates/code.html').toString('utf-8');

      var mixinCode = '';
      var extendCode = '';

      if (fs.existsSync(mixins)) {
        mixinFile = fs.readFileSync(mixins).toString('utf-8') + '\n';

        mixinCode = code.replace('{{summary}}', 'Sass Mixin Source');
        mixinCode = mixinCode.replace('{{language}}', 'scss');
        mixinCode = mixinCode.replace('{{code}}', mixinFile);
      }
      if (fs.existsSync(extend)) {
        extendFile = fs.readFileSync(extend).toString('utf-8');

        extendCode = code.replace('{{summary}}', 'Sass Extend Source');
        extendCode = extendCode.replace('{{language}}', 'scss');
        extendCode = extendCode.replace('{{code}}', extendFile);
      }

      return mixinCode + extendCode;
    }
    else {
      var path = 'sass/components/_' + type + '.scss';

      var code = fs.readFileSync('templates/code.html').toString('utf-8');
      code = code.replace('{{summary}}', 'Sass Source');
      code = code.replace('{{language}}', 'scss');

      var file = fs.readFileSync(path).toString('utf-8');

      var startType = '// @{' + type + '}';
      var endType = '// {' + type + '}@';
      var typeFindLength = startType.length;
      var indexStartType = file.indexOf(startType) >= 0 ? file.indexOf(startType) + typeFindLength + 1 : false;
      var indexEndType = file.indexOf(endType) >= 0 ? file.indexOf(endType) : false;

      var startComp = '// @{' + type + '--' + name + '}';
      var endComp = '// {' + type + '--' + name + '}@';
      var compFindLength = startComp.length;
      var indexStartComp = file.indexOf(startComp) >= 0 ? file.indexOf(startComp) + compFindLength + 1 : false;
      var indexEndComp = file.indexOf(endComp) >= 0 ? file.indexOf(endComp) : false;

      var typeSass = indexStartType && indexEndType ? file.slice(indexStartType, indexEndType) + '\n' : '';

      var compSass = indexStartComp && indexEndComp ? file.slice(indexStartComp, indexEndComp) : '';

      var fullSass = typeSass + compSass;

      code = code.replace('{{code}}', fullSass);

      return code;
    }
  },
  'component': function(type, component) {

    var name = component;
    if (typeof(component) === 'object') {
      name = Object.keys(component)[0];
    }
    name = _s.slugify(name);

    var path = 'partials/components/' + type + '/' + _s.slugify(type) + '--' + name + '.html';

    var file = fs.readFileSync(path).toString('utf-8');

    return file;
  }
};