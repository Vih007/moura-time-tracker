package br.com.moura.time_tracker.security;

import br.com.moura.time_tracker.dto.JWTUserData;
import br.com.moura.time_tracker.exception.AuthenticationException;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400}")
    private long expirationTime;

    public String generateToken(UUID userId, String email, String role) {
        Algorithm algorithm = Algorithm.HMAC256(secret);
        Instant expiresAt = Instant.now().plus(expirationTime, ChronoUnit.SECONDS);

        return JWT.create()
                .withSubject(email)
                .withClaim("userId", String.valueOf(userId))
                .withClaim("role", role)
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
                            UUID.fromString(jwt.getClaim("userId").asString()),
                            jwt.getSubject(),
                            jwt.getClaim("role").asString()
                    )
            );
        } catch (JWTVerificationException exception) {
            throw new AuthenticationException("Token inválido ou expirado");
        }
    }
}