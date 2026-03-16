package com.pms.projectmanagement.repository;



import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pms.projectmanagement.entity.Task;
import com.pms.projectmanagement.enums.TaskStatus;

import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task , Long>{
    Page<Task> findByProjectId(Long projectId, Pageable pageable);
    Page<Task> findByStatus(TaskStatus status, Pageable pageable);
    Page<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status, Pageable pageable);
    Page<Task> findByUserEmail(String userEmail, Pageable pageable);
    Page<Task> findByProjectIdAndUserEmail(Long projectId, String userEmail, Pageable pageable);
    Page<Task> findByStatusAndUserEmail(TaskStatus status, String userEmail, Pageable pageable);
    Page<Task> findByProjectIdAndStatusAndUserEmail(Long projectId, TaskStatus status, String userEmail, Pageable pageable);
    Optional<Task> findByIdAndUserEmail(Long id, String userEmail);
}
