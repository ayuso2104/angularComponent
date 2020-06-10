/*
 * Todos los Derechos Reservados 2016 SAT
 * Servicio de Administracion Tributaria (SAT).
 *
 * Este software contiene informacion propiedad exclusiva del SAT considerada
 * confidencial. Queda totalmente prohibido su uso o divulgacion en forma
 * parcial o total
 */

package mx.gob.sat.matce.recon.webcomponents.auth.service.impl;

import mx.gob.sat.matce.recon.webcomponents.auth.util.exception.AuthServiceException;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.security.Key;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.KeySpec;
import java.security.spec.PKCS8EncodedKeySpec;

/**
 * Rub&eacute;n Guzm&aacute;n G&oacute;mez
 * ruben.guzman@softtek.com
 * on 26/04/2017.
 */
@Service("RsaAuthService")
public class RsaAuthService extends AbstractAuthService implements Serializable {

    private static final long serialVersionUID = 8479030392548497421L;

    /**
     * Obtiene la llave para realizar el firmado
     *
     * @return Key
     */
    @Override
    public Key getKey(byte[] keyBytes) throws AuthServiceException {
        Key key;
        try {
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            KeySpec ks = new PKCS8EncodedKeySpec(keyBytes);
            key = keyFactory.generatePrivate(ks);
        } catch (NoSuchAlgorithmException e) {
            throw new AuthServiceException("Error al generar la llave de RSA", e);
        } catch (InvalidKeySpecException e) {
            throw new AuthServiceException("Error al generar la llave de RSA", e);
        }
        return key;
    }


}
