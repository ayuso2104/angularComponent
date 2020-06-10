/*
 * Derechos Reservados 2016 SAT.
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * Confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total.
 *
 */
package mx.gob.sat.matce.recon.webcomponents.comun.dto;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.web.context.ContextLoader;
import org.springframework.web.context.WebApplicationContext;

import java.io.PrintWriter;
import java.io.Serializable;
import java.io.StringWriter;
import java.util.Properties;

/**
 * @author Octavio Martinez Jose
 *
 */
public class RespuestaRestDTO<T> implements Serializable {
    private static final Logger LOG = LoggerFactory.getLogger(RespuestaRestDTO.class);
    private static final int ERROR = 3;

    private int idError;
    private String descError;
    private T objRespuesta;

    private String errorLog;

    public RespuestaRestDTO (T objRespuesta) {
        this.objRespuesta = objRespuesta;
    }

    public RespuestaRestDTO () {

    }

    /**
     * @return the idError
     */
    public int getIdError() {
        return idError;
    }

    /**
     * @param idError
     *            the idError to set
     */
    public void setIdError(int idError) {
        this.idError = idError;
    }

    /**
     * @return the descError
     */
    public String getDescError() {
        return descError;
    }

    /**
     * @param descError
     *            the descError to set
     */
    public void setDescError(String descError) {
        this.descError = descError;
    }

    /**
     * @return the objRespuesta
     */
    public T getObjRespuesta() {
        return objRespuesta;
    }

    /**
     * @param objRespuesta
     *            the objRespuesta to set
     */
    public void setObjRespuesta(T objRespuesta) {
        this.objRespuesta = objRespuesta;
    }

    /**
     * recupera errorLog
     */
    public String getErrorLog() {
        return errorLog;
    }

    public void setError(String mensajeUsuario, Throwable e) {
        this.idError = ERROR;
        this.descError = mensajeUsuario;

        WebApplicationContext webApplicationContext = ContextLoader.getCurrentWebApplicationContext();
        Properties configuracion = null;
        if(webApplicationContext != null) {
             try {
                 configuracion = webApplicationContext.getBean("webComponentsConfig", Properties.class);
             } catch (BeansException ex) {
                 LOG.error("Se produjo un error de bean.", ex);
             }
        }
        if("true".equalsIgnoreCase(configuracion == null ? null: configuracion.getProperty("DEBUG_LOG"))) {
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            this.errorLog = sw.toString();
        }
    }

    @Override
    public String toString() {
        return "RespuestaRestDTO{" +
                "idError=" + idError +
                ", descError='" + descError + '\'' +
                ", objRespuesta=" + objRespuesta +
                ", errorLog='" + errorLog + '\'' +
                '}';
    }
}
