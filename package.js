Package.describe({
    name: 'dasdeck:data-list',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: 'create simple filterable list from tables',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function (api) {
    api.versionsFrom('1.3');
    api.use('templating', 'client');
    api.use('blaze-html-templates');
    api.use('less');
    api.use('msgfmt:core');
    api.use('ecmascript');
    api.use('meteortypescript:compiler');
    api.use('mongo');
    api.use('dasdeck:data-filters');
    // api.use('ui');

    api.addFiles('client/tableView.html', 'client');
    // api.addFiles('client/style.less', 'client');
    // api.addFiles('Filter.ts', 'client');
    // api.addFiles('FilterConfig.ts', 'client');
    // api.addFiles('server/startup.js', 'server');
    // api.addFiles('lib/startup.js');


    api.addFiles('client/tableView.js', 'client');
});

Package.onTest(function (api) {
    //api.use('ecmascript');
    //api.use('tinytest');
    //api.use('mongo-object');
    //api.addFiles('mongo-object-tests.js');
});
