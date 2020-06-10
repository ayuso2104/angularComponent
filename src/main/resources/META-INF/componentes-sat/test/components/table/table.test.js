import TableWEBC from '@src/components/table/table.js';

describe("Table debería", () => {

    test("existir", () => {
        let table = TableWEBC.Table;
        expect(table).not.toBeUndefined();
    });


});

describe("Columna debería", () => {

    test("Agregar la clase 'ac-header__column'", () => {
        let column = {
            columnName: () => "value",
            size: "5rem"
        };
        let index, fixed, config;
        let columna = new TableWEBC.Column(column, index, fixed, config);

        expect(columna.classList).not.toContain("ac-header__column");
        expect(columna.style.getPropertyValue("min-width")).toBe("5rem");
        expect(columna.style.getPropertyValue("padding")).toBe("0.5rem");
    });

    test("Agregar la clase 'ac-header__column'", () => {
        let column = {
            columnName: () => "value"
        };
        let index, fixed, config;
        let columna = new TableWEBC.Column(column, index, fixed, config);

        expect(columna.classList).not.toContain("ac-header__column");
        expect(columna.style.getPropertyValue("min-width")).toBe("15rem");
        expect(columna.style.getPropertyValue("padding")).toBe("0.5rem");
    });


});


describe("TableHeader debería", () =>{
    test("Agregar la clase 'ac-header__column'", () => {
        let columnsDefinition = [
            {
                columnName: () => 'value'
            }
        ];
        let config = {
            hasCheck: true
        };
        let tableHeader = new TableWEBC.TableHeader(columnsDefinition, config);
        let checkHeader = tableHeader.querySelector("tr").querySelector("th");

        expect(checkHeader.classList).toContain("ac-header__column--check");
        expect(checkHeader.classList).not.toContain("ac-header__column");
        expect(checkHeader.style.getPropertyValue("min-width")).toBe("5rem");
        expect(checkHeader.style.getPropertyValue("padding")).toBe("0.5rem");
    });

    test("Agregar la clase 'ac-header__column'", () => {
        let columnsDefinition = [
            {
                columnName: () => 'value'
            }
        ];
        let config = {
            hasCheck: true,
            hasCheckSize: '3rem'
        };
        let tableHeader = new TableWEBC.TableHeader(columnsDefinition, config);
        let checkHeader = tableHeader.querySelector("tr").querySelector("th");

        expect(checkHeader.classList).toContain("ac-header__column--check");
        expect(checkHeader.classList).not.toContain("ac-header__column");
        expect(checkHeader.style.getPropertyValue("min-width")).toBe("3rem");
        expect(checkHeader.style.getPropertyValue("padding")).toBe("0.5rem");
    })
});