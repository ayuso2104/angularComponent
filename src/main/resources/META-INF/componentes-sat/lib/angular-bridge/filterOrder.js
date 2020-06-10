import sortBy from 'lodash/sortBy';
import defaultTo from 'lodash/defaultTo';
import map from 'lodash/map';
import filter from 'lodash/filter';

/** @ngInject */
export default () => {
    return (input, attributeStr) => {
        return map(sortBy(filter(map(defaultTo(input, []), (it) => ({
            ...attributeStr(it),
            value: it
        })), it => it.index !== -1), ["index", "valueStr"]), it => it.value);
    }
}