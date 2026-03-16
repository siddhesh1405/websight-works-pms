package com.pms.projectmanagement.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pms.projectmanagement.entity.SubTask;
import com.pms.projectmanagement.enums.TaskStatus;
import java.util.Optional;

public interface SubTaskRepository extends JpaRepository<SubTask, Long> {

    Page<SubTask> findByTaskId(Long taskId, Pageable pageable);

Page<SubTask> findByStatus(TaskStatus status, Pageable pageable);

Page<SubTask> findByTaskIdAndStatus(Long taskId,
                                    TaskStatus status,
                                    Pageable pageable);

Optional<SubTask> findByIdAndUserEmail(Long id, String userEmail);
}
