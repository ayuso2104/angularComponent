/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.clienterest.service;


import mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad.PistaAuditoriaException;
import mx.gob.sat.siat.modelo.dto.SegbMovimientoDTO;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 29/05/2017.
 */


public interface PistasAuditoriaService {

    /**
     * Obtiene el numero de folio del movimiento generado
     *
     * @param movimiento El movimiento a realizar
     * @return La cadena que forma el folio
     * @throws PistaAuditoriaException Lanzada al ocurrir un error en la generacion del folio
     */
    String getFolioPista(SegbMovimientoDTO movimiento) throws PistaAuditoriaException;

    /**
     * Obtiene los numeros de folio generados para los movimientos
     *
     * @param movimientos Los movimientos a realizar
     * @return La lista de folios generados
     * @throws PistaAuditoriaException Lanzada al ocurrir un error en la generacion del folio
     */
    List<String> getFolioPista(List<SegbMovimientoDTO> movimientos) throws PistaAuditoriaException;


    /**
     * Genera el folio de la pista
     *
     * @param sesion La sesion actual del usuario
     * @param idProceso El identificador del proceso
     * @param idSistema El identificador del sistema
     * @param idMovimiento  El identificador del movimiento
     * @param descripcion  Breve descripcion del motivo de la insercion
     * @return El folio de la pista
     * @throws PistaAuditoriaException Lanzada al ocurrir un error en la generacion del folio
     */
    String generarFolioAuditoria(HttpSession sesion, String idProceso, String idSistema, int idMovimiento, String descripcion) throws PistaAuditoriaException;
}
