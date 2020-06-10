/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */
package mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad;

import java.io.Serializable;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 24/05/2017.
 */
public class PistaAuditoria implements Serializable{
    private static final long serialVersionUID = -5331553963017121579L;
    private int cantidad;

    private int idMovimiento;

    private String descripcion;



    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }

    public int getIdMovimiento() {
        return idMovimiento;
    }

    public void setIdMovimiento(int idMovimiento) {
        this.idMovimiento = idMovimiento;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    @Override
    public String toString() {
        return "PistaAuditoria{" +
                "cantidad=" + cantidad +
                ", idMovimiento=" + idMovimiento +
                ", descripcion='" + descripcion + '\'' +
                '}';
    }

}
