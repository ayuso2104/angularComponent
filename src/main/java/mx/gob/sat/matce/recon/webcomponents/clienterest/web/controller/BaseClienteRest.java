/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 * <p>
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */
package mx.gob.sat.matce.recon.webcomponents.clienterest.web.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.io.IOException;
import java.io.Serializable;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Properties;
import java.util.Set;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.util.UriComponentsBuilder;

import mx.gob.sat.matce.recon.webcomponents.clienterest.dto.RespuestaGenerica;
import mx.gob.sat.matce.recon.webcomponents.clienterest.service.PistasAuditoriaService;
import mx.gob.sat.matce.recon.webcomponents.clienterest.util.ManejadorRespuestaError;
import mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad.MetodoMapper;
import mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad.PistaAuditoria;
import mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad.PistaAuditoriaException;
import mx.gob.sat.matce.recon.webcomponents.clienterest.util.seguridad.UrlMapper;
import mx.gob.sat.matce.recon.webcomponents.comun.util.IpUtil;
import mx.gob.sat.siat.modelo.dto.AccesoUsr;

/**
 * Prueba de un cliente rest gen&eacute;rico
 *
 * @author javier.solis
 */
public abstract class BaseClienteRest implements Serializable {

    private static final Logger LOG = LoggerFactory.getLogger(BaseClienteRest.class);
    private static final String CODIFICACION_DEFAULT = "UTF-8";
    private static final String URL_REMPLAZO_REGEXP = "/rest";
    private static final String ACCESO_USR = "accesoEF";
    private static final long serialVersionUID = -660514423779725420L;

    @Resource(name = "webComponentsConfig")
    private Properties config;

    @Resource
    private transient HttpServletRequest request;

    @Resource(name = "pistasAuditoria")
    private PistasAuditoriaService pistasAuditoriaService;

    @Resource(name = "urlsAFormatear")
    private transient List<UrlMapper> urlsAFormatear;

    @Resource(name = "ipUtil")
    private IpUtil ipUtil;

    private final String urlEndPoint;

    protected BaseClienteRest(String urlEndPoint) {
        this.urlEndPoint = urlEndPoint;
    }

