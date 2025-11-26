package com.waterball.course.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "mock", matchIfMissing = true)
public class MockStorageService implements StorageService {
    
    @Override
    public String uploadFile(String path, MultipartFile file) {
        return "mock://uploaded/" + path;
    }
    
    @Override
    public InputStream downloadFile(String path) {
        return new ByteArrayInputStream(new byte[0]);
    }
    
    @Override
    public void deleteFile(String path) {
    }
    
    @Override
    public String getFileUrl(String path) {
        return "mock://storage/" + path;
    }
    
    @Override
    public String generateSignedUrl(String path, int expirationSeconds) {
        return "mock://signed/" + path + "?expires=" + expirationSeconds;
    }
}
