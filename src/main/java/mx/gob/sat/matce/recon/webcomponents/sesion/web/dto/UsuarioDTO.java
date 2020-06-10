/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.sesion.web.dto;

import mx.gob.sat.siat.modelo.dto.AccesoUsr;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 31/07/2017.
 */

public class UsuarioDTO extends AccesoUsr{

    private String cveAduana;

    private String cveSeccion;

    private String ipAsignada;

    public String getCveAduana() {
        return cveAduana;
    }

    public void setCveAduana(String cveAduana) {
        this.cveAduana = cveAduana;
    }

    public String getCveSeccion() {
        return cveSeccion;
    }

    public void setCveSeccion(String cveSeccion) {
        this.cveSeccion = cveSeccion;
    }

    public String getIpAsignada() {
        return ipAsignada;
    }

    public void setIpAsignada(String ipAsignada) {
        this.ipAsignada = ipAsignada;
    }

    @Override
    public String toString() {
        return "UsuarioDTO{" +
                "AccesoUsr['" + super.toString() + "\']" +
                "cveAduana='" + cveAduana + '\'' +
                ", cveSeccion='" + cveSeccion + '\'' +
                '}';
    }
}
