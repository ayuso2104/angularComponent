/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.auth.service.impl;

import mx.gob.sat.matce.recon.webcomponents.auth.service.AuthService;
import mx.gob.sat.matce.recon.webcomponents.auth.util.exception.AuthServiceException;

import java.util.Date;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 26/04/2017.
 */

abstract class AbstractAuthService implements AuthService {
    private static final int SEGUNDOS_EN_MINUTO = 60;
    private static final int MILISEGUNDOS_EN_SEGUNDO = 1000;

    /**
     * Obtiene la fecha en la que se esta generando la autehticacion
     *
     * @return Date
     */
    @Override
    public Date getIssuedAt() {
        return new Date();
    }

    /**
     * Obtiene la fecha en que el token expirara
     *
     * @param duracion La duracion en minutos
     * @return Date
     */
    @Override
    public Date getExpiration(int duracion) throws AuthServiceException {
        if (duracion <= 0) {
            throw new AuthServiceException("La duracion del debe ser mayor o igual a 0");
        }
        int expiracion = duracion * SEGUNDOS_EN_MINUTO * MILISEGUNDOS_EN_SEGUNDO;
        Date fechaActual = new Date();
        return new Date(fechaActual.getTime()+ expiracion);
    }
}
