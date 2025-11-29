package com.waterball.course;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {"com.waterball.course", "com.waterballsa.backend"})
@EntityScan(basePackages = {"com.waterball.course", "com.waterballsa.backend"})
@EnableJpaRepositories(basePackages = {"com.waterball.course", "com.waterballsa.backend"})
public class CoursePlatformApplication {
    public static void main(String[] args) {
        SpringApplication.run(CoursePlatformApplication.class, args);
    }
}
