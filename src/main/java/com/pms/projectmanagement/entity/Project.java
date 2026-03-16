package com.pms.projectmanagement.entity;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name =  "projects")
public class Project {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@NotBlank(message = "Title is required")
private String title;
@NotBlank(message = "Description is required")
private String description;
@NotNull(message = "Start date is required")
@Column(name = "start_date")
private LocalDate startDate;
@NotNull(message = "End date is required")
@Column(name = "end_date")
private LocalDate endDate;

@OneToMany(mappedBy = "project")
@JsonManagedReference
private List<Task> tasks;

public List<Task> getTasks() {
    return tasks;
}

public void setTasks(List<Task> tasks) {
    this.tasks = tasks;
}
public Long getId(){
    return id;
}

public void setId(Long id){
    this.id = id;}

public String getTitle(){
    return title;
}

public void setTitle(String title){
    this.title = title;
}

public String getDescription(){
    return description;}

public void setDescription(String description){
    this.description = description;
}
public LocalDate getStartDate(){
    return startDate;}
public void setStartDate(LocalDate startDate){
    this.startDate = startDate;
}
public LocalDate getEndDate(){
    return endDate;
}
public void setEndDate(LocalDate endDate){
    this.endDate = endDate;

}   

    
}
