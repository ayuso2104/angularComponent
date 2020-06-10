import Common from './../common';
import Menu from './../menu/menu';

var WEBC = {
    el: Common.el,
    retriveValueOfData: Common.retriveValueOfData,
    retriveValue: Common.retriveValue,
    propagateEvent: Common.propagateEvent,
    whenElementMounted: Common.whenElementMounted,
    ButtonIcon: Common.ButtonIcon,
    uuid: Common.uuid,
    ToolTip: Common.ToolTip,
    Icon: Common.Icon,
    BasicButton: Common.BasicButton,
    deepContains: Common.deepContains,
    ContextualMenu: Menu.ContextualMenu,
    deepEqual: Common.deepEqual,
    deepClone: Common.deepClone,
    deepIndexOf: Common.deepIndexOf
};

/**
 * Configuracion de la tabla constantes
 */
;
(function (WEBC) {
    "use strict";

    WEBC.TableConfig = {
        NUMBER_PAGES_OPTIONS: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
        EVENTS: {
            NUMER_BY_PAGE_CHANGE: 'number-pages-change',
            COLUMN_ORDER_CHANGE: 'column-order-change',
            NUM_PAGE_CHANGE: 'page-change-activation',
            FILTER_ELEMENTS_REQUEST: 'elements-filter-activation',
            CLEAN_FILTER_ORDER_REQUEST: 'clean-filter-order',
            CHANGE_TO_LOCAL_REQUEST: "change-to-local",
            CHANGE_TO_GLOBAL_REQUEST: "change-to-global",
            CLICK_ON_ROW: "click-on-row",
            SELECT_ALL_PAGE: "select-all-page",
            CLEAN_SELECTED: "clean-selected",
            EXCLUDE_FROM_ALL: "exclude-from-all",
            REMOVE_FROM_EXCLUDES: "remove-from-excludes",
            NUM_ROWS_CHANGE: "num-rows-change"
        },
        ENTER: 13
    }

})(WEBC);

/**
 * Ajustar el tamañi de una fila
 */
;
(function (window, WEBC, Number) {
    "use strict";

    WEBC.ajustHeightHeader = _ajustHeightHeader;
    WEBC.getHeight = _getHeight;

    var isIE = navigator.userAgent.match(/Trident/);

    function _ajustHeightHeader(row, typeCell) {
        var headerWithMaxHeight = Array.from(row.querySelectorAll(typeCell)).reduce(function (currentTh, nextTh) {
            return _getHeight(currentTh) > _getHeight(nextTh) ? currentTh : nextTh;
        });

        var maxHeightText = (isIE ? _getHeight(headerWithMaxHeight) + 10 : _getHeight(headerWithMaxHeight)) + "px";

        row.style.setProperty("height", maxHeightText);

        Array.from(row.querySelectorAll(typeCell)).forEach(function (th) {
            th.style.setProperty("height", maxHeightText);
        });

        return _getHeight(headerWithMaxHeight);
    }

    function _getHeight(element) {
        var heightText = window.getComputedStyle(element).height;
        return Number(heightText.replace("px", ""));
    }

})(window, WEBC, Number);

/**
 * Proveedor de datos estaticos
 */
