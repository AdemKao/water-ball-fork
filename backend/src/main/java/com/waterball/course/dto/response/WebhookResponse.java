package com.waterball.course.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class WebhookResponse {
    private boolean received;

    public static WebhookResponse success() {
        return new WebhookResponse(true);
    }
}
