/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad;

import java.util.List;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 03/08/2017.
 *
 * Contiene la url y el metodo al que se le aplicará la pista de auditoria y las ips si son necesarias
 */

public class UrlMapper {

    private String url;

    private List<MetodoMapper> metodos;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public List<MetodoMapper> getMetodos() {
        return metodos;
    }

    public void setMetodos(List<MetodoMapper> metodos) {
        this.metodos = metodos;
    }

    @Override
    public String toString() {
        return "UrlMapper{" +
                "url='" + url + '\'' +
                ", metodos=" + metodos +
                '}';
    }
}