;
(function (WEBC, retriveValueOfData) {
    "use strict";

    WEBC.OfflineDataProvider = _offlineDataProvider;

    function _offlineDataProvider(data) {
        this.data = data;
    }

    _offlineDataProvider.prototype.getPage = _getPage;
    _offlineDataProvider.prototype.getAllData = _getAllData;

    function _getPage(startIndex, offset, columnForOrder, columnsToFilter) {
        return new Promise(passData.bind(this));

        function passData(resolve) {
            return _getDataResolver(this.data, startIndex, offset, columnForOrder, columnsToFilter).then(function (data) {
                return resolve(data);
            }, console.error);
        }
    }

    function _getAllData(columnForOrder, columnToFilter) {
        return new Promise(passData.bind(this));

        function passData(resolve) {
            return _getDataResolver(this.data, 0, this.data.length, columnForOrder, columnToFilter).then(function (data) {
                return resolve(data);
            }, console.error);
        }
    }

    function _getDataResolver(data, startIndex, offset, columnForOrder, columnsToFilter) {

        return _filterData().then(function (dataFiltered) {
            return _getDataOrdered(dataFiltered, columnForOrder).then(_returnDataProcessed);
        }, console.error);

        function _filterData() {

            return Promise.all(columnsToFilter.map(function (columnToFilter) {
                return Promise.all(_getResolvedValuesPromises(columnToFilter.value, data)).then(function (resolvedValues) {
                    return {
                        columnToFilter: columnToFilter,
                        resolvedValues: resolvedValues
                    };
                }, console.error);
            })).then(function (resolvedValuesData) {
                var assignedData = [];

                for (var i = 0; i < data.length; i++) {
                    var assignedElement = {
                        filters: []
                    };

                    for (var j = 0; j < resolvedValuesData.length; j++) {
                        assignedElement.filters.push({
                            columnToFilter: resolvedValuesData[j].columnToFilter,
                            value: resolvedValuesData[j].resolvedValues[i]
                        });
                    }
                    assignedElement.column = data[i];

                    assignedData.push(assignedElement);
                }

                return assignedData;
            }, console.error).then(function (assignedData) {
                return assignedData.filter(function (assignedElement) {
                    var finded = [];

                    for (var i = 0; i < assignedElement.filters.length; i++) {

                        var texto = String(assignedElement.filters[i].value);
                        var filtro = assignedElement.filters[i].columnToFilter.textToFilter;

                        var fnToFilter;

                        var filterCriteria = assignedElement.filters[i].columnToFilter.filterCriteria;
                        if (filterCriteria) {
                            if (typeof (filterCriteria) === "function") {
                                fnToFilter = function () {
                                    return filterCriteria(assignedElement.column, filtro);
                                };
                            } else {
                                if (typeof (filterCriteria) === "string") {
                                    fnToFilter = function () {
                                        return defaultFilterFunction(assignedElement.column[filterCriteria].toLowerCase(), filtro);
                                    };
                                } else {
                                    throw new Error("filterCriteria no compatible");
                                }
                            }
                        } else {
                            fnToFilter = function () {
                                return defaultFilterFunction(texto, filtro);
                            };
                        }

                        if (fnToFilter()) {
                            finded.push(true);
                        }
                    }

                    return finded.length === assignedElement.filters.length;
                });

                function defaultFilterFunction(texto, filtro) {
                    return texto.toLowerCase().indexOf(filtro.toLowerCase()) !== -1;
                }

            }, console.error).then(function (assignedDataFiltered) {
                return assignedDataFiltered.map(function (assignedElementFiltered) {
                    return assignedElementFiltered.column;
                });
            }, console.error);
        }

        function _returnDataProcessed(dataProcessed) {
            return new Promise(function (resolve) {
                let finalData = dataProcessed.slice(startIndex, startIndex + offset);
                return resolve({
                    total: dataProcessed.length,
                    rows: finalData
                });
            });
        }

    }

    function _getDataOrdered(dataFiltered, columnForOrder) {

        return Promise.all(_getResolvedValuesPromises(columnForOrder.value, dataFiltered)).then(_assignValuesToElement, console.error).then(_orderData, console.error);

        function _assignValuesToElement(resolvedValues) {
            return resolvedValues.map(function (resolveValue, index) {
                return {
                    resolveValue: resolveValue,
                    column: dataFiltered[index]
                }
            });
        }

        function _orderData(resolvedValuesData) {
            var orderFunction;

            if (columnForOrder.orderCriteria) {
                if (typeof (columnForOrder.orderCriteria) === "function") {
                    orderFunction = function (element, nextElement) {
                        return columnForOrder.orderCriteria(element, nextElement, columnForOrder);
                    }
                } else {
                    if (typeof (columnForOrder.orderCriteria) === "string") {
                        orderFunction = function (element, nextElement) {
                            return _defaultOrderFunction({
                                resolveValue: element.column[columnForOrder.orderCriteria]
                            }, {
                                resolveValue: nextElement.column[columnForOrder.orderCriteria]
                            });
                        }
                    } else {
                        throw new Error("El order criteria no es compatible");
                    }
                }
            } else {
                orderFunction = _defaultOrderFunction;
            }

            if(!resolvedValuesData) {
                console.error("No se resolvieron valores para ordenar la columna", columnForOrder);
                return [];
            }

            return resolvedValuesData.sort(orderFunction).map(function (dataOrdered) {
                return dataOrdered.column;
            });

            function _defaultOrderFunction(element, elementNext) {
                if (element.resolveValue > elementNext.resolveValue) {
                    return columnForOrder.orderDirection === 'desc' ? 1 : -1;
                } else if (element.resolveValue < elementNext.resolveValue) {
                    return columnForOrder.orderDirection === 'desc' ? -1 : 1;
                } else {
                    return 0;
                }
            }
        }

    }

    function _getResolvedValuesPromises(value, data) {
        return data.map(function (element) {
            return retriveValueOfData(element, value);
        })
    }

})(WEBC, WEBC.retriveValueOfData);

/**
 * Page provider, proveedor de paginas basado en local
 */
;
(function (WEBC) {
    "use strict";

    WEBC.BasicPageProvider = _basicPageProvider;

    function _basicPageProvider(dataProvider, numRowsByPage) {
        this.dataProvider = dataProvider;
        this.numRowsByPage = numRowsByPage;
    }

    _basicPageProvider.prototype.getPage = _getPage;

    function _getPage(numPage, columnForOrder, columnsToFilter) {
        if (!numPage)
            throw new Error("Proporcione un numero de pagina");

        return this.dataProvider.getPage((numPage - 1) * this.numRowsByPage, this.numRowsByPage, columnForOrder, columnsToFilter).then(_processResponse.bind(this), console.error);

        function _processResponse(res) {
            return {
                data: res.rows,
                nextPage: numPage === _getTotalPages(res, this.numRowsByPage) ? undefined : numPage + 1,
                previousPage: numPage === 1 ? undefined : numPage - 1,
                initPage: 1,
                finalPage: _getTotalPages(res, this.numRowsByPage),
                actualPage: numPage,
                numRowsByPage: this.numRowsByPage,
                total: res.total
            }
        }

        function _getTotalPages(res, numRowsByPage) {
            return Math.ceil(res.total / numRowsByPage);
        }
    }


})(WEBC);

/**
 * Proveedor de datos de la pagina local
 */
;
(function (WEBC, OfflineDataProvider, deepClone) {
    "use strict";

    WEBC.LocalPageProvider = _localPageProvider;

    function _localPageProvider(dataPageResolved) {
        this.dataPageResolved = deepClone(dataPageResolved);
    }

    _localPageProvider.prototype.getPage = _getPage;

    function _getPage(numPage, columnForOrder, columnsToFilter) {
        return new Promise(_processValue.bind(this));

        function _processValue(resolve, reject) {
            var dataProvider = new OfflineDataProvider(this.dataPageResolved.data);

            return dataProvider.getPage(0, dataProvider.data.length, columnForOrder, columnsToFilter).then((function (res) {
                this.dataPageResolved = Object.assign(this.dataPageResolved, {
                    data: res.rows,
                    total: res.total,
                    finalPage: 1,
                    nextPage: undefined
                });
                return resolve(this.dataPageResolved);
            }).bind(this), console.error);
        }
    }

})(WEBC, WEBC.OfflineDataProvider, WEBC.deepClone);

