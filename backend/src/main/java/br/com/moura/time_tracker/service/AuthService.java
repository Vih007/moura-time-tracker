package br.com.moura.time_tracker.service;

import br.com.moura.time_tracker.exception.AuthenticationException;
import br.com.moura.time_tracker.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws AuthenticationException {
        return employeeRepository.findEmployeeByEmail(username).orElseThrow(() -> new AuthenticationException("Usuario ou senha invalidos"));
    }
}