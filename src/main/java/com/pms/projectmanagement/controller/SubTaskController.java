package com.pms.projectmanagement.controller;



import org.springframework.data.domain.Pageable;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;

import com.pms.projectmanagement.dto.SubTaskDTO;
import com.pms.projectmanagement.dto.SubTaskStatusUpdateDTO;
import com.pms.projectmanagement.enums.TaskStatus;
import com.pms.projectmanagement.service.SubTaskService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/subtasks")

public class SubTaskController {
private final SubTaskService subTaskService;

    public SubTaskController(SubTaskService subTaskService) {
        this.subTaskService = subTaskService;
    }
    
    @PostMapping
    public SubTaskDTO createSubTask(@Valid @RequestBody SubTaskDTO dto){
        return subTaskService.createSubTask(dto);
    }

    @GetMapping
public Page<SubTaskDTO> getAllSubTasks(
        @RequestParam(required = false) Long taskId,
        @RequestParam(required = false) TaskStatus status,
        @ParameterObject Pageable pageable){

    return subTaskService.getAllSubTasks(taskId, status, pageable);
}

    @GetMapping("/{id}")
    public SubTaskDTO getSubTaskById(@PathVariable Long id){
        return subTaskService.getSubTaskById(id);   
    }

    @PutMapping("/{id}")
    public SubTaskDTO updateSubTask(@PathVariable Long id, @Valid @RequestBody SubTaskDTO dto){
        return subTaskService.updateSubTask(id, dto);
    }

    @DeleteMapping("/{id}")
    public SubTaskDTO deleteSubTask(@PathVariable Long id){
        return subTaskService.deleteSubTask(id);
    }

    @PatchMapping("/{id}/status")
    public SubTaskDTO updateSubTaskStatus(@PathVariable Long id, @Valid @RequestBody SubTaskStatusUpdateDTO dto) {
        return subTaskService.updateSubTaskStatus(id, dto.getStatus());
    }
}
