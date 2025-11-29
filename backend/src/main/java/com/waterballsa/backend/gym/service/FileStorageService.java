package com.waterballsa.backend.gym.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    
    String storeFile(MultipartFile file, String directory);
    
    void deleteFile(String fileUrl);
    
    Resource loadFileAsResource(String fileUrl);
}
