package com.pms.projectmanagement.dto;

import com.pms.projectmanagement.enums.TaskStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class SubTaskDTO {

    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Status is required")
    private TaskStatus status;

    @NotNull(message = "Task is required")
    private Long taskId;

    @NotNull(message = "User is required")
    private Long userId;

    public SubTaskDTO() {
    }

    public SubTaskDTO(Long id, String title, TaskStatus status,
                      Long taskId, Long userId) {
        this.id = id;
        this.title = title;
        this.status = status;
        this.taskId = taskId;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public Long getTaskId() {
        return taskId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
