package com.pms.projectmanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Role name is required")
    @Column(name = "role_name")
    private String roleName;

    public Long getId(){
        return id;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setId(Long id){
        this.id = id;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
}


