/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */
package mx.gob.sat.matce.recon.webcomponents.sesion.web.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import mx.gob.sat.matce.recon.webcomponents.comun.bean.Rol;
import mx.gob.sat.matce.recon.webcomponents.sesion.web.dto.RolDTO;
import mx.gob.sat.matce.recon.webcomponents.sesion.web.dto.UsuarioBuilder;
import mx.gob.sat.matce.recon.webcomponents.sesion.web.dto.UsuarioDTO;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.logging.Level;
import mx.gob.sat.siat.modelo.dto.AccesoUsr;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez ruben.guzman@softtek.com on
 * 24/04/2017.
 * <p>
 * Clase encargada de cargar los roles temporales para realizar pruebas
 */
@Controller
public class SesionCtrl {

    private static final Logger LOG = LoggerFactory.getLogger(SesionCtrl.class);
    @Resource(name = "webComponentsConfig")
    private Properties config;
    @Resource
    private HttpServletRequest request;

    @Resource(name = "roles")
    private Map<String, Rol> roles;

    private static final List<UsuarioDTO> ACCESOS;

    static {
        ACCESOS = new LinkedList<UsuarioDTO>();
        ACCESOS.add(new UsuarioBuilder("LOMF5809", "FRANCISCO", "FRANCISCO", "MARTINEZ").setUsuario("LOMF580910RN2").setIp("99.90.24.217").build());
        ACCESOS.add(new UsuarioBuilder("VAST8301", "TOMAS ENRIQUE", "VALDEZ", "SANCHEZ").setUsuario("VAST830128NZ1").setIp("99.90.24.232").build());
        ACCESOS.add(new UsuarioBuilder("TAME7003", "EDGAR", "TAPIA", "MORENO").setUsuario("TAME700305PG8").setIp("99.90.24.175").build());
        ACCESOS.add(new UsuarioBuilder("BARA7508", "ANA ROSAURA", "BALDERAS", "RODRIGUEZ").setUsuario("BARA750820691").setIp("99.90.24.231").build());
        ACCESOS.add(new UsuarioBuilder("CASC53AH", "CUAUHTEMOC", "CASTRUITA", "SALAZAR").setUsuario("CASC531017DG7").setIp("99.90.24.219").build());
        ACCESOS.add(new UsuarioBuilder("COFA82CP", "ANDRICK ISRAEL", "COLIN", "FLORES").setUsuario("COFA821225GY3").setIp("99.90.24.230").build());
        ACCESOS.add(new UsuarioBuilder("CASA86B8", "Alejandro Virgilio", "Chapero", "Serrano").setUsuario("CASA8611088L9").build());
        ACCESOS.add(new UsuarioBuilder("DISB807C", "Bertha Alicia", "Diaz", "Sanchez").setUsuario("DISB800712Q36").setIp("99.99.99.101").build());
        ACCESOS.add(new UsuarioBuilder("LOPJ8011", "JUAN", "PENAFORT", "LOPEZ").setUsuario("LOPJ800101GS6").setIp("99.90.25.204").build());
        ACCESOS.add(new UsuarioBuilder("DISB8007", "BERTHA ALICIA", "DIAZ", "SANCHEZ").setUsuario("DISB800712Q36").setIp("99.90.24.44").build());
        ACCESOS.add(new UsuarioBuilder("GAHJ4812", "JUAN", "GARCIA", "HERNANDEZ").setUsuario("GAHJ48122184A").setIp("99.90.24.24").build());
        ACCESOS.add(new UsuarioBuilder("GULE6608", "ERNESTO", "GUERRERO", "LOPEZ").setUsuario("GULE6608181M3").setIp("99.90.51.171").build());
        ACCESOS.add(new UsuarioBuilder("CEMG7204", "GONZALO", "CERVERA", "MENDEZ").setUsuario("CEMG720429XX9").setIp("99.90.24.202").setCveAduana("17").setCveSeccion("171").build());
        ACCESOS.add(new UsuarioBuilder("PASM6209", "MARTIN JOEL", "PADILLA", "SANCHEZ").setUsuario("PASM620920185").setIp("99.90.24.204").setCveAduana("17").setCveSeccion("171").build());
        ACCESOS.add(new UsuarioBuilder("GAGN847T", "Norma Edith", "Garcia", "Garcilazo").setUsuario("GAGN847T").setIp("99.90.24.1").setCveAduana("7").setCveSeccion("70").build());
        ACCESOS.add(new UsuarioBuilder("LURP818N", "Paola Gabriela", "Lugo", "Romero").setUsuario("LURP818N").setIp("99.90.24.238").setCveAduana("16").setCveSeccion("160").build());
        ACCESOS.add(new UsuarioBuilder("MOPC84BO", "Carlos Alejandro", "Morales", "Payan").setUsuario("MOPC84BO").setIp("99.90.24.205").setCveAduana("16").setCveSeccion("160").build());
        ACCESOS.add(new UsuarioBuilder("BEVJ71CB", "Josue", "Benignos", "Vega").setUsuario("BEVJ71CB").setCveAduana("-1").setCveSeccion("-10").build());
        ACCESOS.add(new UsuarioBuilder("EAGL848R", "Leonel Arturo", "Escalona", "Gonzalez").setUsuario("EAGL840827IK7").setCveAduana("-1").setCveSeccion("-10").build());
        ACCESOS.add(new UsuarioBuilder("ZUSJ7405", "JULIO", "ZUMAYA", "SANTIAGO").setUsuario("ZUSJ740522I64").setIp("99.90.24.175").build());
        ACCESOS.add(new UsuarioBuilder("LOJM5902", "MARTIN RAUL", "LOPEZ", "JIMENEZ").setUsuario("LOJM590223N42").setIp("99.90.24.175").build());
        ACCESOS.add(new UsuarioBuilder("PICA805J", "Alejandro", "Priego", "Cornelio").setUsuario("PICA800519ID3").setIp("99.90.24.204").setCveAduana("17").build());
        ACCESOS.add(new UsuarioBuilder("NAHD746E", "Daniel", "Najera", "Hernandez").setUsuario("NAHD740614GI7").setIp("99.90.24.204").setCveAduana("17").build());
        ACCESOS.add(new UsuarioBuilder("CAMC867B", "CARLOS CESAR", "CANTU", "MANDRAGON").setUsuario("CAMC860711242").setIp("99.90.24.204").setCveAduana("17").build());
        ACCESOS.add(new UsuarioBuilder("LILR7995", "Rolando", "Lizarraga", "Lopez").setUsuario("LILR790905K4A").setIp("99.90.24.204").setCveAduana("17").build());
        ACCESOS.add(new UsuarioBuilder("PACM88BN", "Miriam", "Paco", "Cortes").setUsuario("PACM881123DI0").setIp("99.90.24.204").setCveAduana("17").build());
        ACCESOS.add(new UsuarioBuilder("LOLL81A1", "Liliana", "Lopez", "Lopez").setUsuario("LOLL811001HP2").setIp("99.90.24.106").setCveAduana("17").build());
    }

