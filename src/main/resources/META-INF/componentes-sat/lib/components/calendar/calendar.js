import Common from './../common';

const el = Common.el;
const EventBus = Common.EventBus;
const BasicButton = Common.BasicButton;
const ButtonIcon = Common.ButtonIcon;
const FloatElement = Common.FloatElement;

var WEBC = {};
var DAYS = [{
        shortName: 'Dom.',
        fullName: 'Domingo'
    },
    {
        shortName: 'Lun.',
        fullName: 'Lunes'
    },
    {
        shortName: 'Mar.',
        fullName: 'Martes'
    },
    {
        shortName: 'Mie.',
        fullName: 'Miércoles'
    },
    {
        shortName: 'Jue.',
        fullName: 'Jueves'
    },
    {
        shortName: 'Vie.',
        fullName: 'Viernes'
    },
    {
        shortName: 'Sab.',
        fullName: 'Sabado'
    }
];

var MONTHS = [{
        shortName: 'Ene.',
        fullName: 'Enero'
    },
    {
        shortName: 'Feb.',
        fullName: 'Febrero'
    },
    {
        shortName: 'Mar.',
        fullName: 'Marzo'
    },
    {
        shortName: 'Abr.',
        fullName: 'Abril'
    },
    {
        shortName: 'May.',
        fullName: 'Mayo'
    },
    {
        shortName: 'Jun.',
        fullName: 'Junio'
    },
    {
        shortName: 'Jul.',
        fullName: 'Julio'
    },
    {
        shortName: 'Ago.',
        fullName: 'Agosto'
    },
    {
        shortName: 'Sep.',
        fullName: 'Septiembre'
    },
    {
        shortName: 'Oct.',
        fullName: 'Octubre'
    },
    {
        shortName: 'Nov.',
        fullName: 'Noviembre'
    },
    {
        shortName: 'Dic.',
        fullName: 'Diciembre'
    }
];

WEBC.MONTHS = MONTHS;
WEBC.getDaysOfMoth = _getDaysOfMoth;
WEBC.currentMonth = _currentMonth;
WEBC.today = _today;
WEBC.monthCollection = _monthCollection;
WEBC.prevMonth = _prevMonth;
WEBC.nextMonth = _nextMonth;
WEBC.formatDate = _formatDate;

function _getDaysOfMoth(year, month) {
    if (month < 0 || month > 11) throw new Error("El mes no es válido: " + month);

    return new Date(year, month + 1, 0).getDate();
}

function _currentMonth() {
    return (new Date()).getMonth();
}

function _today() {
    return (new Date()).getDate();
}

function _monthCollection(month, year) {
    var days = getDaysBeforeToCompleteWeek(year, month);
    var daysOfMonth = _getDaysOfMoth(year, month);

    for (var i = 0; i < daysOfMonth; i++) {
        var date = new Date(year, month, i + 1);
        days.push({
            date: date,
            nameDay: DAYS[date.getDay()],
            position: 'in'
        });
    }
    return days.concat(getDaysAfterToCompleteWeek(year, month, daysOfMonth));
}

function addDays(date, numdays) {
    var newDate = new Date(date.valueOf());
    newDate.setDate(date.getDate() + numdays);
    return newDate;
}

function _prevMonth(year, month) {
    var current = new Date(year, month, 1);
    current.setMonth(current.getMonth() - 1);
    return {
        year: current.getFullYear(),
        month: current.getMonth()
    }
}

function _nextMonth(year, month) {
    var current = new Date(year, month, 1);
    current.setMonth(current.getMonth() + 1);
    return {
        year: current.getFullYear(),
        month: current.getMonth()
    }
}

function getDaysBeforeToCompleteWeek(year, month) {
    var date = new Date(year, month, 1);
    var days = [];

    for (var i = date.getDay(); i > 0; i--) {
        var newDate = addDays(date, -i);
        days.push({
            date: newDate,
            nameDay: DAYS[newDate.getDay()],
            position: 'before'
        });
    }
    return days;
}

function getDaysAfterToCompleteWeek(year, month, finalDayOfMonth) {
    var date = new Date(year, month, finalDayOfMonth);
    var numberMissingDays = 6 - date.getDay();

    if (numberMissingDays === 0 && finalDayOfMonth === 28) {
        numberMissingDays = 7;
    }

    var days = [];
    for (var i = 0; i < numberMissingDays; i++) {
        var newDate = addDays(date, i + 1);
        days.push({
            date: newDate,
            nameDay: DAYS[newDate.getDay()],
            position: 'after'
        });
    }
    return days;
}

