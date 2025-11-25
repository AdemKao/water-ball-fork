package com.waterball.course.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "supabase")
public class SupabaseStorageService implements StorageService {
    
    @Override
    public String uploadFile(String path, MultipartFile file) {
        throw new UnsupportedOperationException("Supabase storage not implemented yet");
    }
    
    @Override
    public InputStream downloadFile(String path) {
        throw new UnsupportedOperationException("Supabase storage not implemented yet");
    }
    
    @Override
    public void deleteFile(String path) {
        throw new UnsupportedOperationException("Supabase storage not implemented yet");
    }
    
    @Override
    public String getFileUrl(String path) {
        throw new UnsupportedOperationException("Supabase storage not implemented yet");
    }
    
    @Override
    public String generateSignedUrl(String path, int expirationSeconds) {
        throw new UnsupportedOperationException("Supabase storage not implemented yet");
    }
}
