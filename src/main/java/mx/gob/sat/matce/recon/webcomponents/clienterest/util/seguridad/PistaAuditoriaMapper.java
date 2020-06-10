/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad;

import org.springframework.beans.factory.annotation.Required;

import java.util.List;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 30/05/2017.
 */

public class PistaAuditoriaMapper {


    private String sistema;
    private String proceso;
    private List<PistaAuditoria> pistas;

    public PistaAuditoriaMapper() {

    }

    public String getSistema() {
        return sistema;
    }

    @Required
    public void setSistema(String sistema) {
        this.sistema = sistema;
    }

    public String getProceso() {
        return proceso;
    }

    @Required
    public void setProceso(String proceso) {
        this.proceso = proceso;
    }

    public List<PistaAuditoria> getPistas() {
        return pistas;
    }

    public void setPistas(List<PistaAuditoria> pistas) {
        this.pistas = pistas;
    }
}
