package com.pms.projectmanagement.dto;

import com.pms.projectmanagement.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public class TaskStatusUpdateDTO {
    @NotNull(message = "Status is required")
    private TaskStatus status;

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
}
