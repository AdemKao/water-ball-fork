# Spring Boot 依賴注入與條件式 Bean 配置指南

本文件以專案中的 `StorageService` 為例，說明 Spring Boot 的依賴注入 (DI) 機制與 `@ConditionalOnProperty` 的用法。

## 目錄

1. [什麼是依賴注入 (DI)](#什麼是依賴注入-di)
2. [專案實例：StorageService](#專案實例storageservice)
3. [@ConditionalOnProperty 詳解](#conditionalonproperty-詳解)
4. [如何切換實作](#如何切換實作)
5. [DI 與 @ConditionalOnProperty 的關係](#di-與-conditionalonproperty-的關係)
6. [常見問題](#常見問題)

---

## 什麼是依賴注入 (DI)

**依賴注入 (Dependency Injection)** 是一種設計模式，讓物件不需要自己建立依賴的物件，而是由外部（Spring 容器）注入。

### 沒有 DI 的寫法（不推薦）

```java
public class VideoService {
    // 直接建立依賴，緊耦合
    private StorageService storageService = new LocalStorageService();
    
    public String getVideoUrl(UUID videoId) {
        return storageService.getFileUrl("videos/" + videoId);
    }
}
```

**問題：**

- `VideoService` 與 `LocalStorageService` 緊密耦合
- 無法在測試時替換成 Mock
- 想換成 `SupabaseStorageService` 需要修改程式碼

### 使用 DI 的寫法（推薦）

```java
@Service
@RequiredArgsConstructor  // Lombok 自動生成建構子
public class VideoService {
    // Spring 會自動注入適當的實作
    private final StorageService storageService;
    
    public String getVideoUrl(UUID videoId) {
        return storageService.getFileUrl("videos/" + videoId);
    }
}
```

**優點：**

- `VideoService` 只依賴介面，不關心具體實作
- 可透過設定檔切換實作，不需修改程式碼
- 測試時可輕鬆注入 Mock

---

## 專案實例：StorageService

### 架構圖

```
                    ┌─────────────────────┐
                    │  StorageService     │  ← 介面 (Interface)
                    │  (Interface)        │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│LocalStorageService│ │SupabaseStorage │  │MockStorageService│
│                 │  │    Service      │  │                 │
│ @Conditional... │  │ @Conditional... │  │ @Conditional... │
│ havingValue=    │  │ havingValue=    │  │ havingValue=    │
│ "local"         │  │ "supabase"      │  │ "mock"          │
│ matchIfMissing  │  │                 │  │                 │
│ = true          │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
        ↑                                         
    預設使用                                      
```

### 介面定義

檔案：`src/main/java/com/waterball/course/service/StorageService.java`

```java
public interface StorageService {
    String uploadFile(String path, MultipartFile file);
    InputStream downloadFile(String path);
    void deleteFile(String path);
    String getFileUrl(String path);
    String generateSignedUrl(String path, int expirationSeconds);
}
```

### 實作 1：LocalStorageService（預設）

檔案：`src/main/java/com/waterball/course/service/LocalStorageService.java`

```java
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {
    
    @Value("${storage.local.base-path:./uploads}")
    private String basePath;
    
    @Override
    public String uploadFile(String path, MultipartFile file) {
        // 儲存到本地檔案系統
        Path targetPath = uploadDir.resolve(path);
        Files.copy(file.getInputStream(), targetPath);
        return path;
    }
    
    // ... 其他方法
}
```

**重點：**

- `matchIfMissing = true`：當 `storage.type` 沒設定時，使用此實作
- 這是**預設**的儲存服務

### 實作 2：SupabaseStorageService

檔案：`src/main/java/com/waterball/course/service/SupabaseStorageService.java`

```java
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "supabase")
public class SupabaseStorageService implements StorageService {
    
    @Override
    public String uploadFile(String path, MultipartFile file) {
        // 上傳到 Supabase Storage
        throw new UnsupportedOperationException("Supabase storage not implemented yet");
    }
    
    // ... 其他方法
}
```

**重點：**

- 只有當 `storage.type=supabase` 時才會啟用
- 目前尚未實作，僅作為佔位

### 實作 3：MockStorageService

檔案：`src/main/java/com/waterball/course/service/MockStorageService.java`

```java
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "mock")
public class MockStorageService implements StorageService {
    
    @Override
    public String uploadFile(String path, MultipartFile file) {
        return "mock://uploaded/" + path;  // 不真的儲存
    }
    
    // ... 其他方法
}
```

**重點：**

- 用於測試環境，不真的執行儲存操作
- 設定 `storage.type=mock` 啟用

### 使用者（依賴 StorageService 的類別）

| 類別 | 用途 |
|------|------|
| `VideoService` | 產生影片串流 URL |
| `SubmissionService` | 儲存學生作業檔案 |
| `FileController` | 處理檔案上傳/下載 API |

這些類別**不需要知道**使用的是哪個實作，Spring 會自動注入正確的 Bean。

---

## @ConditionalOnProperty 詳解

`@ConditionalOnProperty` 是 Spring Boot 提供的條件式註解，用於**根據設定檔的屬性值決定是否建立 Bean**。

### 語法

```java
@ConditionalOnProperty(
    name = "property.name",       // 屬性名稱
    havingValue = "expectedValue", // 期望的值
    matchIfMissing = false        // 屬性不存在時是否匹配（預設 false）
)
```

### 參數說明

| 參數 | 說明 | 範例 |
|------|------|------|
| `name` | 要檢查的屬性名稱 | `"storage.type"` |
| `havingValue` | 屬性必須等於此值才會建立 Bean | `"local"` |
| `matchIfMissing` | 當屬性不存在時，是否視為匹配 | `true` = 不存在也建立 |

### 運作流程

```
Spring Boot 啟動
       │
       ▼
讀取 application.properties / application.yml
       │
       ▼
掃描所有 @Service, @Component 等類別
       │
       ▼
檢查 @ConditionalOnProperty
       │
       ├─ storage.type = "local" ──────► 建立 LocalStorageService
       │
       ├─ storage.type = "supabase" ───► 建立 SupabaseStorageService
       │
       ├─ storage.type = "mock" ───────► 建立 MockStorageService
       │
       └─ storage.type 未設定 ─────────► 建立 LocalStorageService
                                         (因為 matchIfMissing = true)
```

### 其他常見的 Conditional 註解

| 註解 | 用途 |
|------|------|
| `@ConditionalOnProperty` | 根據屬性值 |
| `@ConditionalOnMissingBean` | 當某 Bean 不存在時 |
| `@ConditionalOnBean` | 當某 Bean 存在時 |
| `@ConditionalOnClass` | 當某 Class 存在於 classpath |
| `@ConditionalOnProfile` | 根據 active profile |

---

## 如何切換實作

### 方法 1：修改 application.properties

```properties
# 使用本地儲存（預設）
storage.type=local
storage.local.base-path=./uploads

# 或使用 Supabase
# storage.type=supabase
# supabase.url=https://xxx.supabase.co
# supabase.key=your-key

# 或使用 Mock（測試用）
# storage.type=mock
```

### 方法 2：環境變數

```bash
# Linux/Mac
export STORAGE_TYPE=supabase

# Windows
set STORAGE_TYPE=supabase

# 執行應用程式
mvn spring-boot:run
```

### 方法 3：命令列參數

```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--storage.type=mock"
```

### 方法 4：測試時指定

```java
@SpringBootTest
@TestPropertySource(properties = "storage.type=mock")
class VideoServiceTest {
    @Autowired
    private StorageService storageService;  // 會注入 MockStorageService
}
```

---

## DI 與 @ConditionalOnProperty 的關係

```
┌─────────────────────────────────────────────────────────────────┐
│                        Spring 容器                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 啟動時掃描所有類別                                           │
│                     │                                           │
│                     ▼                                           │
│  2. 評估 @Conditional 條件                                       │
│     - 讀取 application.properties                               │
│     - 檢查 storage.type 的值                                    │
│                     │                                           │
│                     ▼                                           │
│  3. 只建立符合條件的 Bean                                        │
│     ┌─────────────────────────────┐                             │
│     │ LocalStorageService (Bean) │ ← 只有這個被建立              │
│     └─────────────────────────────┘                             │
│                     │                                           │
│                     ▼                                           │
│  4. 依賴注入                                                     │
│     ┌─────────────────┐    注入    ┌─────────────────────────┐  │
│     │  VideoService   │ ◄───────── │ LocalStorageService     │  │
│     └─────────────────┘            └─────────────────────────┘  │
│     ┌─────────────────┐    注入    ┌─────────────────────────┐  │
│     │ SubmissionService│ ◄───────── │ LocalStorageService     │  │
│     └─────────────────┘            └─────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**關係說明：**

1. **@ConditionalOnProperty 決定「哪些 Bean 會被建立」**
   - 是 Bean 建立階段的過濾條件
   - 在 DI 發生之前執行

2. **DI 負責「把建立好的 Bean 注入到需要的地方」**
   - 是 Bean 使用階段的機制
   - 只能注入已經建立的 Bean

3. **兩者配合的好處**
   - 不需修改任何程式碼，只改設定檔就能切換實作
   - 符合「開放封閉原則」：對擴展開放，對修改封閉

---

## 常見問題

### Q1: 如果兩個實作都符合條件會怎樣？

Spring 會拋出 `NoUniqueBeanDefinitionException`，因為不知道要注入哪一個。

**解法：**

- 確保條件互斥（每個 havingValue 不同）
- 使用 `@Primary` 指定優先

### Q2: 如何確認目前使用哪個實作？

```java
@Autowired
private StorageService storageService;

@PostConstruct
public void init() {
    System.out.println("Using: " + storageService.getClass().getSimpleName());
}
```

或在啟動日誌中搜尋：

```
Bean 'localStorageService' of type [com.waterball.course.service.LocalStorageService]
```

### Q3: 測試時如何 Mock StorageService？

```java
@SpringBootTest
class VideoServiceTest {
    
    @MockBean  // 自動替換容器中的 StorageService
    private StorageService storageService;
    
    @Autowired
    private VideoService videoService;
    
    @Test
    void testGetVideoUrl() {
        when(storageService.getFileUrl(any())).thenReturn("http://mock-url");
        // ...
    }
}
```

### Q4: 可以同時啟用多個實作嗎？

可以，但需要用 `@Qualifier` 區分：

```java
@Service("primaryStorage")
@ConditionalOnProperty(name = "storage.primary", havingValue = "local")
public class LocalStorageService implements StorageService { }

@Service("backupStorage")
@ConditionalOnProperty(name = "storage.backup", havingValue = "supabase")
public class SupabaseStorageService implements StorageService { }

// 使用時
@Autowired
@Qualifier("primaryStorage")
private StorageService primaryStorage;

@Autowired
@Qualifier("backupStorage")
private StorageService backupStorage;
```

---

## 延伸閱讀

- [Spring Framework - Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html)
- [Spring Boot - Conditional Beans](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.developing-auto-configuration.condition-annotations)
- [Baeldung - @ConditionalOnProperty](https://www.baeldung.com/spring-conditionalonproperty)
