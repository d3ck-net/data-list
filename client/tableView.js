/**
 * Created by jms on 18/08/16.
 */
import {Converter} from 'meteor/dasdeck:data-filters';

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
                    self.filter.set(search);
                }
                else if (model.rules.length === 0) {
                    self.filter.set({});
                }
            }
        }

    },
    deReference: function (key) {
        return Template.parentData(1)[key];
    },
    schema: function () {
        var self = Template.instance().data;
        if (self.schema) {
            return self.schema;
        }
        else if (self.collection.simpleSchema) {
            var filters = Converter.convertSimpleSchemaToQueryBuilder(self.collection.simpleSchema());

            if (self.collection.alterFilters) {

                self.collection.alterFilters(filters);
            }

            return filters;

        }
        else {
            console.error('no schema defined for ' + self.collection._collectionName)
        }
    },
    data: function () {

        return this.collection.find();
    }
    ,
    count: function () {
        return this.collection.count(this.filter.get());
    }
    ,
    limit: function () {
        return this.limit.get();
    }
    ,
    numPages: function () {
        return this.numPages.get();
    },
    page: function () {
        return this.page.get() + 1;
    }

})
;

Template.dataList.events({
    'click .add': function () {

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

    var filter = this.data.filter = new ReactiveVar({});
    var limit = this.data.limit = new ReactiveVar(20);
    var page = this.data.page = new ReactiveVar(0);
    var numPages = this.data.numPages = new ReactiveVar(0);

    Tracker.autorun(function () {
        var limitNum = limit.get();
        var filterVar = filter.get();
        var pageVar = page.get();
        var count = collection.count(filterVar);

        var numPagesVar = Math.ceil(count / limitNum);//this.numPages.get();

        numPages.set(numPagesVar);


        if (pageVar >= numPagesVar) {
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
            Meteor.subscribe(collection._name, vars);

        }


    });

});