/*
 * Derechos Reservados 2016 SAT.
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * Confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total.
 *
 */

package mx.gob.sat.matce.recon.webcomponents.clienterest.util.filtro;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.Serializable;

/**
 * @author Pablo Eliezer L&oacute;pez Santiago
 *         created on 15/08/2017.
 */
public class FiltroArchivo implements Filter, Serializable {

    private static final Logger LOG = LoggerFactory.getLogger(FiltroArchivo.class);


    @Override
    public void init(FilterConfig filterConfig) throws ServletException {

    }

    /**
     *
     * @param servletRequest
     * @param servletResponse
     * @param filterChain
     * @throws IOException
     * @throws ServletException
     */
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse
            , FilterChain filterChain) throws IOException, ServletException {

        String parameterUpload = servletRequest.getParameter("command");
        LOG.debug("Buacando virus al subir Archivo el atributo command file es: {} ", parameterUpload);
        String cabeceraVirus;
        if (parameterUpload != null && parameterUpload.equalsIgnoreCase("FileUpload")) {
            HttpServletRequest httpRequest = (HttpServletRequest) servletRequest;
            cabeceraVirus = httpRequest.getHeader("VIRUS_DETECTED");
            if (cabeceraVirus != null) {
                LOG.debug("Cabecera virus: {}", cabeceraVirus);
                if(cabeceraVirus.equalsIgnoreCase("YES")){
                    throw new ServletException("Imagen con virus");
                }
            }
        }
        filterChain.doFilter(servletRequest, servletResponse);
    }

    @Override
    public void destroy() {

    }
}
