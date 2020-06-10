/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.sesion.web.dto;

import java.util.HashMap;
import java.util.Map;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 28/07/2017.
 */

public class UsuarioBuilder {

    private final String rfc;
    private final String nombre;
    private final String apPaterno;
    private final String apMaterno;
    private String ip;
    private String ethernetIp;
    private String centroCosto;
    private String centroDatos;
    private String centroCostoOp;
    private String usuario;
    private String cveAduana;
    private String cveSeccion;
    private Map<Integer, String> procesos;
    private static final String CONSTANTE_SESION = "accesoEF";

    public UsuarioBuilder(String rfc, String nombre, String apPaterno, String apMaterno) {
        this.rfc = rfc;
        this.nombre = nombre;
        this.apPaterno = apPaterno;
        this.apMaterno = apMaterno;
        this.centroCosto = "25";
        this.centroDatos = "3";
        this.centroCostoOp = "885";
        this.cveAduana = "17";
        this.cveSeccion = "170";
        this.ip = "99.90.24.195";
        this.ethernetIp = "[lo (Software Loopback Interface 1)=/127.0.0.1][lo (Software Loopback Interface 1)=/0:0:0:0:0:0:0:1][eth29 (VirtualBox Host-Only Ethernet Adapter)=/169.254.28.251][eth29 (VirtualBox Host-Only Ethernet Adapter)=/fe80:0:0:0:e9c8:4c24:513f:1cfb%eth29][eth31 (Broadcom NetXtreme Gigabit Ethernet Plus #15)=/99.90.24.195][eth31 (Broadcom NetXtreme Gigabit Ethernet Plus #15)=/fe80:0:0:0:7423:9064:7ddc:b692%eth31][eth32 (VMware Virtual Ethernet Adapter for VMnet1)=/192.168.252.1][eth32 (VMware Virtual Ethernet Adapter for VMnet1)=/fe80:0:0:0:f8d0:84f1:5fab:508e%eth32][eth33 (VMware Virtual Ethernet Adapter for VMnet8)=/192.168.192.1][eth33 (VMware Virtual Ethernet Adapter for VMnet8)=/fe80:0:0:0:20ae:3d9c:73a0:5979%eth33][net46 (Microsoft 6to4 Adapter)=/2002:635a:18f1:0:0:0:635a:18f1][eth41 (Cisco Systems VPN Adapter for 64-bit Windows)=/10.55.253.23][eth41 (Cisco Systems VPN Adapter for 64-bit Windows)=/fe80:0:0:0:4d7:3af2:a0d5:71a6%eth41]";
        this.procesos  = new HashMap<Integer, String>();

        int indiceProceso = 0;
        /*
         * Pistas auditoria SSI
         */
        this.procesos.put(++indiceProceso, "CET00103");

        /*
         * Pistas auditoria ORA
         */
        this.procesos.put(++indiceProceso, "CET00104");

        /*
         * Pistas auditoria Plantillador
         */
        this.procesos.put(++indiceProceso, "CET00065");

        this.procesos.put(++indiceProceso, "CET00131");



    }

    public UsuarioBuilder setCentroCosto(String centroCosto) {
        this.centroCosto = centroCosto;
        return this;
    }

    public UsuarioBuilder setCentroCostoOp(String centroCostoOp) {
        this.centroCostoOp = centroCostoOp;
        return this;
    }

    public UsuarioBuilder setCentroDatos(String centroDatos) {
        this.centroDatos = centroDatos;
        return this;
    }

    public UsuarioBuilder setUsuario(String usuario) {
        this.usuario = usuario;
        return this;
    }

    public UsuarioBuilder setCveAduana(String cveAduana) {
        this.cveAduana = cveAduana;
        return this;
    }

    public UsuarioBuilder setCveSeccion(String cveSeccion) {
        this.cveSeccion = cveSeccion;
        return this;
    }

    public UsuarioBuilder setIp(String ip) {
        this.ip = ip;
        this.ethernetIp = "[lo (Software Loopback Interface 1)=/127.0.0.1][lo (Software Loopback Interface 1)=/0:0:0:0:0:0:0:1][eth29 (VirtualBox Host-Only Ethernet Adapter)=/169.254.28.251][eth29 (VirtualBox Host-Only Ethernet Adapter)=/fe80:0:0:0:e9c8:4c24:513f:1cfb%eth29][eth31 (Broadcom NetXtreme Gigabit Ethernet Plus #15)=/".concat(ip).concat("][eth31 (Broadcom NetXtreme Gigabit Ethernet Plus #15)=/fe80:0:0:0:7423:9064:7ddc:b692%eth31][eth32 (VMware Virtual Ethernet Adapter for VMnet1)=/192.168.252.1][eth32 (VMware Virtual Ethernet Adapter for VMnet1)=/fe80:0:0:0:f8d0:84f1:5fab:508e%eth32][eth33 (VMware Virtual Ethernet Adapter for VMnet8)=/192.168.192.1][eth33 (VMware Virtual Ethernet Adapter for VMnet8)=/fe80:0:0:0:20ae:3d9c:73a0:5979%eth33][net46 (Microsoft 6to4 Adapter)=/2002:635a:18f1:0:0:0:635a:18f1][eth41 (Cisco Systems VPN Adapter for 64-bit Windows)=/10.55.253.23][eth41 (Cisco Systems VPN Adapter for 64-bit Windows)=/fe80:0:0:0:4d7:3af2:a0d5:71a6%eth41]");
        return this;
    }

    public UsuarioDTO build(){
        UsuarioDTO usr = new UsuarioDTO();
        usr.setUsuario(this.usuario);
        usr.setRfcCorto(this.rfc);
        usr.setNombreCompleto(this.nombre);
        usr.setPrimerApellido(this.apPaterno);
        usr.setSegundoApellido(this.apMaterno);
        usr.setIp(this.ethernetIp);
        usr.setIpAsignada(this.ip);
        usr.setTipoAuth("4");
        usr.setMenu("2");
        usr.setIdTipoPersona("2");
        usr.setCentroCosto(this.centroCosto);
        usr.setSessionID("6548");
        usr.setCentroDatos(this.centroDatos);
        usr.setCentroCostoOp(this.centroCostoOp);
        usr.setCveAduana(this.cveAduana);
        usr.setCveSeccion(this.cveSeccion);
        usr.setProcesos(this.procesos);
        usr.setSessionID(CONSTANTE_SESION);
        return usr;
    }


}

