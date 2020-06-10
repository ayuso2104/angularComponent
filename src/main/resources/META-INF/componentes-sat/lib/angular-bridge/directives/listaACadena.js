/** @ngInject */
export default ($log) => {
    const SUSPENSIVOS = "...";
    return {
        scope: {
            limite: '=limite',
            lista: '=lista',
            caracter: '=caracter',
            titulo: '=titulo'
        },
        link: ($scope, $element, $attr) => {

            let caracter = $scope.caracter ? $scope.caracter: ', ';
            let titulo = $scope.titulo ? $scope.titulo: 'Lista de elementos';

            let cadena = ($scope.lista || []).join(caracter);
            let span = document.createElement("span");

            if(cadena.length >= $scope.limite) {
                let a = document.createElement("a");
                a.textContent = cadena.substring(0, $scope.limite - SUSPENSIVOS.length) + SUSPENSIVOS;
                a.href = "";
                a.classList.add("anchor");
                a.addEventListener("click", function () {
                    mostrarListaCompleta($scope.lista, titulo);
                });
                span.appendChild(a);
            } else {
                span.textContent = cadena;
            }

            $element[0].appendChild(span);
        }
    };


    function mostrarListaCompleta(lista, titulo) {
        console.log("Mostrar la lista completa");
        let listContainer = document.createElement("div");
        let table = document.createElement("table");
        table.classList.add("table");
        table.classList.add("table-bordered");
        table.classList.add("table-striped");

        let tbody = document.createElement("tbody");

        lista.forEach( (element) => {
            let elContainer = document.createElement("tr");
            let elTd = document.createElement("td");
            elTd.textContent = element;
            elContainer.appendChild(elTd);
            tbody.appendChild(elContainer);
        });
        table.appendChild(tbody);
        listContainer.appendChild(table);
        let modal = new WEBC.Modal(titulo, listContainer, [
            {
                text: 'Cerrar',
                icon: 'times',
                action: () => modal.eventBus.dispatchCloseModal()
            }
        ]);
        modal.classList.add("ac-modal--small");
        document.body.appendChild(modal);
    }

}