/**
 * Paginador formado por la definicion de página
 */
;
(function (WEBC, el, BasicButton, ButtonIcon, TableConfig, whenElementMounted) {
    "use strict";

    WEBC.Paginator = _paginator;

    function _paginator(page) {
        this.paginatorContainer = el("div").addClasses("ac-paginator", "ac-paginator__container");

        this.createPaginator(page);

        return this.paginatorContainer;
    }

    _paginator.prototype.createPaginator = _createPaginator;

    function _createPaginator(pagePromise) {
        pagePromise.then(_createPageFromData.bind(this), console.error);
    }

    function _createPageFromData(page) {
        this.paginatorContainer.removeChildren();

        var buttonGroup = el("div").addAttributes({
            role: "group"
        }).addClasses("paginator__buttons");

        var numPaginatorContainer = el("select").addClasses("form-control", "ac-paginator__number-pages");

        if (TableConfig.NUMBER_PAGES_OPTIONS.indexOf(page.numRowsByPage) === -1) {
            numPaginatorContainer.addChildren(
                el("option").addAttributes({
                    selected: "selected"
                }).addChildren(
                    el("div").addChildren(page.numRowsByPage)
                )
            );
        }

        TableConfig.NUMBER_PAGES_OPTIONS.forEach(function (numberPageOption) {
            var option = el("option").addChildren(
                el("div").addChildren(numberPageOption)
            );

            if (numberPageOption === page.numRowsByPage) {
                option.addAttributes({
                    selected: "selected"
                });
            }

            numPaginatorContainer.addChildren(
                option
            );
        });

        numPaginatorContainer.addEvent("change", (function (evt) {
            var customEvent = new CustomEvent(TableConfig.EVENTS.NUMER_BY_PAGE_CHANGE, {
                detail: {
                    numRowsByPage: Number(evt.target.value)
                }
            });

            this.paginatorContainer.dispatchEvent(customEvent);

        }).bind(this));

        this.paginatorContainer.addChildren(
            buttonGroup,
            numPaginatorContainer
        );

        buttonGroup.addChildren(el("span").addClasses("paginator-buttons-left").addChildren(
            addEventForPage(this.paginatorContainer, new ButtonIcon("angle-double-left"), page.initPage, page.actualPage),
            addEventForPage(this.paginatorContainer, new ButtonIcon("angle-left"), page.previousPage, page.actualPage)
        ));

        var buttonsNumbersContainer = el("span").addClasses("paginator-buttons-number-container");
        var buttonsNumbers = el("div").addClasses("paginator-buttons-number");

        for (var i = page.initPage; i <= page.finalPage; i++) {
            var buttonPage = addEventForPage(this.paginatorContainer, new BasicButton(i), i, page.actualPage);

            if (i === page.actualPage) {
                buttonPage.addClasses("active paginator-button-active");
            }

            buttonsNumbers.addChildren(
                buttonPage
            );
        }

        whenElementMounted(buttonsNumbers).then(function () {
            var elementContainer = buttonsNumbers;
            do {
                elementContainer = elementContainer.parentElement;
            } while (elementContainer != null && !elementContainer.matches(".ac-controls-container"));

            if (elementContainer === null) {
                console.error("No se encontro el elemento para montar");
            } else {
                var rect = elementContainer.getBoundingClientRect();
                buttonsNumbers.style.setProperty("max-width", (rect.width * .60) + "px");

                window.addEventListener("resize", function () {
                    if(!elementContainer) {
                        return;
                    }
                    if(elementContainer.getBoundingClientRect().width === rect.width) {
                        return;
                    }
                    var newRect = elementContainer.getBoundingClientRect();
                    buttonsNumbers.style.setProperty("max-width", (newRect.width * .60) + "px");
                    rect = newRect;
                });

            }

        });

        buttonsNumbersContainer.addChildren(buttonsNumbers);
        buttonGroup.addChildren(buttonsNumbersContainer);

        buttonGroup.addChildren(
            el("span").addClasses("paginator-buttons-right").addChildren(
                addEventForPage(this.paginatorContainer, new ButtonIcon("angle-right"), page.nextPage, page.actualPage),
                addEventForPage(this.paginatorContainer, new ButtonIcon("angle-double-right"), page.finalPage, page.actualPage)
            )
        );

        function addEventForPage(paginatorContainer, button, numPage, actualPage) {
            if (numPage === undefined || actualPage === numPage) {
                return button.addClasses("disabled");
            }

            button.addEvent("click", function () {
                var customEvent = new CustomEvent(TableConfig.EVENTS.NUM_PAGE_CHANGE, {
                    detail: {
                        currentPage: numPage
                    }
                });

                paginatorContainer.dispatchEvent(customEvent);
            });

            return button;
        }
    }


})(WEBC, WEBC.el, WEBC.BasicButton, WEBC.ButtonIcon, WEBC.TableConfig, WEBC.whenElementMounted);

/**
 * Botón para realizar la configuración
 */
