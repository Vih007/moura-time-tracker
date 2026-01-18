package br.com.moura.time_tracker.security;

import br.com.moura.time_tracker.dto.JWTUserData;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Component
public class JwtUtil {

    @Value("${jwt.secret:your-secret-key-change-in-production}")
    private String secret;

    @Value("${jwt.expiration:86400}")
    private long expirationTime;

    public String generateToken(Long userId, String email) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        Instant expiresAt = Instant.now().plus(expirationTime, ChronoUnit.SECONDS);

        return JWT.create()
                .withSubject(email)
                .withClaim("userId", userId)
                .withExpiresAt(expiresAt)
                .withIssuedAt(Instant.now())
                .sign(algorithm);
    }

    public Optional<JWTUserData> validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);

            DecodedJWT jwt = JWT.require(algorithm)
                    .build()
                    .verify(token);

            return Optional.of(
                    new JWTUserData(
                            jwt.getClaim("userId").asLong(),
                            jwt.getSubject()
                    )
            );
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Token inválido ou expirado", exception);
        }
    }

    public Long getUserIdFromToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .build()
                    .verify(token)
                    .getClaim("userId")
                    .asLong();
        } catch (JWTVerificationException exception) {
            throw new RuntimeException("Token inválido ou expirado", exception);
        }
    }
}