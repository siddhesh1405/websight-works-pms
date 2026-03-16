package com.pms.projectmanagement.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pms.projectmanagement.entity.Role;
import com.pms.projectmanagement.entity.User;
import com.pms.projectmanagement.exception.ResourceNotFoundException;
import com.pms.projectmanagement.repository.RoleRepository;
import com.pms.projectmanagement.repository.UserRepository;
import com.pms.projectmanagement.dto.UserRequestDTO;
import com.pms.projectmanagement.dto.UserResponseDTO;

@Service
public class UserService {
    private static final String PROTECTED_ADMIN_EMAIL = "admin@websightworks.org";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService (UserRepository userRepository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponseDTO createUser(UserRequestDTO requestDTO){
        Role role = roleRepository.findById(requestDTO.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        String normalizedEmail = requestDTO.getEmail() == null ? "" : requestDTO.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setName(requestDTO.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(requestDTO.getPassword()));
        user.setRole(role);

        User savedUser = userRepository.save(user);

        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().getRoleName()
        );
    }

    public Page<UserResponseDTO> getAllUsers(Pageable pageable){
        return userRepository.findAll(pageable)
                .map(user -> new UserResponseDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole().getRoleName()
                ));
    }

    public UserResponseDTO getUserById(Long id){
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().getRoleName()
        );
    }

    public UserResponseDTO updateUser(Long id, UserRequestDTO requestDTO) {

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String normalizedEmail = requestDTO.getEmail() == null ? "" : requestDTO.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailAndIdNot(normalizedEmail, id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        if (PROTECTED_ADMIN_EMAIL.equalsIgnoreCase(existingUser.getEmail())
                && !PROTECTED_ADMIN_EMAIL.equalsIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Protected admin email cannot be changed");
        }

        existingUser.setName(requestDTO.getName());
        existingUser.setEmail(normalizedEmail);
        existingUser.setPassword(passwordEncoder.encode(requestDTO.getPassword()));

        Role role = roleRepository.findById(requestDTO.getRoleId())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        existingUser.setRole(role);

        User updatedUser = userRepository.save(existingUser);

        return new UserResponseDTO(
                updatedUser.getId(),
                updatedUser.getName(),
                updatedUser.getEmail(),
                updatedUser.getRole().getRoleName()
        );
    }
    public UserResponseDTO deleteUser(Long id) {

        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isProtectedEmail = PROTECTED_ADMIN_EMAIL.equalsIgnoreCase(existingUser.getEmail());
        boolean isAdminRole = existingUser.getRole() != null
                && "ADMIN".equalsIgnoreCase(existingUser.getRole().getRoleName());

        if (isProtectedEmail || isAdminRole) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin user cannot be deleted");
        }

        userRepository.delete(existingUser);

        return new UserResponseDTO(
                existingUser.getId(),
                existingUser.getName(),
                existingUser.getEmail(),
                existingUser.getRole().getRoleName()
        );
    }


}
