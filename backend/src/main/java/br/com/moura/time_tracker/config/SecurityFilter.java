package br.com.moura.time_tracker.config;

import br.com.moura.time_tracker.dto.JWTUserData;
import br.com.moura.time_tracker.repository.EmployeeRepository; // <--- Importante
import br.com.moura.time_tracker.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final EmployeeRepository employeeRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authorizationHeader = request.getHeader("Authorization");

        if (Strings.isNotEmpty(authorizationHeader) && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring("Bearer ".length());

            Optional<JWTUserData> optionalJWTUserData = jwtUtil.validateToken(token);

            if (optionalJWTUserData.isPresent()) {
                JWTUserData jwtUserData = optionalJWTUserData.get();

                var userEntityOptional = employeeRepository.findByEmail(jwtUserData.email());

                if (userEntityOptional.isPresent()) {
                    UserDetails user = userEntityOptional.get();
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }
}