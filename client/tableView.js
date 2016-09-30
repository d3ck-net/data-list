/**
 * Created by jms on 18/08/16.
 */
import {Converter} from 'meteor/dasdeck:restcollection';

//@TODO non mongo ids
//@TODO auto edit per table
//@TODO edit clumn
//@TODO custom search fields (all text)

AutoForm.addInputType('relation', {template: 'relationField'});


import {CollectionWrapper} from 'meteor/dasdeck:restcollection';


Template.dataList.helpers({
    callbacks: function () {

        var self = this;
        return {
            change: function (e) {
                if (e.type === 'keyup') {
                    $(e.target).trigger('change');
                    return;
                }
                var valid = $(this).queryBuilder('validate');
                var model = $(this).queryBuilder('getModel');
                if (valid) {
                    var search = $(this).queryBuilder('getMongo');

                    var remap = {
                        $fulltext: {
                            proc: function (val) {
                                var res = [];

                                $.each(self.fulltext, function (i, o) {
                                    var op = {};

                                    op[o] = val;
                                    res.push(op);
                                });

                                return res;
                            },
                            rename: '$or'
                        }
                    }

                    Tools.keyProcess(search, remap);

                    self.filter.set(search);
                }
                else {
                    self.filter.set({});
                }
            }
        }
    },
    useValue: function (par) {
        if (typeof par === 'object') {

            var value = "";
            if (par.value) {
                if (typeof par.value === 'function') {
                    value = par.value.call(Template.parentData(1));
                }
                else {
                    value = par.value;
                }
            }
            if (par.class) {
                value = '<span class="' + par.class + '">' + value + '</span>';
            }
            if (par.link) {
                value = '<a href="' + par.link + '">' + value + '</a>';
            }

            return value;
        }
        else {
            return par;
        }
    },
    deReference: function (key) {
        return Template.parentData(1)[key];
    },
    searchSchema: function () {
        var collection = Template.instance().data.collection;
        return collection.getSchema('search');
    },

    _id: function () {

        if (this.getId() instanceof Mongo.ObjectID) {
            return this.getId()._str + "/oid";
        }
        else {
            return this.getId();
        }
    },
    schema: function () {
        var self = Template.instance().data;
        return self.collection.getSchema('table');
    },
    data: function () {
        return this.collection.find(this.filter.get());
    },
    count: function () {
        return this.collection.count(this.filter.get());
    },
    limit: function () {
        return this.limit.get();
    },
    paging: function () {
        return this.numPages.get() > 1
    },
    numPages: function () {
        return this.numPages.get();
    },
    page: function () {
        return this.page.get() + 1;
    }

})


Template.dataList.events({
    'dblclick .pagesIndex': function () {
        var page = prompt('go to page:', this.page.get() + 1);

        var pageInt = parseInt(page);
        if (!isNaN(pageInt)) {
            this.page.set(pageInt - 1);
        }
    },
    'click .prevPage': function () {
        this.page.set(this.page.get() - 1);
    },
    'click .nextPage': function () {
        this.page.set(this.page.get() + 1);
    }

})

Template.dataList.onCreated(function () {
    var collection = this.data.collection = window[this.data.collection];

    this.data.fulltext = this.data.fulltext ? this.data.fulltext : CollectionWrapper.getfullTextSearchFields(collection);

    var filter = this.data.filter = new ReactiveVar({});
    var limit = this.data.limit = new ReactiveVar(20);
    var page = this.data.page = new ReactiveVar(0);
    var numPages = this.data.numPages = new ReactiveVar(0);

    var refresh = function (thisComp) {

        var limitNum = limit.get();
        var filterVar = filter.get();
        var pageVar = page.get();
        var count = collection.count(filterVar);

        var numPagesVar = Math.ceil(count / limitNum);//this.numPages.get();

        numPages.set(numPagesVar);


        if (numPagesVar && pageVar >= numPagesVar) {
            page.set(pageVar - numPagesVar);
        }
        else if (pageVar < 0) {
            page.set(pageVar + numPagesVar);
        }
        else {

            var vars = {
                limit: {
                    limit: limitNum,
                    skip: pageVar * limitNum
                },
                filter: filterVar
            };


            if (collection.setPreFilter) {
                collection.setPreFilter(vars.filter, vars.limit);
            }
            else {
                Meteor.subscribe(collection._name, vars);
            }

        }


    }

    this.tracker = Tracker.autorun(refresh);
    refresh();

});

Template.dataListAdd.helpers({
    schema: function () {
        var self = this.collection;
        return self.getSchema('add');
    }
});

Template.dataListAdd.events({
    'click .insert': function (e) {

        var collection = Template.instance().data.collection;
        var formName = collection._name;
        if (AutoForm.validateForm(formName)) {
            var modal = $(e.target).closest('.modal');
            var serialized = modal.find('form').serializeArray();

            var data = {};
            $.each(serialized, function (i, o) {
                data[o.name] = o.value;
            });

            collection.insert(data, function (error, id) {
                if (!error) {
                    modal.modal('hide');
                    // toastr.success("item added succsessfully");
                }
                else {
                    // toastr.error("could not save data");
                }
            });
        }

        e.preventDefault();
    }
});

Template.dataList.onDestroyed(function () {
    this.tracker.stop();
});

Template.relationField.helpers({
    name: function () {
        return this.atts.name;
    },
    options: function () {
        var collection = window[this.atts.settings.collection];
        return collection.find();
    },
    value: function () {

        var data = Template.parentData();
        var res = this[data.atts.settings.key];
        if (res instanceof Mongo.ObjectID) {
            res = res._str;
        }
        return res;
    },
    label: function () {
        var data = Template.parentData();
        return this[data.atts.settings.label];
    }

});

Template.relationField.onCreated(function () {

    var collection = window[this.data.atts.settings.collection];
    Meteor.subscribe(collection._name);
});