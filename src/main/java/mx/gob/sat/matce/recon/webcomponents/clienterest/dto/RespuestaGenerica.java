/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.clienterest.dto;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 29/05/2017.
 */

public class RespuestaGenerica {

    private String msge;

    public RespuestaGenerica(String msge) {
        this.msge = msge;
    }

    public String getMsge() {
        return msge;
    }

    public void setMsge(String msge) {
        this.msge = msge;
    }
}
