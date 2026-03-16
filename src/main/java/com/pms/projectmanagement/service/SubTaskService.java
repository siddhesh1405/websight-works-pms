package com.pms.projectmanagement.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pms.projectmanagement.dto.SubTaskDTO;
import com.pms.projectmanagement.enums.TaskStatus;
import com.pms.projectmanagement.entity.SubTask;
import com.pms.projectmanagement.entity.Task;
import com.pms.projectmanagement.entity.User;
import com.pms.projectmanagement.exception.ResourceNotFoundException;
import com.pms.projectmanagement.repository.SubTaskRepository;
import com.pms.projectmanagement.repository.TaskRepository;
import com.pms.projectmanagement.repository.UserRepository;

@Service
public class SubTaskService {

    private final SubTaskRepository subTaskRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public SubTaskService(SubTaskRepository subTaskRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository) {
        this.subTaskRepository = subTaskRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public SubTaskDTO createSubTask(SubTaskDTO dto) {

        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SubTask subTask = new SubTask();
        subTask.setTitle(dto.getTitle());
        subTask.setStatus(dto.getStatus());
        subTask.setTask(task);
        subTask.setUser(user);

        SubTask saved = subTaskRepository.save(subTask);

        return mapToDTO(saved);
    }

    public Page<SubTaskDTO> getAllSubTasks(Long taskId,
                                           TaskStatus status,
                                           Pageable pageable) {

        Page<SubTask> subTasks;

        if (taskId != null && status != null) {
            subTasks = subTaskRepository.findByTaskIdAndStatus(taskId, status, pageable);
        } else if (taskId != null) {
            subTasks = subTaskRepository.findByTaskId(taskId, pageable);
        } else if (status != null) {
            subTasks = subTaskRepository.findByStatus(status, pageable);
        } else {
            subTasks = subTaskRepository.findAll(pageable);
        }

        return subTasks.map(this::mapToDTO);
    }

    public SubTaskDTO getSubTaskById(Long id) {
        SubTask subTask = isCurrentUserAdmin()
                ? subTaskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("SubTask not found"))
                : subTaskRepository.findByIdAndUserEmail(id, getCurrentUserEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("SubTask not found"));

        return mapToDTO(subTask);
    }

    public SubTaskDTO updateSubTask(Long id, SubTaskDTO dto) {

        SubTask existing = subTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubTask not found"));

        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        existing.setTitle(dto.getTitle());
        validateStatusTransition(existing.getStatus(), dto.getStatus());
        existing.setStatus(dto.getStatus());
        existing.setTask(task);
        existing.setUser(user);

        SubTask updated = subTaskRepository.save(existing);

        return mapToDTO(updated);
    }

    public SubTaskDTO deleteSubTask(Long id) {

        SubTask existing = subTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SubTask not found"));

        subTaskRepository.delete(existing);

        return mapToDTO(existing);
    }

    public SubTaskDTO updateSubTaskStatus(Long id, TaskStatus status) {
        SubTask existing = isCurrentUserAdmin()
                ? subTaskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("SubTask not found"))
                : subTaskRepository.findByIdAndUserEmail(id, getCurrentUserEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("SubTask not found"));

        validateStatusTransition(existing.getStatus(), status);
        existing.setStatus(status);
        SubTask updated = subTaskRepository.save(existing);
        return mapToDTO(updated);
    }

    private void validateStatusTransition(TaskStatus current, TaskStatus next) {
        if (current == TaskStatus.COMPLETED && next != TaskStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed subtask cannot move back to planning/active");
        }
    }

    private String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new ResourceNotFoundException("Authenticated user not found");
        }
        return authentication.getName();
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private SubTaskDTO mapToDTO(SubTask subTask) {
        return new SubTaskDTO(
                subTask.getId(),
                subTask.getTitle(),
                subTask.getStatus(),
                subTask.getTask().getId(),
                subTask.getUser().getId()
        );
    }
}
