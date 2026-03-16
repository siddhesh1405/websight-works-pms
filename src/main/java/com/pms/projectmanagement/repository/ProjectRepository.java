package com.pms.projectmanagement.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pms.projectmanagement.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    boolean existsByTitleIgnoreCase(String title);
    boolean existsByTitleIgnoreCaseAndIdNot(String title, Long id);
}
