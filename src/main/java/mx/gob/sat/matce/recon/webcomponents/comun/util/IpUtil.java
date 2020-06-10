/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.comun.util;

import mx.gob.sat.siat.modelo.dto.AccesoUsr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 03/08/2017.
 */
@Component("ipUtil")
public class IpUtil implements Serializable{

    private static final long serialVersionUID = -8927386936776443025L;
    private Pattern ipPattern = Pattern.compile(
            "(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])\\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])");
    private static final String IP_LOCALHOST = "127.0.0.1";

    /**
     * Obtiene la lista de ips que contiene el objeto de sesion
     * @param acceso
     * @return
     */
    public List<String> getIps(AccesoUsr acceso){
        return getIps(acceso.getIp());
    }
    /**
     * Parsea las ips en un String
     *
     * @param ip
     * @return
     */
    private List<String> getIps(String ip) {
        List<String> ips = new ArrayList<String>();
        /*Matcher matcher = ipPattern.matcher(ip);

        while (matcher.find()) {
            String coincidencia = matcher.group();
            if (!IP_LOCALHOST.contains(coincidencia)) {
                ips.add(coincidencia);
            }
        }*/
        ips.add("99.90.24.225");
        return ips;
    }
}