function _formatDate(date, format) {
    var orderReplaces = {
        'yyyy': date.getFullYear(),
        'yy': date.getFullYear().toString().substr(2, 2),
        'MM': addZeroIfNeed(date.getMonth() + 1),
        'M': date.getMonth() + 1,
        'dd': addZeroIfNeed(date.getDate()),
        'd': date.getDate()
    };
    var dateFormated = format;

    for (var i in orderReplaces) {
        dateFormated = dateFormated.replace(new RegExp(i, "g"), orderReplaces[i]);
    }

    return dateFormated;

    function addZeroIfNeed(value) {
        if (value.toString().length === 1) {
            return "0" + value;
        }
        return value;
    }
}

WEBC.DayElement = _dayElement;

var CLASSES = {
    'in': "days-view__day--in",
    'before': "days-view__day--before",
    'after': "days-view__day--after"
};

function _dayElement(eventBus, day, isCurrentDate, config) {
    var isBeforeDisabled = config.before && day.date.getTime() > config.before.setHours(0, 0, 0, 0);
    var isAfterDisabled = config.after && day.date.getTime() < config.after.setHours(0, 0, 0, 0);

    var dayContainer = el("div").addClasses("days-view__day-container");
    if (isCurrentDate) {
        dayContainer.addClasses("days-view__day-container--selected");
    }

    if(isBeforeDisabled) {
        dayContainer.addClasses("days-view__day-container--disabled");
    }

    if(isAfterDisabled) {
        dayContainer.addClasses("days-view__day-container--disabled");
    }

    initDayContainer(dayContainer, eventBus, day, isBeforeDisabled || isAfterDisabled);
    return dayContainer;
}

function initDayContainer(dayContainer, eventBus, day, isDisabled) {
    var dayElement = el("div").addClasses("days-view__day").addChildren(day.date.getDate());
    dayContainer.addChildren(dayElement);
    dayContainer.addClasses(CLASSES[day.position]);

    if(!isDisabled) {
        dayContainer.addEvent("click", function () {
            eventBus.dispatchSelectDate(day);
        });
    }
}


WEBC.DaysView = _daysView;

function _daysView(eventBus, config) {
    var viewContainer = el("div").addClasses("days-view");
    initDaysView(viewContainer, eventBus, config);
    return viewContainer;
}

function initDaysView(viewContainer, eventBus, config) {
    var collectionDays = _monthCollection(config.currentMonth, config.currentYear);

    collectionDays.forEach(function (day) {
        viewContainer.addChildren(new WEBC.DayElement(eventBus, day,
            day.date.getTime() === config.currentDay.getTime(),
            config
        ));
    });
}

WEBC.MonthsView = _monthsView;

function _monthsView(eventBus, config) {
    var viewContainer = el("div").addClasses("months-view");
    initMonthView(eventBus, viewContainer, config);
    return viewContainer;
}

function initMonthView(eventBus, viewContainer, config) {
    MONTHS.forEach(function (month, index) {
        viewContainer.addChildren(
            el("div").addClasses("months-view__month-container").addChildren(
                el("div").addClasses("months-view__month").addChildren(month.fullName)
            ).addEvent("click", function () {
                eventBus.dispatchGoToYearAndMonth({
                    year: config.currentYear,
                    month: index,
                    currentView: 'days'
                });
            })
        );
    });
}

WEBC.YearsView = _yearsView;

function _yearsView(eventBus, config) {
    var viewContainer = el("div").addClasses("years-view");
    initYearsView(eventBus, viewContainer, config);
    return viewContainer;
}

function initYearsView(eventBus, viewContainer, config) {
    var yearsBefore = 4;
    var yearsAfter = 8;
    for (var i = config.currentYearToSelect - yearsBefore; i < config.currentYearToSelect + yearsAfter; i++) {
        viewContainer.addChildren(
            el("div").addClasses("years-view__year-container").addChildren(
                el("div").addClasses("years-view__year").addChildren(i)
            ).addEvent("click", goToViewMonth(eventBus, i))
        );
    }
}

function goToViewMonth(eventBus, index) {
    return function () {
        eventBus.dispatchChangeViewTo({
            view: 'months',
            year: index
        });
    }
}

WEBC.CalendarControl = _calendarControl;

function _calendarControl(eventBus, config) {
    var calendarControl = el("div").addClasses("calendar-control");
    initCalendarControl(eventBus, calendarControl, config);
    return calendarControl;
}

function initCalendarControl(eventBus, calendarControl, config) {
    calendarControl.addChildren(
        createButtonPrev(eventBus, config),
        createButtonSelector(eventBus, config),
        createButtonNext(eventBus, config)
    );
}

