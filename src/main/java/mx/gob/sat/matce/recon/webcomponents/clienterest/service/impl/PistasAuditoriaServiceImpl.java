/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.clienterest.service.impl;

import mx.gob.sat.matce.recon.webcomponents.clienterest.service.PistasAuditoriaService;
import mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad.PistaAuditoriaException;
import mx.gob.sat.siat.exception.AccesoDenegadoException;
import mx.gob.sat.siat.exception.DaoException;
import mx.gob.sat.siat.modelo.dao.SegbMovimientosDAO;
import mx.gob.sat.siat.modelo.dto.SegbMovimientoDTO;
import mx.gob.sat.siat.util.MovimientoUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;
import java.io.Serializable;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 29/05/2017.
 */
@Service("pistasAuditoria")
@Scope(BeanDefinition.SCOPE_PROTOTYPE)
public class PistasAuditoriaServiceImpl implements PistasAuditoriaService, Serializable {

    private static final Logger LOG = LoggerFactory.getLogger(PistasAuditoriaServiceImpl.class);
    private static final long serialVersionUID = -1301705131294846811L;

    @Resource
    private SegbMovimientosDAO movimientosDAO;

    /**
     * Obtiene el numero de folio del movimiento generado
     *
     * @param movimiento El movimiento a realizar
     * @return La cadena que forma el folio
     * @throws PistaAuditoriaException
     */
    @Override
    public String getFolioPista(SegbMovimientoDTO movimiento) throws PistaAuditoriaException {
        LOG.debug(" El movimiento tiene movimientosDAO {}", movimientosDAO);
        BigInteger movimientoObtenido = null;
        try {
            movimientoObtenido = movimientosDAO.insert(movimiento);
            LOG.debug("se obtuvo el movimiento {}", movimientoObtenido);
            return movimientoObtenido.toString();
        } catch (DaoException e) {
            LOG.error("Ocurrio un error al momento de insertar el movimiento {}", movimiento, e);
            throw new PistaAuditoriaException("Ocurrio un error al momento de generar el folio del movimiento", e);
        } catch (Exception e) {
            LOG.error("Ocurrio un error al momento de insertar el movimiento {}, exception {}", movimientoObtenido, e);
            throw new PistaAuditoriaException("Ocurrio un error al momento de generar el folio del movimiento", e);
        }
    }

    /**
     * Obtiene los numeros de folio generados para los movimientos
     *
     * @param movimientos Los movimientos a realizar
     * @return La lista de folios generados
     * @throws PistaAuditoriaException
     */
    @Override
    public List<String> getFolioPista(List<SegbMovimientoDTO> movimientos) throws PistaAuditoriaException {
        List<String> folios = new ArrayList<String>();

        for (SegbMovimientoDTO movimiento : movimientos) {
            folios.add(this.getFolioPista(movimiento));
        }

        return folios;
    }

    /**
     * Genera el folio de la pista
     *
     * @param sesion La sesion actual del usuario
     * @return El folio de la pista
     * @throws PistaAuditoriaException
     */
    public String generarFolioAuditoria(HttpSession sesion, String idSistema, String idProceso,
                                        int idMovimiento, String descripcion) throws PistaAuditoriaException {
        try {
            return this.getFolioPista(MovimientoUtil.addMovimiento(sesion,
                    idSistema, idProceso, new Date(),
                    new Date(), idMovimiento, descripcion));

        } catch (AccesoDenegadoException e) {
            LOG.error("Ocurrió un error al momento de generar el folio para el movimiento [{} {} {} {}]", idSistema,
                    idProceso, idMovimiento, descripcion, e);
            throw new PistaAuditoriaException(
                    "Ocurrió un error al momento de generar el folio para el movimiento", e);

        } catch (Exception e) {
            LOG.error("Ocurrió un error al momento de generar el folio para el movimiento [{} {} {} {}] {}", idSistema,
                    idProceso, idMovimiento, descripcion, e);
            throw new PistaAuditoriaException(
                    "Ocurrió un error desconocido al momento de generar el folio para el movimiento", e);
        }
    }
}
