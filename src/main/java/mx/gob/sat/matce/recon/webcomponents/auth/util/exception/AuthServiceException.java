/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.auth.util.exception;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 26/04/2017.
 */

public class AuthServiceException extends Exception {

    /**
     * Constructor para la generacion de una exepcion del servicio de autenticacio
     */
    public AuthServiceException() {
        super();
    }

    /**
     * Constructor para la generacion de una exepcion del servicio de autenticacio
     *
     * @param mensaje El mensaje a mostrar
     */
    public AuthServiceException(String mensaje) {
        super(mensaje);
    }


    /**
     * Constructor para la generacion de una exepcion del servicio de autenticacio
     *
     * @param e La excepcion disparadora
     */
    public AuthServiceException(Exception e) {
        super(e);
    }

    /**
     * Constructor para la generacion de una exepcion del servicio de autenticacio
     *
     * @param mensaje El mensaje a mostrar
     * @param e       La excepcion disparadora
     */
    public AuthServiceException(String mensaje, Exception e) {
        super(mensaje, e);
    }

}