    /**
     * M&ecute;todo para cargar los roles para la prueba de la seciones.
     *
     * @return resp.9vn }
     */
    @RequestMapping(value = "/roles", method = RequestMethod.GET)
    @ResponseBody
    public List<RolDTO> cargarRoles() {
        if (!"true".equals(config.getProperty("FAKE_SESSION"))) {
            return null;
        }
        List<RolDTO> rolesAEnviar = new ArrayList<RolDTO>();

        for (Map.Entry<String, Rol> rol : this.roles.entrySet()) {
            rolesAEnviar.add(new RolDTO(rol.getValue().getToken(), rol.getKey(), rol.getValue().getDescripcion()));
        }
        return rolesAEnviar;
    }

    @RequestMapping(value = "/sesion", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Map<String, String>> cargarSession(HttpServletRequest request) {
        if (!"true".equals(config.getProperty("FAKE_SESSION"))) {
            return null;
        }
        AccesoUsr accesoUsr = new AccesoUsr();

        Enumeration enumeration = config.propertyNames();
        Map<String, String> mapa = new HashMap<String, String>();

        while (enumeration.hasMoreElements()) {
            String propertyName = String.valueOf(enumeration.nextElement());
            if (propertyName.startsWith("__session.")) {
                String propiedad = propertyName.replace("__session.", "");
                String valor = config.getProperty(propertyName);

                try {
                    String setMethodName = "set" + StringUtils.capitalize(propiedad);
                    boolean isMap = valor.startsWith("{");

                    Method method = accesoUsr.getClass().getMethod(setMethodName, isMap ? Map.class : String.class);
                    method.invoke(accesoUsr, isMap ? new ObjectMapper().readValue(valor, new TypeReference<Map<Integer, String>>() {
                    }) : valor);
                    mapa.put(propiedad, valor);
                } catch (NoSuchMethodException ex) {
                    LOG.error("No se obtuvo la propiedad {}, causa: ", propiedad, ex);
                } catch (SecurityException ex) {
                    LOG.error("No se obtuvo la propiedad por motivos de seguridad {}, causa: ", propiedad, ex);
                } catch (IllegalAccessException ex) {
                    LOG.error("No se obtuvo la propiedad acceso ilegal {}, causa: ", propiedad, ex);
                } catch (IllegalArgumentException ex) {
                    LOG.error("No se obtuvo la propiedad argumento ilegal {}, causa: ", propiedad, ex);
                } catch (InvocationTargetException ex) {
                    LOG.error("No se obtuvo la propiedad objetivo invalido {}, causa: ", propiedad, ex);
                } catch (IOException ex) {
                    LOG.error("No se obtuvo la propiedad IO {}, causa: ", propiedad, ex);
                }
            }
        }

        request.getSession(true).setAttribute("accesoEF", accesoUsr);

        return new ResponseEntity<Map<String, String>>(mapa, HttpStatus.OK);
    }

    @RequestMapping(value = "/borrar-sesion", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<Map<String, Object>> borrarSesion(HttpServletRequest request) {
        Map<String, Object> propiedades = new HashMap<String, Object>();

        request.getSession(true).removeAttribute("accesoEF");

        propiedades.put("sesionBorrada", "ok");
        return new ResponseEntity<Map<String, Object>>(propiedades, HttpStatus.OK);
    }

    /**
     * M&ecute;todo para cargar la sesi&ocute;n de prueba.
     *
     * @param roles Los roles seleccionados pro el usuario
     */
    @RequestMapping(value = "/roles", method = RequestMethod.POST)
    @ResponseBody
    public void cargarSessionPrueba(@RequestParam("roles") String roles, @RequestBody UsuarioDTO usuario) {

        if (!"true".equals(config.getProperty("FAKE_SESSION"))) {
            return;
        }
        usuario.setRoles(roles);
        request.getSession(true).setAttribute("accesoEF", usuario);

    }

    /**
     * M&eacute;todo que devuelve para los rfc de prueba.
     *
     * @return rfc
     */
    @RequestMapping(value = "/rfcs")
    @ResponseBody
    public List<UsuarioDTO> cargarRfcPrueba() {
        return ACCESOS;
    }

}
