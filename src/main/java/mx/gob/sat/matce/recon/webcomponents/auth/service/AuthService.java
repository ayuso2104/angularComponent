/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.auth.service;

import mx.gob.sat.matce.recon.webcomponents.auth.util.exception.AuthServiceException;

import java.security.Key;
import java.util.Date;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 26/04/2017.
 */

public interface AuthService {

    /**
     * Obtiene la llave para realizar el firmado
     *
     * @param bytes Los de bytes utilizados para generar la llave
     * @return Key
     * @throws AuthServiceException Lanzada al ocurrir un error al momento de generar la llave
     */
    Key getKey(byte[] bytes) throws AuthServiceException;

    /**
     * Obtiene la fecha en la que se esta generando la autehticacion
     *
     * @return Date
     */
    Date getIssuedAt();

    /**
     * Obtiene la fecha en que el token expirara
     *
     * @param duracion La duracion en minutos
     * @return Date
     * @throws AuthServiceException Generada cuando el valor de la duracion es <= 0
     */
    Date getExpiration(int duracion) throws AuthServiceException;


}
