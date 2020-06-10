import './componentes-sat.scss';

import AccordionTab from './components/accordion/accordion';
import Selector from './components/selector/selector';
import Calendar from './components/calendar/calendar';
import Table from './components/table/table';
import Common from './components/common';
import Menu from './components/menu/menu';
import Modal from './components/modal/modal';
import SelectorMultiple from './components/selectorMultiple/selectorMultiple';

window.WEBC = {
    AccordionTab: AccordionTab,
    SelectorItems: Selector.SelectorItems,
    PanelSearch: Selector.PanelSearch,
    Calendar: Calendar.Calendar,
    OfflineDataProvider: Table.OfflineDataProvider,
    Table: Table.Table,
    el: Common.el,
    ContextualMenu: Menu.ContextualMenu,
    FloatElement: Common.FloatElement,
    formatDate: Calendar.formatDate,
    Modal: Modal.Modal,
    uuid: Common.uuid,
    confirm: Modal.confirm,
    message: Modal.message,
    messageError: Modal.messageError,
    SelectorMultiple: SelectorMultiple.SelectorMultiple,
    ButtonIcon: Common.ButtonIcon,
    deepEqual: Common.deepEqual,
    EventBus: Common.EventBus,
    retriveValue: Common.retriveValue,
    Icon: Common.Icon
};