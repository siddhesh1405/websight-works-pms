package com.pms.projectmanagement.service;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pms.projectmanagement.entity.Project;
import com.pms.projectmanagement.exception.ResourceNotFoundException;
import com.pms.projectmanagement.repository.ProjectRepository;
import com.pms.projectmanagement.dto.ProjectDTO;

@Service
public class ProjectService {
    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public ProjectDTO createProject(ProjectDTO dto) {

        validateProjectDates(dto);
        if (projectRepository.existsByTitleIgnoreCase(dto.getTitle().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Project title already exists");
        }

        Project project = new Project();
        project.setTitle(dto.getTitle());
        project.setDescription(dto.getDescription());
        project.setStartDate(dto.getStartDate());
        project.setEndDate(dto.getEndDate());

        Project savedProject = projectRepository.save(project);

        return new ProjectDTO(
                savedProject.getId(),
                savedProject.getTitle(),
                savedProject.getDescription(),
                savedProject.getStartDate(),
                savedProject.getEndDate()
        );
    }

    public Page<ProjectDTO> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable)
                .map(project -> new ProjectDTO(
                        project.getId(),
                        project.getTitle(),
                        project.getDescription(),
                        project.getStartDate(),
                        project.getEndDate()
                ));
    }

    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        return new ProjectDTO(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getStartDate(),
                project.getEndDate()
        );
    }

    public ProjectDTO updateProject(Long id, ProjectDTO dto) {
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        validateProjectDates(dto);
        if (projectRepository.existsByTitleIgnoreCaseAndIdNot(dto.getTitle().trim(), id)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Project title already exists");
        }

        existingProject.setTitle(dto.getTitle());
        existingProject.setDescription(dto.getDescription());
        existingProject.setStartDate(dto.getStartDate());
        existingProject.setEndDate(dto.getEndDate());

        Project updatedProject = projectRepository.save(existingProject);

        return new ProjectDTO(
                updatedProject.getId(),
                updatedProject.getTitle(),
                updatedProject.getDescription(),
                updatedProject.getStartDate(),
                updatedProject.getEndDate()
        );
    }

    public ProjectDTO deleteProject(Long id) {
        Project existingProject = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        projectRepository.delete(existingProject);

        return new ProjectDTO(
                existingProject.getId(),
                existingProject.getTitle(),
                existingProject.getDescription(),
                existingProject.getStartDate(),
                existingProject.getEndDate()
        );
    }

    private void validateProjectDates(ProjectDTO dto) {
        if (dto.getStartDate() != null && dto.getEndDate() != null && dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date cannot be before start date");
        }
    }
}
