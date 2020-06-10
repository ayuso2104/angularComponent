/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.auth.web.controller;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import mx.gob.sat.matce.recon.webcomponents.auth.dto.DatosUsuarioDTO;
import mx.gob.sat.matce.recon.webcomponents.auth.dto.TokenDTO;
import mx.gob.sat.matce.recon.webcomponents.auth.service.impl.RsaAuthService;
import mx.gob.sat.matce.recon.webcomponents.auth.util.exception.AuthServiceException;
import mx.gob.sat.matce.recon.webcomponents.comun.bean.Rol;
import mx.gob.sat.matce.recon.webcomponents.comun.util.IpUtil;
import mx.gob.sat.siat.modelo.dto.AccesoUsr;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez ruben.guzman@softtek.com on
 * 24/04/2017. Clase encargada de la generecion del token para la autenticacion,
 * asi como la carga de roles temporeales para las pruebas
 */
@Controller
public class AuthCtrl implements Serializable {
    private static final Logger LOG = LoggerFactory.getLogger(AuthCtrl.class);
    protected static final String ACCESO_USR = "accesoEF";
    private static final int DURACION_TOKEN = 200;
    private static final long serialVersionUID = 507043339840336701L;
    private static final String MENSAJE_ERROR_KEY = "mensajeError";
    private static final String MENSAJE_ERROR_GENERICO = "Ocurrío un error al obtener los datos del usuario";


    @Resource(name = "webComponentsConfig")
    private Properties config;

    @Resource
    private transient HttpServletRequest request;

    @Resource(name = "RsaAuthService")
    private RsaAuthService authService;

    @Resource(name = "roles")
    private transient Map<String, Rol> roles;

    @Resource(name = "ipUtil")
    private IpUtil ipUtil;

