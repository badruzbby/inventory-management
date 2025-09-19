package com.inventory.management.backend.repository;

import com.inventory.management.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    Optional<User> findByEmail(String email);
    
    List<User> findByActiveTrue();
    
    List<User> findByRole(User.Role role);
    
    @Query("SELECT u FROM User u WHERE u.active = true AND u.role = :role")
    List<User> findActiveUsersByRole(User.Role role);
    
    boolean existsByUsername(String username);
    
    boolean existsByEmail(String email);
}
