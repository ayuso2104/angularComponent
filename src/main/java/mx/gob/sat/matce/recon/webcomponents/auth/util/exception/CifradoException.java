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

public class CifradoException extends Exception {

    /**
     * Lanzada cuando ocurre un error al momento de descifrar o cifrado
     *
     * @param mensaje
     */
    public CifradoException(String mensaje, Exception e) {
        super(mensaje, e);
    }
}
