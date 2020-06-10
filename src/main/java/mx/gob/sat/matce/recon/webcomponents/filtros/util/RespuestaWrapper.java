/**
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */
package mx.gob.sat.matce.recon.webcomponents.filtros.util;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletResponseWrapper;

/**
 * Wrapper para la respuesta
 * 
 * @author javier.solis
 *
 */
public class RespuestaWrapper extends HttpServletResponseWrapper {

    public RespuestaWrapper(HttpServletResponse response) {
        super(response);
    }

}