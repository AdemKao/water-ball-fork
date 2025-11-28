# Thymeleaf 模板引擎指南

## 什麼是 Thymeleaf？

Thymeleaf 是 Spring Boot 官方推薦的**伺服器端模板引擎**，用來動態產生 HTML 頁面。

簡單來說：當你需要後端產生一個完整的網頁（而不是只回傳 JSON），就需要用到 Thymeleaf。

## 為什麼這個專案需要 Thymeleaf？

這個專案有一個 **Mock Payment Gateway**（模擬金流頁面），它需要顯示一個付款表單給使用者填寫。

看看 `MockPaymentController.java`：

```java
@Controller  // <-- 注意：是 @Controller，不是 @RestController
@RequestMapping("/mock-payment")
public class MockPaymentController {

    @GetMapping("/checkout/{sessionId}")
    public String showCheckoutPage(@PathVariable String sessionId, Model model) {
        // ... 取得 session 資料 ...
        
        model.addAttribute("session", session);  // 把資料放進 Model
        return "mock-payment/checkout";          // 回傳「視圖名稱」
    }
}
```

### `@Controller` vs `@RestController` 的差別

| 註解 | 回傳值代表 | 用途 |
|------|-----------|------|
| `@RestController` | JSON 資料本身 | 建立 REST API |
| `@Controller` | 視圖（View）的名稱 | 回傳 HTML 網頁 |

當 Controller 回傳 `"mock-payment/checkout"` 這個字串時：
- **有 Thymeleaf**：Spring 會去找 `templates/mock-payment/checkout.html`，用 Model 裡的資料渲染後回傳
- **沒有 Thymeleaf**：Spring 不知道怎麼處理，會誤以為這是靜態資源路徑，產生錯誤：
  ```
  No static resource mock-payment/checkout
  ```

## 模板檔案放在哪裡？

```
backend/src/main/resources/
├── templates/                    <-- Thymeleaf 預設讀取這個目錄
│   └── mock-payment/
│       ├── checkout.html         <-- 付款表單頁面
│       └── expired.html          <-- Session 過期頁面
└── static/                       <-- 純靜態檔案（CSS, JS, 圖片）
```

## Thymeleaf 基本語法

看看 `checkout.html` 裡的幾個常見用法：

### 1. 顯示變數

```html
<!-- 顯示 session.amount 的值 -->
<div th:text="${session.amount}">1,999</div>

<!-- 數字格式化（加上千分位） -->
<div th:text="${#numbers.formatDecimal(session.amount, 1, 'COMMA', 0, 'POINT')}">1,999</div>
```

### 2. 條件判斷

```html
<!-- 如果是信用卡付款 -->
<div th:if="${isCreditCard}">
    顯示信用卡表單
</div>

<!-- 如果不是信用卡（銀行轉帳） -->
<div th:unless="${isCreditCard}">
    顯示銀行轉帳表單
</div>
```

### 3. 動態 CSS class

```html
<!-- 根據條件加上不同的 CSS class -->
<span th:classappend="${isCreditCard} ? 'credit-card' : 'bank-transfer'">
    Payment Method
</span>
```

### 4. URL 連結

```html
<!-- 產生動態 URL：/mock-payment/checkout/abc123/submit -->
<form th:action="@{/mock-payment/checkout/{id}/submit(id=${session.id})}" method="post">
```

### 5. 迴圈（這個專案沒用到，但很常見）

```html
<ul>
    <li th:each="item : ${items}" th:text="${item.name}">Item</li>
</ul>
```

## 如何加入 Thymeleaf 依賴

在 `pom.xml` 加入：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

Spring Boot 會自動配置好一切，不需要額外設定。

## 資料流程圖解

```
1. 使用者請求 GET /mock-payment/checkout/abc123
                    │
                    ▼
2. MockPaymentController 處理請求
   - 從資料庫查詢 CheckoutSession
   - 把資料放進 Model
   - 回傳 "mock-payment/checkout"
                    │
                    ▼
3. Thymeleaf 模板引擎
   - 讀取 templates/mock-payment/checkout.html
   - 用 Model 裡的資料替換 th:* 屬性
   - 產生完整的 HTML
                    │
                    ▼
4. 回傳給瀏覽器顯示付款表單
```

## 什麼時候用 Thymeleaf？什麼時候用 REST API？

| 情境 | 建議方式 |
|------|----------|
| 前後端分離（React/Vue/Next.js） | REST API（`@RestController`） |
| 簡單的管理後台 | Thymeleaf |
| 第三方回呼頁面（如金流） | Thymeleaf |
| Email 模板 | Thymeleaf |

這個專案主要用 Next.js 前端 + REST API，但 Mock Payment Gateway 需要一個獨立的付款頁面（模擬真實金流商的行為），所以用 Thymeleaf 來處理。

## 常見問題

### Q: 為什麼不用前端來做付款頁面？

A: 真實的金流商（如綠界、藍新）會提供他們自己的付款頁面，使用者會被導向到金流商的網站付款。這個 Mock Payment Gateway 是在模擬這個行為，所以需要一個後端產生的獨立頁面。

### Q: 我改了 HTML 但沒有生效？

A: 開發模式下，修改 `templates/` 裡的 HTML 應該會自動生效。如果沒有，試試重啟 Spring Boot。

### Q: th:text 和直接寫內容有什麼差別？

A: `th:text` 會**覆蓋**元素內的文字。原本寫的文字（如 `1,999`）只是給設計師看的預設值，實際顯示時會被 Model 裡的資料取代。

```html
<!-- 顯示的會是 session.amount 的值，不是 "1,999" -->
<div th:text="${session.amount}">1,999</div>
```

## 延伸閱讀

- [Thymeleaf 官方文件](https://www.thymeleaf.org/documentation.html)
- [Spring Boot + Thymeleaf 教學](https://spring.io/guides/gs/serving-web-content/)
