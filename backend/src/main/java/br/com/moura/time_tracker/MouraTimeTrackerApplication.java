package br.com.moura.time_tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import jakarta.annotation.PostConstruct;

import java.util.TimeZone;

@SpringBootApplication
public class MouraTimeTrackerApplication {

	public static void main(String[] args) {
		SpringApplication.run(MouraTimeTrackerApplication.class, args);
	}

    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
    }
}
