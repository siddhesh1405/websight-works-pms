package com.pms.projectmanagement.controller;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.pms.projectmanagement.service.RoleService;

import jakarta.validation.Valid;

import com.pms.projectmanagement.entity.Role;

@RestController
@RequestMapping("/roles")
public class RoleController {

    
    private final RoleService roleService;

    public RoleController (RoleService roleService){
        this.roleService = roleService;
    }

    @PostMapping
    public Role createRole(@Valid @RequestBody Role role) {
        return roleService.createRole(role);
        
    }

    @GetMapping
    public List<Role> getAllRoles(){
        return roleService.getAllRoles();
    }

    @GetMapping("/{id}")
    public Role getRoleById(@PathVariable Long id){
        return roleService.getRoleById(id);
    }

@PutMapping("/{id}")
public Role updateRole(@PathVariable Long id,@Valid @RequestBody Role role) {
    return roleService.updateRole(id, role);
}

@DeleteMapping("/{id}")
public Role deleteRole(@PathVariable Long id){

    return roleService.deleteRole(id);
}
    
}
