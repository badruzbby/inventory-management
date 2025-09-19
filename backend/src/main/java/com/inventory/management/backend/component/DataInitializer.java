package com.inventory.management.backend.component;

import com.inventory.management.backend.entity.User;
import com.inventory.management.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            log.info("Initializing default users...");

            // Create default admin user
            User admin = new User();
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole(User.Role.ADMIN);
            admin.setFullName("System Administrator");
            admin.setEmail("admin@inventory.com");
            admin.setActive(true);
            userRepository.save(admin);

            // Create default staff user
            User staff = new User();
            staff.setUsername("staff");
            staff.setPasswordHash(passwordEncoder.encode("staff123"));
            staff.setRole(User.Role.STAFF);
            staff.setFullName("Staff User");
            staff.setEmail("staff@inventory.com");
            staff.setActive(true);
            userRepository.save(staff);

            log.info("Default users created successfully!");
            log.info("Admin - Username: admin, Password: admin123");
            log.info("Staff - Username: staff, Password: staff123");
        }
    }
}
