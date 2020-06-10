/**
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 * <p>
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */
package mx.gob.sat.matce.recon.webcomponents.auth.dto;

import java.io.Serializable;
import java.util.Map;

/**
 * Clase que contendra todos los datos que se necesitan enviar en el token
 *
 * @author javier.solis
 *
 */
public class DatosUsuarioDTO implements Serializable {

    private static final long serialVersionUID = -5398776586606659132L;

    /**
     * Saber si el usuario se encuentra dado de alta en la base
     */
    private boolean estaEnBase;

    private String cveAduana;
    private String cveSeccion;
    private Map<String, Object> complementos;

    /**
     * @return the estaEnBase
     */
    public boolean getEstaEnBase() {
        return estaEnBase;
    }

    /**
     * @param estaEnBase
     *            the estaEnBase to set
     */
    public void setEstaEnBase(boolean estaEnBase) {
        this.estaEnBase = estaEnBase;
    }

    /**
     *
     * @return
     */
    public String getCveAduana() {
        return cveAduana;
    }

    /**
     *
     * @param cveAduana
     */
    public void setCveAduana(String cveAduana) {
        this.cveAduana = cveAduana;
    }


    public String getCveSeccion() {
        return cveSeccion;
    }

    public void setCveSeccion(String cveSeccion) {
        this.cveSeccion = cveSeccion;
    }

    public boolean isEstaEnBase() {
        return estaEnBase;
    }

    public Map<String, Object> getComplementos() {
        return complementos;
    }

    public void setComplementos(Map<String, Object> complementos) {
        this.complementos = complementos;
    }

    /* (non-Javadoc)
                 * @see java.lang.Object#toString()
                 */

    @Override
    public String toString() {
        return "DatosUsuarioDTO{" +
                "estaEnBase=" + estaEnBase +
                ", cveAduana='" + cveAduana + '\'' +
                ", cveSeccion='" + cveSeccion + '\'' +
                ", complementos=" + complementos +
                '}';
    }
}
