package com.pms.projectmanagement.dto;

public class UserResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String roleName;

    public UserResponseDTO(Long id, String name, String email, String roleName) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roleName = roleName;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRoleName() {
        return roleName;
    }
}