;
(function (WEBC, el, ButtonIcon, TableConfig, ToolTip, uuid) {
    "use strict";

    WEBC.ButtonConfig = _buttonConfig;

    function _buttonConfig(config) {
        var buttonClean = new ButtonIcon("brush").addClasses("ac-table-config__button-clean icon-rotate-180").addAttributes({ title: "Limpiar"});
        var buttonConfig = new ButtonIcon("cogs").addAttributes({ title: "Configuración"});
        var buttonContainer;

        var uuidName = uuid();
        var uuidGlobal = uuid();
        var uuidLocal = uuid();

        var inputGlobal = el("input").addAttributes({
            type: "radio",
            name: uuidName,
            value: "global",
            id: uuidGlobal
        });

        var inputLocal = el("input").addAttributes({
            type: "radio",
            name: uuidName,
            value: "local",
            id: uuidLocal
        });

        if (config.defaultOrder === 'local') {
            inputLocal.addAttributes({
                checked: true
            });
        } else {
            inputGlobal.addAttributes({
                checked: true
            });
        }

        var global = el("div").addClasses("radio").addChildren(
            el("label").addChildren(
                inputGlobal,
                "Busqueda general"
            )
        );

        var local = el("div").addClasses("radio").addChildren(
            el("label").addChildren(
                inputLocal,
                "Página actual"
            )
        );

        var menu = el("div").addClasses("ac-table-config-tooltip-container").addChildren(
            global,
            local
        );
        var tooltipConfig = new ToolTip(buttonConfig, menu);

        buttonContainer = el("div").addChildren(
            buttonClean,
            tooltipConfig
        );

        buttonConfig.addEvent("click", function () {
            tooltipConfig.toggle();
        });

        buttonClean.addEvent("click", function () {
            buttonContainer.dispatchEvent(new CustomEvent(TableConfig.EVENTS.CLEAN_FILTER_ORDER_REQUEST));
        });

        menu.querySelector("#" + uuidGlobal).addEventListener("change", function (evt) {
            if (evt.target.checked) {
                buttonContainer.dispatchEvent(new CustomEvent(TableConfig.EVENTS.CHANGE_TO_GLOBAL_REQUEST));
            }
        });

        menu.querySelector("#" + uuidLocal).addEventListener("change", function (evt) {
            if (evt.target.checked) {
                buttonContainer.dispatchEvent(new CustomEvent(TableConfig.EVENTS.CHANGE_TO_LOCAL_REQUEST));
            }
        });


        return buttonContainer;
    }

})(WEBC, WEBC.el, WEBC.ButtonIcon, WEBC.TableConfig, WEBC.ToolTip, WEBC.uuid);

/**
 * Celda básica
 */
;
(function (WEBC, el, retriveValueOfData) {
    "use strict";

    WEBC.BasicCell = _basicCell;

    function _basicCell(element, howRetrive) {
        var cellTd = el("td").addClasses("ac-cell", "ac-cell--basic");
        var cell = el("div").addClasses("ac-cell--container-content");

        retriveValueOfData(element, howRetrive).then(function (value) {
            if (value === null || value === undefined) {
                value = "";
                console.debug("El valor para element: ", element, ", de esta forma: ", howRetrive, " no trajo resultado.");
            }
            cell.addChildren(
                el("div").addClasses("ac-cell__label-text").addChildren(value)
            );
        }, console.error);

        cellTd.addChildren(cell);
        cellTd.refs = {
            container: cell
        };
        return cellTd;
    }

})(WEBC, WEBC.el, WEBC.retriveValueOfData);

/**
 * Fila formada de celdas básica
 */
;
(function (WEBC, el, BasicCell, whenElementMounted, ajustHeightHeader, getHeight, retriveValueOfData, TableConfig, deepEqual, deepContains, ContextualMenu) {
    "use strict";

    WEBC.BasicRow = _basicRow;

    function _basicRow(originalElement, element, columnsDefinition, config) {
        var row = el("tr").addClasses("ac-row");
        if(config.menu) {
            row.addClasses("pointer");
        }
        row.references = {};
        var fixed = config.fixed;

        if (fixed > 0) {
            row.addClasses("ac-row--has-fixed", "translate-row-" + fixed);
        }

        if (config.hasCheck) {
            var checked = (function () {
                if (config.selection === 'multiple') {
                    return deepContains(config.detail.selection.multiple, element);
                } else if (config.selection === 'single') {
                    return deepEqual(config.detail.selection.single, element);
                } else {
                    return false;
                }
            })();

            var inputCheck = el("input").addAttributes({
                type: 'checkbox'
            }).addEvent("click", function (evt) {
                evt.stopPropagation();
                if (!config.allSelected) {
                    row.dispatchEvent(new CustomEvent(TableConfig.EVENTS.CLICK_ON_ROW, {
                        detail: {
                            element: originalElement,
                            viewElement: element
                        }
                    }));
                } else {
                    if (evt.target.checked) {
                        row.dispatchEvent(new CustomEvent(TableConfig.EVENTS.REMOVE_FROM_EXCLUDES, {
                            detail: originalElement
                        }));
                    } else {
                        row.dispatchEvent(new CustomEvent(TableConfig.EVENTS.EXCLUDE_FROM_ALL, {
                            detail: originalElement
                        }));
                    }
                }
            });

            if (config.allSelected) {
                if (!deepContains(config.detail.selection.excludes, originalElement)) {
                    inputCheck.addAttributes({
                        checked: true
                    });
                }
            } else {
                if (checked) {
                    inputCheck.addAttributes({
                        checked: checked
                    });
                }
            }

            var checkCell = el("td").addClasses("ac-cell", "ac-cell--check").addChildren(
                inputCheck
            );
            checkCell.style.setProperty("min-width", config.hasCheckSize ? config.hasCheckSize: "5rem");
            row.addChildren(checkcell);

            row.references.check = inputCheck;
        }

        columnsDefinition.forEach(function (definition, index) {
            var cell = new BasicCell(element, definition.value).addClasses("ac-cell").addClasses(definition.className || 'row-no-named');
            cell.style.setProperty("min-width", definition.size ? definition.size: "15rem");
            if (fixed > 0) {
                cell.addClasses("translate-col-" + index);
                cell.addClasses(index < fixed ? "ac-cell--fixed" : "ac-cell--no-fixed");
            }

            row.addChildren(cell);

            if (config.menu) {
                if (!ContextualMenu) {
                    throw new Error("No esta cargado el componente de ContextualMenu");
                }

                var menu = new ContextualMenu(cell.refs.container, config.menu, element);
            }
        });

        if (config.selection === 'single' || config.selection === 'multiple') {
            row.addClasses('ac-row--selectionable');

            if (config.selection === 'single') {
                if (deepEqual(config.detail.selection.single, element)) {
                    row.addClasses('ac-row--selected');
                }
            } else {
                if (deepContains(config.detail.selection.multiple, element)) {
                    row.addClasses('ac-row--selected');
                }
            }
        }

        row.currentHeight = 0;

        whenElementMounted(row).then(function () {
            row.currentHeight = ajustHeightHeader(row, "td");
        }, console.error);

        addResizeListener(row, function () {
            if (getHeight(row) === row.currentHeight) {
                return;
            }
            row.currentHeight = ajustHeightHeader(row, "td");
        });

        if (config.rowClasses) {

            for (var clazz in config.rowClasses) {
                _addClassforCriteria(element, config.rowClasses[clazz], clazz);
            }

        }

        function _addClassforCriteria(element, fnClazzCriteria, clazz) {
            retriveValueOfData(element, fnClazzCriteria).then(function (append) {
                if (append) {
                    row.addClasses(clazz);
                }
            }, console.error);
        }

        return row;
    }


})(WEBC, WEBC.el, WEBC.BasicCell, WEBC.whenElementMounted, WEBC.ajustHeightHeader, WEBC.getHeight, WEBC.retriveValueOfData, WEBC.TableConfig, WEBC.deepEqual, WEBC.deepContains, WEBC.ContextualMenu);

