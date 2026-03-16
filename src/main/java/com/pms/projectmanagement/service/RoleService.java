package com.pms.projectmanagement.service;

import com.pms.projectmanagement.repository.RoleRepository;
import com.pms.projectmanagement.entity.Role;
import com.pms.projectmanagement.exception.ResourceNotFoundException;

import java.util.List;


import org.springframework.stereotype.Service;

@Service
public class RoleService {
    
  
    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository){
        this.roleRepository = roleRepository;
    }

    public Role createRole(Role role){
        return roleRepository.save(role);
    }

    public List<Role> getAllRoles(){
        return roleRepository.findAll();
    }

    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
    }

    public Role updateRole(Long id, Role updatedRole) {
    
    Role existingRole = roleRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

    existingRole.setRoleName(updatedRole.getRoleName());

    return roleRepository.save(existingRole);

    }

    public Role deleteRole(Long id) {
        Role existingRole = roleRepository.findById(id)
             .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

      roleRepository.delete(existingRole);

        return existingRole;
    
    }



}