    /**
     * Obtiene la sesion actual y genera el JWT para la autenticacion posterior
 x    *
     * @return ResponseEntity
     */
    @RequestMapping(value = "/auth")
    @ResponseBody
    public ResponseEntity<?> autenticar() {

        HttpSession sesion = this.getSession();

        Map<String, String> error = new HashMap<String, String>();
        error.put("sesionFake", config.getProperty("FAKE_SESSION"));

        AccesoUsr acceso = (AccesoUsr) sesion.getAttribute(ACCESO_USR);

        LOG.debug("la session contiene en el accesso {} ", acceso);

        if (acceso == null) {
            error.put(MENSAJE_ERROR_KEY, "Sesión expirada");
            return new ResponseEntity<Object>(error, HttpStatus.UNAUTHORIZED);
        }


        try {
            DatosUsuarioDTO datosUsuario = this.obtenerDatosUsuario(acceso);
            if (!datosUsuario.getEstaEnBase()) {
                error.put(MENSAJE_ERROR_KEY,
                        "El usuario no se encuentra en la base de datos, consulte a su administrador");
                return new ResponseEntity<Object>(error, HttpStatus.UNAUTHORIZED);
            }

            return this.getToken(acceso, datosUsuario);


        } catch (HttpStatusCodeException e) {
            LOG.error("Ocurrio en la capa de servicio {}", e);
            error.put(MENSAJE_ERROR_KEY, this.getMensaje(e));
            return new ResponseEntity<Object>(error, HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            LOG.error("Ocurrío un error al momento de generar el token", e);
            error.put(MENSAJE_ERROR_KEY, MENSAJE_ERROR_GENERICO);
            return new ResponseEntity<Object>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }


    }

    private String getMensaje(HttpStatusCodeException e) {
        return (e.getResponseBodyAsString().startsWith("[ERR-")) ? e.getResponseBodyAsString() :
                MENSAJE_ERROR_GENERICO;
    }

    private ResponseEntity getToken(AccesoUsr acceso, DatosUsuarioDTO datosUsuario) throws IOException, AuthServiceException {
        String compactJws;
        String keyPath = config.getProperty("privateKey");
        byte[] keyBytes = this.getBytesFile(keyPath);

        LOG.debug("llenando la informacion del token");
        LOG.debug("session controller padre,  el usuario es rfc {}, y la ip \n valores {} {}", acceso.getRfcCorto(),
                acceso.getIp(), acceso.getRoles(), acceso.toArrayNombreValor());

        compactJws = Jwts.builder().setClaims(this.getPrivateClaims(acceso, datosUsuario)).setSubject("ADC")
                .setAudience("USR").setIssuer("SVR").setIssuedAt(authService.getIssuedAt())
                .setExpiration(authService.getExpiration(DURACION_TOKEN))
                .signWith(SignatureAlgorithm.RS512, authService.getKey(keyBytes)).compact();

        LOG.debug("el valor del token \n contiene {}", compactJws);
        LOG.debug("----------------- fin del padre----------------------");
        ResponseEntity<TokenDTO> respuesta = new ResponseEntity<TokenDTO>(new TokenDTO(compactJws), HttpStatus.OK);
        return agregarNoCacheHeaders(respuesta);


    }

    /**
     * javier.solis
     *
     * @param respuesta
     */
    private ResponseEntity<?> agregarNoCacheHeaders(ResponseEntity respuesta) {
        HttpHeaders headers = new HttpHeaders();
        headers.putAll(respuesta.getHeaders());

        headers.add("X-UA-Compatible", "IE=edge");
        headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
        headers.add("Pragma", "no-cache");
        headers.add("Expires", "0");
        headers.add("If-Modified-Since", "Mon, 26 Jul 1997 05:00:00 GMT");

        return new ResponseEntity<Object>(respuesta.getBody(), headers, respuesta.getStatusCode());

    }

    protected HttpSession getSession() {
        return request.getSession(true);
    }

    /**
     * javier.solis
     *
     * @return
     **/
    private DatosUsuarioDTO obtenerDatosUsuario(AccesoUsr acceso) {
        RestTemplate restTemplate = new RestTemplate();
        String url = obtenerUrlDatosSesion(acceso.getRfcCorto());
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(url);

        List<String> ips = ipUtil.getIps(acceso);

        for (String ip : ips) {
            builder.queryParam("ip", ip);
        }

        builder.queryParam("centroCosto", acceso.getCentroCostoOp());

        return restTemplate.getForObject(builder.build().encode().toUri(), DatosUsuarioDTO.class);
    }

    /**
     * javier.solis
     *
     * @return
     */
    private String obtenerUrlDatosSesion(String rfcCorto) {
        StringBuilder url = new StringBuilder();
        url.append(this.obtenerEndPoint()).append("/datos-usuario/").append(rfcCorto);
        return url.toString();
    }

    protected String obtenerEndPoint() {
        return config.getProperty("END_POINT");
    }

    /**
     * Obtiene la llave para el firmado del token
     *
     * @param path La direccion donde se encuentra el archivo @return
     *             byte[] @throws
     */
    private byte[] getBytesFile(String path) throws IOException {

        File privKeyFile = new File(path);
        BufferedInputStream bufferedInputStream;
        bufferedInputStream = new BufferedInputStream(new FileInputStream(privKeyFile));
        byte[] privKeyBytes = new byte[(int) privKeyFile.length()];
        bufferedInputStream.read(privKeyBytes);
        bufferedInputStream.close();

        return privKeyBytes;
    }

    /**
     * Obtiene un mapa de los valores del objeto AccesoUsr
     *
     * @param acceso El objeto de acceso de sesion
     * @return Map
     */
    protected Map<String, Object> getPrivateClaims(AccesoUsr acceso, DatosUsuarioDTO datosUsuario) {
        Map<String, Object> atributos = new HashMap<String, Object>();

        atributos.put("roles", getTokenRoles(acceso.getRoles()));
        atributos.put("cveAduana", datosUsuario.getCveAduana());
        atributos.put("cveSeccion", datosUsuario.getCveSeccion());
        atributos.put("rfc", acceso.getRfcCorto());
        atributos.put("usuario", acceso.getUsuario());

        if (datosUsuario.getComplementos() != null) {
            atributos.putAll(datosUsuario.getComplementos());
        }


        return atributos;
    }

    /**
     * Parsea la lista de roles separadas por comas a una cadena de su token
     * separada por comas
     *
     * @param roles Cadena de roles separadas por comas
     * @return String
     */
    private String getTokenRoles(String roles) {
        LOG.debug("el metodo get token {}", roles);
        String rolesAvalidar = (roles != null) ? roles : "";
        List<String> rolesList = Arrays.asList(rolesAvalidar.split(","));
        List<String> rolesMapeados = new ArrayList<String>();

        for (String rol : rolesList) {
            if (this.roles.containsKey(rol)) {
                rolesMapeados.add(this.roles.get(rol).getToken());
            }
        }
        LOG.debug("se mapearon {}", rolesMapeados);
        String tokenRoles = Arrays.toString(rolesMapeados.toArray());
        return tokenRoles.length() > 0 ? tokenRoles.replaceAll("[\\[\\] ]", "") : tokenRoles;
    }

}
