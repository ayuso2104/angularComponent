/**
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */
package mx.gob.sat.matce.recon.webcomponents.clienterest.util.filtro;

import java.io.IOException;
import java.io.Serializable;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import mx.gob.sat.matce.recon.webcomponents.clienterest.web.controller.BaseClienteRest;
import mx.gob.sat.siat.modelo.dto.AccesoUsr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Validar si la peticion viene de una session activa.
 * 
 * @author javier.solis
 *
 */
public class ValidarSession implements Filter, Serializable {
    private static final String SIN_SESION_ACTIVA = "{\"msge\": \"Sesión expirada\"}";
    private static final String APPLICATION_JSON = "application/json";
    private static final String UTF = "UTF-8";
    private static final int SOY_UNA_TETERA = 401;
    private static final Logger LOG = LoggerFactory.getLogger(BaseClienteRest.class);

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.Filter#destroy()
     */
    @Override
    public void destroy() {

    }

    /*
     * Validar que la session siga activa
     * 
     */
    @Override
    public void doFilter(ServletRequest peticion, ServletResponse respuesta, FilterChain arg2)
            throws IOException, ServletException {
        HttpSession session = ((HttpServletRequest) peticion).getSession(true);
        AccesoUsr usr = (AccesoUsr) session.getAttribute("accesoEF");
        if (usr == null) {
            LOG.debug("Sin usuario para la peticion {} ", ((HttpServletRequest) peticion).getRequestURI() );
            ((HttpServletResponse) respuesta).setStatus(SOY_UNA_TETERA);
            ((HttpServletResponse) respuesta).setContentType(APPLICATION_JSON);
            ((HttpServletResponse) respuesta).setCharacterEncoding(UTF);
            ((HttpServletResponse) respuesta).getWriter().write(SIN_SESION_ACTIVA);
        } else {
            arg2.doFilter(peticion, respuesta);
        }
    }

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
     */
    @Override
    public void init(FilterConfig arg0) throws ServletException {

    }

}
