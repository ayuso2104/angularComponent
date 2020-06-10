/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.clienterest.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 *
 * @author Horacio S&acute;nchez D&icute;az
 */
@Controller
@RequestMapping(value = "/rest/**")
public class ClienteRest extends BaseClienteRest {

    public ClienteRest() {
        super("END_POINT");
    }

}
