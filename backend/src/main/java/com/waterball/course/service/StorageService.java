package com.waterball.course.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface StorageService {
    String uploadFile(String path, MultipartFile file);
    
    InputStream downloadFile(String path);
    
    void deleteFile(String path);
    
    String getFileUrl(String path);
}
