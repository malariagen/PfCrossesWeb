define(["jquery", "DQX/Controls", "DQX/Utils", "i18n!nls/PfCrossesWebResources"],
    function ($, Controls, Utils, resources) {
        var VariantFilters = function(filters, model) {
            var that = {};
            that.grid = Controls.CompoundGrid();
            that.grid.sepV = 0;

            var set_all = function(filters, val) {
                var ret = {};
                $.each(filters, function(id, filter) {
                    ret[id] = val;
                });
                return ret;
            };
            var select_all = Controls.Button(DQX.getNextUniqueID()+'SetAll', { content: resources.filtersSetAll, width: 100, buttonClass: "DQXWizardButton FilterGroupChangeButton" })
                .setOnChanged(function(id) {
                    model.set(set_all(filters, true));
                });
            var select_none = Controls.Button(DQX.getNextUniqueID()+'SetNone', { content: resources.filtersSetNone, width: 100, buttonClass: "DQXWizardButton FilterGroupChangeButton" })
                .setOnChanged(function(id) {
                    model.set(set_all(filters, false));
                });
            that.grid.setItem(0,0, select_all);
            that.grid.setItem(0,1, select_none);
            var i = 2;
            that.checks = $.map(filters, function (filter, id) {
                var check = Controls.Check(DQX.getNextUniqueID(),
                    {
                        label: filter.label,
                        value: model.get(id),
                        hint: filter.description
                    }
                );
                check.bindToModel(model, id);
                check.call_methods = filter.call_methods;
                that.grid.setItem(Math.floor(i/2), i%2, check);
                i++;
                return check;
            });

            that.setCallMethod = function(call_method) {
                $.each(that.checks, function(i, check) {
                    check.modifyEnabled($.inArray(call_method, check.call_methods) != -1);
                })
            };
            return that;
        };
        return VariantFilters;
    }
);