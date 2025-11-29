package com.waterball.course.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    @Value("${storage.local.base-path:./uploads}")
    private String basePath;

    @Value("${storage.local.base-url:http://localhost:8888/uploads}")
    private String baseUrl;

    private Path uploadDir;

    @PostConstruct
    public void init() {
        uploadDir = Paths.get(basePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public String uploadFile(String path, MultipartFile file) {
        try {
            Path targetPath = uploadDir.resolve(path).normalize();
            if (!targetPath.startsWith(uploadDir)) {
                throw new RuntimeException("Invalid path: " + path);
            }
            Files.createDirectories(targetPath.getParent());
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return getFileUrl(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file: " + path, e);
        }
    }

    @Override
    public InputStream downloadFile(String path) {
        try {
            Path filePath = uploadDir.resolve(path).normalize();
            if (!filePath.startsWith(uploadDir)) {
                throw new RuntimeException("Invalid path: " + path);
            }
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to download file: " + path, e);
        }
    }

    @Override
    public void deleteFile(String path) {
        try {
            Path filePath = uploadDir.resolve(path).normalize();
            if (!filePath.startsWith(uploadDir)) {
                throw new RuntimeException("Invalid path: " + path);
            }
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + path, e);
        }
    }

    @Override
    public String getFileUrl(String path) {
        return baseUrl + "/" + path;
    }

    @Override
    public String generateSignedUrl(String path, int expirationSeconds) {
        return getFileUrl(path);
    }
}