function createButtonSelector(eventBus, config) {
    if (config.currentView === 'days') {
        return new BasicButton(MONTHS[config.currentMonth].fullName + " (" + config.currentYear + ")")
            .addClasses("calendar-control__button-selector", "calendar-control__button-selector--days")
            .addEvent('click', changeViewTo('months'));
    } else if (config.currentView === 'months') {
        return new BasicButton(config.currentYear)
            .addClasses("calendar-control__button-selector", "calendar-control__button-selector--months")
            .addEvent('click', changeViewTo('years'));
    } else if (config.currentView === 'years') {
        return new BasicButton("").addAttributes({
            disabled: true
        }).addClasses("calendar-control__button-selector", "calendar-control__button-selector--years");
    } else {
        throw new Error("No allowed button");
    }

    function changeViewTo(view) {
        return function () {
            eventBus.dispatchChangeViewTo({
                view: view
            });
        }
    }
}

function createButtonPrev(eventBus, config) {
    var prevButton = ButtonIcon("angle-left").addEvent("click", function () {
        if (config.currentView === 'days') {
            var yearMonth = _prevMonth(config.currentYear, config.currentMonth);
            return eventBus.dispatchGoToYearAndMonth(yearMonth);
        }
        if (config.currentView === 'years') {
            eventBus.dispatchChangeYearToSelect(config.currentYearToSelect - 12);
        }
    });

    if (config.currentView === 'months') {
        prevButton.addAttributes({
            disabled: true
        });
    }

    return prevButton;
}

function createButtonNext(eventBus, config) {
    var nextButton = new ButtonIcon("angle-right").addEvent("click", function () {
        if (config.currentView === 'days') {
            var yearMonth = _nextMonth(config.currentYear, config.currentMonth);
            return eventBus.dispatchGoToYearAndMonth(yearMonth);
        }
        if (config.currentView === 'years') {
            eventBus.dispatchChangeYearToSelect(config.currentYearToSelect + 12);
        }
    });

    if (config.currentView === 'months') {
        nextButton.addAttributes({
            disabled: true
        });
    }

    return nextButton;
}

WEBC.Calendar = _calendar;

function _calendar(config) {
    config = config || {};
    var calendarContainer = el("div").addClasses("calendar-container");
    var eventBus = new EventBus(calendarContainer, ["SelectDate", "GoToYearAndMonth", "ChangeViewTo", "ChangeYearToSelect"]);
    render(eventBus, calendarContainer, config);
    calendarContainer.eventBus = eventBus;
    return calendarContainer;
}

function render(eventBus, calendarContainer, config) {
    config.currentDay = config.currentDay || dateWithZeroHours();
    config.currentMonth = config.currentMonth === undefined ? config.currentDay.getMonth() : config.currentMonth;
    config.currentYear = config.currentYear || config.currentDay.getFullYear();
    config.currentView = config.currentView || 'days';
    config.currentYearToSelect = config.currentYearToSelect || config.currentYear;

    calendarContainer.setLimits = function (limits) {
      config.after = limits.after;
      config.before = limits.before;
      refresh(eventBus, calendarContainer, config);
    };

    eventBus.onSelectDate(function (evt) {
        config.currentDay = evt.detail.date;
        calendarContainer.dispatchEvent(new CustomEvent("date-selected", {
            detail: config.currentDay
        }));
        refresh(eventBus, calendarContainer, config);
    });

    eventBus.onGoToYearAndMonth(function (evt) {
        config.currentYear = evt.detail.year;
        config.currentMonth = evt.detail.month;
        config.currentView = evt.detail.currentView || config.currentView;
        refresh(eventBus, calendarContainer, config);
    });

    eventBus.onChangeViewTo(function (evt) {
        config.currentView = evt.detail.view;
        config.currentYear = evt.detail.year || config.currentYear;
        refresh(eventBus, calendarContainer, config);
    });

    eventBus.onChangeYearToSelect(function (evt) {
        config.currentYearToSelect = evt.detail;
        refresh(eventBus, calendarContainer, config);
    });

    init(eventBus, calendarContainer, config);
}

function init(eventBus, calendarContainer, config) {
    calendarContainer.addChildren(el("div").addClasses("calendar-view").addChildren(
        new WEBC.CalendarControl(eventBus, config),
        createView(eventBus, config)
    ));
}

function refresh(eventBus, calendarContainer, config) {
    calendarContainer.removeChildren();
    init(eventBus, calendarContainer, config);
}

function createView(eventBus, config) {
    if (config.currentView === 'days') {
        return new WEBC.DaysView(eventBus, config);
    } else if (config.currentView === 'months') {
        return new WEBC.MonthsView(eventBus, config);
    } else if (config.currentView === 'years') {
        return new WEBC.YearsView(eventBus, config);
    } else {
        throw new Error("View type not allowed");
    }
}

function dateWithZeroHours() {
    return new Date(new Date().setHours(0, 0, 0, 0));
}

export default WEBC;