    /**
     * Mapea todas las peticion con Content-Type "multipart/form-data"
     *
     * @param params Los par&aacute;metros en "form-data" que no son archivos
     * @param headers Las cabeceras de la petici&oacute;n
     * @param request La petici&oacute;n en formato Multipart (archivos)
     * @return ResponseEntity
     * @throws IOException Lanzada al momento de fallar la conversion de los
     * archivos de "form-param"
     */
    @RequestMapping(method = {RequestMethod.POST, RequestMethod.PUT}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> reenviarMultipart(HttpSession sesion, @RequestParam MultiValueMap<String, Object> params,
            @RequestHeader HttpHeaders headers, MultipartHttpServletRequest request)
            throws IOException, PistaAuditoriaException {

        /*
         * En algunos casos el navegador agrega al "Content-Type" "bundary" la
         * cual genera conflictos
         */
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        /*
         * Como se escribira una nueva peticion la primera cabecera de
         * "Content-Length" genera conflictos con el nuevo tamanio generado
         */
        headers.remove("Content-Length");

        params.putAll(getMapFiles(request.getMultiFileMap()));

        return obtenerRestTemplate().exchange(getUrl(sesion), HttpMethod.valueOf(request.getMethod()),
                new HttpEntity<MultiValueMap<String, Object>>(params, getAuthHeader(sesion, headers)), String.class);

    }

    /**
     * Parsea todas las peticion con Content-Type "application/json"
     *
     * @param body El cuerpo de la petici&ocute;n JSON
     * @param headers Las cabeceras de la peticion
     * @return ResponseEntity
     * @throws UnsupportedEncodingException Lanzada al momento de ocurrir un
     * error al decodificar el "query string" de la peticion
     */
    @RequestMapping(method = {RequestMethod.POST, RequestMethod.PUT}, consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> reenviarPostPut(HttpSession sesion, @RequestBody Object body,
            @RequestHeader HttpHeaders headers) throws UnsupportedEncodingException, PistaAuditoriaException {

        headers.remove("Content-Length");

        return obtenerRestTemplate().exchange(getUrl(sesion), HttpMethod.valueOf(request.getMethod()),
                new HttpEntity<Object>(body, getAuthHeader(sesion, headers)), String.class);

    }

    /**
     * < Mapea todas las URL de GET y POST
     *
     * @param headers Las cabeceras de la peticion
     * @return ResponseEntity
     */
    @RequestMapping(method = {RequestMethod.GET, RequestMethod.DELETE})
    public ResponseEntity<?> reenviarGetDelete(HttpSession sesion, @RequestHeader HttpHeaders headers)
            throws UnsupportedEncodingException, PistaAuditoriaException {

        ResponseEntity<?> respuesta = obtenerRestTemplate().exchange(getUrl(sesion),
                HttpMethod.valueOf(request.getMethod()), new HttpEntity(getAuthHeader(sesion, headers)), String.class);

        return reenviaResponseEntity(respuesta);
    }

    private HttpHeaders getAuthHeader(HttpSession session, HttpHeaders headers) {
        Object acceso = session.getAttribute("accesoEF");
        LOG.debug("El acceso es {} ", acceso);
        if (acceso != null) {
            try {
                String bodyJwt = new ObjectMapper().writeValueAsString(acceso);
                String token = Jwts.builder().setSubject(bodyJwt).signWith(SignatureAlgorithm.HS512, "__THE_KEY__".getBytes(Charset.forName("UTF-8"))).compact();

                headers.add("Authorization", "Bearer " + token);
            } catch (JsonProcessingException ex) {
                LOG.error("No se pudo convertir el acceso usr, causa: ", ex);
            }
        }
        LOG.debug("Los headers {}", headers);
        return headers;
    }

    /**
     * Obtiene el rest template configurado para realizar las peticiones
     *
     * @return RestTemplate
     */
    private RestTemplate obtenerRestTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setErrorHandler(new ManejadorRespuestaError());
        return restTemplate;
    }

    /**
     * Mapea la url de la petici&oacute;n
     *
     * @return String
     */
    private String getUrl(HttpSession sesion) throws UnsupportedEncodingException, PistaAuditoriaException {
        if (LOG.isDebugEnabled()) {
            LOG.debug("Autorizacion header {}", request.getHeader("Authorization"));
            LOG.debug("ACCESO USR: {}", sesion.getAttribute(ACCESO_USR));
        }

        String pathUrl = this.getPathUrl(request);
        UriComponentsBuilder urlBuilder = this.getUrlBuilder(request, pathUrl);

        Map<String, List<String>> queryParams = this.getQueryParamsRequeridos(sesion, pathUrl, request.getMethod());

        for (Map.Entry<String, List<String>> entry : queryParams.entrySet()) {
            for (String valor : entry.getValue()) {
                urlBuilder.queryParam(entry.getKey(), valor);
            }
        }

        return urlBuilder.build().toString();

    }

    /**
     * Obtiene el la el constructor de la nueva url a donde se realizara la
     * peticion
     *
     * @param request La peticion actual
     * @param pathUrl El path de la url
     * @return La nueva url
     * @throws UnsupportedEncodingException La codificacion a decodificar no es
     * soportada
     */
    private UriComponentsBuilder getUrlBuilder(HttpServletRequest request, String pathUrl)
            throws UnsupportedEncodingException {
        String queryString = request.getQueryString() != null ? request.getQueryString() : "";

        String url = getEndPointFromProps().concat(pathUrl).concat("?".concat(queryString));

        String urlDecodificada = URLDecoder.decode(url, CODIFICACION_DEFAULT);

        return UriComponentsBuilder.fromHttpUrl(urlDecodificada);
    }

    private String getEndPointFromProps() {
        if (!config.containsKey(urlEndPoint)) {
            throw new RuntimeException("No se encuentra la clave : " + urlEndPoint + " verifique su configuración");
        }
        return config.getProperty(urlEndPoint);
    }

    /**
     * Obtiene el path del la Url eliminando lo anterior a la palabra "rest" y
     * decodificandola en formato UTF-8
     *
     * @return El "path" de la estructura de la url
     */
    private String getPathUrl(HttpServletRequest request) throws UnsupportedEncodingException {
        int indiceRest = request.getRequestURI().indexOf(URL_REMPLAZO_REGEXP);
        String pathUrl = request.getRequestURI().substring(indiceRest + URL_REMPLAZO_REGEXP.length(), request.getRequestURI().length());
        return URLDecoder.decode(pathUrl, CODIFICACION_DEFAULT);
    }

    /**
     * Se ha probado para los MultiValueMap
     * <p>
     * Parsea un Mapa de {@link MultipartFile } a un mapa de
     * {@link MultiValueMap} para el envio en un {@link RestTemplate}
     *
     * @param multiValueMap Los archivos contenidos en la petici&oacute;n
     * @return MultiValueMap
     * @throws IOException Lanzada al no encontrar la codificaci&oacute;n
     * establecida
     */
    private MultiValueMap<String, Object> getMapFiles(MultiValueMap<String, MultipartFile> multiValueMap)
            throws IOException {
        MultiValueMap<String, Object> params = new LinkedMultiValueMap<String, Object>();
        Set<Entry<String, List<MultipartFile>>> archivos = multiValueMap.entrySet();

        for (Entry<String, List<MultipartFile>> archivoLlave : archivos) {
            for (MultipartFile file : archivoLlave.getValue()) {
                final String filename = file.getOriginalFilename();
                HttpHeaders fileHeaders = new HttpHeaders();
                fileHeaders.add("Content-Type", file.getContentType());
                ByteArrayResource a = new ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return filename;
                    }
                };
                HttpEntity<ByteArrayResource> archivoEntity = new HttpEntity<ByteArrayResource>(a, fileHeaders);
                params.add(archivoLlave.getKey(), archivoEntity);
            }
        }
        return params;

    }

    /**
     * Obtiene los parametros de folios e ips si son requeridos en la
     * configuracion, estos se agregaran como "Query String" a la nueva url
     *
     * @param sesion La sesion actual
     * @param url La url a generar la peticion
     * @param metodo El tipo de metodo utlizado Ej, POST, PUT
     * @return Lista de folios generados
     * @throws PistaAuditoriaException Se genera cuando ocurre un error de
     * insercion en las pistas
     */
    private Map<String, List<String>> getQueryParamsRequeridos(HttpSession sesion, String url, String metodo)
            throws PistaAuditoriaException {
        MetodoMapper metodoAFormatear = this.buscarMetodoAFormatear(urlsAFormatear, url, metodo);
        if (metodoAFormatear == null) {
            return Collections.emptyMap();
        }

        Map<String, List<String>> queryParams = new HashMap<String, List<String>>();

        if (metodoAFormatear.getPistaAuditoria() != null) {
            queryParams.put("folioPa", this.generarFoliosPista(sesion, metodoAFormatear.getPistaAuditoria()));
        }
        queryParams.put("ip", ipUtil.getIps((AccesoUsr) sesion.getAttribute(ACCESO_USR)));

        return queryParams;
    }

    /**
     * BUsca el metodo a que necesita generarse "Query params" para la peticion
     *
     * @param urlsAFormatear Lista de url que necesitan formato
     * @param pathUrl El path de la url
     * @param metodo El metodo de la peticion
     * @return El metodo que necesita formato
     */
    private MetodoMapper buscarMetodoAFormatear(List<UrlMapper> urlsAFormatear, String pathUrl, String metodo) {
        UrlMapper urlAFormatear = this.buscarUrl(urlsAFormatear, pathUrl);
        if (urlAFormatear == null || urlAFormatear.getMetodos() == null) {
            return null;
        }

        return this.buscarMetodo(urlAFormatear.getMetodos(), metodo);
    }

    /**
     * Busca si una url necesita ser formateada con pistas de auditoria o con
     * ips
     *
     * @param urlsAFormatear La lista de url que necesitan algun formato
     * @param pathUrl El path de la url a comparar
     * @return El objeto de url que necesita ser formateado
     */
    private UrlMapper buscarUrl(List<UrlMapper> urlsAFormatear, String pathUrl) {
        for (UrlMapper urlAFormatear : urlsAFormatear) {
            if (pathUrl.matches(urlAFormatear.getUrl())) {
                return urlAFormatear;
            }
        }
        return null;
    }

    /**
     * Busca el tipo de metodo dentro de una lista
     *
     * @param metodos Lista de metodos que tienen que ser formateados
     * @param nombreMetodo El nombre de metodo a formatear
     * @return El metodo si se encontro
     */
    private MetodoMapper buscarMetodo(List<MetodoMapper> metodos, String nombreMetodo) {
        for (MetodoMapper metodoAFormatear : metodos) {
            if (metodoAFormatear.getTipo().contains(nombreMetodo)) {
                return metodoAFormatear;
            }
        }
        return null;
    }

    /**
     * Genera una lista dependiendo del numero de pistas que se requieran para
     * la URL
     *
     * @param sesion La sesion actual del usuario
     * @param pista La pista a geneerar
     * @return Lista de folios
     * @throws PistaAuditoriaException Se genera cuando ocurre un error de
     * insercion en las pistas
     */
    private List<String> generarFoliosPista(HttpSession sesion, PistaAuditoria pista) throws PistaAuditoriaException {
        List<String> lista = new ArrayList<String>();

        for (int i = 0; i < pista.getCantidad(); i++) {
            lista.add(pistasAuditoriaService.generarFolioAuditoria(sesion, config.getProperty("PA_SISTEMA"),
                    config.getProperty("PA_PROCESO"), pista.getIdMovimiento(), pista.getDescripcion()));
        }

        return lista;
    }

    @ExceptionHandler(PistaAuditoriaException.class)
    public ResponseEntity<?> handleCustomException(PistaAuditoriaException e) {
        return new ResponseEntity<Object>(new RespuestaGenerica(e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Coloca cabeceras para evitar generar peticiones en cache
     *
     * @param respuesta {@link ResponseEntity}
     * @return La nueva {@link ResponseEntity}
     */
    private ResponseEntity<?> reenviaResponseEntity(ResponseEntity respuesta) {
        HttpHeaders headers = new HttpHeaders();
        headers.putAll(respuesta.getHeaders());

        addHeader(headers, "X-UA-Compatible", "IE=edge");
        addHeader(headers, "Cache-Control", "no-cache, no-store, must-revalidate");
        addHeader(headers, "Pragma", "no-cache");
        addHeader(headers, "Expires", "0");
        addHeader(headers, "If-Modified-Since", "Mon, 26 Jul 1997 05:00:00 GMT");

        return new ResponseEntity<Object>(respuesta.getBody(), headers, respuesta.getStatusCode());

    }

    private void addHeader(HttpHeaders httpHeaders, String key, String value) {
        if (!httpHeaders.containsKey(key)) {
            httpHeaders.add(key, value);
        }
    }

}
