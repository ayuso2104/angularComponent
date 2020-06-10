/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 03/08/2017.
 *
 * Contiene la informacion del nombre del metodo (GET, PUT, POST, etc) y que mapeado se utilizara,
 * agregar pistas de auditoria y/o agregar ip.
 */

public class MetodoMapper {

    private String tipo;

    private PistaAuditoria pistaAuditoria;

    private boolean ipRequerida;

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public PistaAuditoria getPistaAuditoria() {
        return pistaAuditoria;
    }

    public void setPistaAuditoria(PistaAuditoria pistaAuditoria) {
        this.pistaAuditoria = pistaAuditoria;
    }



    public boolean isIpRequerida() {
        return ipRequerida;
    }

    public void setIpRequerida(boolean ipRequerida) {
        this.ipRequerida = ipRequerida;
    }

    @Override
    public String toString() {
        return "MetodoMapper{" +
                "tipo='" + tipo + '\'' +
                ", pistasAuditoria=" + pistaAuditoria +
                ", ipRequerida=" + ipRequerida +
                '}';
    }
}
