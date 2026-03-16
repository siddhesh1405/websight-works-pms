package com.pms.projectmanagement.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import com.pms.projectmanagement.dto.TaskDTO;
import com.pms.projectmanagement.entity.Project;
import com.pms.projectmanagement.entity.Task;
import com.pms.projectmanagement.entity.User;
import com.pms.projectmanagement.enums.TaskStatus;
import com.pms.projectmanagement.exception.ResourceNotFoundException;
import com.pms.projectmanagement.repository.ProjectRepository;
import com.pms.projectmanagement.repository.TaskRepository;
import com.pms.projectmanagement.repository.UserRepository;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public TaskDTO createTask(TaskDTO dto) {

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setProject(project);
        task.setUser(user);

        Task savedTask = taskRepository.save(task);

        return mapToDTO(savedTask);
    }

    public TaskDTO getTaskById(Long id) {
        Task task = isCurrentUserAdmin()
                ? taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found"))
                : taskRepository.findByIdAndUserEmail(id, getCurrentUserEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        return mapToDTO(task);
    }

    public Page<TaskDTO> getAllTasks(Long projectId,
                                     TaskStatus status,
                                     Pageable pageable) {

        Page<Task> tasks;

        if (isCurrentUserAdmin()) {
            if (projectId != null && status != null) {
                tasks = taskRepository.findByProjectIdAndStatus(projectId, status, pageable);
            } else if (projectId != null) {
                tasks = taskRepository.findByProjectId(projectId, pageable);
            } else if (status != null) {
                tasks = taskRepository.findByStatus(status, pageable);
            } else {
                tasks = taskRepository.findAll(pageable);
            }
        } else {
            String currentUserEmail = getCurrentUserEmail();
            if (projectId != null && status != null) {
                tasks = taskRepository.findByProjectIdAndStatusAndUserEmail(projectId, status, currentUserEmail, pageable);
            } else if (projectId != null) {
                tasks = taskRepository.findByProjectIdAndUserEmail(projectId, currentUserEmail, pageable);
            } else if (status != null) {
                tasks = taskRepository.findByStatusAndUserEmail(status, currentUserEmail, pageable);
            } else {
                tasks = taskRepository.findByUserEmail(currentUserEmail, pageable);
            }
        }

        return tasks.map(this::mapToDTO);
    }

    public TaskDTO updateTask(Long id, TaskDTO dto) {

        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        existingTask.setTitle(dto.getTitle());
        existingTask.setDescription(dto.getDescription());
        validateStatusTransition(existingTask.getStatus(), dto.getStatus());
        existingTask.setStatus(dto.getStatus());
        existingTask.setProject(project);
        existingTask.setUser(user);

        Task updatedTask = taskRepository.save(existingTask);

        return mapToDTO(updatedTask);
    }

    public TaskDTO deleteTask(Long id) {

        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        taskRepository.delete(existingTask);

        return mapToDTO(existingTask);
    }

    public TaskDTO updateTaskStatus(Long id, TaskStatus status) {
        Task task = isCurrentUserAdmin()
                ? taskRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Task not found"))
                : taskRepository.findByIdAndUserEmail(id, getCurrentUserEmail())
                        .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        validateStatusTransition(task.getStatus(), status);
        task.setStatus(status);
        Task updated = taskRepository.save(task);
        return mapToDTO(updated);
    }

    private void validateStatusTransition(TaskStatus current, TaskStatus next) {
        if (current == TaskStatus.COMPLETED && next != TaskStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Completed task cannot move back to planning/active");
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

    private TaskDTO mapToDTO(Task task) {
        return new TaskDTO(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getProject().getId(),
                task.getUser().getId()
        );
    }
}