/**
 * Cuerpo de la tabla para la generacion de filas
 */
;
(function (WEBC, el, BasicRow, propagateEvent, TableConfig) {
    "use strict";

    WEBC.TableBody = _tableBody;

    function _tableBody(pageProviderPromise, columnsDefinition, config) {
        if (!pageProviderPromise)
            throw new Error("Proporcione un pageProviderPromise");

        this.fixed = config.fixed;

        pageProviderPromise.then(_createPage.bind(this), console.error);
        var body = el("tbody");

        function _createPage(res) {
            if (!res.data || !(res.data && res.data.length)) {
                var spanLenght = columnsDefinition.length || 0;
                body.addChildren(el("td").addClasses("ac-table__no-elements").addAttributes({
                    colspan: spanLenght
                }).addChildren("Sin elementos"));
                body.dispatchEvent(new CustomEvent(TableConfig.EVENTS.NUM_ROWS_CHANGE, {
                    detail: 0
                }));
                return;
            }
            body.dispatchEvent(new CustomEvent(TableConfig.EVENTS.NUM_ROWS_CHANGE, {
                detail: res.total
            }));

            var data = createDataView(res.data || []);
            body.resolvedData = res.data;
            data.forEach(function (element) {
                var row = new BasicRow(element.$originalElement, element.$viewElement, columnsDefinition, config);

                propagateEvent(TableConfig.EVENTS.CLICK_ON_ROW, row, body);
                propagateEvent(TableConfig.EVENTS.REMOVE_FROM_EXCLUDES, row, body);
                propagateEvent(TableConfig.EVENTS.EXCLUDE_FROM_ALL, row, body);

                row.addEvent("click", function () {
                    if (!config.allSelected) {
                        body.dispatchEvent(new CustomEvent(TableConfig.EVENTS.CLICK_ON_ROW, {
                            detail: {
                                element: element.$originalElement,
                                viewElement: element.$viewElement
                            }
                        }));
                    } else {
                        if (!row.references.check)
                            return;
                        if (row.references.check.checked) {
                            body.dispatchEvent(new CustomEvent(TableConfig.EVENTS.EXCLUDE_FROM_ALL, {
                                detail: element.$originalElement
                            }));
                        } else {
                            body.dispatchEvent(new CustomEvent(TableConfig.EVENTS.REMOVE_FROM_EXCLUDES, {
                                detail: element.$originalElement
                            }));
                        }
                        row.references.check.checked = !row.references.check.checked;
                    }
                });

                body.addChildren(row);
            });

        }

        return body;
    }


    function createDataView(data) {
        return data.map(function (originalElement) {
            return {
                $originalElement: originalElement,
                $viewElement: processDataView(originalElement)
            };
        });
    }

    function processDataView(element) {
        return element;
    }

})(WEBC, WEBC.el, WEBC.BasicRow, WEBC.propagateEvent, WEBC.TableConfig);


/**
 * Se crea la columna
 */
