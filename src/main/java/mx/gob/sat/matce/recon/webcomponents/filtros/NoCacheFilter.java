/**
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */
package mx.gob.sat.matce.recon.webcomponents.filtros;

import java.io.IOException;
import java.io.Serializable;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;

import mx.gob.sat.matce.recon.webcomponents.filtros.util.RespuestaWrapper;

/**
 * Evitar la cache en las peticiones get
 * 
 * @author javier.solis
 *
 */
public class NoCacheFilter implements Filter, Serializable {

    private static final long serialVersionUID = -1210359575874315982L;

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.Filter#destroy()
     */
    @Override
    public void destroy() {
        // TODO Auto-generated method stub

    }

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.Filter#doFilter(javax.servlet.ServletRequest,
     * javax.servlet.ServletResponse, javax.servlet.FilterChain)
     */
    @Override
    public void doFilter(ServletRequest peticion, ServletResponse respuesta, FilterChain arg2)
            throws IOException, ServletException {
        HttpServletResponse respuestaCors = (HttpServletResponse) respuesta;
        RespuestaWrapper responseWrapper = new RespuestaWrapper(respuestaCors);
        responseWrapper.addHeader("X-UA-Compatible", "IE=edge");
        responseWrapper.addHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        responseWrapper.addHeader("Pragma", "no-cache");
        responseWrapper.addHeader("Expires", "0");
        responseWrapper.addHeader("If-Modified-Since", "Mon, 26 Jul 1997 05:00:00 GMT");

        arg2.doFilter(peticion, respuestaCors);
    }

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.Filter#init(javax.servlet.FilterConfig)
     */
    @Override
    public void init(FilterConfig arg0) throws ServletException {
        // TODO Auto-generated method stub

    }

}
