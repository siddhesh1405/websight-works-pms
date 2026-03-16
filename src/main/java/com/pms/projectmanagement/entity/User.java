package com.pms.projectmanagement.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "users")
public class User {
    
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@NotBlank(message = "Name is required")
private String name;
@NotBlank(message = "Email is required")
@Email(message = "Email should be valid")   
private String email;
@NotBlank(message = "Password is required")
@JsonIgnore
private String password;
@NotNull(message = "Role is required")
@ManyToOne
@JoinColumn(name = "role_id")
private Role role;

public Long getId(){
        return id;
    }

    public String getName() {
        return name;
    }
 public String getEmail() {
        return email;
    }

    public void setId(Long id){
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    public Role getRole() {
    return role;
}
public void setRole(Role role) {
    this.role = role;
}


}