;
(function (WEBC, el, retriveValue, Icon, TableConfig, whenElementMounted) {
    "use strict";

    WEBC.Column = _column;

    function _column(column, index, fixed, config) {
        var th = el("th").addClasses(column.className ? column.className : "column-no-named");
        th.style.setProperty("min-width", column.size ? column.size: "15rem");
        th.style.setProperty("padding", "0.5rem");
        th.references = {
            columnDefinition: column
        };
        if (fixed > 0) {
            th.addClasses("translate-col-" + index);
            th.addClasses(index < fixed ? "ac-header__column--fixed" : "ac-header__column--no-fixed");
        }

        retriveValue(column.columnName).then(function (columnName) {
            var content = el("div").addClasses("ac-header__column-name");

            if (column.orderable !== false) {
                th.addClasses("ac-header__column--orderable");

                var icon;

                if (column.orderDirection) {
                    icon = column.orderDirection === 'desc' ? new Icon("caret-down") : new Icon("caret-up");
                } else {
                    icon = new Icon("minus");
                }

                icon.addClasses("ac-header__column-order");
                content.addChildren(icon);

                var newOrderDirection = column.orderDirection ? (column.orderDirection === 'desc' ? 'asc' : 'desc') : 'desc';
                th.addEvent("click", function () {
                    var customEvent = new CustomEvent(TableConfig.EVENTS.COLUMN_ORDER_CHANGE, {
                        detail: {
                            order: {
                                column: column,
                                direction: newOrderDirection
                            }
                        }
                    });

                    th.dispatchEvent(customEvent);
                });
            }

            content.addChildren(columnName);


            var filterContent = el("div").addClasses("ac-header__column-filter");

            if (column.filterable !== false) {
                th.addClasses("ac-header__column--filterable");
                filterContent.addClasses("ac-header__column-filter--has-filter", "has-feedback");

                var input = el("input").addAttributes({
                    type: "text"
                }).addClasses("form-control")
                    .addEvent("click", function (evt) {
                        evt.stopPropagation();
                    })
                    .addEvent("keyup", function (evt) {
                        if(config.defaultOrder === "local") {
                            var customEvent = new CustomEvent(TableConfig.EVENTS.FILTER_ELEMENTS_REQUEST);
                            setTimeout( ()=> evt.target.focus(), 100);
                            return th.dispatchEvent(customEvent);
                        } else {
                            if (evt.keyCode === TableConfig.ENTER) {
                                var customEvent = new CustomEvent(TableConfig.EVENTS.FILTER_ELEMENTS_REQUEST);
                                return th.dispatchEvent(customEvent);
                            }
                        }

                        if (evt.target.value) {
                            if (!filterContent.contains(buttonClean)) {
                                filterContent.addChildren(buttonClean);
                            }
                        } else {
                            if (filterContent.contains(buttonClean)) {
                                buttonClean.remove();
                            }
                        }
                    });

                th.references.input = input;

                if (column.textToFilter) {
                    input.addAttributes({
                        value: column.textToFilter
                    });
                }

                var buttonClean = el("span").addClasses("ac-header__column-filter-button").addChildren(
                    new Icon("times")
                ).addEvent("click", function () {
                    if (input.value) {
                        input.value = "";
                        th.dispatchEvent(new CustomEvent(TableConfig.EVENTS.FILTER_ELEMENTS_REQUEST));
                    }
                });

                filterContent.addChildren(
                    input
                );

                if (input.value) {
                    filterContent.addChildren(buttonClean);
                }
            }

            th.addChildren(el("div").addClasses("ac-header__content").addChildren(
                el("div").addClasses("ac-header__column-controls"),
                content,
                filterContent
            ));

        }, err => {
            console.error(err);
            console.error("No hay valor obtenido para la columna", column, err);
        });

        return th;
    }

})(WEBC, WEBC.el, WEBC.retriveValue, WEBC.Icon, WEBC.TableConfig, WEBC.whenElementMounted);



/**
 * Cabecera de tabla
 */
;
(function (WEBC, el, whenElementMounted, ajustHeightHeader, getHeight, Column, propagateEvent, TableConfig) {
    "use strict";

    WEBC.TableHeader = _tableHeader;

    function _tableHeader(columnsDefinition, config) {
        this.fixed = config.fixed;
        this.config = config;
        this.tableHeader = el("thead").addClasses("ac-header");
        this.createHeaderRow(columnsDefinition);

        return this.tableHeader;
    }

    _tableHeader.prototype.createHeaderRow = _createHeaderRow;

    function _createHeaderRow(columnsDefinition) {
        this.tableHeader.references = this.tableHeader.references || {};
        var rowHeader = el("tr").addClasses("ac-header__row");

        if (this.fixed > 0) {
            rowHeader.addClasses("ac-header__row--has-fixed", "translate-row-" + this.fixed);
        }

        this.tableHeader.references.columns = [];

        if (this.config.hasCheck) {
            var inputCheck = el("input").addAttributes({
                type: "checkbox"
            }).addEvent("click", (function (evt) {
                this.tableHeader.dispatchEvent(new CustomEvent(evt.target.checked ? TableConfig.EVENTS.SELECT_ALL_PAGE : TableConfig.EVENTS.CLEAN_SELECTED));
            }).bind(this));

            if (this.config.allSelected) {
                inputCheck.addAttributes({
                    checked: true
                });
            }

            let checkHeader = el("th").addClasses("ac-header__column--check").addChildren(
                inputCheck
            );
            checkHeader.style.setProperty("min-width", this.config.hasCheckSize ? this.config.hasCheckSize: "5rem");
            checkHeader.style.setProperty("padding", "0.5rem");
            rowHeader.addChildren(checkHeader);
        }

        columnsDefinition.forEach(_printRow.bind(this));

        this.tableHeader.addChildren(rowHeader);

        function _printRow(column, index) {
            var column = new Column(column, index, this.fixed, this.config);
            rowHeader.addChildren(column);

            propagateEvent(TableConfig.EVENTS.COLUMN_ORDER_CHANGE, column, this.tableHeader);
            propagateEvent(TableConfig.EVENTS.FILTER_ELEMENTS_REQUEST, column, this.tableHeader);

            this.tableHeader.references.columns.push(column);
        }

        rowHeader.maxHeight = 0;
        whenElementMounted(rowHeader).then(function () {
            _ajustHeightHeaderAndFilter();
        }, console.error);

        addResizeListener(rowHeader, function () {
            if (getHeight(rowHeader) === rowHeader.maxHeight) {
                return;
            }
            _ajustHeightHeaderAndFilter();
        });


        function _ajustHeightHeaderAndFilter() {
            ajustHeightHeader(rowHeader, "th");
            Array.from(rowHeader.querySelectorAll(".ac-header__column-filter")).forEach(function (el) {
                el.style.setProperty("position", "absolute");
            });
        }
    }


})(WEBC, WEBC.el, WEBC.whenElementMounted, WEBC.ajustHeightHeader, WEBC.getHeight, WEBC.Column, WEBC.propagateEvent, WEBC.TableConfig);


