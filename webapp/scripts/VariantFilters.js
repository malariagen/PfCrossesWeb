define(["jquery", "DQX/Controls", "DQX/Utils", "i18n!nls/PfCrossesWebResources"],
    function ($, Controls, Utils, resources) {
        var VariantFilters = function(filters, model) {
            var that = {};
            that.grouper = Controls.CompoundVert();

            var set_all = function(filters, val) {
                var ret = {};
                $.each(filters, function(id, filter) {
                    ret[id] = val;
                });
                return ret;
            };
            var select_all = Controls.Button(DQX.getNextUniqueID()+'SetAll', { content: resources.filtersSetAll,  buttonClass: "DQXWizardButton FilterGroupChangeButton" })
                .setOnChanged(function(id) {
                    model.set(set_all(filters, true));
                });
            var select_none = Controls.Button(DQX.getNextUniqueID()+'SetNone', { content: resources.filtersSetNone,  buttonClass: "DQXWizardButton FilterGroupChangeButton" })
                .setOnChanged(function(id) {
                    model.set(set_all(filters, false));
                });
            that.grouper.addControl(Controls.CompoundHor([select_all, select_none]));

            that.grid = Controls.CompoundGrid();
            that.grouper.addControl(that.grid);
            that.grid.sepV = 0;

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
                check.showhide = Controls.ShowHide(check);
                that.grid.setItem(Math.floor(i/2), i%2, check.showhide);
                i++;
                return check;
            });

            that.setCallMethod = function(call_method) {
                $.each(that.checks, function(i, check) {
                    check.modifyEnabled($.inArray(call_method, check.call_methods) != -1);
                    check.showhide.setVisible($.inArray(call_method, check.call_methods) != -1);
                })
            };

            that.getControl = function() {
                return that.grouper;
            }
            return that;
        };
        return VariantFilters;
    }
);