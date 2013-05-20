define([DQXSC("Controls"), DQXSC("SQL"), "i18n!nls/PfCrossesWebResources.js"], function (Controls, SQL, resources) {

    function OptionsCommon() { };



    OptionsCommon.prototype = {

        changeFunction: null,
        variantContainer: null,
        queryPane: null,
        optionsList: null,
        widgetNumber: 0,
        statics: {
            widgetCount: 0
        },

        convertName: function (name) {
            var s1 = name.replace(new RegExp('(.)([A-Z][a-z]+)', "g"), function ($0, $1, $2, $3, $4) {
                return $1.toLowerCase() + '_' + $2.toLowerCase();
            });
            var s2 = s1.replace(new RegExp('(.)([A-Z][a-z]+)', "g"), function ($0, $1, $2, $3, $4) {
                return $1 + '_' + $2;
            }).toLowerCase();
            //	return (s2);
            return (name);
        },
        setAllFilterOptions: function () {
            var self = this;

            this.clear = Controls.Button(self.getIdPrefix() + 'SetNone', { content: resources.filtersSetNone, width: 100, buttonClass: "DQXWizardButton FilterGroupChangeButton" })
            .setOnChanged(function (id) {
                var options = self.getOptionsList();
                var modified = false;
                for (var i = 0; i < options.length; i++) {
                    modified |= options[i].getValue();
                    options[i].modifyValue(false, true);
                }
                if (modified) {
                    self.changeFunction(self);
                }
            });
            this.setAll = Controls.Button(self.getIdPrefix() + 'SetAll', { content: resources.filtersSetAll, width: 100, buttonClass: "DQXWizardButton FilterGroupChangeButton" })
            .setOnChanged(function (id) {
                var options = self.getOptionsList();
                var modified = false;
                for (var i = 0; i < options.length; i++) {
                    modified |= !options[i].getValue();
                    options[i].modifyValue(true, true);
                }
                if (modified) {
                    self.changeFunction(self);
                }
            });
            var multiSet = Controls.CompoundHor([this.clear, this.setAll]);
            self.queryPane.addControl(multiSet);
        },
        processFilters: function (filterList) {

            var self = this;
            $.each(filterList, function (idx, filter) {
                var id = self.getIdPrefix() + self.convertName(filter.label);
                var box = Controls.Check(id, {
                    name: filter.label,
                    value: filter.label,
                    id: id,
                    checked: true,
                    onChange: self.changeFunction,
                    variantContainer: self.variantContainer,
                    label: filter.label,
                    hint: filter.description
                });
                box.setOnChanged(self.changeFunction);
                box.variantContainer = self.variantContainer;
                box.originalFilterID = filter.label;
                self.optionsList.push(box);
                self.queryPane.addControl(box);
            });
        },
        createFilters: function () {
            //select distinct filter,method from pfx_variant_filter;
            var my_filters = [
            /*
            {
            label : "DUP_ALLELE",
            description : "Allele has been merged"
            },
            {
            label : "DUP_CALL",
            description : "Duplicated variant that was not the first seen"
            }
            */
			                      ];

            this.processFilters(my_filters);

        },

        getMethod: function () {
            return "unknown";
        },
        createContainer: function () {
            this.queryPane = Controls.CompoundVert();
            if (this.settings.showHeader)
                this.queryPane.setLegend(this.getLabel());
        },
        getOptionsPane: function () {
            return this.callsetOptionsPane;
        },
        getOptionsList: function () {
            return this.optionsList;
        },
        getQueryPane: function () {
            return this.queryPane;
        },
        getIdPrefix: function () {
            return this.getMethod() + this.widgetNumber.toString();
        },
        setQueryParams: function (filter) {
            var options = this.getOptionsList();
            for (var i = 0; i < options.length; i++) {
                var id = options[i].getFullID('');
                var value = options[i].getValue();
                //It's a checked box
                if (options[i].isChecked) {
                    id = id.substring(this.getIdPrefix().length);
                    if (value == false) {
                        //If the box isn't checked we don't care about the value
                        value = 1;
                    } else {
                        value = 0;
                        filter.push(SQL.WhereClause.CompareFixed(id, '=', value));
                    }
                }

            }
        },
        setup: function (_changeFunction, _variantContainer, settings) {

            this.settings = settings;
            this.widgetNumber = this.statics.widgetCount++;
            this.optionsList = new Array();

            this.changeFunction = _changeFunction;
            this.variantContainer = _variantContainer;

            this.createContainer();

            this.setAllFilterOptions();

            this.createFilters();

        }
    };

    return OptionsCommon;
});