/**
 * Table
 */
;
(function (WEBC, el, TableHeader, TableBody, BasicPageProvider, Paginator, ButtonConfig, TableConfig, deepEqual,
           LocalPageProvider, whenElementMounted, propagateEvent, deepIndexOf, deepContains) {
    "use strict";

    WEBC.Table = _table;

    function _table(dataProvider, columnsDefinition, config) {

        if (!dataProvider)
            throw new Error("Proporcione un dataProvider");

        this.tableContainer = el("div").addClasses("ac-table-container").addChildren();
        this.createTable(dataProvider, columnsDefinition || {}, config || {});
        return this.tableContainer;
    }

    _table.prototype.createTable = _createTable;

    function _createTable(dataProvider, columnsDefinition, config, dataPageResolved) {

        config.numRowsByPage = config.numRowsByPage || 5;
        config.fixed = config.fixed || 0;
        config.currentPage = config.currentPage || 1;
        config.defaultOrder = config.defaultOrder || 'global';
        config.showConfig = config.showConfig === false ? false: true;

        config.detail = config.detail || {};
        config.detail.selection = config.detail.selection || {};
        config.detail.selection.multiple = config.detail.selection.multiple || [];
        config.detail.selection.excludes = config.detail.selection.excludes || [];

        if (_getColumnOrdered() === undefined) {
            columnsDefinition[0].orderDirection = 'desc';

            var i = 0;
            while(i < columnsDefinition.length) {
                if(columnsDefinition[i].orderable !== false) {
                    columnsDefinition[i].orderDirection = 'desc';
                    break;
                }
                i++;
            }
            _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
            return;
        }

        var pageProvider = new BasicPageProvider(dataProvider, config.numRowsByPage);
        var pageProviderPromise;

        if (config.defaultOrder === 'local') {
            if (!dataPageResolved) {
                _getPageProvider().then((function (dataPageResolved) {
                    _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
                }).bind(this), console.error);
                return;
            }
            pageProviderPromise = new LocalPageProvider(dataPageResolved).getPage(config.currentPage, _getColumnOrdered(), _getColumnsFiltered());
        } else {
            dataPageResolved = undefined;
            pageProviderPromise = _getPageProvider();
        }

        function _getPageProvider() {
            return pageProvider.getPage(config.currentPage, _getColumnOrdered(), _getColumnsFiltered());
        }

        var paginator = new Paginator(pageProviderPromise);

        paginator.addEvent(TableConfig.EVENTS.NUM_PAGE_CHANGE, _rechageTable.bind(this));
        paginator.addEvent(TableConfig.EVENTS.NUMER_BY_PAGE_CHANGE, _rechageTableWithNumberByPage.bind(this));

        function _rechageTable(evt) {
            config.currentPage = evt.detail.currentPage;
            _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
        }

        function _rechageTableWithNumberByPage(evt) {
            config.numRowsByPage = evt.detail.numRowsByPage;
            config.currentPage = 1;
            _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
        }

        var header = new TableHeader(columnsDefinition, config);
        var body = new TableBody(pageProviderPromise, columnsDefinition, config);

        header.addEvent(TableConfig.EVENTS.COLUMN_ORDER_CHANGE, _reorderTable.bind(this));
        header.addEvent(TableConfig.EVENTS.FILTER_ELEMENTS_REQUEST, _refilterTable.bind(this));
        header.addEvent(TableConfig.EVENTS.CLEAN_SELECTED, _cleanSelected.bind(this));
        header.addEvent(TableConfig.EVENTS.SELECT_ALL_PAGE, _selectAllPage.bind(this));

        if (config.selection === 'single' || config.selection === 'multiple') {
            body.addEvent(TableConfig.EVENTS.CLICK_ON_ROW, (function (evt) {

                config.detail.selection = config.detail.selection || {};
                var ce;

                if (config.selection === 'single') {
                    config.detail.selection.single = deepEqual(config.detail.selection.single, evt.detail.element) ? undefined : evt.detail.element;
                    ce = new CustomEvent(TableConfig.EVENTS.CLICK_ON_ROW, {
                        detail: {
                            element: config.detail.selection.single
                        }
                    });
                } else {
                    config.detail.selection.multiple = config.detail.selection.multiple || [];

                    var indexOf = deepIndexOf(config.detail.selection.multiple, evt.detail.element);
                    if (indexOf === -1) {
                        config.detail.selection.multiple.push(evt.detail.element);
                    } else {
                        config.detail.selection.multiple.splice(indexOf, 1);
                    }

                    ce = new CustomEvent(TableConfig.EVENTS.CLICK_ON_ROW, {
                        detail: {
                            collection: config.detail.selection.multiple,
                            element: evt.detail.element
                        }
                    });
                }

                this.tableContainer.dispatchEvent(ce);

                _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);

            }).bind(this));

            if (config.selection === "multiple") {
                body.addEvent(TableConfig.EVENTS.EXCLUDE_FROM_ALL, function (evt) {
                    config.detail.selection.excludes.push(evt.detail);
                });

                body.addEvent(TableConfig.EVENTS.REMOVE_FROM_EXCLUDES, function (evt) {
                    var indexOf = deepIndexOf(config.detail.selection.excludes, evt.detail);
                    if (indexOf !== -1) {
                        config.detail.selection.excludes.splice(indexOf, 1);
                    }
                });
            }
        }


        function _cleanSelected() {
            config.allSelected = false;
            _cleanData.bind(this)();
            _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
        }

        function _selectAllPage() {
            config.allSelected = true;
            pageProviderPromise.then((function (res) {
                config.detail.selection.multiple = res.data;
                _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
            }).bind(this));
        }

        function _reorderTable(evt) {
            config.currentPage = 1;
            for (var i in columnsDefinition) {
                if (deepEqual(evt.detail.order.column, columnsDefinition[i])) {
                    columnsDefinition[i].orderDirection = evt.detail.order.direction;
                } else {
                    delete columnsDefinition[i].orderDirection;
                }
            }
            _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
        }

        function _refilterTable(evt) {
            config.currentPage = 1;
            header.references.columns.forEach(function (column) {
                for (var i in columnsDefinition) {
                    if (deepEqual(column.references.columnDefinition, columnsDefinition[i])) {
                        columnsDefinition[i].textToFilter = column.references.input ? column.references.input.value : "";
                    }
                }
            });

            _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
        }

        function _getColumnOrdered() {
            for (var i in columnsDefinition) {
                if (columnsDefinition[i].orderDirection) {
                    return columnsDefinition[i];
                }
            }
            return undefined;
        }

        function _getColumnsFiltered() {
            return columnsDefinition.filter(function (column) {
                return column.textToFilter;
            });
        }

        var buttonConfig = new ButtonConfig(config);

        buttonConfig.addEvent(TableConfig.EVENTS.CLEAN_FILTER_ORDER_REQUEST, _cleanFiltersOrder.bind(this));
        buttonConfig.addEvent(TableConfig.EVENTS.CHANGE_TO_GLOBAL_REQUEST, _changeToGlobal.bind(this));
        buttonConfig.addEvent(TableConfig.EVENTS.CHANGE_TO_LOCAL_REQUEST, _changeToLocal.bind(this));

        function _cleanFiltersOrder() {
            _cleanData.bind(this)();
            config.currentPage = 1;

            _createTable.bind(this)(dataProvider, columnsDefinition.map(function (column) {
                delete column.textToFilter;
                delete column.orderDirection;

                return column;
            }), config, dataPageResolved);

        }

        function _cleanData() {

            config.detail.selection = {
                single: undefined,
                multiple: undefined,
                excludes: []
            };

            config.allSelected = false;

        }

        function _changeToGlobal() {
            _cleanData.bind(this)();
            config.defaultOrder = 'global';
            _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
        }

        function _changeToLocal() {
            _cleanData.bind(this)();
            config.defaultOrder = 'local';
            _createTable.bind(this)(dataProvider, columnsDefinition, config, dataPageResolved);
        }

        this.tableContainer.removeChildren();
        this.scrollContainer = el("div").addClasses("ac-scroll-table").addChildren(
            el("table").addClasses("ac-table", "table").addChildren(
                header,
                body
            )
        );

        var controlContainer = el("div").addClasses("ac-controls-container");

        if(config.showConfig) {
            controlContainer.addChildren(buttonConfig)
        }

        controlContainer.addChildren(paginator);

        this.tableContainer.addChildren(
            this.scrollContainer,
            controlContainer
        );

        this.tableContainer.resolveData = function () {
            if (config.allSelected && config.defaultOrder === 'global') {
                return dataProvider.getAllData(_getColumnOrdered(), _getColumnsFiltered()).then(function (data) {
                    return data.rows.filter(function (elem) {
                        if (deepContains(config.detail.selection.excludes, elem)) {
                            return false;
                        }
                        return true;
                    });
                });
            } else {
                return _getDataAsPromise();
            }
        };

        this.tableContainer.pageData = function () {
            return pageProviderPromise;
        };

        this.tableContainer.totalRows = 0;
        body.addEventListener(TableConfig.EVENTS.NUM_ROWS_CHANGE, (function (evt) {
            this.tableContainer.totalRows = evt.detail;
        }).bind(this));


        function _getDataAsPromise() {
            return new Promise(function (resolve) {
                if (config.selection === "multiple") {
                    return resolve(config.detail.selection.multiple.filter(function (elem) {
                        if (!config.allSelected)
                            return true;
                        return !deepContains(config.detail.selection.excludes, elem);
                    }));
                } else if (config.selection === "single") {
                    return resolve(config.detail.selection.single);
                } else {
                    return resolve(undefined);
                }
            });
        }

        whenElementMounted(this.tableContainer).then((function (element) {
            element.scrollIntoView();
        }).bind(this), console.error);
    }

})(WEBC, WEBC.el, WEBC.TableHeader, WEBC.TableBody, WEBC.BasicPageProvider, WEBC.Paginator, WEBC.ButtonConfig,
    WEBC.TableConfig, WEBC.deepEqual, WEBC.LocalPageProvider, WEBC.whenElementMounted, WEBC.propagateEvent,
    WEBC.deepIndexOf, WEBC.deepContains);

export default WEBC;